import { gql } from "apollo-server-express";
const Nodo = require("../model/atlas/Nodo").modeloNodo;



export const typeDefs = gql`
type Vinculo{
    id:ID!,
    tipo: String!,
    idRef: ID!,
    rol: String!
}

type NodoConocimiento{
    id: ID!
    nombre: String!,
    coordX: Int,
    coordY: Int,
    vinculos: [Vinculo],    
}

type Query{
    todosNodos: [NodoConocimiento]
}
`;

export const resolvers = {
    Query: {
        todosNodos: async function () {
            console.log(`enviando todos los nombres, vinculos y coordenadas`);
            try {
                var todosNodos = await Nodo.find({}, "nombre vinculos coordx coordy ubicado").exec();
                console.log(`encontrados ${todosNodos.length} nodos`);
            }
            catch (error) {
                console.log(`error fetching todos los nodos. e: ` + error);
                return ;
            }

            return todosNodos;
        }
    }
};

module.exports = { typeDefs: typeDefs, resolvers: resolvers }