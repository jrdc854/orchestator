// orchestrator/server.js

const express = require("express");
const fetch = require('node-fetch'); //para las llamedas internas
const orchestratorRoutes = require("./routes/orchestratorRoutes");

//variables de entorno y conf
const PORT = process.env.PORT || 8080;
const ACQUIRE_URL = process.env.ACQUIRE_URL || "http://acquire:3001";
const PREDICT_URL = process.env.PREDICT_URL || "http://predict:3002";


const app = express();
app.use(express.json());

// ------------------------------------------------------------------
// --- FUNCIÓN DE INICIALIZACIÓN (Simulada para el Orchestrator) ---
// ------------------------------------------------------------------

// Aquí el Orchestrator podría chequear que sus dependencias están listas.
async function initDependencies() {
  console.log('[ORCHESTRATOR] Chequeando dependencias...');
  
  // 1. Chequeo de Acquire
  const acquireHealth = await fetch(`${ACQUIRE_URL}/health`).catch(() => null);
  if (!acquireHealth || acquireHealth.status !== 200) {
    console.error(`[ORCHESTRATOR] Acquire no está listo o no responde en ${ACQUIRE_URL}/health`);
    // En un entorno de producción, intentaríamos de nuevo o lanzaríamos un error fatal.
  } else {
    console.log('[ORCHESTRATOR] Acquire OK.');
  }
  
  // 2. Chequeo de Predict
  const predictHealth = await fetch(`${PREDICT_URL}/health`).catch(() => null);
  if (!predictHealth || predictHealth.status !== 200) {
    console.error(`[ORCHESTRATOR] Predict no está listo o no responde en ${PREDICT_URL}/health`);
  } else {
    console.log('[ORCHESTRATOR] Predict OK.');
  }

  // Devolvemos las URLs para asegurar que el server las conoce
  return { ACQUIRE_URL, PREDICT_URL };
}



//CONFIGURACIÖN DE RUTAS
app.use("/", orchestratorRoutes);

//arranque del servidor e inicialización de dependencias
app.listen(PORT, async () => {
    const serverUrl = `http://localhost:${PORT}`;
    console.log(`[ORCHESTRATOR] Servicio escuchando en ${serverUrl}`);

    try {
        await initDependencies();
    }catch (err){
        console.error("Error al inicializar dependencias:", err);
        process.exit(1);
    }
});

