
const prisma = require('../database/prisma')

// Cria erros com códigos HTTP específicos
const criarErro = (status, mensagem) => {
  const erro = new Error(mensagem)
  erro.status = status
  return erro
}

// Busca o usuário e confirma seu perfil atual no banco
const buscarUsuario = async (tx, usuarioId, perfilEsperado) => {
  const usuario = await tx.usuario.findUnique({
    where: { id: usuarioId }
  })

  if (!usuario) {
    throw criarErro(404, 'Usuário não encontrado')
  }

  if (perfilEsperado && usuario.perfil !== perfilEsperado) {
    throw criarErro(403, 'Você não tem permissão para esta operação')
  }

  return usuario
}

// Valida os dados necessários de um patrimônio
const validarDadosPatrimonio = (dados) => {
  if (!dados || typeof dados !== 'object') {
    throw criarErro(400, 'Informe os dados do patrimônio')
  }

  const campos = ['nome', 'tipo', 'patrimonio', 'status', 'localizacao']

  for (const campo of campos) {
    if (
      typeof dados[campo] !== 'string' ||
      !dados[campo].trim()
    ) {
      throw criarErro(400, `O campo ${campo} é obrigatório`)
    }
  }

  return {
    nome: dados.nome.trim(),
    tipo: dados.tipo.trim(),
    patrimonio: dados.patrimonio.trim(),
    status: dados.status.trim(),
    localizacao: dados.localizacao.trim()
  }
}

// Confirma que o gestor possui um inventário
const buscarInventarioDoGestor = async (tx, gestorId) => {
  const inventario = await tx.inventario.findUnique({
    where: { gestorId }
  })

  if (!inventario) {
    throw criarErro(404, 'Nenhum inventário está associado a este gestor')
  }

  return inventario
}

// Confirma que o patrimônio pertence ao inventário do gestor
const buscarPatrimonioDoGestor = async (tx, patrimonioId, inventarioId) => {
  const patrimonio = await tx.patrimonio.findUnique({
    where: { id: patrimonioId }
  })

  if (!patrimonio) {
    throw criarErro(404, 'Patrimônio não encontrado')
  }

  if (patrimonio.inventarioId !== inventarioId) {
    throw criarErro(403, 'Este patrimônio não pertence ao seu inventário')
  }

  return patrimonio
}

// Impede exclusão com empréstimo ativo ou transferência pendente
const verificarBloqueiosDeExclusao = async (tx, patrimonioId) => {
  const emprestimoAtivo = await tx.emprestimo.findFirst({
    where: {
      patrimonioId,
      dataDevolucao: null
    }
  })

  if (emprestimoAtivo) {
    throw criarErro(400, 'Não é possível excluir um patrimônio com empréstimo ativo')
  }

  const transferenciaPendente = await tx.transferencia.findFirst({
    where: {
      patrimonioId,
      status: 'pendente'
    }
  })

  if (transferenciaPendente) {
    throw criarErro(400, 'Não é possível excluir um patrimônio com transferência pendente')
  }
}


// =====================================================
// 1. GESTOR ENVIA SOLICITAÇÃO
// =====================================================

const criarSolicitacao = async (req, res) => {
  try {
    const resultado = await prisma.$transaction(async (tx) => {
      const gestor = await buscarUsuario(tx, req.usuarioId, 'gestor')

      const {
        tipo,
        patrimonioId,
        dadosSolicitados,
        justificativaSolicitante
      } = req.body

      const tiposPermitidos = ['CADASTRO', 'EDICAO', 'EXCLUSAO']

      if (!tiposPermitidos.includes(tipo)) {
        throw criarErro(400, 'Tipo de solicitação inválido')
      }

      const inventario = await buscarInventarioDoGestor(tx, gestor.id)

      let dadosValidados
      let patrimonioExistente = null
      let idPatrimonio = null

      if (tipo === 'CADASTRO') {
        dadosValidados = validarDadosPatrimonio(dadosSolicitados)

        const patrimonioDuplicado = await tx.patrimonio.findUnique({
          where: { patrimonio: dadosValidados.patrimonio }
        })

        if (patrimonioDuplicado) {
          throw criarErro(409, 'Já existe um patrimônio com este número')
        }

        // Impede solicitações de cadastro duplicadas ainda pendentes
        const cadastrosPendentes = await tx.solicitacaoPatrimonio.findMany({
          where: {
            tipo: 'CADASTRO',
            status: 'PENDENTE'
          },
          select: {
            dadosSolicitados: true
          }
        })

        const cadastroDuplicado = cadastrosPendentes.some((solicitacao) => {
          return solicitacao.dadosSolicitados?.patrimonio === dadosValidados.patrimonio
        })

        if (cadastroDuplicado) {
          throw criarErro(409, 'Já existe uma solicitação pendente para este número patrimonial')
        }
      }

      if (tipo === 'EDICAO' || tipo === 'EXCLUSAO') {
        idPatrimonio = Number(patrimonioId)

        if (!Number.isInteger(idPatrimonio) || idPatrimonio <= 0) {
          throw criarErro(400, 'ID do patrimônio inválido')
        }

        patrimonioExistente = await buscarPatrimonioDoGestor(
          tx,
          idPatrimonio,
          inventario.id
        )

        const solicitacaoPendente = await tx.solicitacaoPatrimonio.findFirst({
          where: {
            patrimonioId: idPatrimonio,
            status: 'PENDENTE'
          }
        })

        if (solicitacaoPendente) {
          throw criarErro(409, 'Este patrimônio já possui uma solicitação pendente')
        }
      }

      if (tipo === 'EDICAO') {
        dadosValidados = validarDadosPatrimonio(dadosSolicitados)
      }

      if (tipo === 'EXCLUSAO') {
        await verificarBloqueiosDeExclusao(tx, idPatrimonio)
      }

      const solicitacao = await tx.solicitacaoPatrimonio.create({
        data: {
          tipo,
          status: 'PENDENTE',
          gestorId: gestor.id,
          patrimonioId: idPatrimonio,
          dadosSolicitados: dadosValidados,
          justificativaSolicitante: justificativaSolicitante || null
        }
      })

      await tx.logAuditoria.create({
        data: {
          usuarioId: gestor.id,
          usuarioNome: gestor.nome,
          acao: 'SOLICITACAO_PATRIMONIO_CRIADA',
          detalhes: `Enviou solicitação de ${tipo} de patrimônio ${patrimonioExistente?.nome || dadosValidados?.nome || patrimonioId || ''}.`
        }
      })

      return solicitacao
    })

    return res.status(201).json({
      mensagem: 'Solicitação enviada para análise do administrador',
      solicitacao: resultado
    })

  } catch (error) {
    return res.status(error.status || (error.code === 'P2002' ? 409 : 500)).json({
      erro: error.code === 'P2002'
        ? 'Já existe um patrimônio com este número'
        : error.message
    })
  }
}


// =====================================================
// 2. ADMINISTRADOR OU GESTOR CONSULTA SOLICITAÇÕES
// =====================================================

const listarSolicitacoes = async (req, res) => {
  try {
    const usuario = await buscarUsuario(prisma, req.usuarioId)

    if (!['admin', 'gestor'].includes(usuario.perfil)) {
      throw criarErro(403, 'Você não tem permissão para consultar solicitações')
    }

    const solicitacoes = await prisma.solicitacaoPatrimonio.findMany({
      where: usuario.perfil === 'gestor'
        ? { gestorId: usuario.id }
        : {},
      include: {
        gestor: {
          select: {
            id: true,
            nome: true,
            login: true
          }
        },
        administrador: {
          select: {
            id: true,
            nome: true
          }
        },
        patrimonio: true
      },
      orderBy: {
        dataSolicitacao: 'desc'
      }
    })

    return res.status(200).json(solicitacoes)

  } catch (error) {
    return res.status(error.status || 500).json({
      erro: error.message
    })
  }
}


// =====================================================
// 3. ADMINISTRADOR APROVA SOLICITAÇÃO
// =====================================================

const aprovarSolicitacao = async (req, res) => {
  try {
    const id = Number(req.params.id)

    if (!Number.isInteger(id) || id <= 0) {
      throw criarErro(400, 'ID da solicitação inválido')
    }

    const resultado = await prisma.$transaction(async (tx) => {
      const administrador = await buscarUsuario(tx, req.usuarioId, 'admin')

      const solicitacao = await tx.solicitacaoPatrimonio.findUnique({
        where: { id },
        include: { gestor: true }
      })

      if (!solicitacao) {
        throw criarErro(404, 'Solicitação não encontrada')
      }

      if (solicitacao.status !== 'PENDENTE') {
        throw criarErro(409, 'Esta solicitação já foi analisada')
      }

      // Reserva a decisão. Se outra operação já decidiu,
      // a transação não poderá continuar.
      const reserva = await tx.solicitacaoPatrimonio.updateMany({
        where: {
          id,
          status: 'PENDENTE'
        },
        data: {
          status: 'APROVADA',
          administradorId: administrador.id,
          dataDecisao: new Date()
        }
      })

      if (reserva.count !== 1) {
        throw criarErro(409, 'Esta solicitação já foi analisada')
      }

      let patrimonioResultado

      if (solicitacao.tipo === 'CADASTRO') {
        const inventario = await buscarInventarioDoGestor(
          tx,
          solicitacao.gestorId
        )

        if (solicitacao.gestor.perfil !== 'gestor') {
          throw criarErro(409, 'O solicitante não possui mais perfil de gestor')
        }

        const dados = validarDadosPatrimonio(solicitacao.dadosSolicitados)

        const duplicado = await tx.patrimonio.findUnique({
          where: { patrimonio: dados.patrimonio }
        })

        if (duplicado) {
          throw criarErro(409, 'Já existe um patrimônio com este número')
        }

        patrimonioResultado = await tx.patrimonio.create({
          data: {
            ...dados,
            inventarioId: inventario.id
          }
        })
      }

      if (solicitacao.tipo === 'EDICAO') {
        const inventario = await buscarInventarioDoGestor(
          tx,
          solicitacao.gestorId
        )

        if (solicitacao.gestor.perfil !== 'gestor') {
          throw criarErro(409, 'O solicitante não possui mais perfil de gestor')
        }

        await buscarPatrimonioDoGestor(
          tx,
          solicitacao.patrimonioId,
          inventario.id
        )

        const dados = validarDadosPatrimonio(solicitacao.dadosSolicitados)

        patrimonioResultado = await tx.patrimonio.update({
          where: { id: solicitacao.patrimonioId },
          data: dados
        })
      }

      if (solicitacao.tipo === 'EXCLUSAO') {
        const inventario = await buscarInventarioDoGestor(
          tx,
          solicitacao.gestorId
        )

        if (solicitacao.gestor.perfil !== 'gestor') {
          throw criarErro(409, 'O solicitante não possui mais perfil de gestor')
        }

        const patrimonio = await buscarPatrimonioDoGestor(
          tx,
          solicitacao.patrimonioId,
          inventario.id
        )

        await verificarBloqueiosDeExclusao(tx, patrimonio.id)

        // Exclusão lógica: preserva o histórico e os vínculos existentes.
        patrimonioResultado = await tx.patrimonio.update({
          where: { id: patrimonio.id },
          data: { status: 'EXCLUIDO' }
        })
      }

        // Vincula o patrimônio criado à solicitação de cadastro.
        if (solicitacao.tipo === 'CADASTRO' && patrimonioResultado) {
            await tx.solicitacaoPatrimonio.update({
                where: { id },
                data: {
                    patrimonioId: patrimonioResultado.id
                }
            })
        }

      await tx.logAuditoria.create({
        data: {
          usuarioId: administrador.id,
          usuarioNome: administrador.nome,
          acao: 'SOLICITACAO_PATRIMONIO_APROVADA',
          detalhes: `Aprovou solicitação ${solicitacao.tipo} nº ${solicitacao.id}, enviada por ${solicitacao.gestor.nome}.`
        }
      })

      return {
        solicitacao: await tx.solicitacaoPatrimonio.findUnique({
          where: { id }
        }),
        patrimonio: patrimonioResultado
      }
    })

    return res.status(200).json({
      mensagem: 'Solicitação aprovada com sucesso',
      ...resultado
    })

  } catch (error) {
    return res.status(error.status || (error.code === 'P2002' ? 409 : 500)).json({
      erro: error.code === 'P2002'
        ? 'Já existe um patrimônio com este número'
        : error.message
    })
  }
}


// =====================================================
// 4. ADMINISTRADOR RECUSA SOLICITAÇÃO
// =====================================================

const recusarSolicitacao = async (req, res) => {
  try {
    const id = Number(req.params.id)
    const { justificativaAdmin } = req.body

    if (!Number.isInteger(id) || id <= 0) {
      throw criarErro(400, 'ID da solicitação inválido')
    }

    if (
      typeof justificativaAdmin !== 'string' ||
      !justificativaAdmin.trim()
    ) {
      throw criarErro(400, 'A justificativa da recusa é obrigatória')
    }

    const resultado = await prisma.$transaction(async (tx) => {
      const administrador = await buscarUsuario(tx, req.usuarioId, 'admin')

      const solicitacao = await tx.solicitacaoPatrimonio.findUnique({
        where: { id }
      })

      if (!solicitacao) {
        throw criarErro(404, 'Solicitação não encontrada')
      }

      if (solicitacao.status !== 'PENDENTE') {
        throw criarErro(409, 'Esta solicitação já foi analisada')
      }

      const decisao = await tx.solicitacaoPatrimonio.updateMany({
        where: {
          id,
          status: 'PENDENTE'
        },
        data: {
          status: 'RECUSADA',
          administradorId: administrador.id,
          justificativaAdmin: justificativaAdmin.trim(),
          dataDecisao: new Date()
        }
      })

      if (decisao.count !== 1) {
        throw criarErro(409, 'Esta solicitação já foi analisada')
      }

      await tx.logAuditoria.create({
        data: {
          usuarioId: administrador.id,
          usuarioNome: administrador.nome,
          acao: 'SOLICITACAO_PATRIMONIO_RECUSADA',
          detalhes: `Recusou a solicitação nº ${id}. Justificativa: ${justificativaAdmin.trim()}`
        }
      })

      return tx.solicitacaoPatrimonio.findUnique({
        where: { id }
      })
    })

    return res.status(200).json({
      mensagem: 'Solicitação recusada',
      solicitacao: resultado
    })

  } catch (error) {
    return res.status(error.status || 500).json({
      erro: error.message
    })
  }
}


module.exports = {
  criarSolicitacao,
  listarSolicitacoes,
  aprovarSolicitacao,
  recusarSolicitacao
}
