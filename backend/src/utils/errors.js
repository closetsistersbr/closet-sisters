// Erro de aplicação com status HTTP. Mensagens seguras para o cliente.
export class AppError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
    this.isOperational = true;
  }
}

export const NotFound = (msg = 'Não encontrado') => new AppError(msg, 404);
export const Unauthorized = (msg = 'Não autorizado') => new AppError(msg, 401);
export const Conflict = (msg = 'Conflito') => new AppError(msg, 409);
