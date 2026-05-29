const express = require('express')

const router = express.Router()

const authMiddleware = require('../middlewares/authMiddleware')

const {
  criarPatrimonio,
  listarPatrimonios,
  editarPatrimonio,
  deletarPatrimonio
} = require('../controllers/patrimoniosController')

router.post(
  '/patrimonios',
  authMiddleware,
  criarPatrimonio
)

router.get(
  '/patrimonios',
  authMiddleware,
  listarPatrimonios
)

router.put(
    '/patrimonios/:id',
    authMiddleware,
    editarPatrimonio
)

router.delete(
    '/patrimonios/:id',
    authMiddleware,
    deletarPatrimonio
)

module.exports = router