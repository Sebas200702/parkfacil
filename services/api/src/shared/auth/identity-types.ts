export interface Identity {
  sub: string
  email: string | undefined
  groups: string[]
  parqueaderoId: string | undefined
}

export interface AdminIdentity extends Identity {
  parqueaderoId: string
}
