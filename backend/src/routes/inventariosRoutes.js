
const express = require('express')
const router = express.Router()

const authMiddleware = require('../middlewares/authMiddleware')
const verificarPerfil = require('../middlewares/verificarPerfil')

const {
  criarInventario,
  listarInventarios,
  editarInventario,
  excluirInventario
} = require('../controllers/inventariosController')

// Somente administradores podem cadastrar inventários
router.post(
  '/inventarios',
  authMiddleware,
  verificarPerfil('admin'),
  criarInventario
)

// Administradores e gestores podem consultar inventários
router.get(
  '/inventarios',
  authMiddleware,
  listarInventarios
)

// Somente administradores podem editar inventários
router.put(
  '/inventarios/:id',
  authMiddleware,
  verificarPerfil('admin'),
  editarInventario
)

router.delete(
  '/inventarios/:id',
  authMiddleware,
  verificarPerfil('admin'),
  excluirInventario
)

module.exports = router
