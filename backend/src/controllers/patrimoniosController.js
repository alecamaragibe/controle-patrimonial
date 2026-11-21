
const prisma = require('../database/prisma')

// Cria erros com códigos HTTP específicos
const criarErro = (status, mensagem) => {
  const erro = new Error(mensagem)
  erro.status = status
  return erro
}

// Confirma o perfil atual do usuário no banco
const buscarUsuario = async (usuarioId) => {
  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId }
  })

  if (!usuario) {
    throw criarErro(404, 'Usuário não encontrado')
  }

  return usuario
}

// Valida os campos obrigatórios do patrimônio
const validarDados = (dados) => {
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

// Impede exclusão de patrimônio com empréstimo ou transferência pendente
const verificarBloqueiosDeExclusao = async (tx, patrimonioId) => {
  const emprestimoAtivo = await tx.emprestimo.findFirst({
    where: {
      patrimonioId,
      dataDevolucao: null
    }
  })

  if (emprestimoAtivo) {
    throw criarErro(
      400,
      'Não é possível excluir um patrimônio com empréstimo ativo'
    )
  }

  const transferenciaPendente = await tx.transferencia.findFirst({
    where: {
      patrimonioId,
      status: 'pendente'
    }
  })

  if (transferenciaPendente) {
    throw criarErro(
      400,
      'Não é possível excluir um patrimônio com transferência pendente'
    )
  }
}

// =====================================================
// 1. CADASTRAR PATRIMÔNIO — SOMENTE ADMINISTRADOR
// =====================================================

const criarPatrimonio = async (req, res) => {
  try {
    const usuario = await buscarUsuario(req.usuarioId)

    if (usuario.perfil !== 'admin') {
      throw criarErro(403, 'Somente o administrador pode cadastrar diretamente')
    }

    const dados = validarDados(req.body)

    const inventarioId = Number(req.body.inventarioId)

    if (!Number.isInteger(inventarioId) || inventarioId <= 0) {
      throw criarErro(400, 'Selecione um inventário válido')
    }

    const resultado = await prisma.$transaction(async (tx) => {
      const inventario = await tx.inventario.findUnique({
        where: { id: inventarioId }
      })

      if (!inventario || !inventario.gestorId) {
        throw criarErro(
          400,
          'O inventário selecionado não possui um gestor responsável'
        )
      }

      const novoPatrimonio = await tx.patrimonio.create({
        data: {
          ...dados,
          inventarioId: inventario.id
        }
      })

      await tx.logAuditoria.create({
        data: {
          usuarioId: usuario.id,
          usuarioNome: usuario.nome,
          acao: 'PATRIMONIO_CADASTRADO',
          detalhes: `Cadastrou o patrimônio ${novoPatrimonio.nome} (${novoPatrimonio.patrimonio}) no inventário ${inventario.nome}.`
        }
      })

      return novoPatrimonio
    })

    return res.status(201).json(resultado)

  } catch (error) {
    return res.status(error.status || (error.code === 'P2002' ? 409 : 500)).json({
      erro: error.code === 'P2002'
        ? 'Já existe um patrimônio com este número'
        : error.message
    })
  }
}

// =====================================================
// 2. CONSULTAR PATRIMÔNIOS
// =====================================================


const listarPatrimonios = async (req, res) => {
  try {
    const usuario = await buscarUsuario(req.usuarioId)

    const busca = typeof req.query.busca === 'string'
      ? req.query.busca.trim()
      : ''

    if (!['admin', 'gestor', 'usuario'].includes(usuario.perfil)) {
      throw criarErro(403, 'Perfil sem permissão para consultar patrimônios')
    }

    // Usuário comum precisa informar o que deseja pesquisar
    if (usuario.perfil === 'usuario' && busca.length < 2) {
      throw criarErro(
        400,
        'Informe pelo menos dois caracteres para pesquisar'
      )
    }

    const filtro = {
      status: {
        not: 'EXCLUIDO'
      }
    }

    // Gestor consulta somente o próprio inventário
    if (usuario.perfil === 'gestor') {
      const inventario = await prisma.inventario.findUnique({
        where: { gestorId: usuario.id }
      })

      if (!inventario) {
        return res.status(200).json([])
      }

      filtro.inventarioId = inventario.id
    }

    // Todos os perfis podem pesquisar por nome ou número patrimonial
    if (busca.length >= 2) {
      filtro.OR = [
        {
          nome: {
            contains: busca,
            mode: 'insensitive'
          }
        },
        {
          patrimonio: {
            contains: busca,
            mode: 'insensitive'
          }
        }
      ]
    }

    const patrimonios = await prisma.patrimonio.findMany({
      where: filtro,
      select: {
        id: true,
        nome: true,
        tipo: true,
        patrimonio: true,
        status: true,
        localizacao: true,
        inventario: {
          select: {
            id: true,
            nome: true,
            gestor: {
              select: {
                id: true,
                nome: true
              }
            }
          }
        }
      },
      orderBy: {
        nome: 'asc'
      }
    })

    return res.status(200).json(patrimonios)

  } catch (error) {
    return res.status(error.status || 500).json({
      erro: error.message
    })
  }
}

// =====================================================
// 3. EDITAR PATRIMÔNIO — SOMENTE ADMINISTRADOR
// =====================================================

const editarPatrimonio = async (req, res) => {
  try {
    const usuario = await buscarUsuario(req.usuarioId)

    if (usuario.perfil !== 'admin') {
      throw criarErro(403, 'Somente o administrador pode editar diretamente')
    }

    const id = Number(req.params.id)

    if (!Number.isInteger(id) || id <= 0) {
      throw criarErro(400, 'ID do patrimônio inválido')
    }

    const dados = validarDados(req.body)

    const resultado = await prisma.$transaction(async (tx) => {
      const patrimonioExistente = await tx.patrimonio.findUnique({
        where: { id }
      })

      if (!patrimonioExistente) {
        throw criarErro(404, 'Patrimônio não encontrado')
      }

      if (patrimonioExistente.status === 'EXCLUIDO') {
        throw criarErro(400, 'Este patrimônio está excluído')
      }

      const patrimonioAtualizado = await tx.patrimonio.update({
        where: { id },
        data: dados
      })

      await tx.logAuditoria.create({
        data: {
          usuarioId: usuario.id,
          usuarioNome: usuario.nome,
          acao: 'PATRIMONIO_EDITADO',
          detalhes: `Editou o patrimônio ${patrimonioAtualizado.nome} (${patrimonioAtualizado.patrimonio}).`
        }
      })

      return patrimonioAtualizado
    })

    return res.status(200).json(resultado)

  } catch (error) {
    return res.status(error.status || (error.code === 'P2002' ? 409 : 500)).json({
      erro: error.code === 'P2002'
        ? 'Já existe um patrimônio com este número'
        : error.message
    })
  }
}

// =====================================================
// 4. EXCLUIR PATRIMÔNIO — SOMENTE ADMINISTRADOR
// =====================================================

const deletarPatrimonio = async (req, res) => {
  try {
    const usuario = await buscarUsuario(req.usuarioId)

    if (usuario.perfil !== 'admin') {
      throw criarErro(403, 'Somente o administrador pode excluir diretamente')
    }

    const id = Number(req.params.id)

    if (!Number.isInteger(id) || id <= 0) {
      throw criarErro(400, 'ID do patrimônio inválido')
    }

    await prisma.$transaction(async (tx) => {
      const patrimonioExistente = await tx.patrimonio.findUnique({
        where: { id }
      })

      if (!patrimonioExistente) {
        throw criarErro(404, 'Patrimônio não encontrado')
      }

      if (patrimonioExistente.status === 'EXCLUIDO') {
        throw criarErro(400, 'Este patrimônio já está excluído')
      }

      await verificarBloqueiosDeExclusao(tx, id)

      // Exclusão lógica: preserva o registro e seu histórico
      await tx.patrimonio.update({
        where: { id },
        data: {
          status: 'EXCLUIDO'
        }
      })

      await tx.logAuditoria.create({
        data: {
          usuarioId: usuario.id,
          usuarioNome: usuario.nome,
          acao: 'PATRIMONIO_EXCLUIDO',
          detalhes: `Excluiu logicamente o patrimônio ${patrimonioExistente.nome} (${patrimonioExistente.patrimonio}).`
        }
      })
    })

    return res.status(200).json({
      mensagem: 'Patrimônio excluído com sucesso'
    })

  } catch (error) {
    return res.status(error.status || 500).json({
      erro: error.message
    })
  }
}

module.exports = {
  criarPatrimonio,
  listarPatrimonios,
  editarPatrimonio,
  deletarPatrimonio
}
