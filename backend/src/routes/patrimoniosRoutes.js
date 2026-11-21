
const express = require('express')

const router = express.Router()

const authMiddleware = require('../middlewares/authMiddleware')
const verificarPerfil = require('../middlewares/verificarPerfil')

const {
  criarPatrimonio,
  listarPatrimonios,
  editarPatrimonio,
  deletarPatrimonio
} = require('../controllers/patrimoniosController')

// Cadastro direto: somente administrador
router.post(
  '/patrimonios',
  authMiddleware,
  verificarPerfil('admin'),
  criarPatrimonio
)

// Consulta: administrador, gestor e usuário comum
router.get(
  '/patrimonios',
  authMiddleware,
  verificarPerfil('admin', 'gestor', 'usuario'),
  listarPatrimonios
)

// Edição direta: somente administrador
router.put(
  '/patrimonios/:id',
  authMiddleware,
  verificarPerfil('admin'),
  editarPatrimonio
)

// Exclusão direta: somente administrador
router.delete(
  '/patrimonios/:id',
  authMiddleware,
  verificarPerfil('admin'),
  deletarPatrimonio
)

module.exports = router
