const mongoose = require("mongoose");

const permisosDeUsuario = ["usuario", "administrador", "atlasAdministrador", "superadministrador", "actividadesProfes-profe"];

const esquemaUsuario = mongoose.Schema({
    username: {
        type: String,
        min: 3,
        max: 50,
        unique: true
    },
    nombres: {
        type: String,
        max: 255,
        min: 2,
        required: true
    },
    apellidos: {
        type: String,
        max: 255,
        min: 2,
        required: true
    },
    fechaNacimiento: {
        type: Date,
        max: Date.now(),
        min: '1900-01-01',
        default: Date.now()
    },
    fotografia: {
        type: Buffer,
    },
    lugarResidencia: {
        type: String
    },
    numeroTel: {
        type: String,
    },
    email: {
        type: String,
    },
    nodosConocimiento: [{
        tipo: {
            type: String,
            required: true,
            max: 20,
            default: "APRENDIENDO",
            enum: ["aprendiendo", "aprendido", "objetivo"]
        },
        nodoConocimiento: {
            type: String,
        }
    }],
    password: {
        type: String,
        required: true,
        max: 1024,
        min: 6
    },
    permisos: {
        type: [String],
        required: true,
        max: 100,
        min: 2,
        default: ["usuario"],
        enum: permisosDeUsuario
    },
    atlas: {
        centroVista: {
            x: {
                type: Number,
                default: 0
            },
            y: {
                type: Number,
                default: 0
            }
        }
    }
});

esquemaUsuario.methods.getEdad = function () {
    console.log(`convirtiendo ${this.fechaNacimiento} a edad`);
    let hoy = new Date();
    let edad = hoy - this.fechaNacimiento;
    let edadAños = parseInt(edad / (60 * 60 * 24 * 365 * 1000));
    return edadAños;
}
esquemaUsuario.methods.validarDatosUsuario = function (datosUsuario) {

    var charProhibidos = /[^ a-zA-ZÀ-ž0-9_():.,-]/g;
    var charProhibidosNombre = /[^ a-zA-ZÀ-ž]/g;
    var charProhibidosNumeroTel = /[^0-9+-]/g;
    var emailChars = /\S+@\S+\.\S+/;
    var dateChars = /[12][90][0-9][0-9]-[01][0-9]-[0-3][0-9]/;


    var errores = [];

    for (let dato in datosUsuario) {
        if (!datosUsuario[dato]) {
            errores.push(`El dato ${dato} no tenia valor`);
            return errores;
        }
        datosUsuario[dato] = datosUsuario[dato].trim();

        if (dato == "nombres") {
            if (datosUsuario.nombres.length < 2) {
                errores.push("Tu nombre es muy corto");
            }
            if (charProhibidosNombre.test(datosUsuario.nombres)) {
                errores.push("Tu nombre contiene caracteres no permitidos");
            }
        }
        else if (dato == "apellidos") {
            if (datosUsuario.apellidos.length < 2) {
                errores.push("Tu apellido es muy corto");
            }
            if (charProhibidosNombre.test(datosUsuario.apellidos)) {
                errores.push("Tu apellido contiene caracteres no permitidos");
            }
        }

        else if (dato == "fechaNacimiento") {
            if (!dateChars.test(datosUsuario.fechaNacimiento)) {
                errores.push("Tu fecha de nacimiento es incorrecta");
            }
        }

        else if (dato == "email") {
            if (datosUsuario.email.length > 0 && !emailChars.test(datosUsuario.email)) {
                errores.push("Tu e-mail no es válido");
            }
        }

        else if (dato == "numeroTel") {
            if (charProhibidosNumeroTel.test(datosUsuario.numeroTel)) {
                errores.push("Tu número telefónico no es válido");
            }
        }

        else if (dato == "lugarResidencia") {
            if (datosUsuario.lugarResidencia.length < 2) {
                errores.push("Tu lugar de residencia es muy corto");
            }
            if (charProhibidos.test(datosUsuario.lugarResidencia)) {
                errores.push(
                    "Tu lugar de residencia contiene caracteres no permitidos"
                );
            }
        }
        else if (dato == "username") {
            if (datosUsuario.username.length < 4) {
                errores.push("Tu nombre de usuario es muy corto");
            }
            if (charProhibidos.test(datosUsuario.username)) {
                errores.push("Tu nombre de usuario contiene caracteres no permitidos");
            }
        }
        else if (dato == "password") {
            if (datosUsuario.password.length < 6 || datosUsuario.password.length > 32) {
                errores.push("Tu contraseña debe contener entre 6 y 32 caracteres");
            }
        }
        else {
            errores.push(`El dato ${dato} no tenía lǵica de validación`);
        }
    }

    return errores;
}


module.exports = { Usuario: mongoose.model("Usuario", esquemaUsuario), permisosDeUsuario }

