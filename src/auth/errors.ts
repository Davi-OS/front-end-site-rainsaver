/** The account authenticated but has no organization giving it access to RainSaver. */
export class NoAccessError extends Error {
  constructor() {
    super('Sua conta não tem acesso ao RainSaver. Fale com o administrador da sua organização.')
    this.name = 'NoAccessError'
  }
}
