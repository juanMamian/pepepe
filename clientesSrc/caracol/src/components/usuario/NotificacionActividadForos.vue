<template>
  <div class="notificacionActividadForos" @click="visitar">
    <img
      src="@/assets/iconos/conversacion.png"
      alt="Conversación"
      id="iconoConversacion"
    />
    <div id="texto" v-html="mensaje"></div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import { QUERY_YO } from "../../App.vue";

export default {
  name: "NotificacionActividadForos",
  props: {
    estaNotificacion: {
      type: Object,
      default: function () {
        return {};
      },
    },
  },
  methods: {
    visitar() {
      var enlace = "/";
      enlace +=
        this.estaNotificacion.tipoParent + "/" + this.estaNotificacion.idParent;

      if (this.estaNotificacion.tipoParent == "libro") {
        console.log(`Es el enlace a un libro`);
        var enlaceLibro =this.tallerCuentosUrl+'?t='+this.usuario.token+"&l="+this.estaNotificacion.idParent;
        console.log(`Abriendo enlace: ${enlaceLibro}`);
        window.open(enlaceLibro, "_blank");
        this.eliminarse();
      } else {
        this.eliminarse();
        this.$router.push(enlace).catch((error) => {
          console.log(`Error de navegación: ${error.message.substr(0, 28)}`);
          if (error.message.substr(0, 28) == "Avoided redundant navigation") {
            console.log(`Error por navegación`);
          }
        });
      }
    },
    eliminarse() {
      let idParent = this.estaNotificacion.idParent;
      console.log(`Eliminandose: ${idParent}`);
      this.$apollo.mutate({
        mutation: gql`
          mutation($idParent: ID!) {
            eliminarNotificacionActividadForos(idParent: $idParent)
          }
        `,
        variables: {
          idParent,
        },
        update: (store, { data: { eliminarNotificacionActividadForos } }) => {
          if (eliminarNotificacionActividadForos) {
            let cache = store.readQuery({
              query: QUERY_YO,
            });
            let nuevoCache = JSON.parse(JSON.stringify(cache));
            let indexN = nuevoCache.yo.notificacionesActividadForos.findIndex(
              (n) => n.idParent == idParent
            );
            if (indexN > -1) {
              nuevoCache.yo.notificacionesActividadForos.splice(indexN, 1);
            }
            store.writeQuery({
              query: QUERY_YO,
              data: nuevoCache,
            });
          }
        },
      });
    },
  },
  computed: {
    mensaje: function () {
      let tipoTarget = this.estaNotificacion.tipoParent;
      if (tipoTarget == "nodoConocimiento") tipoTarget = "nodo de conocimiento";
      let palabraTarget = "<span style='color:red'>" + tipoTarget + "</span>";
      var mensaje =
        "Hay nuevas respuestas en los foros del " +
        palabraTarget +
        " " +
        this.estaNotificacion.nombreParent;

      return mensaje;
    },
    tallerCuentosUrl() {
      return process.env.NODE_ENV === "production"
        ? "https://pe-pe-pe.herokuapp.com/tallerCuentos"
        : "http://localhost:8081";
    },
  },
};
</script>

<style scoped>
.notificacionActividadForos {
  width: 300px;
  height: 130px;
  border: 1px solid rgb(0, 58, 105);
  background-color: rgb(58, 175, 243);
  display: grid;
  grid-template-columns: 100px 1fr;
  grid-template-rows: 15px 1fr;
  grid-template-areas:
    "info info"
    "imagen texto";
  align-items: center;
  justify-items: center;
  cursor: pointer;
}
.notificacionActividadForos:hover {
  background-color: rgb(119, 196, 241);
}
#info {
  grid-area: info;
  font-size: 11px;
  color: white;
}
#iconoConversacion {
  grid-area: imagen;
  width: 70px;
  height: 70px;
  border-radius: 50%;
}
#texto {
  grid-area: texto;
}
.textoTarget {
  color: white;
}
</style>