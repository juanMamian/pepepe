import { ApolloError, AuthenticationError, gql, withFilter } from "apollo-server-express";
import mongoose from "mongoose";
import { ModeloLibro as Libro } from "../../model/cuentos/Libro";

export const typeDefs = gql`

    type AudioEmbedded{
        tipoReproduccion:String,
    },

    type CuadroImagenCuento{
        id:ID,
        tipoActivacionSecundario:String,
        posicion:Coords,
        size:Coords,
        originalSize:Coords,
        audio: AudioEmbedded,
    },

    type FormatoTexto{
        alineacion:String,
        fontSize:Int,
        colorLetra:String,
        tipoLetra:String,
    }

    type CuadroTextoCuento{
        id:ID,
        texto:String,
        posicion:Coords,
        size:Coords,
        formato:FormatoTexto
    }

    type PaginaCuento{
        id:ID,
        cuadrosTexto:[CuadroTextoCuento],
        cuadrosImagen:[CuadroImagenCuento],
        color:String,
    }

    type Libro{
        id:ID,
        paginas: [PaginaCuento]
    }

    extend type Query{
        libro(idLibro:ID)Libro,
    }

    extend type Mutation{
        crearLibro:Libro,
    }

`