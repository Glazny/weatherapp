pipeline {
    agent any

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
                bat """
                    docker build -t %DOCKER_REGISTRY%/%DOCKER_IMAGE%:%DOCKER_TAG% ^
                        --build-arg VITE_WEATHER_API_KEY=%VITE_WEATHER_API_KEY% .
                """
            }
        }

        stage('Run Tests') {
            when {
                expression { params.RUN_TESTS }
            }
            steps {
                bat "docker run --rm %DOCKER_REGISTRY%/%DOCKER_IMAGE%:%DOCKER_TAG% npm run test"
            }
        }

        stage('Push Docker Image') {
            when {
                expression { params.ENVIRONMENT != 'dev' }
            }
            steps {
                withCredentials([usernamePassword(credentialsId: 'registry-credentials', usernameVariable: 'REGISTRY_USER', passwordVariable: 'REGISTRY_PASS')]) {
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

        stage('Deploy') {
            steps {
                bat """
                    docker run -d ^
                        -p 4173:4173 ^
                        -e VITE_WEATHER_API_KEY=%VITE_WEATHER_API_KEY% ^
                        --name weatherapp-%ENVIRONMENT% ^
                        %DOCKER_REGISTRY%/%DOCKER_IMAGE%:%DOCKER_TAG%
                """
            }
        }

        stage('Health Check') {
            steps {
                bat """
                    set count=0
                    :LOOP
                    curl -s http://localhost:4173 > nul
                    if %ERRORLEVEL% EQU 0 (
                        echo Application is up and running
                        goto :END
                    )
                    set /a count+=1
                    if %count% GEQ 12 (
                        echo Application failed to start
                        exit 1
                    )
                    echo Waiting for application to start...
                    timeout /t 5 /nobreak > nul
                    goto :LOOP
                    :END
                """
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
            bat """
                docker stop weatherapp-%ENVIRONMENT% || ver > nul
                docker rm weatherapp-%ENVIRONMENT% || ver > nul
            """
            cleanWs()
        }
    }
}