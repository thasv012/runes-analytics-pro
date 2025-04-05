// servidor.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const { RateLimiterMemory } = require('rate-limiter-flexible');

const app = express();
const port = process.env.PORT || 3008;

// Configuração de segurança
app.use(helmet({
  contentSecurityPolicy: false, // Desativado para facilitar o desenvolvimento
}));
app.use(cors());

// Rate limiting - protege contra ataques de DDoS
const rateLimiter = new RateLimiterMemory({
  points: 20, // Número de requisições
  duration: 1, // Por 1 segundo
});

app.use((req, res, next) => {
  rateLimiter.consume(req.ip)
    .then(() => {
      next();
    })
    .catch(() => {
      res.status(429).json({error: 'Muitas requisições, tente novamente mais tarde'});
    });
});

// Middleware para logs
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Servir arquivos estáticos
app.use(express.static(__dirname));
app.use(express.json());

   // Rotas API
   const routes = require('./routes');
   app.use('/api', routes);
   
// Rota principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Erro interno no servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : null
  });
});

// Iniciar servidor
app.listen(port, () => {
  console.log('===================================');
  console.log(`SERVIDOR RODANDO NA PORTA ${port}`);
  console.log(`Acesse: http://localhost:${port}`);
  console.log(`Ambiente: ${process.env.NODE_ENV}`);
  console.log('===================================');
});