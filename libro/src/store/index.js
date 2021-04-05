import Vue from "vue"
import Vuex from "vuex"

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
    state:{
        token:null,
        usuario:{
            username:null,
            nombres:null,
            id:null,
        }
    },
    mutations:{
        setToken(state, token){
            state.token=token;
        },
        setUserInfo(state, token){
            const datos=parseJwt(token);
            state.usuario.username=datos.username,
            state.usuario.id=datos.id;
        },
        deslogearse(state){
            state.usuario.username=null;
            state.usuario.id=null;

            state.token=null;
        }
    }
});