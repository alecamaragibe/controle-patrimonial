
const express = require('express')

const router = express.Router()

const authMiddleware = require('../middlewares/authMiddleware')
const verificarPerfil = require('../middlewares/verificarPerfil')

const {
  criarUsuario,
  loginUsuario,
  listarUsuarios,
  deletarUsuario,
  editarUsuario,
  cadastrarUsuarioPublico
} = require('../controllers/usuariosController')

// Rotas públicas
router.post('/login', loginUsuario)
router.post('/cadastro', cadastrarUsuarioPublico)

// Rotas administrativas: somente admin
router.post(
  '/usuarios',
  authMiddleware,
  verificarPerfil('admin'),
  criarUsuario
)

router.get(
  '/usuarios',
  authMiddleware,
  verificarPerfil('admin'),
  listarUsuarios
)

router.put(
  '/usuarios/:id',
  authMiddleware,
  verificarPerfil('admin'),
  editarUsuario
)

router.delete(
  '/usuarios/:id',
  authMiddleware,
  verificarPerfil('admin'),
  deletarUsuario
)

module.exports = router
