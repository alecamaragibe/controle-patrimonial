
const express = require('express')
const router = express.Router()

const authMiddleware = require('../middlewares/authMiddleware')
const verificarPerfil = require('../middlewares/verificarPerfil')

const {
  listarLogs
} = require('../controllers/logsController')

// Consultar Logs de Auditoria (somente administrador)
router.get(
  '/logs',
  authMiddleware,
  verificarPerfil('admin'),
  listarLogs
)

module.exports = router
