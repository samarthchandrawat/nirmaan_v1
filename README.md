# Nirmaan – Web3-Powered Wage Security

## Overview
Nirmaan is a Web3-based platform designed to ensure fair wages, instant payments, and transparent work records for India’s construction workers. By leveraging blockchain, smart contracts, and decentralized identity (DID), Nirmaan eliminates wage theft, prevents fraud, and removes middlemen from the payment process. Workers get paid on time, their employment history is securely recorded, and they can access government benefits without bureaucratic delays.


## Architecture
Nirmaan integrates Web3 with real-world financial infrastructure:

- Decentralized Identity (DID): Workers register using Aadhaar, generating an on-chain identity.
- Smart Contracts: Automate wage disbursement and maintain immutable payment logs.
- UPI Integration: Enables instant payouts to verified worker accounts.


## Conclusion
Nirmaan aims to create a fair and transparent wage system for construction workers, eliminating financial exploitation and ensuring seamless access to welfare benefits. By integrating Web3 with real-world financial infrastructure, we hope to drive real social impact. Future plans include expanding to other labor sectors and partnering with government agencies.

## Setup

# Setup Instructions  

## 1. Install Dependencies  

### Backend  
```sh
cd backend  
npm install
```

### Frontend
```sh
cd frontend
npm install
```

### Server
```sh
cd backend/server
npm install
```

## 2. Running the Application
Open four terminals and follow the steps below

### Terminal 1: Compile and Start Hardhat Local Blockchain
```sh
npx hardhat compile  
npx hardhat node
```

### Terminal 2: Deploy Smart Contracts
```sh
npx hardhat run scripts/deploy.ts --network localhost
```

### Terminal 3: Start the Frontend
```sh
cd frontend  
npm run dev
```

### Terminal 4: Start the Backend Server
```sh
cd backend/server  
node server.js  
```

## 3. Database Setup
### 1. Install PostgreSQL (if not already installed)
```sh
brew install postgresql  
brew services start postgresql
```

## 2. Access PostgreSQL
```sh
psql -U postgres
```

## 3. Create Database & User
```sql
CREATE DATABASE nirmaan;  

CREATE USER nirmaan_admin WITH PASSWORD 'nirmaan123';  
ALTER ROLE nirmaan_admin SET client_encoding TO 'utf8';  
ALTER ROLE nirmaan_admin SET default_transaction_isolation TO 'read committed';  
ALTER ROLE nirmaan_admin SET timezone TO 'UTC';  
GRANT ALL PRIVILEGES ON DATABASE nirmaan TO nirmaan_admin;
```

Exit PostgreSQL:

```sh
\q
```
  
## 4. Connect to the Database
```sh
psql -U nirmaan_admin -d nirmaan
```
 
## 5. Create Tables
Workers Table
```sql
CREATE TABLE workers (  
    id SERIAL PRIMARY KEY,  
    aadhaar_hash TEXT UNIQUE NOT NULL,  
    name TEXT NOT NULL,  
    phone TEXT NOT NULL  
);
```

Payments Table
```sql
CREATE TABLE payments (  
    id SERIAL PRIMARY KEY,  
    worker_id INT REFERENCES workers(id) ON DELETE CASCADE,  
    amount NUMERIC NOT NULL,  
    employer TEXT NOT NULL,  
    transaction_hash TEXT UNIQUE NOT NULL,  
    paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  
);
```

Citizens Table
```sql
CREATE TABLE citizens (  
    aadhar_number VARCHAR(12) PRIMARY KEY,  
    full_name VARCHAR(255) NOT NULL,  
    date_of_birth DATE NOT NULL,  
    phone_number VARCHAR(15) UNIQUE NOT NULL  
);
```

Assignments Table
```sql
CREATE TABLE assignments (  
    id SERIAL PRIMARY KEY,  
    contractor_id INT NOT NULL,  
    aadhaar_number VARCHAR(12) NOT NULL,  
    expiration_date DATE NOT NULL,  
    payment NUMERIC(10,2) NOT NULL,  
    status TEXT NOT NULL,  
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  
);  
```
