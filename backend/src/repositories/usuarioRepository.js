// Acesso a dados de usuários. Consultas SEMPRE parametrizadas ($1, $2...) —
// anti-SQL-injection.
import { query } from '../config/database.js';

export const usuarioRepository = {
  async buscarPorEmail(email) {
    const r = await query('SELECT * FROM usuarios WHERE email = $1 AND ativo = TRUE', [email]);
    return r.rows[0] || null;
  },
  async buscarPorId(id) {
    const r = await query('SELECT id, nome, email, ativo, criado_em FROM usuarios WHERE id = $1', [id]);
    return r.rows[0] || null;
  },
  async criar({ nome, email, senha_hash }) {
    const r = await query(
      'INSERT INTO usuarios (nome, email, senha_hash) VALUES ($1, $2, $3) RETURNING id, nome, email, ativo, criado_em',
      [nome, email, senha_hash],
    );
    return r.rows[0];
  },
};
