pipeline {
    agent any

    stages {

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
                powershell '''
                    $date = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

                    @"
# Jenkins Feedback Report

## Career Compass 2.0

**Generated:** $date

## Verification

| Check | Status |
|---|---|
| Frontend ESLint | PASSED |
| Frontend Production Build | PASSED |

## Feature Under Verification

**Recruiter Authentication UI**

- Recruiter Login
- Recruiter Signup
- Form validation
- Login to Signup navigation

## Result

The frontend authentication feature passed the automated Jenkins verification stages.

> This report was generated automatically by Jenkins.
"@ | Set-Content -Path "feedback-report.md" -Encoding UTF8

                    Write-Host "[SUCCESS] feedback-report.md generated."
                '''
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'feedback-report.md', allowEmptyArchive: true
        }
    }
}
