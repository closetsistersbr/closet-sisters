// Lê e valida as variáveis de ambiente UMA vez, no início.
// Segredos vêm SEMPRE do .env (nunca hardcoded, nunca no frontend).
import dotenv from 'dotenv';
dotenv.config();

function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === '') {
    throw new Error(`Variável de ambiente obrigatória ausente: ${name}. Copie backend/.env.example para backend/.env e preencha.`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT || 3333),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: required('JWT_SECRET'),
  sessionExpiresIn: process.env.SESSION_EXPIRES_IN || '8h',
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5500,http://127.0.0.1:5500')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  databaseUrl: process.env.DATABASE_URL || './data/loja.sqlite',
};

export const isProd = env.nodeEnv === 'production';
