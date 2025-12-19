// orchestrator/controllers/orchestratorController.js

const fetch = require('node-fetch');

//URLS
const ACQUIRE_URL = process.env.ACQUIRE_URL || "http://acquire:3001";
const PREDICT_URL = process.env.PREDICT_URL || "http://predict:3002";


exports.getHealth = (req, res) => {
    res.status(200).json({ status: "ok", service: "orchestrator" });

};

exports.runPredictionFlow = async (req, res) => {
    let acquireData;

    //llamada a acquire
    try {
        console.log('[CONTROLLER] 1. Llamando a ACQUIRE...');
        const acquireResponse = await fetch(`${ACQUIRE_URL}/data`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({})
        });

        if (!acquireResponse.ok) {
            console.error(`Error de Acquire: ${acquireResponse.status}`);
            return res.status(502).json({ error: 'Acquire service failed.' });
        }

        acquireData = await acquireResponse.json();
        const { dataId, features, featureCount } = acquireData;

        if (featureCount !== 7) {
            return res.status(500).json({ error: 'Acquire returned invalid feature count.' });
        }
    } catch (error) {
        console.error('Network Error connecting to Acquire:', error.message);
        return res.status(504).json({ error: 'Gateway Timeout: Cannot reach Acquire service.' });
    }

    //llamada a predict
    try {
        console.log('[CONTROLLER] 2. Llamando a PREDICT...');

        const predictBody = {
            features: acquireData.features,
            meta: {
                featureCount: acquireData.featureCount,
                dataId: acquireData.dataId,
                source: "orchestrator",
                correlationId: Date.now().toString()
            }
        };

        const predictResponse = await fetch(`${PREDICT_URL}/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(predictBody)
        });

        if (!predictResponse.ok) {
            console.error(`Error de Predict: ${predictResponse.status}`);
            return res.status(502).json({ error:'Predict service failed.' });
        }

        const predictData = await predictResponse.json();

        //cumplir el contrato de orchestrator
        console.log('[CONTROLLER] 3. Flujo complretado con éxito.');
        return res.status(200).json({
            dataId: acquireData.dataId,
            predictionId: predictData.predictionId,
            prediction: predictData.prediction,
            timestamp: new Date().toISOString()
        });
    }catch (error) {
        console.error('Network Error connecting to Predict:', error.message);
        return res.status(504).json({ error: 'Gateway Timeout: Cannot reach Predict service.'});
    }
};
