import mongoose from "mongoose";

const EsquemaAdministracionAtlas = new mongoose.Schema({
    idAtlas: String,
    lastPosicionamientoNodos: {
        type: Date,
        default: new Date('1995-12-17T03:24:00')
    },
    ciclosDefault: {
        type: Number,
        default: 5
    }

});

export const ModeloAdministracionAtlas = mongoose.model("AdministracionAtlas", EsquemaAdministracionAtlas);