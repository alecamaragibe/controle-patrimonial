
const prisma = require('../database/prisma')

const criarMovimentacao = async (req, res) => {
    try {
        const {
            tipo,
            observacao,
            patrimonioId,
            novaLocalizacao
        } = req.body

        const usuarioId = req.usuarioId

        const resultado = await prisma.$transaction(async (tx) => {

            const usuario = await tx.usuario.findUnique({
                where: { id: usuarioId }
            })

            if (!usuario) {
                throw new Error('Usuário não encontrado')
            }

            const patrimonio = await tx.patrimonio.findUnique({
                where: { id: patrimonioId }
            })

            if (!patrimonio) {
                throw new Error('Patrimônio não encontrado')
            }

            const movimentacao = await tx.movimentacao.create({
                data: {
                    tipo,
                    observacao,
                    patrimonioId,
                    usuarioId
                }
            })

            if (tipo === 'EMPRESTIMO') {
                await tx.patrimonio.update({
                    where: { id: patrimonioId },
                    data: {
                        status: 'Emprestado',
                        localizacao: novaLocalizacao
                    }
                })
            }

            if (tipo === 'DEVOLUCAO') {
                await tx.patrimonio.update({
                    where: { id: patrimonioId },
                    data: {
                        status: 'Disponível',
                        localizacao: novaLocalizacao
                    }
                })
            }

            await tx.logAuditoria.create({
                data: {
                    usuarioId: usuario.id,
                    usuarioNome: usuario.nome,
                    acao: tipo,
                    detalhes: `${tipo === 'EMPRESTIMO' ? 'Empréstimo' : tipo === 'DEVOLUCAO' ? 'Devolução' : 'Movimentação'} do patrimônio ${patrimonio.nome} (${patrimonio.patrimonio}). ${observacao || ''}`
                }
            })

            return movimentacao
        })

        return res.status(201).json(resultado)

    } catch (error) {
        console.error(error)

        return res.status(500).json({
            erro: error.message
        })
    }
}

const listarMovimentacoes = async (req, res) => {
    try {
        const movimentacoes = await prisma.movimentacao.findMany({
            include: {
                patrimonio: true,
                usuario: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return res.json(movimentacoes)

    } catch (error) {
        return res.status(500).json({
            erro: error.message
        })
    }
}

module.exports = {
    criarMovimentacao,
    listarMovimentacoes
}
