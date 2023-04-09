<template>
  <div class=".logoutScreen">
    <div id="zonaCentral">
      <loading />
      <div class="anuncio">Cerrando sesión.</div>
    </div>
  </div>
</template>
<script>
import { QUERY_AUTH_USUARIO } from "../globalMixin";
import Loading from "../components/utilidades/Loading.vue";

export default {
  name: "LogoutScreen",
  components: {
    Loading,
  },
  data() {
    return {};
  },
  methods: {
    waitApolloNotLoading() {
      if (this.$apollo.loading) {
        console.log("apollo is loading");
        setTimeout(() => {
            this.waitApolloNotLoading
        }, 500);
      } else {
        console.log("Apollo idle");
        this.$router.push({ name: "loginScreen" });
      }
    },
    funcionesDeslogeo() {
      this.$apollo.skipAll = true;
      this.$nextTick(() => {
        const store = this.$apollo.provider.defaultClient;
        store.writeQuery({
          query: QUERY_AUTH_USUARIO,
          data: { auth_usuario: null },
        });
        store
          .resetStore()
          .then(() => {
            console.log("Store reset");
            this.waitApolloNotLoading();
          })
          .catch((error) => {
            console.log("Error resetting store: " + error);
          });
      });
    },
  },
  mounted() {
    this.funcionesDeslogeo();
  },
};
</script>
<style scoped>
#zonaCentral {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>
