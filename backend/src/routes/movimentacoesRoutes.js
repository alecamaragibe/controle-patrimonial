const express = require('express')
const router = express.Router()
const authMiddleware = require('../middlewares/authMiddleware')

const {
    criarMovimentacao,
    listarMovimentacoes
} = require('../controllers/movimentacoesController')

router.post(
    '/movimentacoes',
    authMiddleware,
    criarMovimentacao
)

router.get(
    '/movimentacoes',
    authMiddleware,
    listarMovimentacoes
)

module.exports = router