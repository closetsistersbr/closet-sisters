// Tratador central de erros. Nunca vaza stack trace nem detalhes internos
// para o cliente em produção.
import { isProd } from '../config/env.js';

export function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;

  // Log interno (sem dados sensíveis). Em produção, ideal enviar a um serviço.
  if (status >= 500) {
    console.error('[ERRO]', err.message);
  }

  const body = {
    erro: err.isOperational || status < 500
      ? err.message
      : 'Erro interno. Tente novamente.',
  };

  if (!isProd && status >= 500) {
    body.detalhe = err.message; // só em desenvolvimento
  }

  res.status(status).json(body);
}
