import Vue from 'vue'
import App from './App.vue'
import store from "./store/main"
import {apolloProvider} from "./apollo"

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
    }
  }
})


Vue.config.productionTip = false

new Vue({
  render: h => h(App),
  store,
  apolloProvider
}).$mount('#app')
