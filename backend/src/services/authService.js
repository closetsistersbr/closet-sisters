// Regras de autenticação: login com senha em hash + emissão de token JWT.
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { usuarioRepository } from '../repositories/usuarioRepository.js';
import { Unauthorized } from '../utils/errors.js';

export const authService = {
  async registrar({ nome, email, senha }) {
    const senha_hash = await bcrypt.hash(senha, 12);
    return usuarioRepository.criar({ nome, email, senha_hash });
  },

  async login({ email, senha }) {
    const usuario = await usuarioRepository.buscarPorEmail(email);
    // Mensagem genérica de propósito: não revela se o e-mail existe.
    const generico = Unauthorized('E-mail ou senha incorretos.');
    if (!usuario) {
      await bcrypt.hash(senha, 12); // gasta tempo igual (evita timing attack)
      throw generico;
    }
    const ok = await bcrypt.compare(senha, usuario.senha_hash);
    if (!ok) throw generico;

    const token = jwt.sign(
      { nome: usuario.nome },
      env.jwtSecret,
      { subject: String(usuario.id), expiresIn: env.sessionExpiresIn },
    );
    // Nunca devolve o hash da senha.
    return { token, usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email } };
  },
};
