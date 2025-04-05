// routes/index.js
const express = require('express');
const router = express.Router();

// Rota temporária para testes
router.get('/status', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date(),
    environment: process.env.NODE_ENV
  });
});

// Aqui serão adicionadas outras rotas posteriormente
// const runesRoutes = require('./runes.routes');
// router.use('/runes', runesRoutes);

module.exports = router;