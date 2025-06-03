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
        
        stage('Run Docker Container') {
    steps {
        script {
            docker.image("${DOCKER_REGISTRY}/${DOCKER_IMAGE}:${DOCKER_TAG}")
                .run("-p 4173:4173 --name weatherapp-${ENVIRONMENT}")
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
