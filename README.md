# HealthLink Africa dApp

HealthLink Africa is a decentralized application (dApp) built on the Polygon blockchain, aimed at improving healthcare record management and data sharing in Africa. This project combines blockchain technology with a user-friendly web interface to create a secure and efficient healthcare ecosystem.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Smart Contracts](#smart-contracts)
- [Frontend](#frontend)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Overview

HealthLink Africa allows patients to securely store their medical records on the blockchain, while doctors can access and update these records with patient permission. The platform also includes a marketplace feature for anonymized health data sharing.

## Features

- Secure patient registration and authentication
- Doctor registration and verification
- Blockchain-based medical record storage
- Permissioned access to patient records for doctors
- Health data marketplace for research purposes
- Token-based incentive system for data sharing

## Architecture

The HealthLink Africa dApp consists of the following components:

- Smart Contracts (Solidity) deployed on Polygon Amoy Testnet
- React.js frontend
- Web3.js for blockchain interactions
- Docker for containerization
- Kubernetes for orchestration
- Jenkins for CI/CD pipeline

## Prerequisites

- Node.js (v14.0.0 or later)
- npm (v6.0.0 or later)
- MetaMask browser extension
- Docker
- Kubernetes cluster (e.g., DigitalOcean Kubernetes)
- Jenkins server

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/Omardibba50/HealthLInk-dApp.git
   cd healthlink-dApp
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add the following:
   ```
   REACT_APP_HEALTH_CONTRACT_ADDRESS=<your_health_contract_address>
   REACT_APP_MARKETPLACE_CONTRACT_ADDRESS=<your_marketplace_contract_address>
   ```

4. Start the development server:
   ```
   npm start
   ```

## Smart Contracts

The smart contracts are located in the `blockchain` directory. To compile and deploy the contracts:

1. Navigate to the blockchain directory:
   ```
   cd blockchain
   ```

2. Install Hardhat and dependencies:
   ```
   npm install
   ```

3. Compile the contracts:
   ```
   npx hardhat compile
   ```

4. Deploy to Polygon Amoy Testnet:
   ```
   npx hardhat run scripts/deploy.js --network polygon_amoy
   ```

Make sure to update the contract addresses in your frontend `.env` file after deployment.

## Frontend

The frontend is built with React.js and uses Web3.js for blockchain interactions. Key components include:

- `Login.js`: Handles user authentication and registration
- `PatientDashboard.js`: Displays patient records and allows data sharing
- `DoctorDashboard.js`: Provides interface for doctors to view and update patient records
- `Marketplace.js`: Facilitates health data transactions

## Deployment

The application is deployed using a CI/CD pipeline with Jenkins and Kubernetes. 

1. Build the Docker image:
   ```
   docker build -t yourdockerhubusername/healthlink-frontend:latest .
   ```

2. Push the image to Docker Hub:
   ```
   docker push yourdockerhubusername/healthlink-frontend:latest
   ```

3. Apply Kubernetes manifests:
   ```
   kubectl apply -f k8s/frontend-deployment.yaml
   kubectl apply -f k8s/frontend-service.yaml
   kubectl apply -f k8s/frontend-hpa.yaml
   ```

For detailed deployment instructions, refer to the Jenkinsfile in the repository.

## Contributing

We welcome contributions to the HealthLink Africa project. Please read our [CONTRIBUTING.md](CONTRIBUTING.md) file for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.