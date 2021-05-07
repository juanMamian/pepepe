import Vue from 'vue'
import App from './App.vue'
import { apolloProvider, serverUrl } from "./apollo"

Vue.config.productionTip = false

Vue.mixin({
  data(){
    return {
      serverUrl,
    }
  },  
})


new Vue({
  render: h => h(App),
  apolloProvider
}).$mount('#app')
