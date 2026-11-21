
const express = require('express')
const router = express.Router()

const authMiddleware = require('../middlewares/authMiddleware')

const {
  solicitarTransferencia,
  listarTransferencias,
  responderTransferencia
} = require('../controllers/transferenciasController')

// Solicitar transferência de patrimônio
router.post(
  '/transferencias',
  authMiddleware,
  solicitarTransferencia
)

// Listar transferências
router.get(
  '/transferencias',
  authMiddleware,
  listarTransferencias
)

// Responder transferência (aceitar ou recusar)
router.put(
  '/transferencias/:id/responder',
  authMiddleware,
  responderTransferencia
)

module.exports = router
