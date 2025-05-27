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
                sh 'npm ci'
            }
        }

        stage('Lint') {
            steps {
                sh 'npm run lint'
            }
        }

        stage('Type Check') {
            steps {
                sh 'npx tsc --noEmit'
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
                    docker.build("${env.DOCKER_REGISTRY}/${env.DOCKER_IMAGE}:${params.DOCKER_TAG}")
                }
            }
        }

        stage('Run Tests') {
            when {
                expression { params.RUN_TESTS }
            }
            steps {
                script {
                    docker.image("${env.DOCKER_REGISTRY}/${env.DOCKER_IMAGE}:${params.DOCKER_TAG}")
                        .inside {
                            sh 'npm run test'
                        }
                }
            }
        }

        stage('Push Docker Image') {
            when {
                expression { env.ENVIRONMENT != 'dev' }
            }
            steps {
                script {
                    docker.withRegistry('https://registry.example.com', 'registry-credentials') {
                        docker.image("${env.DOCKER_REGISTRY}/${env.DOCKER_IMAGE}:${params.DOCKER_TAG}").push()
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    def deployCommand = """
                        docker run -d \
                        -p 4173:4173 \
                        -e VITE_WEATHER_API_KEY=${env.VITE_WEATHER_API_KEY} \
                        --name weatherapp-${env.ENVIRONMENT} \
                        ${env.DOCKER_REGISTRY}/${env.DOCKER_IMAGE}:${params.DOCKER_TAG}
                    """
                    sh deployCommand
                }
            }
        }

        stage('Health Check') {
            steps {
                script {
                    sh '''
                        for i in {1..12}; do
                            if curl -s http://localhost:4173 >/dev/null; then
                                echo "Application is up and running"
                                exit 0
                            fi
                            echo "Waiting for application to start..."
                            sleep 5
                        done
                        echo "Application failed to start"
                        exit 1
                    '''
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
            cleanWs()
        }
    }
}