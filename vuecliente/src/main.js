import Vue from 'vue'
import VueApollo from "vue-apollo";

import App from './App.vue'
import ApolloClient from "apollo-boost"

Vue.use(VueApollo);


const apolloClient=new ApolloClient({
  uri: "http://localhost:3000/graphql"
});

const apolloProvider=new VueApollo({
  defaultClient:apolloClient
})
Vue.config.productionTip = false

new Vue({
  render: h => h(App),
  apolloProvider
}).$mount('#app')
