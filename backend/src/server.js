require("dotenv").config();
const express = require("express");
const cors    = require("cors");

const authRoutes  = require("./routes/auth");
const timesRoutes = require("./routes/times");

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Middlewares globais ──────────────────────────────────────────
app.use(cors({ origin: "http://localhost:5173" })); // ajuste para a URL do seu front (Vite)
app.use(express.json());

// ── Rotas ────────────────────────────────────────────────────────
app.use("/auth",  authRoutes);
app.use("/times", timesRoutes);

// ── Health check ─────────────────────────────────────────────────
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// ── 404 catch-all ────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ erro: "Rota não encontrada." }));

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});