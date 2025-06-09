// backend/server.js
const express = require("express");
const cors = require("cors");
const redis = require("redis");

const app = express();
app.use(cors());
app.use(express.json());

// Configuración de Redis local
const redisClient = redis.createClient({url: "redis://127.0.0.1:6379" });
redisClient.connect().catch(console.error);

// Endpoint para obtener alertas desde Redis
app.get("/alertas-redis/:usuarioId", async (req, res) => {
  try {
    const usuarioId = req.params.usuarioId;
    const keys = await redisClient.keys("alerta:*");
    const values = await Promise.all(keys.map(k => redisClient.get(k)));
    const alertas = values
      .map(v => JSON.parse(v))
      .filter(a => a.usuarioId === usuarioId);
    res.json(alertas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint para cachear alertas en Redis
app.post("/cache-alertas-redis", async (req, res) => {
  try {
    const { usuarioId, alertas } = req.body;
    if (!usuarioId || !Array.isArray(alertas)) {
      return res.status(400).json({ error: "Datos inválidos" });
    }
    for (const alerta of alertas) {
      await redisClient.set(
        `alerta:${alerta.transaccionId}`,
        JSON.stringify(alerta),
        { EX: 60 * 60 }
      );
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5001, () => {
  console.log("Servidor Express para Redis escuchando en http://localhost:5001");
});