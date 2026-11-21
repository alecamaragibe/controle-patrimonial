require('dotenv').config()

const express = require('express')
const cors = require('cors')

const usuariosRoutes = require('./routes/usuariosRoutes')
const patrimoniosRoutes = require('./routes/patrimoniosRoutes')
const movimentacoesRoutes = require('./routes/movimentacoesRoutes')
const dashboardRoutes = require('./routes/dashboardRoutes')
const inventariosRoutes = require('./routes/inventariosRoutes')
const transferenciasRoutes = require('./routes/transferenciasRoutes')
const logsRoutes = require('./routes/logsRoutes')
const solicitacoesPatrimonioRoutes = require('./routes/solicitacoesPatrimonioRoutes')

const app = express()

app.use(cors())
app.use(express.json())

app.use(usuariosRoutes)
app.use(patrimoniosRoutes)
app.use(movimentacoesRoutes)
app.use('/dashboard', dashboardRoutes)
app.use(inventariosRoutes)
app.use(transferenciasRoutes)
app.use(logsRoutes)
app.use(solicitacoesPatrimonioRoutes)

app.get('/', (req, res) => {
  return res.send('API funcionando')
})

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000')
})