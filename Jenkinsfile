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
                sh 'npm ci'
            }
        }

        stage('Lint') {
            steps {
                sh 'npm run lint'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }
        
        stage('Build Docker Image') {
            steps {
                script {
                    docker.build(env.DOCKER_IMAGE)
                }
            }
        }
        stage('Run Docker Container') {
            steps {
                script {
                    docker.image("${env.DOCKER_IMAGE}:latest").run("-p 4173:4173")
                }
            }
        }

    post {
        success {
            echo """
                Pipeline completed successfully!
                Application deployed to ${params.ENVIRONMENT} environment.
                Access the application at:
                - Dev: http://localhost:8081
                - Staging: http://localhost:8082
                - Prod: http://localhost:8083
            """
        }
        failure {
            echo "Pipeline failed. Check the logs for more information."
        }
        always {
            // Clean up workspace
            cleanWs()
        }
    }
}
