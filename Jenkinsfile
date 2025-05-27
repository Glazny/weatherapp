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
        NODE_VERSION = '20.11.1'
    }

    stages {
        stage('Setup Node.js') {
            steps {
                script {
                    def nodeHome = tool name: 'NodeJS', type: 'jenkins.plugins.nodejs.tools.NodeJSInstallation'
                    env.PATH = "${nodeHome}/bin:${env.PATH}"
                }
            }
        }

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    if (isUnix()) {
                        sh 'npm ci'
                    } else {
                        bat 'npm ci'
                    }
                }
            }
        }

        stage('Lint') {
            steps {
                script {
                    if (isUnix()) {
                        sh 'npm run lint'
                    } else {
                        bat 'npm run lint'
                    }
                }
            }
        }

        stage('Type Check') {
            steps {
                script {
                    if (isUnix()) {
                        sh 'npx tsc --noEmit'
                    } else {
                        bat 'npx tsc --noEmit'
                    }
                }
            }
        }

        stage('Build') {
            steps {
                script {
                    if (isUnix()) {
                        sh 'npm run build'
                    } else {
                        bat 'npm run build'
                    }
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    def dockerImage = docker.build("${env.DOCKER_REGISTRY}/${env.DOCKER_IMAGE}:${params.DOCKER_TAG}", "--build-arg VITE_WEATHER_API_KEY=${env.VITE_WEATHER_API_KEY} .")
                    env.DOCKER_IMAGE_BUILT = dockerImage.id
                }
            }
        }

        stage('Run Tests') {
            when {
                expression { params.RUN_TESTS }
            }
            steps {
                script {
                    docker.image(env.DOCKER_IMAGE_BUILT).inside {
                        if (isUnix()) {
                            sh 'npm run test'
                        } else {
                            bat 'npm run test'
                        }
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
                        def image = docker.image("${env.DOCKER_REGISTRY}/${env.DOCKER_IMAGE}:${params.DOCKER_TAG}")
                        image.push()
                        
                        if (env.ENVIRONMENT == 'prod') {
                            image.push('latest')
                        }
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
                    
                    if (isUnix()) {
                        sh deployCommand
                    } else {
                        bat deployCommand.replace('\\', '^')
                    }
                }
            }
        }

        stage('Health Check') {
            steps {
                script {
                    if (isUnix()) {
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
                    } else {
                        bat '''
                            for /L %%i in (1,1,12) do (
                                curl -s http://localhost:4173 > nul
                                if !errorlevel! equ 0 (
                                    echo Application is up and running
                                    exit 0
                                )
                                echo Waiting for application to start...
                                timeout /t 5 /nobreak > nul
                            )
                            echo Application failed to start
                            exit 1
                        '''
                    }
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
                if (isUnix()) {
                    sh '''
                        docker ps -q --filter "name=weatherapp-${ENVIRONMENT}" | xargs -r docker stop
                        docker ps -aq --filter "name=weatherapp-${ENVIRONMENT}" | xargs -r docker rm
                    '''
                } else {
                    bat '''
                        for /f "tokens=*" %%i in ('docker ps -q --filter "name=weatherapp-%ENVIRONMENT%"') do docker stop %%i
                        for /f "tokens=*" %%i in ('docker ps -aq --filter "name=weatherapp-%ENVIRONMENT%"') do docker rm %%i
                    '''
                }
            }
            cleanWs()
        }
    }
}