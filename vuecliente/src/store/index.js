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
        }
    }
});
