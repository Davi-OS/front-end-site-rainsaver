/** The authenticated account, as returned by go-auth-service's GET /me. */
export interface PublicUser {
  id: string
  email: string
}

export interface LoginInput {
  email: string
  password: string
  /** Organization to log into, required when the account belongs to several. */
  org?: string
}
