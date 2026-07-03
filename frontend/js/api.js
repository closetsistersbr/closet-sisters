// Cliente da API. ÚNICO ponto do frontend que fala com o backend.
// O token de sessão fica no navegador (localStorage) — NUNCA há chave de API
// aqui; segredos vivem só no backend.
const BASE_URL = 'https://closet-sisters-api.onrender.com/api';

const TOKEN_KEY = 'loja_token';
export const auth = {
  get token() { return localStorage.getItem(TOKEN_KEY); },
  set token(t) { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); },
  get logado() { return !!this.token; },
  sair() { this.token = null; },
};

async function request(metodo, caminho, corpo) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth.token) headers.Authorization = `Bearer ${auth.token}`;

  const resp = await fetch(BASE_URL + caminho, {
    method: metodo,
    headers,
    body: corpo ? JSON.stringify(corpo) : undefined,
  });

  if (resp.status === 401) {
    auth.sair();
    location.reload();
    throw new Error('Sessão expirada.');
  }

  const dados = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(dados.erro || 'Erro na requisição.');
  return dados;
}

export const api = {
  login: (email, senha) => request('POST', '/auth/login', { email, senha }),
  produtos: () => request('GET', '/produtos'),
  criarProduto: (p) => request('POST', '/produtos', p),
  alertasEstoque: () => request('GET', '/produtos/alertas-estoque'),
  clientes: () => request('GET', '/clientes'),
  criarCliente: (c) => request('POST', '/clientes', c),
  historicoCliente: (id) => request('GET', `/clientes/${id}/historico`),
  registrarVenda: (v) => request('POST', '/vendas', v),
  dashboard: () => request('GET', '/dashboard'),
  resumo: (de, ate) => request('GET', `/relatorios/resumo?de=${de}&ate=${ate}`),
  margem: () => request('GET', '/relatorios/margem'),
  produtosParados: () => request('GET', '/relatorios/produtos-parados'),
  topClientes: () => request('GET', '/relatorios/top-clientes'),
};
