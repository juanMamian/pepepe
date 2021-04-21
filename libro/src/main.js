import Vue from 'vue'
import App from './App.vue'
import { apolloProvider, serverUrl } from "./apollo"
import store from "./store/index"

Vue.config.productionTip = false

Vue.mixin({
  data(){
    return {
      serverUrl,
    }
  },
  computed:{
    usuario(){
      return this.$store.state.usuario
    },
    usuarioSuperadministrador(){
      return this.$store.state.usuario.permisos.includes("superadministrador");
    },    
    usuarioLogeado: function () {
      if(!this.$store.state.token){
        return false;
      }
      return true;
    },
  }
})

new Vue({
  render: h => h(App),
  store,
  apolloProvider,
}).$mount('#app')