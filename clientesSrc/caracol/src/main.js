import { createApp } from 'vue'

import App from './App.vue'
import router from './router'
import { apolloProvider } from './apollo'
import { globalMixin } from "./globalMixin";
import { persistor } from "./apolloCache";



const iniciarVue = async function () {
    await persistor.restore();

    app.mount("#app");
};

const app = createApp(App)
app.mixin(globalMixin);
app.use(router);
app.use(apolloProvider);

iniciarVue();