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

        stage('Print Parameters') {
            steps {
                echo "Docker Tag: ${params.DOCKER_TAG}"
                echo "Environment: ${params.ENVIRONMENT}"
                echo "Run Tests: ${params.RUN_TESTS}"
            }
        }

        stage('Echo Environment') {
            steps {
                echo "Deploying to ${params.ENVIRONMENT} environment"
            }
        }

        stage('Check Workspace') {
            steps {
                sh 'ls -al'
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

        stage('Post-Build Cleanup') {
            steps {
                echo "Nothing to clean, but this is a placeholder for future cleanup steps."
            }
        }
    }
}
