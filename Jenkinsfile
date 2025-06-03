pipeline {
    agent {
        node {
            label 'windows-docker'  // Updated label for Windows agents with Docker
        }
    }

    parameters {
        string(name: 'DOCKER_TAG', defaultValue: 'latest', description: 'Tag for Docker image')
        choice(name: 'ENVIRONMENT', choices: ['dev', 'staging', 'prod'], description: 'Environment for deployment')
        booleanParam(name: 'RUN_TESTS', defaultValue: true, description: 'Run tests')
        string(name: 'WEATHER_API_KEY', defaultValue: '', description: 'Weather API Key')
    }

    environment {
        DOCKER_IMAGE = 'weatherapp'
        DOCKER_REGISTRY = 'your-registry'
        VITE_WEATHER_API_KEY = credentials('weather-api-key')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm ci'
            }
        }

        stage('Lint') {
            steps {
                bat 'npm run lint'
            }
        }

        stage('Type Check') {
            steps {
                bat 'npx tsc --noEmit'
            }
        }

        stage('Build') {
            steps {
                bat 'npm run build'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    bat """
                        docker build -t %DOCKER_REGISTRY%/%DOCKER_IMAGE%:%DOCKER_TAG% ^
                            --build-arg VITE_WEATHER_API_KEY=%VITE_WEATHER_API_KEY% .
                    """
                }
            }
        }

        stage('Run Tests') {
            when {
                expression { params.RUN_TESTS }
            }
            steps {
                script {
                    bat "docker run --rm %DOCKER_REGISTRY%/%DOCKER_IMAGE%:%DOCKER_TAG% npm run test"
                }
            }
        }

        stage('Push Docker Image') {
            when {
                expression { params.ENVIRONMENT != 'dev' }
            }
            steps {
                withCredentials([usernamePassword(credentialsId: 'registry-credentials', usernameVariable: 'REGISTRY_USER', passwordVariable: 'REGISTRY_PASS')]) {
                    script {
                        bat """
                            docker login %DOCKER_REGISTRY% -u %REGISTRY_USER% -p %REGISTRY_PASS%
                            docker push %DOCKER_REGISTRY%/%DOCKER_IMAGE%:%DOCKER_TAG%
                            if "%ENVIRONMENT%"=="prod" (
                                docker push %DOCKER_REGISTRY%/%DOCKER_IMAGE%:latest
                            )
                        """
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    bat """
                        docker run -d ^
                            -p 4173:4173 ^
                            -e VITE_WEATHER_API_KEY=%VITE_WEATHER_API_KEY% ^
                            --name weatherapp-%ENVIRONMENT% ^
                            %DOCKER_REGISTRY%/%DOCKER_IMAGE%:%DOCKER_TAG%
                    """
                }
            }
        }

        stage('Health Check') {
            steps {
                script {
                    bat """
                        @echo off
                        setlocal EnableDelayedExpansion
                        set count=0
                        :loop
                        if !count! geq 12 (
                            echo Application failed to start
                            exit 1
                        )
                        curl -s http://localhost:4173 > nul 2>&1
                        if !errorlevel! equ 0 (
                            echo Application is up and running
                            exit 0
                        )
                        echo Waiting for application to start...
                        timeout /t 5 /nobreak > nul
                        set /a count+=1
                        goto loop
                    """
                }
            }
        }
    }

    post {
        success {
            echo "✅ Pipeline completed successfully!"
        }
        failure {
            echo "❌ Pipeline failed!"
        }
        always {
            script {
                bat """
                    docker stop weatherapp-%ENVIRONMENT% 2>nul || exit /b 0
                    docker rm weatherapp-%ENVIRONMENT% 2>nul || exit /b 0
                """
                cleanWs()
            }
        }
    }
}