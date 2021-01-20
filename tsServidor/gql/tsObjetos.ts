import { PubSub } from "apollo-server-express";

export interface UsuarioLogin{
    username: string,
    permisos: Array<string>,
    id: string
}

export interface contextoQuery{
    usuario:UsuarioLogin,
    pubsub:PubSub
}

export interface InterfaceCredencialesUsuario{
    id: string,
    permisos: Array<string>,
}