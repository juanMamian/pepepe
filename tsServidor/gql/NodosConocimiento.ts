import { gql } from "apollo-server-express";
const Nodo = require("../model/atlas/Nodo").modeloNodo;



export const typeDefs = gql`
type Query{
    nodos: String
}
`;

export const resolvers = {
    Query: {
        nodos: async function () {
            console.log(`enviando todos los nombres, vinculos y coordenadas`);
            try {
                var todosNodos = await Nodo.find({}, "nombre vinculos coordx coordy ubicado").exec();
            }
            catch (error) {
                console.log(`error fetching todos los nodos. e: ` + error);
                return { msj: "error fetching nodos" };
            }

            return { nodos: todosNodos };
        }
    }
};

module.exports = { typeDefs: typeDefs, resolvers: resolvers }