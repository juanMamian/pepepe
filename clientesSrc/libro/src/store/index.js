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
            permisos:[],
            foros:[]
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
            state.usuario.permisos=datos.permisos
        },
        deslogearse(state){
            state.usuario.username=null;
            state.usuario.id=null;

            state.token=null;
        },
        setRespuestasLeidasConversacionUsuario(state, datos){
            var infoForo=state.usuario.foros.find(f=>f.idForo==datos.idForo);
            if(!infoForo){
                var nuevoInfoForo={
                    idForo:datos.idForo,
                    conversaciones:[],
                    __typename:"InfoForosUsuario"
                };
                state.usuario.foros.push(nuevoInfoForo);
                infoForo=state.usuario.foros.find(f=>f.idForo==datos.idForo);
            }
            

            var infoConversacion=infoForo.conversaciones.find(c=>c.idConversacion==datos.idConversacion);
            if(!infoConversacion){
                var nuevoInfoConversacion={
                    idConversacion:datos.idConversacion,                    
                    __typename:"InfoConversacionesUsuario"
                }
                infoForo.conversaciones.push(nuevoInfoConversacion);
                infoConversacion=infoForo.conversaciones.find(c=>c.idConversacion==datos.idConversacion);
            }
            infoConversacion.respuestasLeidas=datos.respuestasLeidas;                        
            console.log(`En variable IC: ${JSON.stringify(infoConversacion)}`);
            console.log(`En state IC: ${JSON.stringify(state.usuario.foros.find(f=>f.idForo==datos.idForo).conversaciones.find(c=>c.idConversacion==datos.idConversacion))}`);
        },
        setInfoForosUsuario(state, foros){
            state.usuario.foros=foros;
        },
    }
});