// Acesso a dados de vendas e relatórios. Consultas parametrizadas.
// Os métodos de escrita recebem o "exec" (client da transação) para que toda a
// venda aconteça atomicamente.
import { query, pool } from '../config/database.js';

export const vendaRepository = {
  // Baixa de estoque ATÔMICA. O WHERE estoque >= $1 garante que só funciona se
  // ainda houver peça — é isso que impede vender a "última blusa" duas vezes
  // ao mesmo tempo. Retorna true se baixou; false se faltou estoque.
  async baixarEstoque(variacaoId, quantidade, exec = pool) {
    const r = await exec.query(
      'UPDATE variacoes SET estoque = estoque - $1 WHERE id = $2 AND estoque >= $1',
      [quantidade, variacaoId],
    );
    return r.rowCount === 1;
  },

  async inserirVenda(v, exec = pool) {
    const r = await exec.query(
      `INSERT INTO vendas (cliente_id, usuario_id, pagamento, parcelas, desconto, total, custo_total, lucro)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
      [v.cliente_id, v.usuario_id, v.pagamento, v.parcelas, v.desconto, v.total, v.custo_total, v.lucro],
    );
    return r.rows[0].id;
  },

  async inserirItem(i, exec = pool) {
    await exec.query(
      `INSERT INTO venda_itens (venda_id, variacao_id, quantidade, preco_unitario, custo_unitario, descricao)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [i.venda_id, i.variacao_id, i.quantidade, i.preco_unitario, i.custo_unitario, i.descricao],
    );
  },

  async buscarPorId(id, exec = pool) {
    const venda = (await exec.query('SELECT * FROM vendas WHERE id = $1', [id])).rows[0];
    if (!venda) return null;
    venda.itens = (await exec.query('SELECT * FROM venda_itens WHERE venda_id = $1', [id])).rows;
    return venda;
  },

  // --- Relatórios ---
  async resumoPeriodo(de, ate) {
    const r = await query(`
      SELECT COUNT(*) AS qtd_vendas,
             COALESCE(SUM(total), 0)       AS faturamento,
             COALESCE(SUM(custo_total), 0) AS custo,
             COALESCE(SUM(lucro), 0)       AS lucro
      FROM vendas
      WHERE criado_em BETWEEN $1 AND $2
    `, [de, ate]);
    return r.rows[0];
  },

  async maisVendidos(de, ate, limite = 10) {
    const r = await query(`
      SELECT vi.descricao,
             SUM(vi.quantidade) AS unidades,
             SUM(vi.quantidade * vi.preco_unitario) AS receita
      FROM venda_itens vi
      JOIN vendas v ON v.id = vi.venda_id
      WHERE v.criado_em BETWEEN $1 AND $2
      GROUP BY vi.descricao
      ORDER BY unidades DESC
      LIMIT $3
    `, [de, ate, limite]);
    return r.rows;
  },

  // Produtos que nunca venderam (produtos parados).
  async produtosParados() {
    const r = await query(`
      SELECT p.id, p.nome, p.colecao
      FROM produtos p
      WHERE p.ativo = TRUE
        AND NOT EXISTS (
          SELECT 1 FROM venda_itens vi
          JOIN variacoes v ON v.id = vi.variacao_id
          WHERE v.produto_id = p.id
        )
      ORDER BY p.criado_em
    `);
    return r.rows;
  },

  // Margem de lucro por produto.
  async margemPorProduto() {
    const r = await query(`
      SELECT id, nome, preco_custo, preco_venda,
             (preco_venda - preco_custo) AS margem_valor,
             CASE WHEN preco_venda > 0
                  THEN ROUND((preco_venda - preco_custo) * 100.0 / preco_venda, 1)
                  ELSE 0 END AS margem_pct
      FROM produtos
      WHERE ativo = TRUE
      ORDER BY margem_pct DESC
    `);
    return r.rows;
  },

  async clientesQueMaisCompram(limite = 10) {
    const r = await query(`
      SELECT c.id, c.nome, COUNT(v.id) AS compras, COALESCE(SUM(v.total),0) AS total_gasto
      FROM clientes c
      JOIN vendas v ON v.cliente_id = c.id
      GROUP BY c.id
      ORDER BY total_gasto DESC
      LIMIT $1
    `, [limite]);
    return r.rows;
  },
};
