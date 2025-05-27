pipeline {
    agent {
        node {
            label 'windows' // upewnij się, że agent to Windows z Docker+WSL
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
                sh '''
                    docker build -t $DOCKER_REGISTRY/$DOCKER_IMAGE:$DOCKER_TAG \
                        --build-arg VITE_WEATHER_API_KEY=$VITE_WEATHER_API_KEY .
                '''
            }
        }

        stage('Run Tests') {
            when {
                expression { params.RUN_TESTS }
            }
            steps {
                sh 'docker run --rm $DOCKER_REGISTRY/$DOCKER_IMAGE:$DOCKER_TAG npm run test'
            }
        }

        stage('Push Docker Image') {
            when {
                expression { params.ENVIRONMENT != 'dev' }
            }
            steps {
                withCredentials([usernamePassword(credentialsId: 'registry-credentials', usernameVariable: 'REGISTRY_USER', passwordVariable: 'REGISTRY_PASS')]) {
                    sh '''
                        docker login $DOCKER_REGISTRY -u $REGISTRY_USER -p $REGISTRY_PASS
                        docker push $DOCKER_REGISTRY/$DOCKER_IMAGE:$DOCKER_TAG
                        if [ "$ENVIRONMENT" = "prod" ]; then
                            docker push $DOCKER_REGISTRY/$DOCKER_IMAGE:latest
                        fi
                    '''
                }
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                    docker run -d \
                        -p 4173:4173 \
                        -e VITE_WEATHER_API_KEY=$VITE_WEATHER_API_KEY \
                        --name weatherapp-$ENVIRONMENT \
                        $DOCKER_REGISTRY/$DOCKER_IMAGE:$DOCKER_TAG
                '''
            }
        }

        stage('Health Check') {
            steps {
                sh '''
                    count=0
                    until curl -s http://localhost:4173 > /dev/null || [ $count -ge 12 ]; do
                        echo "Waiting for application to start..."
                        sleep 5
                        count=$((count + 1))
                    done

                    if [ $count -ge 12 ]; then
                        echo "Application failed to start"
                        exit 1
                    else
                        echo "Application is up and running"
                    fi
                '''
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
            steps {
                sh '''
                    docker stop $(docker ps -q --filter "name=weatherapp-$ENVIRONMENT") || true
                    docker rm $(docker ps -aq --filter "name=weatherapp-$ENVIRONMENT") || true
                '''
                cleanWs()
            }
        }
    }
}
