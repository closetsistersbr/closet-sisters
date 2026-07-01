// Valida o corpo da requisição com um schema Zod.
// Tudo que o cliente envia é tratado como hostil até ser validado aqui.
import { AppError } from '../utils/errors.js';

export const validate = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const msg = result.error.issues.map((i) => i.message).join('; ');
    return next(new AppError(`Dados inválidos: ${msg}`, 422));
  }
  req.body = result.data; // dados já saneados/tipados
  next();
};
