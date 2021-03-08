import Vue from "vue"
import Vuex from "vuex"
import { apolloClient } from "../apollo"
Vue.use(Vuex);

function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}


export default new Vuex.Store({
    state: {
        usuario: {
            username: null,
            permisos: [],
            id: null,
            atlas:{
                centroVista:null,
            },
            foros:[]
        },
        token: null,

        refreshActividadEspecifica:0,

    },
    mutations: {
        logearse: function (state, token) {

            let usuario = parseJwt(token);

            state.token = token;
            state.usuario.username = usuario.username;
            state.usuario.permisos = usuario.permisos;
            state.usuario.id = usuario.id;

            let usuarioLS = JSON.stringify(state.usuario);

            localStorage.setItem("pepepe_usuario", usuarioLS);
            localStorage.setItem("token", token);

        },
        deslogearse(state) {
            localStorage.clear();

            state.usuario.username = null,
                state.usuario.permisos = null,
                state.usuario.id = null,

                state.token = null
            apolloClient.cache.data.clear();
        },

        refreshActividadEspecifica(state){
            state.refreshActividadEspecifica++;
        },

        setCentroVistaAtlas(state, nuevoCentro){
            state.usuario.atlas.centroVista=nuevoCentro;
        },

        setInfoForosUsuario(state, foros){
            state.usuario.foros=foros;
        },

        setRespuestasLeidasConversacionUsuario(state, datos){
            console.log(`Setting con datos: ${JSON.stringify(datos)}`);
            var infoForo=state.usuario.foros.find(f=>f.id==datos.idForo);
            console.log(`State foros: ${JSON.stringify(state.usuario.foros)}`);
            if(!infoForo){
                var nuevoInfoForo={
                    idForo:datos.idForo,
                    conversaciones:[]
                };
                state.usuario.foros.push(nuevoInfoForo);
                infoForo=state.usuario.foros.find(f=>f.idForo==datos.idForo);
            }
            console.log(`State foros: ${JSON.stringify(state.usuario.foros)}`);

            var infoConversacion=infoForo.conversaciones.find(c=>c.idconversacion==datos.idConversacion);
            if(!infoConversacion){
                var nuevoInfoConversacion={
                    idConversacion:datos.idConversacion,                    
                }
                infoForo.conversaciones.push(nuevoInfoConversacion);
                infoConversacion=infoForo.conversaciones.find(c=>c.idConversacion==datos.idConversacion);
            }
            infoConversacion.respuestasLeidas=datos.respuestasLeidas;                        
            console.log(`State foros: ${JSON.stringify(state.usuario.foros)}`);
        }
    }
});
