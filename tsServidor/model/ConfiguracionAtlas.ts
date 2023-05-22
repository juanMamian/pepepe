import mongoose, { InferSchemaType } from "mongoose";


export const esquemaConfiguracionAtlas = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        enum: ["solidaridad", "conocimiento"],
    },
    posicionando: {
        type: Boolean,
        default: false,
    },
    lastGeneralSnapshot: {
        type: Date,
    }
});


export type tConfiguracionAtlas = InferSchemaType<typeof esquemaConfiguracionAtlas>

export const ModeloConfiguracionAtlas = mongoose.model("ConfiguracionAtlas", esquemaConfiguracionAtlas, "configuracionesAtlas");
export type DocAtlas = InstanceType<typeof ModeloConfiguracionAtlas>
