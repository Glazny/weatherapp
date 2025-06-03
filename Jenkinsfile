pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "weatherapp"
        DOCKER_TAG = "latest"
        ENVIRONMENT = "dev"
    }

    stages {
        stage('Print Parameters') {
            steps {
                echo "Docker Tag: ${DOCKER_TAG}"
                echo "Environment: ${ENVIRONMENT}"
                echo "Run Tests: ${params.RUN_TESTS}"
            }
        }

        stage('Echo Environment') {
            steps {
                echo "Deploying to ${ENVIRONMENT} environment"
            }
        }

        stage('Check Workspace') {
            steps {
                bat 'dir'
            }
        }

        stage('Build Docker Image') {
            steps {
                bat "docker build -t %DOCKER_IMAGE%:%DOCKER_TAG% ."
            }
        }

        stage('Run Docker Container') {
            steps {
                bat "docker run -d -p 3000:3000 --name weatherapp_container %DOCKER_IMAGE%:%DOCKER_TAG%"
            }
        }
    }

    post {
        always {
            echo "Cleaning up..."
            bat "docker rm -f weatherapp_container || exit 0"
            bat "docker rmi %DOCKER_IMAGE%:%DOCKER_TAG% || exit 0"
        }
    }
}
