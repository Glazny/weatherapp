pipeline {
    agent {
        node {
            label 'any'
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
                script {
                    bat 'npm ci'
                }
            }
        }

        stage('Lint') {
            steps {
                script {
                    bat 'npm run lint'
                }
            }
        }

        stage('Type Check') {
            steps {
                script {
                    bat 'npx tsc --noEmit'
                }
            }
        }

        stage('Build') {
            steps {
                script {
                    bat 'npm run build'
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    bat "docker build -t %DOCKER_REGISTRY%/%DOCKER_IMAGE%:%DOCKER_TAG% --build-arg VITE_WEATHER_API_KEY=%VITE_WEATHER_API_KEY% ."
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
                expression { env.ENVIRONMENT != 'dev' }
            }
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'registry-credentials', usernameVariable: 'REGISTRY_USER', passwordVariable: 'REGISTRY_PASS')]) {
                        bat "docker login %DOCKER_REGISTRY% -u %REGISTRY_USER% -p %REGISTRY_PASS%"
                        bat "docker push %DOCKER_REGISTRY%/%DOCKER_IMAGE%:%DOCKER_TAG%"
                        
                        if (env.ENVIRONMENT == 'prod') {
                            bat "docker push %DOCKER_REGISTRY%/%DOCKER_IMAGE%:latest"
                        }
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
                        setlocal enabledelayedexpansion
                        set /a count=0
                        :loop
                        if !count! geq 12 (
                            echo Application failed to start
                            exit 1
                        )
                        curl -s http://localhost:4173 > nul
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
            echo "Pipeline completed successfully!"
        }
        failure {
            echo "Pipeline failed!"
        }
        always {
            script {
                bat """
                    for /f "tokens=*" %%i in ('docker ps -q --filter "name=weatherapp-%ENVIRONMENT%"') do docker stop %%i
                    for /f "tokens=*" %%i in ('docker ps -aq --filter "name=weatherapp-%ENVIRONMENT%"') do docker rm %%i
                """
                cleanWs()
            }
        }
    }
}