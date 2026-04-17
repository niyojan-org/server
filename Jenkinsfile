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

        stage('Get Git Info') {
            steps {
                script {
                    env.GIT_COMMIT_MSG = sh(
                        script: 'git log -1 --pretty=%B',
                        returnStdout: true
                    ).trim()

                    env.GIT_AUTHOR = sh(
                        script: 'git log -1 --pretty=%an',
                        returnStdout: true
                    ).trim()
                }
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
    }

    post {
        success {
            emailext(
                to: 'abhishek@orgatick.in',
                subject: "✅ SUCCESS: ${JOB_NAME} #${BUILD_NUMBER}",
                body: """
Build Status: SUCCESS ✅

Project: ${JOB_NAME}
Build Number: ${BUILD_NUMBER}

Docker Image:
${DOCKER_USER}/${DOCKER_IMAGE}:latest
${DOCKER_USER}/${DOCKER_IMAGE}:${BUILD_NUMBER}

Git Info:
Author: ${GIT_AUTHOR}
Message: ${GIT_COMMIT_MSG}
Commit: ${GIT_COMMIT}

Details: ${BUILD_URL}
"""
            )
        }

        failure {
            emailext(
                to: 'abhishek@orgatick.in',
                subject: "❌ FAILURE: ${JOB_NAME} #${BUILD_NUMBER}",
                body: """
Build Status: FAILURE ❌

Project: ${JOB_NAME}
Build Number: ${BUILD_NUMBER}

Git Info:
Author: ${GIT_AUTHOR}
Message: ${GIT_COMMIT_MSG}
Commit: ${GIT_COMMIT}

Check logs: ${BUILD_URL}
"""
            )
        }
    }
}
