// Ponto de entrada do backend. Monta o Express com as camadas de segurança.
// Assíncrono para awaitar a migration do banco.
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { migrate } from './config/database.js';
import { router } from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { AppError } from './utils/errors.js';

async function iniciar() {
  try {
    await migrate(); // cria as tabelas se não existirem
  } catch (err) {
    console.error('Erro ao conectar no banco:', err.message);
    process.exit(1);
  }

  const app = express();

  // 1) Helmet: cabeçalhos de segurança no navegador.
  app.use(helmet());

  // 2) CORS restrito: só origens conhecidas chamam a API.
  app.use(cors({
    origin(origin, cb) {
      if (!origin || env.corsOrigins.includes(origin)) return cb(null, true);
      cb(new AppError('Origem não autorizada (CORS).', 403));
    },
  }));

  // 3) Limita o tamanho do corpo.
  app.use(express.json({ limit: '1mb' }));

  // 4) Rate limit geral (anti-abuso/força bruta).
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true }));

  // Rate limit mais rígido no login.
  app.use('/api/auth/login', rateLimit({ windowMs: 15 * 60 * 1000, max: 10 }));

  // Rotas da API.
  app.use('/api', router);

  // Saúde do servidor.
  app.get('/api/health', (_req, res) => res.json({ ok: true }));

  // Rota de seed único — só funciona com a chave correta e remove-se após uso.
  app.get('/api/seed-init', async (req, res) => {
    if (req.query.key !== 'closet2026seed') return res.status(403).json({ erro: 'Não autorizado.' });
    try {
      const { authService } = await import('./services/authService.js');
      const { query } = await import('./config/database.js');
      const check = await query('SELECT COUNT(*) AS n FROM usuarios');
      if (parseInt(check.rows[0].n) > 0) return res.json({ ok: false, msg: 'Banco já populado.' });
      const socias = [
        { nome: 'Sócia 1', email: 'socia1@loja.com', senha: 'troque123' },
        { nome: 'Sócia 2', email: 'socia2@loja.com', senha: 'troque123' },
        { nome: 'Sócia 3', email: 'socia3@loja.com', senha: 'troque123' },
      ];
      for (const s of socias) await authService.registrar(s);
      res.json({ ok: true, msg: 'Seed concluído! Faça login com socia1@loja.com / troque123' });
    } catch (err) {
      res.status(500).json({ erro: err.message });
    }
  });

  // 404 e tratador de erros (sempre por último).
  app.use((_req, _res, next) => next(new AppError('Rota não encontrada.', 404)));
  app.use(errorHandler);

  app.listen(env.port, () => {
    console.log(`API rodando em http://localhost:${env.port} (${env.nodeEnv})`);
  });
}

iniciar();
