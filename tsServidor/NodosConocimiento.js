"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_express_1 = require("apollo-server-express");
const Nodo = require("../../model/atlas/Nodo").modeloNodo;
const typeDefs = apollo_server_express_1.gql `
type Query{
    nodos: Object
}
`;
const resolvers = {
    Query: {
        nodos: function () {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`enviando todos los nombres, vinculos y coordenadas`);
                try {
                    var todosNodos = yield Nodo.find({}, "nombre vinculos coordx coordy ubicado").exec();
                }
                catch (error) {
                    console.log(`error fetching todos los nodos. e: ` + error);
                    return { msj: "error fetching nodos" };
                }
                return { nodos: todosNodos };
            });
        }
    }
};
module.exports.defs = { typeDefs, resolvers };
