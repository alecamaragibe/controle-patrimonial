
const prisma = require('../database/prisma')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const PERFIS_VALIDOS = ['admin', 'gestor', 'usuario']

// CADASTRO ADMINISTRATIVO
const criarUsuario = async (req, res) => {
  try {
    const { nome, login, senha, perfil } = req.body

    if (
      typeof nome !== 'string' || !nome.trim() ||
      typeof login !== 'string' || !/^\d{8}$/.test(login) ||
      typeof senha !== 'string' || senha.length < 6 ||
      !PERFIS_VALIDOS.includes(perfil)
    ) {
      return res.status(400).json({
        erro: 'Informe nome, NIP válido com 8 números, senha com pelo menos 6 caracteres e um perfil válido.'
      })
    }

    const senhaHash = await bcrypt.hash(senha, 10)

    const usuario = await prisma.usuario.create({
      data: {
        nome: nome.trim(),
        login,
        senha: senhaHash,
        perfil
      },
      select: {
        id: true,
        nome: true,
        login: true,
        perfil: true,
        createdAt: true
      }
    })

    return res.status(201).json(usuario)

  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        erro: 'NIP já cadastrado'
      })
    }

    return res.status(500).json({
      erro: error.message
    })
  }
}

// CADASTRO PÚBLICO: PERFIL SEMPRE USUARIO
const cadastrarUsuarioPublico = async (req, res) => {
  try {
    const { nome, login, senha } = req.body

    if (
      typeof nome !== 'string' || !nome.trim() ||
      typeof login !== 'string' || !/^\d{8}$/.test(login) ||
      typeof senha !== 'string' || senha.length < 6
    ) {
      return res.status(400).json({
        erro: 'Informe um nome, um NIP válido com exatamente 8 números e uma senha com pelo menos 6 caracteres'
      })
    }

    const senhaHash = await bcrypt.hash(senha, 10)

    const usuario = await prisma.usuario.create({
      data: {
        nome: nome.trim(),
        login,
        senha: senhaHash,
        perfil: 'usuario'
      },
      select: {
        id: true,
        nome: true,
        login: true,
        perfil: true,
        createdAt: true
      }
    })

    return res.status(201).json({
      mensagem: 'Cadastro realizado com sucesso',
      usuario
    })

  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        erro: 'NIP já cadastrado'
      })
    }

    return res.status(500).json({
      erro: error.message
    })
  }
}

// LOGIN
const loginUsuario = async (req, res) => {
  try {
    const { login, senha } = req.body

    if (
      typeof login !== 'string' ||
      !/^\d{8}$/.test(login) ||
      typeof senha !== 'string' ||
      !senha
    ) {
      return res.status(400).json({
        erro: 'Informe um NIP válido e uma senha.'
      })
    }

    const usuario = await prisma.usuario.findUnique({
      where: { login }
    })

    if (!usuario) {
      return res.status(401).json({
        erro: 'Usuário ou senha inválidos'
      })
    }

    const senhaValida = await bcrypt.compare(
      senha,
      usuario.senha
    )

    if (!senhaValida) {
      return res.status(401).json({
        erro: 'Usuário ou senha inválidos'
      })
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        perfil: usuario.perfil
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1d'
      }
    )

    return res.json({
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        login: usuario.login,
        perfil: usuario.perfil
      },
      token
    })

  } catch (error) {
    return res.status(500).json({
      erro: error.message
    })
  }
}

// LISTAR USUÁRIOS
const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        login: true,
        perfil: true,
        inventarioGerenciado: {
          select: {
            id: true,
            nome: true
          }
        }
      },
      orderBy: {
        nome: 'asc'
      }
    })

    return res.status(200).json(usuarios)

  } catch (error) {
    return res.status(500).json({
      erro: error.message
    })
  }
}

// EXCLUIR USUÁRIO
const deletarUsuario = async (req, res) => {
  try {
    const id = Number(req.params.id)

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        erro: 'ID do usuário inválido'
      })
    }

    // Impede que o administrador exclua a própria conta
    if (id === req.usuarioId) {
      return res.status(400).json({
        erro: 'Você não pode excluir sua própria conta.'
      })
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id },
      include: {
        inventarioGerenciado: {
          select: {
            id: true,
            nome: true
          }
        }
      }
    })

    if (!usuario) {
      return res.status(404).json({
        erro: 'Usuário não encontrado'
      })
    }

    // Impede excluir gestor ainda associado a um inventário
    if (usuario.inventarioGerenciado) {
      return res.status(409).json({
        erro: `Este usuário ainda administra o inventário "${usuario.inventarioGerenciado.nome}". Substitua o gestor antes de excluí-lo.`
      })
    }

    // Impede excluir o último administrador
    if (usuario.perfil === 'admin') {
      const quantidadeAdmins = await prisma.usuario.count({
        where: {
          perfil: 'admin'
        }
      })

      if (quantidadeAdmins <= 1) {
        return res.status(409).json({
          erro: 'Não é possível excluir o último administrador do sistema.'
        })
      }
    }

    await prisma.usuario.delete({
      where: { id }
    })

    return res.status(200).json({
      mensagem: 'Usuário excluído com sucesso'
    })

  } catch (error) {
    // Protege registros históricos relacionados ao usuário
    if (error.code === 'P2003') {
      return res.status(409).json({
        erro: 'Este usuário possui registros vinculados no sistema e não pode ser excluído.'
      })
    }

    return res.status(500).json({
      erro: error.message
    })
  }
}

// EDITAR USUÁRIO
const editarUsuario = async (req, res) => {
  try {
    const id = Number(req.params.id)

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        erro: 'ID do usuário inválido'
      })
    }

    const {
      nome,
      login,
      senha,
      perfil
    } = req.body

    if (
      typeof nome !== 'string' || !nome.trim() ||
      typeof login !== 'string' || !/^\d{8}$/.test(login) ||
      !PERFIS_VALIDOS.includes(perfil)
    ) {
      return res.status(400).json({
        erro: 'Informe um nome válido, NIP com 8 números e um perfil válido.'
      })
    }

    if (
      senha !== undefined &&
      senha !== '' &&
      (typeof senha !== 'string' || senha.length < 6)
    ) {
      return res.status(400).json({
        erro: 'A nova senha deve possuir pelo menos 6 caracteres.'
      })
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id },
      include: {
        inventarioGerenciado: {
          select: {
            id: true,
            nome: true
          }
        }
      }
    })

    if (!usuario) {
      return res.status(404).json({
        erro: 'Usuário não encontrado'
      })
    }

    // Não permite retirar o perfil de gestor enquanto ele administra inventário
    if (
      usuario.perfil === 'gestor' &&
      perfil !== 'gestor' &&
      usuario.inventarioGerenciado
    ) {
      return res.status(409).json({
        erro: `Este gestor ainda administra o inventário "${usuario.inventarioGerenciado.nome}". Substitua o gestor no inventário antes de alterar seu perfil.`
      })
    }

    // Impede retirar o perfil do último administrador
    if (
      usuario.perfil === 'admin' &&
      perfil !== 'admin'
    ) {
      const quantidadeAdmins = await prisma.usuario.count({
        where: {
          perfil: 'admin'
        }
      })

      if (quantidadeAdmins <= 1) {
        return res.status(409).json({
          erro: 'Não é possível alterar o perfil do último administrador do sistema.'
        })
      }
    }

    const dadosAtualizados = {
      nome: nome.trim(),
      login,
      perfil
    }

    if (senha) {
      dadosAtualizados.senha = await bcrypt.hash(
        senha,
        10
      )
    }

    const usuarioAtualizado = await prisma.usuario.update({
      where: { id },
      data: dadosAtualizados,
      select: {
        id: true,
        nome: true,
        login: true,
        perfil: true
      }
    })

    return res.status(200).json(usuarioAtualizado)

  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        erro: 'NIP já cadastrado'
      })
    }

    return res.status(500).json({
      erro: error.message
    })
  }
}

module.exports = {
  criarUsuario,
  cadastrarUsuarioPublico,
  loginUsuario,
  listarUsuarios,
  deletarUsuario,
  editarUsuario
}
