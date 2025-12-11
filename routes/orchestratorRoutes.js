//orchestrator/routes/orchestratorRoutes.js

const express = require("express");
const router = express.Router();
const orchestratorController = require('../controllers/orchestratorController');

//contrato: POST/run
router.post("/run", orchestratorController.runPredictionFlow);

//contrato: GET /health
router.get("/health", orchestratorController.getHealth);

module.exports = router;