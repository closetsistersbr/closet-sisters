// Conexão com Postgres (banco COMPARTILHADO na nuvem).
// Postgres suporta transações e travas de linha de verdade — é o que garante
// o estoque em tempo real entre as 3 sócias ("não vender a última peça duas
// vezes" mesmo com acessos simultâneos).
import pg from 'pg';
import { env, isProd } from './env.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: env.databaseUrl,
  // Provedores gratuitos (Supabase/Neon/Render) exigem SSL.
  ssl: isProd || (env.databaseUrl || '').includes('sslmode=require')
    ? { rejectUnauthorized: false }
    : false,
  max: 10,
});

// Atalho para consultas simples (sempre parametrizadas).
export const query = (text, params) => pool.query(text, params);

// Executa uma função dentro de UMA transação (tudo ou nada).
// Passa um "client" que deve ser usado em todas as queries da operação.
export async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const resultado = await fn(client);
    await client.query('COMMIT');
    return resultado;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// Cria as tabelas se ainda não existirem.
export async function migrate() {
  await query(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id         SERIAL PRIMARY KEY,
      nome       TEXT NOT NULL,
      email      TEXT NOT NULL UNIQUE,
      senha_hash TEXT NOT NULL,
      ativo      BOOLEAN NOT NULL DEFAULT TRUE,
      criado_em  TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS fornecedores (
      id        SERIAL PRIMARY KEY,
      nome      TEXT NOT NULL,
      contato   TEXT,
      instagram TEXT,
      site      TEXT
    );

    CREATE TABLE IF NOT EXISTS produtos (
      id            SERIAL PRIMARY KEY,
      nome          TEXT NOT NULL,
      colecao       TEXT,
      tecido        TEXT,
      tipo          TEXT,
      medidas       TEXT,
      lavagem       TEXT,
      foto_url      TEXT,
      preco_custo   NUMERIC(10,2) NOT NULL DEFAULT 0,
      preco_venda   NUMERIC(10,2) NOT NULL DEFAULT 0,
      fornecedor_id INTEGER REFERENCES fornecedores(id),
      ativo         BOOLEAN NOT NULL DEFAULT TRUE,
      criado_em     TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS variacoes (
      id          SERIAL PRIMARY KEY,
      produto_id  INTEGER NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
      tamanho     TEXT NOT NULL,
      cor         TEXT NOT NULL,
      estoque     INTEGER NOT NULL DEFAULT 0,
      estoque_min INTEGER NOT NULL DEFAULT 1,
      UNIQUE (produto_id, tamanho, cor)
    );

    CREATE TABLE IF NOT EXISTS clientes (
      id         SERIAL PRIMARY KEY,
      nome       TEXT NOT NULL,
      telefone   TEXT,
      email      TEXT,
      documento  TEXT,
      nascimento DATE,
      pontos     INTEGER NOT NULL DEFAULT 0,
      criado_em  TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS vendas (
      id          SERIAL PRIMARY KEY,
      cliente_id  INTEGER REFERENCES clientes(id),
      usuario_id  INTEGER NOT NULL REFERENCES usuarios(id),
      pagamento   TEXT NOT NULL,
      parcelas    INTEGER NOT NULL DEFAULT 1,
      desconto    NUMERIC(10,2) NOT NULL DEFAULT 0,
      total       NUMERIC(10,2) NOT NULL,
      custo_total NUMERIC(10,2) NOT NULL,
      lucro       NUMERIC(10,2) NOT NULL,
      criado_em   TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS venda_itens (
      id             SERIAL PRIMARY KEY,
      venda_id       INTEGER NOT NULL REFERENCES vendas(id) ON DELETE CASCADE,
      variacao_id    INTEGER NOT NULL REFERENCES variacoes(id),
      quantidade     INTEGER NOT NULL,
      preco_unitario NUMERIC(10,2) NOT NULL,
      custo_unitario NUMERIC(10,2) NOT NULL,
      descricao      TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_variacoes_produto ON variacoes(produto_id);
    CREATE INDEX IF NOT EXISTS idx_venda_itens_venda ON venda_itens(venda_id);
    CREATE INDEX IF NOT EXISTS idx_vendas_data ON vendas(criado_em);
  `);
}
