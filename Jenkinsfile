pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'server'
        DOCKERHUB_CREDENTIALS = 'orgatick'
        DOCKER_USER = 'orgatick'
        NODE_ENV = 'test'
        SONAR_HOST_URL = credentials('sonar-host-url')
        SONAR_TOKEN = credentials('sonar-token')
    }

    options {
        timeout(time: 1, unit: 'HOURS')
        timestamps()
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
                script {
                    echo "Building branch: ${env.BRANCH_NAME}"
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    echo "Installing dependencies..."
                    sh '''
                        if ! command -v pnpm &> /dev/null; then
                            npm install -g pnpm
                        fi
                        pnpm install --frozen-lockfile
                    '''
                }
            }
        }

        stage('Linting') {
            steps {
                script {
                    echo "Running ESLint..."
                    sh '''
                        pnpm run lint || {
                            echo "Linting failed!"
                            exit 1
                        }
                    '''
                }
                recordIssues(
                    enabledForFailure: true,
                    tools: [esLint(pattern: '**/eslint-report.json')]
                )
            }
        }

        stage('Type Check') {
            steps {
                script {
                    echo "Running TypeScript type checking..."
                    sh 'pnpm run build:ts'
                }
            }
        }

        stage('Unit Tests') {
            steps {
                script {
                    echo "Running unit tests..."
                    sh '''
                        pnpm run test:coverage || {
                            echo "Tests failed!"
                            exit 1
                        }
                    '''
                }
            }
            post {
                always {
                    junit 'test-results/**/*.xml' || true
                    publishHTML([
                        reportDir: 'coverage',
                        reportFiles: 'index.html',
                        reportName: 'Code Coverage Report'
                    ])
                    step([$class: 'CoberturaPublisher',
                        autoUpdateHealth: false,
                        autoUpdateStability: false,
                        coberturaReportFile: 'coverage/cobertura-coverage.xml',
                        failUnhealthy: false,
                        failUnstable: false,
                        maxNumberOfBuilds: 0,
                        onlyStable: false,
                        sourceEncoding: 'ASCII',
                        zoomCoverageChart: false
                    ])
                }
            }
        }

        stage('Build') {
            steps {
                script {
                    echo "Building project..."
                    sh 'pnpm run build'
                }
            }
        }

        stage('SonarQube Analysis') {
            when {
                branch 'main'
            }
            steps {
                script {
                    echo "Running SonarQube analysis..."
                    sh '''
                        pnpm install sonar-scanner --save-dev
                        npx sonar-scanner \
                            -Dsonar.projectKey=orgatick-v1 \
                            -Dsonar.sources=src \
                            -Dsonar.exclusions=**/*.test.ts,**/node_modules/** \
                            -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \
                            -Dsonar.host.url=${SONAR_HOST_URL} \
                            -Dsonar.login=${SONAR_TOKEN}
                    '''
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    echo "Building Docker image..."
                    sh 'docker build -t $DOCKER_IMAGE:${BUILD_NUMBER} .'
                    sh 'docker tag $DOCKER_IMAGE:${BUILD_NUMBER} $DOCKER_IMAGE:latest'
                }
            }
        }

        stage('Docker Security Scan') {
            when {
                branch 'main'
            }
            steps {
                script {
                    echo "Scanning Docker image for vulnerabilities..."
                    sh '''
                        if command -v trivy &> /dev/null; then
                            trivy image --severity HIGH,CRITICAL $DOCKER_IMAGE:latest || true
                        else
                            echo "Trivy not installed, skipping security scan"
                        fi
                    '''
                }
            }
        }

        stage('Login to Docker Hub') {
            when {
                branch 'main'
            }
            steps {
                script {
                    echo "Authenticating with Docker Hub..."
                    withCredentials([usernamePassword(
                        credentialsId: "$DOCKERHUB_CREDENTIALS",
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )]) {
                        sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                    }
                }
            }
        }

        stage('Push Docker Image') {
            when {
                branch 'main'
            }
            steps {
                script {
                    echo "Pushing Docker image to registry..."
                    sh '''
                        docker tag $DOCKER_IMAGE:${BUILD_NUMBER} $DOCKER_USER/$DOCKER_IMAGE:latest
                        docker tag $DOCKER_IMAGE:${BUILD_NUMBER} $DOCKER_USER/$DOCKER_IMAGE:${BUILD_NUMBER}
                        docker push $DOCKER_USER/$DOCKER_IMAGE:latest
                        docker push $DOCKER_USER/$DOCKER_IMAGE:${BUILD_NUMBER}
                    '''
                }
            }
        }

        stage('Artifact Archive') {
            steps {
                script {
                    echo "Archiving build artifacts..."
                    sh '''
                        tar -czf dist-${BUILD_NUMBER}.tar.gz dist/
                    '''
                    archiveArtifacts artifacts: 'dist-${BUILD_NUMBER}.tar.gz',
                                     allowEmptyArchive: true
                }
            }
        }
    }

    post {
        always {
            script {
                echo "Cleaning up..."
                cleanWs()
            }
        }
        success {
            script {
                echo "✅ Build Successful!"
                emailext(
                    to: '${DEFAULT_RECIPIENTS}',
                    subject: "CI/CD SUCCESS: ${JOB_NAME} #${BUILD_NUMBER}",
                    body: """
                        Build Status: SUCCESS
                        Job: ${JOB_NAME}
                        Build Number: ${BUILD_NUMBER}
                        Build URL: ${BUILD_URL}
                        Branch: ${env.BRANCH_NAME}

                        Artifacts available at: ${BUILD_URL}artifact/
                    """
                )
            }
        }
        failure {
            script {
                echo "❌ Build Failed!"
                emailext(
                    to: '${DEFAULT_RECIPIENTS}',
                    subject: "CI/CD FAILURE: ${JOB_NAME} #${BUILD_NUMBER}",
                    body: """
                        Build Status: FAILED
                        Job: ${JOB_NAME}
                        Build Number: ${BUILD_NUMBER}
                        Build URL: ${BUILD_URL}
                        Branch: ${env.BRANCH_NAME}

                        Please check the logs for details: ${BUILD_URL}console
                    """,
                    attachLog: true
                )
            }
        }
    }
}
