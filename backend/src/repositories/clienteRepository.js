// Acesso a dados de clientes. Consultas parametrizadas.
// Aceita um "exec" opcional (client de transação); por padrão usa o pool.
import { query, pool } from '../config/database.js';

export const clienteRepository = {
  async listar() {
    const r = await query('SELECT * FROM clientes ORDER BY nome');
    return r.rows;
  },
  async buscarPorId(id) {
    const r = await query('SELECT * FROM clientes WHERE id = $1', [id]);
    return r.rows[0] || null;
  },
  async criar(d) {
    const r = await query(
      `INSERT INTO clientes (nome, telefone, email, documento, nascimento)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [d.nome, d.telefone ?? null, d.email || null, d.documento ?? null, d.nascimento || null],
    );
    return r.rows[0];
  },
  async adicionarPontos(id, pontos, exec = pool) {
    await exec.query('UPDATE clientes SET pontos = pontos + $1 WHERE id = $2', [pontos, id]);
  },
  // Histórico de compras de um cliente (o quê, quanto, quando).
  async historico(clienteId) {
    const r = await query(
      `SELECT v.id, v.criado_em, v.total, v.pagamento,
              string_agg(vi.descricao, ' | ') AS itens
       FROM vendas v
       JOIN venda_itens vi ON vi.venda_id = v.id
       WHERE v.cliente_id = $1
       GROUP BY v.id
       ORDER BY v.criado_em DESC`,
      [clienteId],
    );
    return r.rows;
  },
};
