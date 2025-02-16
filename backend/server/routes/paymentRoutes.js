const express = require("express");
const { ethers } = require("ethers");
const pool = require("../config/db");
require("dotenv").config();
const crypto = require('crypto');


const router = express.Router();

// Hardhat Node Provider & Contract Setup
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
const privateKey = process.env.EMPLOYER_PRIVATE_KEY;
const wallet = new ethers.Wallet(privateKey, provider);

const contractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3"; // Replace with deployed contract address
const contractABI = [
    "function payWorker(address worker) external payable",
    "function getWorkerPayments(address worker) external view returns (uint256[] memory, address[] memory, uint256[] memory)",
    "function releasePayment(address worker, uint256 amount) external payable", // Added releasePayment function
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

    const workerAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

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

// Get Assignments by Contractor ID
router.get("/contractor-assignments/:contractorId", async (req, res) => {
    try {
        const { contractorId } = req.params;

        if (!contractorId) {
            return res.status(400).json({ success: false, message: "Contractor ID is required" });
        }

        // Fetch assignments made by the contractor
        const result = await pool.query(
            "SELECT id, aadhaar_number, expiration_date, payment, status, created_at FROM assignments WHERE contractor_id = $1 ORDER BY created_at DESC",
            [contractorId]
        );

        const assignments = result.rows.map(assignment => ({
            id: assignment.id,
            aadhaar_number: assignment.aadhaar_number,
            expiration_date: new Date(assignment.expiration_date).toISOString(),
            payment: assignment.payment,
            status: assignment.status,
            created_at: new Date(assignment.created_at).toISOString(),
        }));

        res.json({ success: true, assignments });
    } catch (error) {
        console.error("Error fetching contractor assignments:", error);
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
        const workerAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

        // Fetch payments from database
        const dbPayments = await pool.query(
            "SELECT amount, employer, transaction_hash, paid_at FROM payments WHERE worker_id = $1 ORDER BY paid_at DESC",
            [workerId]
        );

        // // Fetch payments from blockchain (Fixing BigInt issue)
        // const [amounts, employers, timestamps] = await contract.getWorkerPayments(workerAddress);

        // // Format blockchain data (Convert BigInt to correct types)
        // const blockchainPayments = amounts.map((amount, index) => ({
        //     amount: ethers.formatEther(amount.toString()), // Convert BigInt to String
        //     employer: employers[index],
        //     transaction_hash: "On Blockchain",
        //     paid_at: new Date(Number(timestamps[index]) * 1000).toISOString(), // Convert BigInt to Number
        // }));

        // // ✅ Combine Blockchain & DB Payments
        // const allPayments = [...dbPayments.rows, ...blockchainPayments];

        const allPayments = [...dbPayments.rows];

        res.json({ success: true, payments: allPayments });

    } catch (error) {
        console.error("Error fetching payment history:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});


// Release Payment API (Contractor releases payment to worker)
// Release Payment API (Contractor releases payment to worker)
router.post("/release-payment", async (req, res) => {
    try {
        const { assignmentId, contractorId } = req.body;
    
        if (!assignmentId || !contractorId) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }
    
        // Fetch assignment details
        const result = await pool.query(
            "SELECT aadhaar_number, payment, status, contractor_id FROM assignments WHERE id = $1",
            [assignmentId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Assignment not found" });
        }
    
        const assignment = result.rows[0];

        // 🔹 Get `worker_id` from `workers` table using `aadhaar_hash`
        const aadhaarHash = require("crypto").createHash("sha256").update(assignment.aadhaar_number).digest("hex");

        const workerResult = await pool.query(
            "SELECT id FROM workers WHERE aadhaar_hash = $1",
            [aadhaarHash]
        );

        const workerId = workerResult.rows[0].id;
  
        // Ensure only the contractor can release payment
        if (contractorId !== assignment.contractor_id) {
            return res.status(403).json({ success: false, message: "Unauthorized: Only the contractor can release payment" });
        }
    
        if (assignment.status !== "unpaid") {
            return res.status(400).json({ success: false, message: "Assignment is not in 'unpaid' status" });
        }
  
        const workerAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
    
        // Validate Ethereum address
        if (!ethers.isAddress(workerAddress)) {
            return res.status(400).json({ success: false, message: "Invalid worker Ethereum address" });
        }

        let paymentAmount;
        paymentAmount = ethers.parseEther(assignment.payment.toString());
        const tx = await contract.releasePayment(workerAddress, assignmentId, {
            value: paymentAmount,
        });
  
        await tx.wait();

        // const transactionHash = crypto.createHash('sha256')
        // .update(`${workerId}-${assignmentId}-${Date.now()}`)
        // .digest('hex');

        await pool.query(
            "INSERT INTO payments (worker_id, amount, employer, transaction_hash) VALUES ($1, $2, $3, $4)",
            [workerId, assignment.payment, contractorId, transactionHash]
        );

        // Update assignment status to 'paid' in database
        await pool.query("UPDATE assignments SET status = 'paid' WHERE id = $1", [assignmentId]);
  
        // res.json({ success: true, message: "Payment released successfully", txHash: tx.hash });
        res.json({ success: true, message: "Payment released successfully" });

    } catch (error) {
      console.error("Error releasing payment:", error);
      res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
  });
  
  

// Get Assigned Works for Worker (Contractor or Worker)
router.get("/assignments/:aadhaar", async (req, res) => {
  try {
      const { aadhaar } = req.params;

      if (!aadhaar || aadhaar.length !== 12) {
          return res.status(400).json({ success: false, message: "Invalid Aadhaar number" });
      }

      // Hash Aadhaar for lookup
      const aadhaarHash = require("crypto").createHash("sha256").update(aadhaar).digest("hex");

      // Fetch assignments from database
      const result = await pool.query(
          "SELECT id, contractor_id, aadhaar_number, expiration_date, payment, status FROM assignments WHERE aadhaar_number = $1 ORDER BY created_at DESC",
          [aadhaar]
      );

      const works = result.rows.map(work => ({
          ...work,
          expiration_date: new Date(work.expiration_date).toISOString(),
      }));

      res.json({ success: true, works });
  } catch (error) {
      console.error("Error fetching assigned works:", error);
      res.status(500).json({ success: false, message: "Server error" });
  }
});


// List Assigned Works API (Contractor sees assigned works)
router.get("/assigned-works/:contractorId", async (req, res) => {
  try {
      const { contractorId } = req.params;

      const result = await pool.query(
          "SELECT id, aadhaar_number, expiration_date, payment, status FROM assignments WHERE contractor_id = $1 ORDER BY created_at DESC",
          [contractorId]
      );

      const works = result.rows.map(work => ({
          ...work,
          expiration_date: new Date(work.expiration_date).toISOString(),
      }));

      res.json({ success: true, works });
  } catch (error) {
      console.error("Error fetching assigned works:", error);
      res.status(500).json({ success: false, message: "Server error" });
  }
});

// Raise Dispute API (Contractor or Worker raises dispute)
router.post("/raise-dispute", async (req, res) => {
  try {
      const { assignmentId } = req.body;

      // Fetch assignment details
      const result = await pool.query(
          "SELECT contractor_id, aadhaar_number, expiration_date, status FROM assignments WHERE id = $1",
          [assignmentId]
      );

      if (result.rows.length === 0) {
          return res.status(404).json({ success: false, message: "Assignment not found" });
      }

      const assignment = result.rows[0];

      // Check if dispute can be raised
      if (assignment.status === "paid") {
          return res.status(400).json({ success: false, message: "Cannot raise dispute for paid assignments" });
      }

      // If the expiration date is passed, automatically mark as "dispute"
      if (new Date() > new Date(assignment.expiration_date)) {
          await pool.query(
              "UPDATE assignments SET status = 'dispute' WHERE id = $1",
              [assignmentId]
          );
          return res.json({ success: true, message: "Dispute raised automatically due to expiration" });
      }

      // Raise dispute manually
      await pool.query(
          "UPDATE assignments SET status = 'dispute' WHERE id = $1",
          [assignmentId]
      );

      res.json({ success: true, message: "Dispute raised successfully" });
  } catch (error) {
      console.error("Error raising dispute:", error);
      res.status(500).json({ success: false, message: "Server error" });
  }
});


  
  

module.exports = router;
