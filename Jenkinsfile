pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'server'
        DOCKERHUB_CREDENTIALS = 'orgatick'
        DOCKER_USER = 'orgatick'
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t $DOCKER_IMAGE .'
            }
        }

        stage('Login to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: "$DOCKERHUB_CREDENTIALS",
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                sh '''
                    docker tag $DOCKER_IMAGE $DOCKER_USER/$DOCKER_IMAGE:latest
                    docker tag $DOCKER_IMAGE $DOCKER_USER/$DOCKER_IMAGE:${BUILD_NUMBER}
                    docker push $DOCKER_USER/$DOCKER_IMAGE:latest
                    docker push $DOCKER_USER/$DOCKER_IMAGE:${BUILD_NUMBER}
                '''
            }
        }

        // Later do the ssh and do the things
    }

    post {
        success {
            echo 'Build & Deployment Successful!'
        }
        failure {
            echo 'Pipeline Failed!'
        }
    }
}
