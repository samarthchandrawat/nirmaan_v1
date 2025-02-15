require('dotenv').config();
const express = require('express');
const cors = require('cors');
const workerRoutes = require('./routes/workerRoutes');
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();
app.use(express.json());
app.use(cors());

app.use('/api', workerRoutes);
app.use("/api", paymentRoutes);

const PORT = 5001; // Running separate from Web3 backend
app.listen(PORT, () => console.log(`Express API running on port ${PORT}`));
