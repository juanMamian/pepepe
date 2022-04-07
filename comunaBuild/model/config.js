"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatorTexto = exports.validatorNombreCosa = exports.charProhibidosTexto = exports.charProhibidosNombreCosa = void 0;
exports.charProhibidosNombreCosa = /[^ a-zA-ZÀ-ž0-9_():.,-]/;
exports.charProhibidosTexto = /[^\n\r a-zA-ZÀ-ž0-9_()":;.,+¡!¿?@=-]/;
exports.validatorNombreCosa = {
    validator: function (n) {
        return !exports.charProhibidosNombreCosa.test(n);
    },
    message: props => `${props.value} contiene caracteres ilegales!`
};
exports.validatorTexto = {
    validator: function (n) {
        return !exports.charProhibidosTexto.test(n);
    },
    message: props => `${props.value} contiene caracteres ilegales!`
};
