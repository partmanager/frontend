pipeline {
    agent {
        docker { 
            image 'node:lts-alpine'
            label 'docker-pipeline'
        }
    }
    stages {
        stage('Test') {
            steps {
                sh 'yarn global add @quasar/cli'
            }
        }
        stage('Lint') {
            steps {
                sh 'yarn lint'
            } 
        }
    }
}
