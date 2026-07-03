// Acesso a dados de produtos e suas variações. Consultas parametrizadas.
// Aceita um "exec" opcional (client de transação); por padrão usa o pool.
import { query, pool, withTransaction } from '../config/database.js';

export const produtoRepository = {
  async listar() {
    const produtos = (await query(`
      SELECT p.*, f.nome AS fornecedor_nome
      FROM produtos p
      LEFT JOIN fornecedores f ON f.id = p.fornecedor_id
      WHERE p.ativo = TRUE
      ORDER BY p.nome
    `)).rows;
    const variacoes = (await query('SELECT * FROM variacoes')).rows;
    return produtos.map((p) => ({
      ...p,
      variacoes: variacoes.filter((v) => v.produto_id === p.id),
    }));
  },

  async buscarPorId(id, exec = pool) {
    const produto = (await exec.query('SELECT * FROM produtos WHERE id = $1', [id])).rows[0];
    if (!produto) return null;
    produto.variacoes = (await exec.query('SELECT * FROM variacoes WHERE produto_id = $1', [id])).rows;
    return produto;
  },

  async buscarVariacao(id, exec = pool) {
    const r = await exec.query('SELECT * FROM variacoes WHERE id = $1', [id]);
    return r.rows[0] || null;
  },

  // Cria produto + variações numa transação (tudo ou nada).
  async criar(d) {
    return withTransaction(async (client) => {
      const produtoId = (await client.query(
        `INSERT INTO produtos
           (nome, colecao, tecido, tipo, medidas, lavagem, foto_url, preco_custo, preco_venda, fornecedor_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
        [d.nome, d.colecao ?? null, d.tecido ?? null, d.tipo ?? null, d.medidas ?? null,
         d.lavagem ?? null, d.foto_url ?? null, d.preco_custo, d.preco_venda, d.fornecedor_id ?? null],
      )).rows[0].id;

      for (const v of d.variacoes) {
        await client.query(
          `INSERT INTO variacoes (produto_id, tamanho, cor, estoque, estoque_min)
           VALUES ($1, $2, $3, $4, $5)`,
          [produtoId, v.tamanho, v.cor, v.estoque ?? 0, v.estoque_min ?? 1],
        );
      }
      return this.buscarPorId(produtoId, client);
    });
  },

  async atualizar(id, d) {
    return withTransaction(async (client) => {
      await client.query(
        `UPDATE produtos SET nome=$1, colecao=$2, tecido=$3, tipo=$4, medidas=$5,
          lavagem=$6, preco_custo=$7, preco_venda=$8 WHERE id=$9`,
        [d.nome, d.colecao ?? null, d.tecido ?? null, d.tipo ?? null, d.medidas ?? null,
         d.lavagem ?? null, d.preco_custo, d.preco_venda, id],
      );
      // Substitui variações: apaga as antigas e insere as novas
      await client.query('DELETE FROM variacoes WHERE produto_id = $1', [id]);
      for (const v of d.variacoes) {
        await client.query(
          `INSERT INTO variacoes (produto_id, tamanho, cor, estoque, estoque_min)
           VALUES ($1, $2, $3, $4, $5)`,
          [id, v.tamanho, v.cor, v.estoque ?? 0, v.estoque_min ?? 1],
        );
      }
      return this.buscarPorId(id, client);
    });
  },

  async excluir(id) {
    await query('UPDATE produtos SET ativo = FALSE WHERE id = $1', [id]);
  },

  // Variações com estoque <= estoque_min (alerta de esgotado/baixo).
  async alertasEstoque() {
    const r = await query(`
      SELECT v.*, p.nome AS produto_nome
      FROM variacoes v
      JOIN produtos p ON p.id = v.produto_id
      WHERE p.ativo = TRUE AND v.estoque <= v.estoque_min
      ORDER BY v.estoque ASC
    `);
    return r.rows;
  },
};
