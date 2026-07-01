// Popula o banco com dados iniciais: as 3 sócias (cada uma com seu login) e
// alguns produtos de exemplo. Rode uma vez com: npm run seed
import { migrate, pool } from './config/database.js';
import { authService } from './services/authService.js';
import { produtoRepository } from './repositories/produtoRepository.js';

async function seed() {
  try {
    await migrate();

    const r = await pool.query('SELECT COUNT(*) AS n FROM usuarios');
    if (r.rows[0].n > 0) {
      console.log('Banco já populado. Nada a fazer.');
      process.exit(0);
    }

    // Senhas iniciais — TROQUE no primeiro acesso.
    const socias = [
      { nome: 'Sócia 1', email: 'socia1@loja.com', senha: 'troque123' },
      { nome: 'Sócia 2', email: 'socia2@loja.com', senha: 'troque123' },
      { nome: 'Sócia 3', email: 'socia3@loja.com', senha: 'troque123' },
    ];

    for (const s of socias) {
      await authService.registrar(s);
      console.log(`Usuária criada: ${s.email} (senha: ${s.senha})`);
    }

    await produtoRepository.criar({
      nome: 'Vestido Manuela',
      colecao: 'Verão 2026',
      tecido: 'Viscose',
      tipo: 'Vestido',
      medidas: 'Busto 88cm / Comprimento 95cm',
      lavagem: 'Lavar à mão, não usar alvejante',
      preco_custo: 45,
      preco_venda: 129.9,
      variacoes: [
        { tamanho: 'P', cor: 'Azul', estoque: 3, estoque_min: 1 },
        { tamanho: 'M', cor: 'Azul', estoque: 2, estoque_min: 1 },
        { tamanho: 'G', cor: 'Vermelho', estoque: 1, estoque_min: 1 },
      ],
    });

    await produtoRepository.criar({
      nome: 'Blusa Bolinhas',
      colecao: 'Verão 2026',
      tecido: 'Algodão',
      tipo: 'Blusa',
      preco_custo: 22,
      preco_venda: 69.9,
      variacoes: [
        { tamanho: 'P', cor: 'Amarelo', estoque: 1, estoque_min: 1 },
        { tamanho: 'M', cor: 'Branco', estoque: 4, estoque_min: 2 },
      ],
    });

    console.log('\nSeed concluído! Faça login com socia1@loja.com / troque123');
    process.exit(0);
  } catch (err) {
    console.error('Erro no seed:', err.message);
    process.exit(1);
  }
}

seed();
