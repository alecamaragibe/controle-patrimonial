
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()


// ==================================================
// SOLICITAR TRANSFERÊNCIA
// ==================================================

const solicitarTransferencia = async (req, res) => {
  try {

    const {
      patrimonioId,
      inventarioDestinoId,
      observacao
    } = req.body

    const usuarioId = req.usuarioId
    const usuarioPerfil = req.usuarioPerfil

    // Somente gestores podem solicitar transferências
    if (usuarioPerfil !== 'gestor') {
      return res.status(403).json({
        erro: 'Somente gestores podem solicitar transferências'
      })
    }

    // Verifica os campos obrigatórios
    if (!patrimonioId || !inventarioDestinoId) {
      return res.status(400).json({
        erro: 'Patrimônio e inventário de destino são obrigatórios'
      })
    }

    // Busca o inventário administrado pelo gestor
    const inventarioOrigem = await prisma.inventario.findUnique({
      where: {
        gestorId: usuarioId
      }
    })

    if (!inventarioOrigem) {
      return res.status(404).json({
        erro: 'Nenhum inventário está associado a este gestor'
      })
    }

    // Verifica se o inventário de destino existe
    const inventarioDestino = await prisma.inventario.findUnique({
      where: {
        id: Number(inventarioDestinoId)
      }
    })

    if (!inventarioDestino) {
      return res.status(404).json({
        erro: 'Inventário de destino não encontrado'
      })
    }

    // Impede transferência para o próprio inventário
    if (inventarioOrigem.id === Number(inventarioDestinoId)) {
      return res.status(400).json({
        erro: 'O inventário de destino deve ser diferente do inventário de origem'
      })
    }

    // Verifica se o patrimônio pertence ao gestor solicitante
    const patrimonio = await prisma.patrimonio.findFirst({
      where: {
        id: Number(patrimonioId),
        inventarioId: inventarioOrigem.id
      }
    })

    if (!patrimonio) {
      return res.status(404).json({
        erro: 'Patrimônio não encontrado no seu inventário'
      })
    }

    // Verifica se existe empréstimo ativo
    const emprestimoAtivo = await prisma.emprestimo.findFirst({
      where: {
        patrimonioId: Number(patrimonioId),
        dataDevolucao: null
      }
    })

    if (emprestimoAtivo) {
      return res.status(400).json({
        erro: 'Este patrimônio possui um empréstimo ativo e não pode ser transferido'
      })
    }

    // Verifica se já existe uma transferência pendente
    const transferenciaPendente = await prisma.transferencia.findFirst({
      where: {
        patrimonioId: Number(patrimonioId),
        status: 'pendente'
      }
    })

    if (transferenciaPendente) {
      return res.status(400).json({
        erro: 'Este patrimônio já possui uma transferência pendente'
      })
    }

    // Cria a transferência e o log na mesma transação
    const transferencia = await prisma.$transaction(async (tx) => {

      const usuario = await tx.usuario.findUnique({
        where: {
          id: usuarioId
        }
      })

      if (!usuario) {
        throw new Error('Usuário responsável não encontrado')
      }

      const novaTransferencia = await tx.transferencia.create({
        data: {
          patrimonioId: Number(patrimonioId),
          inventarioOrigemId: inventarioOrigem.id,
          inventarioDestinoId: inventarioDestino.id,
          solicitadaPorId: usuarioId,
          observacao: observacao || null
        }
      })

      await tx.logAuditoria.create({
        data: {
          usuarioId: usuarioId,
          usuarioNome: usuario.nome,
          acao: 'TRANSFERENCIA_SOLICITADA',
          detalhes: `Solicitou a transferência do patrimônio ${patrimonio.nome} (${patrimonio.patrimonio}) do inventário ${inventarioOrigem.nome} para o inventário ${inventarioDestino.nome}.`
        }
      })

      return novaTransferencia
    })

    return res.status(201).json({
      mensagem: 'Solicitação de transferência criada com sucesso',
      transferencia
    })

  } catch (error) {
    return res.status(500).json({
      erro: error.message
    })
  }
}


// ==================================================
// LISTAR TRANSFERÊNCIAS
// ==================================================

const listarTransferencias = async (req, res) => {
  try {

    const usuarioId = req.usuarioId
    const usuarioPerfil = req.usuarioPerfil

    let where = {}

    // Administrador visualiza todas as transferências
    if (usuarioPerfil === 'admin') {
      where = {}
    }

    // Gestor visualiza transferências relacionadas ao seu inventário
    else if (usuarioPerfil === 'gestor') {

      const inventario = await prisma.inventario.findUnique({
        where: {
          gestorId: usuarioId
        }
      })

      if (!inventario) {
        return res.status(404).json({
          erro: 'Nenhum inventário está associado a este gestor'
        })
      }

      where = {
        OR: [
          {
            inventarioOrigemId: inventario.id
          },
          {
            inventarioDestinoId: inventario.id
          }
        ]
      }
    }

    // Usuário comum não pode consultar transferências
    else {
      return res.status(403).json({
        erro: 'Você não tem permissão para consultar transferências'
      })
    }

    const transferencias = await prisma.transferencia.findMany({
      where,

      include: {
        patrimonio: true,

        inventarioOrigem: {
          include: {
            gestor: {
              select: {
                id: true,
                nome: true
              }
            }
          }
        },

        inventarioDestino: {
          include: {
            gestor: {
              select: {
                id: true,
                nome: true
              }
            }
          }
        },

        solicitadaPor: {
          select: {
            id: true,
            nome: true
          }
        },

        respondidaPor: {
          select: {
            id: true,
            nome: true
          }
        }
      },

      orderBy: {
        dataSolicitacao: 'desc'
      }
    })

    return res.status(200).json(transferencias)

  } catch (error) {
    return res.status(500).json({
      erro: error.message
    })
  }
}


// ==================================================
// RESPONDER TRANSFERÊNCIA
// ==================================================

const responderTransferencia = async (req, res) => {
  try {

    const transferenciaId = Number(req.params.id)
    const usuarioId = req.usuarioId
    const { decisao } = req.body

    // Valida o ID
    if (!Number.isInteger(transferenciaId) || transferenciaId <= 0) {
      return res.status(400).json({
        erro: 'ID da transferência inválido'
      })
    }

    // Valida a decisão
    if (!['aceita', 'recusada'].includes(decisao)) {
      return res.status(400).json({
        erro: 'A decisão deve ser aceita ou recusada'
      })
    }

    const resultado = await prisma.$transaction(async (tx) => {

      // Busca a transferência
      const transferencia = await tx.transferencia.findUnique({
        where: {
          id: transferenciaId
        }
      })

      if (!transferencia) {
        const erro = new Error('Transferência não encontrada')
        erro.statusCode = 404
        throw erro
      }

      // Verifica se o usuário é gestor do inventário de destino
      const inventarioDestino = await tx.inventario.findUnique({
        where: {
          gestorId: usuarioId
        }
      })

      if (
        !inventarioDestino ||
        inventarioDestino.id !== transferencia.inventarioDestinoId
      ) {
        const erro = new Error(
          'Somente o gestor do inventário de destino pode responder'
        )
        erro.statusCode = 403
        throw erro
      }

      // Verifica se a transferência ainda está pendente
      if (transferencia.status !== 'pendente') {
        const erro = new Error(
          'Esta transferência já foi respondida'
        )
        erro.statusCode = 409
        throw erro
      }

      // Verifica se o patrimônio continua no inventário de origem
      const patrimonio = await tx.patrimonio.findFirst({
        where: {
          id: transferencia.patrimonioId,
          inventarioId: transferencia.inventarioOrigemId
        }
      })

      if (!patrimonio) {
        const erro = new Error(
          'O patrimônio não está mais no inventário de origem'
        )
        erro.statusCode = 409
        throw erro
      }

      // Verifica se existe empréstimo ativo
      const emprestimoAtivo = await tx.emprestimo.findFirst({
        where: {
          patrimonioId: transferencia.patrimonioId,
          dataDevolucao: null
        }
      })

      if (emprestimoAtivo) {
        const erro = new Error(
          'O patrimônio possui um empréstimo ativo'
        )
        erro.statusCode = 409
        throw erro
      }

      // Busca o usuário que está respondendo
      const usuario = await tx.usuario.findUnique({
        where: {
          id: usuarioId
        }
      })

      if (!usuario) {
        throw new Error('Usuário responsável não encontrado')
      }

      // Se aceita, transfere o patrimônio para o destino
      if (decisao === 'aceita') {

        await tx.patrimonio.update({
          where: {
            id: transferencia.patrimonioId
          },

          data: {
            inventarioId: transferencia.inventarioDestinoId
          }
        })

      }

      // Registra a decisão da transferência
      const atualizacao = await tx.transferencia.updateMany({
        where: {
          id: transferenciaId,
          status: 'pendente'
        },

        data: {
          status: decisao,
          respondidaPorId: usuarioId,
          dataResposta: new Date()
        }
      })

      if (atualizacao.count === 0) {
        throw new Error('CONFLITO_TRANSFERENCIA')
      }

      // Registra a ação no Log de Auditoria
      await tx.logAuditoria.create({
        data: {
          usuarioId: usuarioId,
          usuarioNome: usuario.nome,
          acao: decisao === 'aceita'
            ? 'TRANSFERENCIA_ACEITA'
            : 'TRANSFERENCIA_RECUSADA',
          detalhes: decisao === 'aceita'
            ? `Aceitou a transferência do patrimônio ${patrimonio.nome} (${patrimonio.patrimonio}) do inventário ${transferencia.inventarioOrigemId} para o inventário ${transferencia.inventarioDestinoId}.`
            : `Recusou a transferência do patrimônio ${patrimonio.nome} (${patrimonio.patrimonio}) do inventário ${transferencia.inventarioOrigemId} para o inventário ${transferencia.inventarioDestinoId}.`
        }
      })

      // Retorna a transferência atualizada
      return await tx.transferencia.findUnique({
        where: {
          id: transferenciaId
        },

        include: {
          patrimonio: true,
          inventarioOrigem: true,
          inventarioDestino: true,

          solicitadaPor: {
            select: {
              id: true,
              nome: true
            }
          },

          respondidaPor: {
            select: {
              id: true,
              nome: true
            }
          }
        }
      })

    })

    return res.status(200).json({
      mensagem: decisao === 'aceita'
        ? 'Transferência aceita com sucesso'
        : 'Transferência recusada com sucesso',

      transferencia: resultado
    })

  } catch (error) {

    if (error.message === 'CONFLITO_TRANSFERENCIA') {
      return res.status(409).json({
        erro: 'Esta transferência já foi respondida por outro usuário'
      })
    }

    return res.status(error.statusCode || 500).json({
      erro: error.message
    })
  }
}


// ==================================================
// EXPORTAÇÃO DAS FUNÇÕES
// ==================================================

module.exports = {
  solicitarTransferencia,
  listarTransferencias,
  responderTransferencia
}
