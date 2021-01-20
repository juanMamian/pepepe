import Vue from "vue"
import Vuex from "vuex"

Vue.use(Vuex);

function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}


export default new Vuex.Store({
    state: {
        usuario: {
            username: null,
            permisos: null,
            id:null,
            idGrupoEstudiantil:null,
            nombreGrupoEstudiantil:null,
        },
        token:null

    },
    mutations: {
        logearse: function (state, token) {

            let usuario=parseJwt(token);
            state.token=token;
            state.usuario.username = usuario.username;
            state.usuario.permisos = usuario.permisos;
            state.usuario.id=usuario.id;

            let usuarioLS=JSON.stringify(state.usuario);

            localStorage.setItem("pepepe_usuario", usuarioLS);
            localStorage.setItem("token".TOKEN_KEY, token);
            
        },
        setDatosUsuario:function(state, yo){
            state.usuario.idGrupoEstudiantil = yo.idGrupoEstudiantil;
            state.usuario.nombreGrupoEstudiantil = yo.nombreGrupoEstudiantil;            
        },
        deslogearse(state) {
            localStorage.clear();

            state.usuario.username = null,
            state.usuario.permisos = null,
            state.usuario.id = null,
            state.usuario.idGrupoEstudiantil=null,
            state.usuario.nombreGrupoEstudiantil=null,
           
            state.token=null


        }
    }
});
