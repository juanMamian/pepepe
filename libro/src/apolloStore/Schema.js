import gql from "graphql-tag"


/*
export const typeDefs=gql`
    type usuario{
        username: String,
    }
`;
*/


export const typeDefs = gql`
    
    enum TiposUsuario{
        USUARIO,
        ADMINISTRADOR,
        SUPERADMINSTRADOR
    }
    
    type Usuario{
        username:String,
        permisos: TiposUsuario
     }

    type Mutations{ 
        setUsuario(username: String, permisos: TiposUsuario):Usuario
    }
`;



export const resolvers={}


