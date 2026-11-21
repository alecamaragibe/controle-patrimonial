
const express = require('express')
const router = express.Router()

const authMiddleware = require('../middlewares/authMiddleware')
const verificarPerfil = require('../middlewares/verificarPerfil')

const {
  criarSolicitacao,
  listarSolicitacoes,
  aprovarSolicitacao,
  recusarSolicitacao
} = require('../controllers/solicitacoesPatrimonioController')

// Gestor envia solicitação
router.post(
  '/solicitacoes-patrimonios',
  authMiddleware,
  verificarPerfil('gestor'),
  criarSolicitacao
)

// Administrador consulta todas; gestor consulta as próprias
router.get(
  '/solicitacoes-patrimonios',
  authMiddleware,
  verificarPerfil('admin', 'gestor'),
  listarSolicitacoes
)

// Administrador aprova
router.put(
  '/solicitacoes-patrimonios/:id/aprovar',
  authMiddleware,
  verificarPerfil('admin'),
  aprovarSolicitacao
)

// Administrador recusa
router.put(
  '/solicitacoes-patrimonios/:id/recusar',
  authMiddleware,
  verificarPerfil('admin'),
  recusarSolicitacao
)

module.exports = router
