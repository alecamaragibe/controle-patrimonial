import { Router } from 'express';
import { ProductController } from '../controllers/product.controller.js'; 
import { validate } from '../middlewares/validate.middleware';
import { createProductSchema } from '../schemas/product.schema';

const router = Router();
const productController = new ProductController();

// Olha a mágica acontecendo aqui na rota POST:
// 1º A Rota -> 2º O Segurança com a Regra -> 3º O Gerente
router.post('/products', validate(createProductSchema), productController.create);

export default router;