
export interface UsuarioLogin{
    username: string,
    permisos: Array<string>,
    id: string
}

export interface contextoQuery{
    usuario:UsuarioLogin,
}

export interface InterfaceCredencialesUsuario{
    id: string,
    permisos: Array<string>,
}