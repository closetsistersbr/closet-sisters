// Portão de autenticação: exige um token JWT válido.
// O token é assinado com JWT_SECRET (vem do .env, nunca do frontend).
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { Unauthorized } from '../utils/errors.js';

export function autenticar(req, _res, next) {
  const header = req.headers.authorization || '';
  const [tipo, token] = header.split(' ');

  if (tipo !== 'Bearer' || !token) {
    return next(Unauthorized('Faça login para continuar.'));
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    // Só o necessário fica disponível na requisição (menor exposição).
    req.usuario = { id: payload.sub, nome: payload.nome };
    next();
  } catch {
    next(Unauthorized('Sessão expirada ou inválida. Faça login novamente.'));
  }
}
