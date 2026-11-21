
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()


// LISTAR LOGS DE AUDITORIA
const listarLogs = async (req, res) => {
  try {

    // Busca os registros mais recentes primeiro
    const logs = await prisma.logAuditoria.findMany({
      orderBy: {
        dataHora: 'desc'
      }
    })

    return res.status(200).json(logs)

  } catch (error) {
    return res.status(500).json({
      erro: error.message
    })
  }
}


module.exports = {
  listarLogs
}
