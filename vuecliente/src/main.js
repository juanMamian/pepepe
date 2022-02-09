import Vue from 'vue'
import App from './App.vue'
import store from "./store/index"
import { apolloProvider, serverUrl } from "./apollo"
import { router } from "./Router"
// import VueApolloComponents from '@vue/apollo-components'
import VueApollo from "vue-apollo"
// import VueApollo from 'vue-apollo'
const clienteUrl = process.env.NODE_ENV === 'production'? serverUrl+'/pepepe' : 'http://localhost:8080'

Vue.mixin({
  data() {
    return {
      serverUrl,      
      clienteUrl
    }
  },
  computed: {
    authHeader: function () {
      let infoSesion = localStorage.getItem("sesionUsuario");
      if (!infoSesion) return null;
      infoSesion = JSON.parse(infoSesion);
      if (!infoSesion.token) {
        return null;
      }
      console.log(`introduciendo header: ${infoSesion.token}`);
      return {
        Authorization: "Bearer " + infoSesion.token
      }
    },
    usuario: function () {
      return this.$store.state.usuario;
    },
    usuarioLogeado: function () {
      if(!this.$store.state.token){
        return false;
      }
      return true;
    },
    usuarioAdministrador: function () {
      if (!this.$store.state.usuario.permisos) return false;
      return (this.$store.state.usuario.permisos.includes("administrador")) ? true : false
    },
    usuarioSuperadministrador: function () {
      if (!this.$store.state.usuario.permisos) return false;
      return (this.$store.state.usuario.permisos.includes("superadministrador")) ? true : false
    },    
    usuarioAdministradorActividadesEstudiantiles: function () {
      if (!this.$store.state.usuario.permisos) return false;
      return (this.$store.state.usuario.permisos.includes("actividadesEstudiantiles-administrador")) ? true : false
    },
    usuarioProfe: function () {
      if (!this.$store.state.usuario.permisos) return false;
      return this.$store.state.usuario.permisos.includes(
        "maestraVida-profesor"
      );
    },
  },
 

})


Vue.config.productionTip = false
Vue.use(VueApollo)



new Vue({
  render: h => h(App),
  store,
  apolloProvider,
  router
}).$mount('#app')


