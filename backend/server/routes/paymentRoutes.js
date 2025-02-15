const express = require("express");
const { ethers } = require("ethers");
const pool = require("../config/db");
require("dotenv").config();

const router = express.Router();

// Hardhat Node Provider & Contract Setup
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
const privateKey = process.env.EMPLOYER_PRIVATE_KEY;
const wallet = new ethers.Wallet(privateKey, provider);

const contractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3"; // Replace with deployed contract address
const contractABI = [
    "function payWorker(address worker) external payable",
    "function getWorkerPayments(address worker) external view returns (uint256[] memory, address[] memory, uint256[] memory)", // ✅ Added
    "event PaymentMade(address indexed worker, address indexed employer, uint256 amount, uint256 timestamp)"
  ];
  
const contract = new ethers.Contract(contractAddress, contractABI, wallet);

// 🔹 Wage Payment API
router.post("/process-payment", async (req, res) => {
  try {
    const { aadhaar, amount } = req.body;

    if (!aadhaar || amount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid input" });
    }

    // Hash Aadhaar for lookup
    const aadhaarHash = require("crypto").createHash("sha256").update(aadhaar).digest("hex");

    // Fetch Worker Address
    const workerResult = await pool.query("SELECT id, blockchain_address FROM workers WHERE aadhaar_hash = $1", [aadhaarHash]);

    if (workerResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Worker not found" });
    }

    const workerAddress = workerResult.rows[0].blockchain_address;

    // Send Payment via Smart Contract
    const tx = await contract.payWorker(workerAddress, { value: ethers.parseEther(amount.toString()) });
    await tx.wait();

    // Store Payment in Database
    await pool.query(
      "INSERT INTO payments (worker_id, amount, employer, transaction_hash) VALUES ($1, $2, $3, $4)",
      [workerResult.rows[0].id, amount, wallet.address, tx.hash]
    );

    res.json({ success: true, message: "Payment successful", txHash: tx.hash });

  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 🔹 Get Payment History API (Fixed)
// 🔹 Get Payment History API (Fixed BigInt Conversion)
router.get("/get-payments/:aadhaar", async (req, res) => {
    try {
        const { aadhaar } = req.params;
  
        if (!aadhaar || aadhaar.length !== 12) {
            return res.status(400).json({ success: false, message: "Invalid Aadhaar number" });
        }

        // Hash Aadhaar for lookup
        const aadhaarHash = require("crypto").createHash("sha256").update(aadhaar).digest("hex");

        // Fetch Worker ID
        const workerResult = await pool.query(
            "SELECT id, blockchain_address FROM workers WHERE aadhaar_hash = $1",
            [aadhaarHash]
        );

        if (workerResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Worker not found" });
        }

        const workerId = workerResult.rows[0].id;
        const workerAddress = workerResult.rows[0].blockchain_address;

        // Fetch payments from database
        const dbPayments = await pool.query(
            "SELECT amount, employer, transaction_hash, paid_at FROM payments WHERE worker_id = $1 ORDER BY paid_at DESC",
            [workerId]
        );

        // Fetch payments from blockchain (Fixing BigInt issue)
        const [amounts, employers, timestamps] = await contract.getWorkerPayments(workerAddress);

        // Format blockchain data (Convert BigInt to correct types)
        const blockchainPayments = amounts.map((amount, index) => ({
            amount: ethers.formatEther(amount.toString()), // Convert BigInt to String
            employer: employers[index],
            transaction_hash: "On Blockchain",
            paid_at: new Date(Number(timestamps[index]) * 1000).toISOString(), // Convert BigInt to Number
        }));

        // ✅ Combine Blockchain & DB Payments
        const allPayments = [...dbPayments.rows, ...blockchainPayments];

        res.json({ success: true, payments: allPayments });

    } catch (error) {
        console.error("Error fetching payment history:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});


  
  

module.exports = router;
