// Controllers: recebem o pedido HTTP, chamam o serviço/repositório certo e
// devolvem a resposta. NÃO contêm regra de negócio — apenas orquestram.
import { authService } from '../services/authService.js';
import { vendaService } from '../services/vendaService.js';
import { produtoRepository } from '../repositories/produtoRepository.js';
import { clienteRepository } from '../repositories/clienteRepository.js';
import { vendaRepository } from '../repositories/vendaRepository.js';
import { NotFound } from '../utils/errors.js';

// Helper para não repetir try/catch em toda função async.
export const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export const authController = {
  login: wrap(async (req, res) => {
    const resultado = await authService.login(req.body);
    res.json(resultado);
  }),
};

export const produtoController = {
  listar: wrap(async (_req, res) => res.json(await produtoRepository.listar())),
  obter: wrap(async (req, res) => {
    const p = await produtoRepository.buscarPorId(Number(req.params.id));
    if (!p) throw NotFound('Produto não encontrado.');
    res.json(p);
  }),
  criar: wrap(async (req, res) => {
    const p = await produtoRepository.criar(req.body);
    res.status(201).json(p);
  }),
  alertas: wrap(async (_req, res) => res.json(await produtoRepository.alertasEstoque())),
};

export const clienteController = {
  listar: wrap(async (_req, res) => res.json(await clienteRepository.listar())),
  criar: wrap(async (req, res) => res.status(201).json(await clienteRepository.criar(req.body))),
  historico: wrap(async (req, res) => {
    const cliente = await clienteRepository.buscarPorId(Number(req.params.id));
    if (!cliente) throw NotFound('Cliente não encontrado.');
    res.json({ cliente, compras: await clienteRepository.historico(cliente.id) });
  }),
};

export const vendaController = {
  registrar: wrap(async (req, res) => {
    const venda = await vendaService.registrar({ ...req.body, usuarioId: req.usuario.id });
    res.status(201).json(venda);
  }),
};

// Período padrão: do início ao fim do dia atual quando não informado.
function periodo(req) {
  const hoje = new Date().toISOString().slice(0, 10);
  const de = (req.query.de || hoje) + ' 00:00:00';
  const ate = (req.query.ate || hoje) + ' 23:59:59';
  return { de, ate };
}

export const relatorioController = {
  resumo: wrap(async (req, res) => {
    const { de, ate } = periodo(req);
    const [resumo, maisVendidos] = await Promise.all([
      vendaRepository.resumoPeriodo(de, ate),
      vendaRepository.maisVendidos(de, ate),
    ]);
    res.json({ periodo: { de, ate }, resumo, maisVendidos });
  }),
  margem: wrap(async (_req, res) => res.json(await vendaRepository.margemPorProduto())),
  parados: wrap(async (_req, res) => res.json(await vendaRepository.produtosParados())),
  topClientes: wrap(async (_req, res) => res.json(await vendaRepository.clientesQueMaisCompram())),
};

export const dashboardController = {
  resumo: wrap(async (_req, res) => {
    const hoje = new Date().toISOString().slice(0, 10);
    const de = hoje + ' 00:00:00';
    const ate = hoje + ' 23:59:59';
    const [hojeResumo, alertasEstoque] = await Promise.all([
      vendaRepository.resumoPeriodo(de, ate),
      produtoRepository.alertasEstoque(),
    ]);
    res.json({ hoje: hojeResumo, alertasEstoque });
  }),
};
