export interface UsuarioLogin{
    username: string,
    permisos: string,
    id: string
}

export interface contextoQuery{
    usuario:UsuarioLogin
}