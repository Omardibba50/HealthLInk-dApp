#!/bin/bash

# Function to read and display file content
read_file() {
    if [ -f "$1" ]; then
        echo "=== Content of $1 ==="
        cat "$1"
        echo "=== End of $1 ==="
        echo
    else
        echo "File $1 does not exist."
        echo
    fi
}

# Blockchain
read_file "blockchain/contracts/Health.sol"
read_file "blockchain/contracts/HealthDataMarketplace.sol"
read_file "blockchain/hardhat.config.js"
read_file "blockchain/package.json"

read_file "blockchain/scripts/deploy.js"

# Frontend
read_file "frontend/README.md"
read_file "frontend/package.json"

read_file "frontend/postcss.config.js"
read_file "frontend/tailwind.config.js"

# Frontend Public
read_file "frontend/public/index.html"
read_file "frontend/public/favicon.ico"
read_file "frontend/public/logo192.png"
read_file "frontend/public/logo512.png"
read_file "frontend/public/manifest.json"
read_file "frontend/public/robots.txt"

# Frontend Source
read_file "frontend/src/App.js"
read_file "frontend/src/App.css"
read_file "frontend/src/App.test.js"
read_file "frontend/src/index.css"
read_file "frontend/src/index.js"
read_file "frontend/src/logo.svg"
read_file "frontend/src/reportWebVitals.js"
read_file "frontend/src/setupTests.js"

# Frontend Source ABIs
read_file "frontend/src/abis/Health.json"
read_file "frontend/src/abis/HealthDataMarketplace.json"

# Frontend Source Utils
read_file "frontend/src/utils/web3Config.js"

# Frontend Source Pages
read_file "frontend/src/pages/Login.js"
read_file "frontend/src/pages/PatientDashboard.js"
read_file "frontend/src/pages/DoctorDashboard.js"
read_file "frontend/src/pages/ResearcherDashboard.js"
read_file "frontend/src/pages/Marketplace.js"
read_file "frontend/src/pages/LandingPage.js"

# Frontend Source Components
read_file "frontend/src/components/Sidebar.js"

echo "Review completed. Please check the output for any inconsistencies or connection issues."