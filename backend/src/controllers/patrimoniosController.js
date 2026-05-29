const prisma = require('../database/prisma')

const criarPatrimonio = async (req, res) => {

  try {

    const {
      nome,
      tipo,
      patrimonio,
      status,
      localizacao
    } = req.body

    const novoPatrimonio = await prisma.patrimonio.create({
      data: {
        nome,
        tipo,
        patrimonio,
        status,
        localizacao
      }
    })

    return res.status(201).json(novoPatrimonio)

  } catch (error) {

    return res.status(500).json({
      erro: error.message
    })

  }

}

const listarPatrimonios = async (req, res) => {

  try {

    const patrimonios = await prisma.patrimonio.findMany()

    return res.json(patrimonios)

  } catch (error) {

    return res.status(500).json({
      erro: error.message
    })

  }

}

const editarPatrimonio = async (req, res) => {

    try {

        const { id } = req.params

        const {
            nome,
            tipo,
            patrimonio,
            status,
            localizacao
        } = req.body

        const patrimonioAtualizado =
            await prisma.patrimonio.update({

                where: {
                    id: Number(id)
                },

                data: {
                    nome,
                    tipo,
                    patrimonio,
                    status,
                    localizacao
                }
            })

        return res.json(patrimonioAtualizado)
    
    }   catch (error) {

        return res.status(500).json({
            erro: error.message
        })
    }

}

const deletarPatrimonio = async (req, res) => {

    try {

        const { id } = req.params

        await prisma.patrimonio.delete({

            where: {
                id: Number(id)
            }
        })

        return res.json({
            mensagem: 'Patrimônio Deletado com Sucesso'
        })
    } catch (error) {

        return res.status(500).json({
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