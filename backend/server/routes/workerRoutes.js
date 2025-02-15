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
router.post('/assign-work', async (req, res) => {
    try {
      const { aadhaar, employer, workDays, dailyWage } = req.body;
  
      if (!aadhaar || aadhaar.length !== 12) {
        return res.status(400).json({ success: false, message: 'Invalid Aadhaar number' });
      }
      if (!workDays || !dailyWage || workDays <= 0 || dailyWage <= 0) {
        return res.status(400).json({ success: false, message: 'Invalid work details' });
      }
  
      // Hash Aadhaar for lookup
      const aadhaarHash = crypto.createHash('sha256').update(aadhaar).digest('hex');
  
      // Fetch worker ID
      const workerResult = await pool.query(
        'SELECT id FROM workers WHERE aadhaar_hash = $1',
        [aadhaarHash]
      );
  
      if (workerResult.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Worker not found' });
      }
  
      const workerId = workerResult.rows[0].id;
  
      // Insert work assignment
      await pool.query(
        'INSERT INTO work_assignments (worker_id, employer, work_days, daily_wage) VALUES ($1, $2, $3, $4)',
        [workerId, employer, workDays, dailyWage]
      );
  
      res.json({ success: true, message: 'Work assigned successfully' });
  
    } catch (error) {
      console.error('Error assigning work:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });  
  
  module.exports = router;