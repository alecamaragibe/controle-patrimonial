import { Request, Response } from 'express';

export class ProductController {
  async create(req: Request, res: Response) {
    // O "segurança" (middleware) já revistou tudo lá na rota! 
    // Então aqui a gente tem certeza absoluta que name, sku, price e quantity estão perfeitos.
    const { name, sku, price, quantity } = req.body;

    // Por enquanto não temos o banco de dados (como o Prisma) conectado aqui no controller, 
    // então vamos estar simulando a criação para você conseguir testar:
    const novoProduto = {
      id: crypto.randomUUID(), // Gera um ID falso só pra gente testar
      name,
      sku,
      price,
      quantity,
      createdAt: new Date()
    };

    // O gerente responde pro cliente que deu tudo certo!
    return res.status(201).json({
      message: 'Produto cadastrado com sucesso no estoque!',
      data: novoProduto
    });
  }
}