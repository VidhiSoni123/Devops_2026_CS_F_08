pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                echo 'Checking out Career Compass 2.0 code...'
                checkout scm
            }
        }

        stage('Install Frontend Dependencies') {
            steps {
                dir('frontend') {
                    bat 'npm.cmd ci'
                }
            }
        }

        stage('Run ESLint') {
            steps {
                dir('frontend') {
                    bat 'npm.cmd run lint'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    bat 'npm.cmd run build'
                }
            }
        }

        stage('Generate Feedback Report') {
            steps {
                bat 'python generate_feedback.py'
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'feedback-report.md', allowEmptyArchive: true
        }
    }
}