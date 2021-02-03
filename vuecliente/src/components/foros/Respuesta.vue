<template>
  <div class="respuesta">
    <div class="infoRespuesta">{{ fechaFormateada }}</div>
    <img
      :src="
        this.serverUrl + '/api/usuarios/fotografias/' + estaRespuesta.autor.id
      "
      :alt="estaRespuesta.autor.nombre"
      class="caritaAutor"
    />
    <div class="mensajeRespuesta">
      {{ estaRespuesta.mensaje }}
    </div>

    <div class="controles">
      <div
        class="controlRespuesta"
        id="bEliminar"
        v-if="usuarioAutor || usuarioSuperadministrador"
        @click="eliminarse"
      >
        Eliminar
      </div>
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
export default {
  name: "Respuesta",
  props: {
    estaRespuesta: {
      type: Object,
    },
    idConversacion:String
  },
  computed: {
    fechaFormateada: function () {
      let laFecha = new Date(this.estaRespuesta.fecha).toString();
      let indexParentesis = laFecha.indexOf("(");
      let fechaCorta = laFecha.substr(0, indexParentesis);
      let indexGMT = fechaCorta.indexOf("GMT");
      if (indexGMT > -1) {
        fechaCorta = fechaCorta.substr(0, indexGMT);
      }
      return fechaCorta;
    },
    usuarioAutor: function () {
      if (this.$store.state.usuario.id == this.estaRespuesta.autor.id) {
        return true;
      }
      return false;
    },
  },
  methods: {
    eliminarse() {
      let dis = this;
      if (!confirm("Eliminando respuesta ¿Continuar?")) {
        return;
      }
      this.$apollo.mutate({
        mutation: gql`
          mutation($idRespuesta: ID!, $idConversacion:ID!) {
            eliminarRespuesta(idRespuesta: $idRespuesta, idConversacion:$idConversacion)
          }
        `,
        variables: {
          idRespuesta: this.estaRespuesta.id,
          idConversacion:this.idConversacion
        },
        update(store, { data: { eliminarRespuesta } }) {
          if (eliminarRespuesta) {
            console.log(`Respuesta eliminada`);
            dis.$emit("meElimine");
          }
        },
      });
    },
  },
};
</script>

<style scoped>
.respuesta {
  background-color: rgb(168, 213, 234);
  border: 2px solid rgb(16, 89, 122);
  border-radius: 5px;
  display: grid;
  grid-template-areas:
    "info info"
    "autor mensaje"
    "controles controles";
  grid-template-columns: 100px 1fr;
  grid-template-rows: 10px 1fr 15px;
  row-gap: 10px;
  align-items: center;
  justify-items: center;
  padding: 10px;
}
.infoRespuesta {
  font-size: 10px;
  margin: 5px 5px;
  color: gray;
  grid-area: info;
  width: 100%;
}
.mensajeRespuesta {
  padding: 5px 10px;
  grid-area: mensaje;
  width: 100%;
  height: 100%;
  padding: 10px;
  white-space: pre-wrap;
}
.caritaAutor {
  width: 70px;
  height: 70px;
  border-radius: 50%;
}
.controles {
  grid-area: controles;
  width: 100%;
  display: flex;
  flex-flow: row-reverse;
  font-size: 13px;
}
.controlRespuesta {
  padding: 3px;
  cursor: pointer;
}
.controlRespuesta:hover {
  background-color: red;
}
</style>