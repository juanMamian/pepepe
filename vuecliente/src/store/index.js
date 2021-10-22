import Vue from "vue"
import Vuex from "vuex"
import { apolloClient, onLogin, onLogout } from "../apollo"
import { router } from "../Router"
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
    state: function () {
        console.log(`Montando datosU`);
        let token = localStorage.getItem("token");
        var datosU = null;
        //let reloj=new Date();
        if (token) {
            datosU = parseJwt(token);
            const secsActual = parseInt(Date.now() / 1000);
            if (!datosU.version || datosU.version < 1) {
                console.log(`Versión de token caducada`);                
            }

            if (datosU.exp && secsActual >= datosU.exp) {            
                console.log(`Token expirado: exp: ${datosU.exp}`);
                token=null;
            }
        }
        return {
            usuario: {
                username: token ? datosU.username : null,
                permisos: token ? datosU.permisos : null,
                id: token ? datosU.id : null,
                atlas: {
                    centroVista: null,
                    configuracion: {
                        modo: 'estudiante'
                    }
                },
                foros: []
            },
            token,
            refreshActividadEspecifica: 0,
            refreshNodoVentanitaAtlasSolidaridad: 0,
        }

    },
    mutations: {
        logearse: function (state, token) {
            console.log(`Logeandos`);
            let usuario = parseJwt(token);
            onLogin(apolloClient, token);

            state.token = token;
            state.usuario.username = usuario.username;
            state.usuario.permisos = usuario.permisos;
            state.usuario.id = usuario.id;

            router.push({ name: "home" })
        },
        deslogearse(state) {
            onLogout(apolloClient);
            apolloClient.cache.data.clear();
            state.token = null;
            state.usuario = {
                username: null,
                permisos: [],
                id: null,
                atlas: {
                    centroVista: null,
                    configuracion: {
                        modo: 'estudiante'
                    }
                },
                foros: []
            }
        },

        refreshActividadEspecifica(state) {
            state.refreshActividadEspecifica++;
        },
        refreshNodoVentanitaAtlasSolidaridad(state) {
            state.refreshNodoVentanitaAtlasSolidaridad++;
        },

        setCentroVistaAtlas(state, nuevoCentro) {
            state.usuario.atlas.centroVista = nuevoCentro;
        },

        setInfoForosUsuario(state, foros) {
            state.usuario.foros = foros;
        },

        setRespuestasLeidasConversacionUsuario(state, datos) {
            var nuevoUsuario = JSON.parse(JSON.stringify(state.usuario));
            var infoForo = nuevoUsuario.foros.find(f => f.idForo == datos.idForo);
            if (!infoForo) {
                var nuevoInfoForo = {
                    idForo: datos.idForo,
                    conversaciones: [],
                    __typename: "InfoForosUsuario"
                };
                nuevoUsuario.foros.push(nuevoInfoForo);
                infoForo = nuevoUsuario.foros.find(f => f.idForo == datos.idForo);
            }


            var infoConversacion = infoForo.conversaciones.find(c => c.idConversacion == datos.idConversacion);
            if (!infoConversacion) {
                var nuevoInfoConversacion = {
                    idConversacion: datos.idConversacion,
                    __typename: "InfoConversacionesUsuario"
                }
                infoForo.conversaciones.push(nuevoInfoConversacion);
                infoConversacion = infoForo.conversaciones.find(c => c.idConversacion == datos.idConversacion);
            }
            infoConversacion.respuestasLeidas = datos.respuestasLeidas;
            state.usuario = nuevoUsuario;
        }
    }
});
