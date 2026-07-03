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

  // Saúde do servidor.
  app.get('/api/health', (_req, res) => res.json({ ok: true }));

  // Rotas da API.
  app.use('/api', router);

  // 404 e tratador de erros (sempre por último).
  app.use((_req, _res, next) => next(new AppError('Rota não encontrada.', 404)));
  app.use(errorHandler);

  app.listen(env.port, () => {
    console.log(`API rodando em http://localhost:${env.port} (${env.nodeEnv})`);
  });
}

iniciar();
