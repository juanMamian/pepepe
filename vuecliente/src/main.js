import Vue from 'vue'
import App from './App.vue'
import store from "./store/index"
import { apolloProvider, serverUrl } from "./apollo"
import { router } from "./Router"
// import VueApolloComponents from '@vue/apollo-components'
import VueApollo from "vue-apollo"
// import VueApollo from 'vue-apollo'
const clienteUrl = process.env.NODE_ENV === 'production' ? serverUrl + '/pepepe' : 'http://localhost:8080'

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
      if (!this.$store.state.token) {
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
  methods: {
    toReadableTime(fecha) {
      var fechaDate = new Date(fecha);
      var hora = "" + fechaDate.getHours();
      if (hora.length === 1) hora = "0" + hora;
      var minutos = "" + fechaDate.getMinutes();
      if (minutos.length === 1) minutos = "0" + minutos;
      return hora + ":" + minutos;
    },
    toReadableDate(fecha) {
      var fechaDate = new Date(fecha);
      var year = fechaDate.getFullYear();
      const listaMeses = [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre",
      ];
      const listaDias = [
        "Domingo",
        "Lunes",
        "Martes",
        "Miércoles",
        "Jueves",
        "Viernes",
        "Sábado",
      ];
      var mes = listaMeses[fechaDate.getMonth()];
      var numDia = fechaDate.getDate();
      var diaSemana = listaDias[fechaDate.getDay()];

      var finalDate = diaSemana + " " + numDia + " de " + mes;

      if (year != (new Date(Date.now())).getFullYear()) {
        finalDate = "(" + year + ") " + finalDate;
      }

      return finalDate;
    },
    toReadableFullDate(fecha) {
      return this.toReadableDate(fecha) + " - " + this.toReadableTime(fecha);
    },
    enrichedToReadableDate(fecha) {
      var fechaDate = new Date(fecha);
      var year = fechaDate.getFullYear();
      var numMes = fechaDate.getMonth();
      var numDia = fechaDate.getDate();

      var dateActual = new Date();
      var dateTomorrow = new Date(dateActual.getTime() + 86400000);
      var dateAyer = new Date(dateActual.getTime() - 86400000);
      if (year === dateActual.getFullYear() && numMes === dateActual.getMonth() && numDia === dateActual.getDate()) {
        return "Hoy"
      }
      if (year === dateTomorrow.getFullYear() && numMes === dateTomorrow.getMonth() && numDia === dateTomorrow.getDate()) {
        return "Mañana"
      }
      if (year === dateAyer.getFullYear() && numMes === dateAyer.getMonth() && numDia === dateAyer.getDate()) {
        return "Ayer"
      }
      return this.toReadableDate(fecha);
    },
    enrichedToReadableFullDate(fecha) {
      return this.enrichedToReadableDate(fecha) + " - " + this.toReadableTime(fecha);
    },
  }


})


Vue.config.productionTip = false
Vue.use(VueApollo)



new Vue({
  render: h => h(App),
  store,
  apolloProvider,
  router
}).$mount('#app')


