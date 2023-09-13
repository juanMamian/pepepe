"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var readline_sync_1 = require("readline-sync");
console.log("Iniciando mirror to Atlas");
var res = readline_sync_1.default.question("¿Continuar?");
main();
function main() {
    if (res != 'y') {
        return console.log("Cancelado");
    }
}
