require('dotenv').config()

const express = require('express')
const cors = require('cors')

const usuariosRoutes = require('./routes/usuariosRoutes')
const patrimoniosRoutes = require('./routes/patrimoniosRoutes')
const movimentacoesRoutes = require('./routes/movimentacoesRoutes')

const app = express()

app.use(cors())
app.use(express.json())

app.use(usuariosRoutes)
app.use(patrimoniosRoutes)
app.use(movimentacoesRoutes)

app.get('/', (req, res) => {
  return res.send('API funcionando')
})

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000')
})