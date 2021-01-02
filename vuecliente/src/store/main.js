import Vue from "vue"
import Vuex from "vuex"

Vue.use(Vuex);

export default new Vuex.Store({
    state:{
        usuario:{
            username: null,
            permisos: null
        }

    },

    mutations:{
        logearse:function(state, usuario){
            state.usuario.username=usuario.username;
            state.usuario.permisos=usuario.permisos
        },
        deslogearse(state){
            localStorage.removeItem("sesionUsuario");            
            state.usuario.username=null,
            state.usuario.permisos=null
        }
    }
});
