import { Response } from "express"

interface ObjetoError {
    tipo: string,
    msjDev: string,
    msjUsuario: string | null

}

export const errorApi = function (error: string | null, tipo: string, msjDev: string, msjUsuario: string | null):ObjetoError {
    console.log(msjDev + ". Error: " + error);
    const respuesta: ObjetoError = {
        tipo,
        msjUsuario,
        msjDev,
    }
    return respuesta;
}