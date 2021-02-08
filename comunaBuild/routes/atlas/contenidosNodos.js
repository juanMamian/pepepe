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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const router = require("express").Router();
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const util_1 = require("util");
const access = util_1.promisify(fs_1.default.access);
router.get("/:idNodo", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const idNodo = req.params.idNodo;
        console.log(`Acceso al contenido de un nodo con id ${req.params.idNodo}`);
        const pathIndex = path_1.default.join(__dirname, '../../assetsAtlas/contenidosNodos/', idNodo, "index.html");
        fs_1.default.access(pathIndex, (err) => {
            if (err) {
                let pathDefault = path_1.default.join(__dirname, '../../assetsAtlas/contenidosNodos/', "default", "index.html");
                console.log(`Error leyendo el archivo. Enviando default`);
                return res.sendFile(pathDefault);
            }
            return res.sendFile(pathIndex);
        });
    });
});
module.exports = router;
