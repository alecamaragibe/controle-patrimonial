import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'O nome tem que ter pelo menos 3 letras'),
    sku: z.string().min(3, 'O SKU tem que ter pelo menos 3 letras'),
    price: z.number().positive('O preço tem que ser maior que zero'),
    quantity: z.number().int().nonnegative('A quantidade não pode ser negativa'),
  }),
});