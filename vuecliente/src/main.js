import Vue from 'vue'
import App from './App.vue'
import store from "./store/index"
import {apolloProvider} from "./apollo"
import {router} from "./Router"

Vue.mixin({
  data(){
    return {
      serverUrl:"http://localhost:3000",
    }
  },
  computed:{
    authHeader: function(){
      let infoSesion=localStorage.getItem("sesionUsuario");
      if(!infoSesion)return null;
      infoSesion=JSON.parse(infoSesion);
      if(!infoSesion.token){
        return null;
      }
      console.log(`introduciendo header: ${infoSesion.token}`);
        return { 
          Authorization: "Bearer "+infoSesion.token
        }
    },
    usuarioLogeado: function () {
      return this.$store.state.usuario.id ? true : false;
    },
    usuarioAdministrador: function(){
      if(!this.$store.state.usuario.permisos) return false;
      return (this.$store.state.usuario.permisos.includes("administrador"))? true: false
    },
    usuarioSuperadministrador:function(){
      if(!this.$store.state.usuario.permisos) return false;
      return (this.$store.state.usuario.permisos.includes("superadministrador"))? true: false
    }
  }
})


Vue.config.productionTip = false

new Vue({
  render: h => h(App),
  store,
  apolloProvider,
  router
}).$mount('#app')
