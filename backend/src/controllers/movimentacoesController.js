const prisma = require('../database/prisma')

const criarMovimentacao = async (req, res) => {

    try {

        const {
            tipo,
            observacao,
            patrimonioId
        } = req.body

        const usuarioId = req.usuarioId

        const movimentacao =
            await prisma.movimentacao.create({

                data: {
                    tipo,
                    observacao,
                    patrimonioId,
                    usuarioId
                }

            })
        if (tipo === 'EMPRESTIMO') {
            await prisma.patrimonio.update({

                where: {
                    id: patrimonioId
                },

                data: {
                    status: 'Emprestado'
                }

            })

        }  
        
        if (tipo === 'DEVOLUCAO') {

            await prisma.patrimonio.update({

                where: {
                    id: patrimonioId
                },

                data: {
                    status: 'Disponível'
                }
            })
        }
        
        return res.status(201).json(movimentacao)
    
    }   catch (error) {

        return res.status(500).json({
            erro: error.message
        })

    }

}

const listarMovimentacoes = async (req, res) => {

    try {

        const movimentacoes =
            await prisma.movimentacao.findMany({

                include: {
                    patrimonio: true,
                    usuario: true
                },

                orderBy: {
                    createdAt: 'desc'
                }

            })
        return res.json(movimentacoes)     

    }   catch (error) {

        return res.status(500).json({
            erro: error.message
        })

    }

}

module.exports = {
    criarMovimentacao,
    listarMovimentacoes
}