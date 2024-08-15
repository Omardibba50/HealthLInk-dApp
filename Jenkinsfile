pipeline {
    agent any
    
    environment {
        KUBECONFIG = credentials('do-kubeconfig')
        DOCKER_IMAGE = 'omardibba/healthlink-frontend'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Build Frontend') {
            steps {
                dir('frontend') {  // Assuming frontend code is in a 'frontend' directory
                    sh 'npm install'
                    sh 'npm run build'
                }
            }
        }
        
        stage('Deploy Smart Contract') {
            steps {
                dir('blockchain') {  // Assuming blockchain code is in a 'blockchain' directory
                    withCredentials([
                        string(credentialsId: 'polygon-amoy-rpc-url', variable: 'POLYGON_AMOY_RPC_URL'),
                        string(credentialsId: 'polygon-private-key', variable: 'PRIVATE_KEY')
                    ]) {
                        sh 'npm install'
                        sh 'echo "PRIVATE_KEY=$PRIVATE_KEY" > .env'
                        sh 'echo "POLYGON_AMOY_RPC_URL=$POLYGON_AMOY_RPC_URL" >> .env'
                        sh 'npx hardhat compile'
                        sh 'npx hardhat run scripts/deploy.js --network polygon_amoy'
                    }
                }
            }
        }
        
        stage('Build and Push Docker Image') {
            steps {
                dir('frontend') {  // Build Docker image from frontend directory
                    withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        sh "echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin"
                        sh "docker build -t ${DOCKER_IMAGE}:${BUILD_NUMBER} ."
                        sh "docker tag ${DOCKER_IMAGE}:${BUILD_NUMBER} ${DOCKER_IMAGE}:latest"
                        sh "docker push ${DOCKER_IMAGE}:${BUILD_NUMBER}"
                        sh "docker push ${DOCKER_IMAGE}:latest"
                    }
                }
            }
        }
        
       stage('Deploy to DigitalOcean Kubernetes') {
    steps {
        withCredentials([file(credentialsId: 'do-kubeconfig', variable: 'KUBECONFIG')]) {
            sh '''
                export KUBECONFIG=$KUBECONFIG
                
                echo "Kubectl version:"
                kubectl version --client
                
                echo "Updating deployment YAML:"
                sed -i "s|image: .*|image: omardibba/healthlink-frontend:${BUILD_NUMBER}|" k8s/frontend-deployment.yaml
                
                echo "Applying Kubernetes manifests:"
                kubectl apply -f k8s/frontend-deployment.yaml
                kubectl apply -f k8s/frontend-service.yaml
                kubectl apply -f k8s/frontend-hpa.yaml
                
                echo "Waiting for deployment to be ready:"
                kubectl rollout status deployment/healthlink-frontend --timeout=300s
                
                echo "Checking pods:"
                kubectl get pods
                
                echo "Checking services:"
                kubectl get services
            '''
        }
    }
}
    }
    
    post {
        always {
            sh 'rm -f $KUBECONFIG'
        }
    }
}