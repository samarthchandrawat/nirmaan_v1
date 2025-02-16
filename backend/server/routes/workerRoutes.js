const express = require('express');
const crypto = require('crypto');
const pool = require('../config/db');
const blockchainAddress = "0x0000000000000000000000000000000000000000"; // Placeholder

const router = express.Router();

// 🔹 Worker Registration API
router.post('/register-worker', async (req, res) => {
  try {
    const { aadhaar, name, phone } = req.body;

    if (!aadhaar || aadhaar.length !== 12) {
      return res.status(400).json({ success: false, message: 'Invalid Aadhaar number' });
    }

    const aadhaarHash = crypto.createHash('sha256').update(aadhaar).digest('hex');

    const result = await pool.query(
        'INSERT INTO workers (aadhaar_hash, name, phone, blockchain_address) VALUES ($1, $2, $3, $4) RETURNING id',
        [aadhaarHash, name, phone, blockchainAddress]
      );

    res.json({ success: true, workerId: result.rows[0].id });
  } catch (error) {
    console.error('Error registering worker:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 🔹 Get Worker Details API
router.get('/get-worker/:aadhaar', async (req, res) => {
    try {
      const { aadhaar } = req.params;
  
      if (!aadhaar || aadhaar.length !== 12) {
        return res.status(400).json({ success: false, message: 'Invalid Aadhaar number' });
      }

      // Hash Aadhaar for lookup
      const aadhaarHash = crypto.createHash('sha256').update(aadhaar).digest('hex');
  
      // Fetch worker details
      const result = await pool.query(
        'SELECT id, name, phone FROM workers WHERE aadhaar_hash = $1',
        [aadhaarHash]
      );
  
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Worker not found' });
      }
  
      const worker = result.rows[0];
  
      res.json({
        success: true,
        workerId: worker.id,
        name: worker.name,
        phone: worker.phone
      });
  
    } catch (error) {
      console.error('Error fetching worker details:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

// 🔹 Assign Work API

// Assign Work API (Contractor assigns work to the worker)
router.post("/assign-work", async (req, res) => {
  try {
      const { aadhaar, days, payment, contractorId } = req.body;

      if (!aadhaar || !days || !payment || days <= 0 || payment <= 0) {
          return res.status(400).json({ success: false, message: "Invalid input" });
      }

      // Calculate expiration date
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + days);

      // Hash Aadhaar for lookup
      const aadhaarHash = require("crypto").createHash("sha256").update(aadhaar).digest("hex");

      // Fetch Worker ID from database using Aadhaar hash
      const workerResult = await pool.query(
          "SELECT id FROM workers WHERE aadhaar_hash = $1",
          [aadhaarHash]
      );

      if (workerResult.rows.length === 0) {
          return res.status(404).json({ success: false, message: "Worker not found" });
      }

      const workerId = workerResult.rows[0].id;

      // Insert work assignment into assignments table
      const result = await pool.query(
          "INSERT INTO assignments (contractor_id, aadhaar_number, expiration_date, payment, status) VALUES ($1, $2, $3, $4, 'unpaid') RETURNING id",
          [contractorId, aadhaar, expirationDate, payment]
      );

      res.json({ success: true, assignmentId: result.rows[0].id });
  } catch (error) {
      console.error("Error assigning work:", error);
      res.status(500).json({ success: false, message: "Server error" });
  }
});
  
  // Get Worker Assigned Works API
router.get("/worker-assigned-works/:aadhaar", async (req, res) => {
  try {
      const { aadhaar } = req.params;

      if (!aadhaar || aadhaar.length !== 12) {
          return res.status(400).json({ success: false, message: "Invalid Aadhaar number" });
      }

      // Hash Aadhaar for lookup
      const aadhaarHash = require("crypto").createHash("sha256").update(aadhaar).digest("hex");

      // Fetch assignments for the worker
      const result = await pool.query(
          "SELECT contractor_id, aadhaar_number, expiration_date, payment, status FROM assignments WHERE aadhaar_number = $1 ORDER BY created_at DESC",
          [aadhaarHash]
      );

      const works = result.rows.map(work => ({
          ...work,
          expiration_date: new Date(work.expiration_date).toISOString(),
      }));

      res.json({ success: true, works });
  } catch (error) {
      console.error("Error fetching worker assignments:", error);
      res.status(500).json({ success: false, message: "Server error" });
  }
});

// Raise Dispute API (Worker raises dispute)
router.post("/worker-raise-dispute", async (req, res) => {
  try {
      const { assignmentId } = req.body;

      // Fetch assignment details
      const result = await pool.query(
          "SELECT aadhaar_number, status FROM assignments WHERE id = $1",
          [assignmentId]
      );

      if (result.rows.length === 0) {
          return res.status(404).json({ success: false, message: "Assignment not found" });
      }

      const assignment = result.rows[0];

      // Only allow raising dispute if the status is "unpaid"
      if (assignment.status === "paid" || assignment.status === "dispute") {
          return res.status(400).json({ success: false, message: "Dispute cannot be raised" });
      }

      // Raise dispute
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