
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()


// CADASTRAR INVENTÁRIO
const criarInventario = async (req, res) => {
  try {
    const { nome, descricao, gestorId } = req.body

    if (!nome || !descricao || !gestorId) {
      return res.status(400).json({
        erro: 'Nome, descrição e gestor são obrigatórios'
      })
    }

    // Verifica se o gestor existe
    const gestor = await prisma.usuario.findUnique({
      where: {
        id: Number(gestorId)
      }
    })

    if (!gestor) {
      return res.status(404).json({
        erro: 'Gestor não encontrado'
      })
    }

    // Verifica se o usuário possui perfil de gestor
    if (gestor.perfil !== 'gestor') {
      return res.status(400).json({
        erro: 'O usuário informado não possui perfil de gestor'
      })
    }

    // Verifica se o gestor já administra outro inventário
    const inventarioExistente = await prisma.inventario.findUnique({
      where: {
        gestorId: Number(gestorId)
      }
    })

    if (inventarioExistente) {
      return res.status(400).json({
        erro: 'Este gestor já administra um inventário'
      })
    }

    const inventario = await prisma.inventario.create({
      data: {
        nome,
        descricao,
        gestorId: Number(gestorId)
      },
      include: {
        gestor: {
          select: {
            id: true,
            nome: true,
            login: true
          }
        }
      }
    })

    return res.status(201).json(inventario)

  } catch (error) {
    return res.status(500).json({
      erro: error.message
    })
  }
}


// LISTAR INVENTÁRIOS
const listarInventarios = async (req, res) => {
  try {
    const { usuarioId, usuarioPerfil } = req

    // Administrador pode visualizar todos os inventários
    if (usuarioPerfil === 'admin') {
      const inventarios = await prisma.inventario.findMany({
        include: {
          gestor: {
            select: {
              id: true,
              nome: true,
              login: true
            }
          }
        }
      })

      return res.status(200).json(inventarios)
    }

    // Gestor pode visualizar somente seu próprio inventário
    if (usuarioPerfil === 'gestor') {
      const inventario = await prisma.inventario.findUnique({
        where: {
          gestorId: usuarioId
        },
        include: {
          gestor: {
            select: {
              id: true,
              nome: true,
              login: true
            }
          }
        }
      })

      if (!inventario) {
        return res.status(404).json({
          erro: 'Nenhum inventário está associado a este gestor'
        })
      }

      return res.status(200).json(inventario)
    }

    // Usuário comum não pode consultar inventários
    return res.status(403).json({
      erro: 'Você não tem permissão para consultar inventários'
    })

  } catch (error) {
    return res.status(500).json({
      erro: error.message
    })
  }
}


// EDITAR INVENTÁRIO
const editarInventario = async (req, res) => {
  try {
    const id = Number(req.params.id)
    const { nome, descricao, gestorId } = req.body

    if (!id || !nome || !descricao || !gestorId) {
      return res.status(400).json({
        erro: 'ID, nome, descrição e gestor são obrigatórios'
      })
    }

    // Verifica se o inventário existe
    const inventario = await prisma.inventario.findUnique({
      where: {
        id
      }
    })

    if (!inventario) {
      return res.status(404).json({
        erro: 'Inventário não encontrado'
      })
    }

    // Verifica se o novo gestor existe
    const novoGestor = await prisma.usuario.findUnique({
      where: {
        id: Number(gestorId)
      }
    })

    if (!novoGestor) {
      return res.status(404).json({
        erro: 'Gestor não encontrado'
      })
    }

    // Verifica se o novo gestor possui perfil de gestor
    if (novoGestor.perfil !== 'gestor') {
      return res.status(400).json({
        erro: 'O usuário informado não possui perfil de gestor'
      })
    }

    // Verifica se o novo gestor já administra outro inventário
    const inventarioDoNovoGestor = await prisma.inventario.findUnique({
      where: {
        gestorId: Number(gestorId)
      }
    })

    if (
      inventarioDoNovoGestor &&
      inventarioDoNovoGestor.id !== id
    ) {
      return res.status(400).json({
        erro: 'Este gestor já administra outro inventário'
      })
    }

    // Atualiza o inventário e, se necessário, substitui o gestor
    const inventarioAtualizado = await prisma.$transaction(async (tx) => {

      const atualizado = await tx.inventario.update({
        where: {
          id
        },
        data: {
          nome,
          descricao,
          gestorId: Number(gestorId)
        },
        include: {
          gestor: {
            select: {
              id: true,
              nome: true,
              login: true
            }
          }
        }
      })

      // Se houve troca de gestor, altera o perfil do anterior
      if (
        inventario.gestorId &&
        inventario.gestorId !== Number(gestorId)
      ) {
        await tx.usuario.update({
          where: {
            id: inventario.gestorId
          },
          data: {
            perfil: 'usuario'
          }
        })
      }

      return atualizado
    })

    return res.status(200).json({
      mensagem: 'Inventário atualizado com sucesso',
      inventario: inventarioAtualizado
    })

  } catch (error) {
    return res.status(500).json({
      erro: error.message
    })
  }
}

// EXCLUIR INVENTÁRIO
const excluirInventario = async (req, res) => {
    try {
      const id = Number(req.params.id)

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
          erro: 'ID do inventário inválido'
        })
      }

      // Verifica se o inventário existe e consulta seus patrimônios
      const inventario = await prisma.inventario.findUnique({
        where: {
          id
        },
        include: {
          _count: {
            select: {
              patrimonios: true
            }
          }
        }
      })

      if (!inventario) {
        return res.status(404).json({
          erro: 'Inventário não encontrado'
        })
      }

      // Impede a exclusão caso existam patrimônios associados
      if (inventario._count.patrimonios > 0) {
        return res.status(400).json({
          erro: 'Este inventário possui patrimônios associados. Transfira os patrimônios antes de excluí-lo.'
        })
      }

      // Exclui o inventário e atualiza o perfil do antigo gestor
      await prisma.$transaction(async (tx) => {

        await tx.inventario.delete({
          where: {
            id
          }
        })

        // Se houver um gestor associado, altera seu perfil
        if (inventario.gestorId) {
          await tx.usuario.update({
            where: {
              id: inventario.gestorId
            },
            data: {
              perfil: 'usuario'
            }
          })
        }
      })

      return res.status(200).json({
        mensagem: 'Inventário excluído com sucesso'
      })

    } catch (error) {
      return res.status(500).json({
        erro: error.message
      })
    }
  }


module.exports = {
  criarInventario,
  listarInventarios,
  editarInventario,
  excluirInventario
}
