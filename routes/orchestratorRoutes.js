//orchestrator/routes/orchestratorRoutes.js

const express = require("express");
const router = express.Router();
const orchestratorController = require('../controllers/orchestratorController');

router.post("/run", orchestratorController.runPredictionFlow);

router.get("/health", orchestratorController.getHealth);

module.exports = router;