import gql from "graphql-tag"

const UsuarioQuery=gql`
    {
        usuario @client{
            username
            permisos
        }
    }
`;


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



export const resolvers={
    Mutation:{
        setUsuario: (_, {username, permisos}, {cache})=>{
            cache.writeQuery({
                query: UsuarioQuery,
                data:{
                    username,
                    permisos,
                }
            });
            
            return cache.readQuery({query: UsuarioQuery});
        }
    },

}


