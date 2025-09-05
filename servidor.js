// Em: servidor.js

import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

// Para __dirname funcionar em ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const port = 3000;

// --- Middlewares Essenciais ---
app.use(express.json());

// --- Servindo os Arquivos do Front-End ---
// Esta linha garante que qualquer arquivo dentro da pasta 'public' seja acessível.
app.use(express.static(path.join(__dirname, "public")));

// --- Conexão com o MongoDB ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Conectado ao MongoDB..."))
  .catch(err => console.error("Erro ao conectar ao MongoDB:", err));

// --- Importando as Rotas da API ---
import rotasUsuario from "./routes/rotasUsuario.js";
import rotasProduto from "./routes/rotasProduto.js";
import rotasPedido from "./routes/rotasPedido.js";

// --- Usando as Rotas da API ---
app.use("/api/usuarios", rotasUsuario);
app.use("/api/produtos", rotasProduto);
app.use("/api/pedidos", rotasPedido);


// --- Iniciando o Servidor ---
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});