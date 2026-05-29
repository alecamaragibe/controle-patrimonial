const express = require('express')

const router = express.Router()

const authMiddleware = require('../middlewares/authMiddleware')

const {
  criarUsuario,
  loginUsuario,
  listarUsuarios,
  deletarUsuario,
  editarUsuario
} = require('../controllers/usuariosController')

router.post('/usuarios', criarUsuario)

router.post('/login', loginUsuario)

router.get(
  '/usuarios',
  authMiddleware,
  listarUsuarios
)
router.put(
  '/usuarios/:id',
  authMiddleware,
  editarUsuario
)
router.delete(
  '/usuarios/:id',
  authMiddleware,
  deletarUsuario
)
module.exports = router