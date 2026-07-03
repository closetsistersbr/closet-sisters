// Definição dos endereços da API. Tudo (menos login) exige autenticação.
import { Router } from 'express';
import { autenticar } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import {
  authController, produtoController, clienteController,
  vendaController, relatorioController, dashboardController,
} from '../controllers/index.js';
import { loginSchema, produtoSchema, clienteSchema, vendaSchema } from './schemas.js';

export const router = Router();

// --- Público ---
router.post('/auth/login', validate(loginSchema), authController.login);

// --- A partir daqui, exige login ---
router.use(autenticar);

// Produtos / estoque
router.get('/produtos', produtoController.listar);
router.get('/produtos/alertas-estoque', produtoController.alertas);
router.get('/produtos/:id', produtoController.obter);
router.post('/produtos', validate(produtoSchema), produtoController.criar);
router.put('/produtos/:id', validate(produtoSchema), produtoController.atualizar);
router.delete('/produtos/:id', produtoController.excluir);

// Clientes
router.get('/clientes', clienteController.listar);
router.post('/clientes', validate(clienteSchema), clienteController.criar);
router.get('/clientes/:id/historico', clienteController.historico);

// Vendas
router.post('/vendas', validate(vendaSchema), vendaController.registrar);

// Relatórios
router.get('/relatorios/resumo', relatorioController.resumo);
router.get('/relatorios/margem', relatorioController.margem);
router.get('/relatorios/produtos-parados', relatorioController.parados);
router.get('/relatorios/top-clientes', relatorioController.topClientes);

// Dashboard
router.get('/dashboard', dashboardController.resumo);
