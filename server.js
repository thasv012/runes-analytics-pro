import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { WebSocketServer } from "ws";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Middleware para logs
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Middleware para tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Algo deu errado!");
});

// Servir arquivos estáticos
app.use(express.static(__dirname));

// Rota principal
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Iniciar servidor
const server = app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});

// Configurar WebSocket
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
    console.log("Nova conexão WebSocket estabelecida");
    
    ws.on("message", (message) => {
        console.log("Mensagem recebida:", message);
    });
    
    ws.on("error", (error) => {
        console.error("Erro no WebSocket:", error);
    });
});
