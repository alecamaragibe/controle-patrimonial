import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

// Adicionamos o <any> para o TypeScript parar de surtar com o formato
export const validate = (schema: ZodSchema<any>) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    
    const result = await schema.safeParseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      res.status(400).json({
        erro: 'Dados inválidos',
        detalhes: result.error.issues
      });
      return;
    }

    // Agora o TS sabe que pode acessar isso aqui de boa
    req.body = result.data.body;
    req.query = result.data.query;
    req.params = result.data.params;
    
    return next();
  };
};