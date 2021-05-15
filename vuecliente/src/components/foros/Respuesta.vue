<template>
  <div class="respuesta">
    <div class="infoRespuesta">{{ fechaFormateada }}</div>
    <img
      :src="
        this.serverUrl +
        '/api/usuarios/fotografias/' +
        estaRespuesta.infoAutor.id
      "
      :alt="estaRespuesta.infoAutor.nombre"
      class="caritaAutor"
    />
    <div id="zonaCuerpoMensaje">
      <div class="mensajeRespuesta">
        {{ estaRespuesta.mensaje }}
      </div>
      <interpolacion
        v-for="interpolacion of estaRespuesta.interpolaciones"
        :key="interpolacion.id"
        :estaInterpolacion="interpolacion"
      />
    </div>

    <div
      id="archivo"
      v-if="
        estaRespuesta.archivo && estaRespuesta.archivo.googleDriveDirectLink
      "
    >
      <a :href="estaRespuesta.archivo.googleDriveDirectLink">
        <img
          src="@/assets/iconos/downloadFile.png"
          alt="Descargar archivo"
          id="imgDownloadArchivo"
        />
      </a>
    </div>

    <div
      class="enlacesAdjuntos"
      v-show="
        estaRespuesta.enlaceAdjunto && estaRespuesta.enlaceAdjunto.length > 0
      "
    >
      <a
        target="_blank"
        :href="enlace"
        :key="index"
        v-for="(enlace, index) of estaRespuesta.enlaceAdjunto"
      >
        <div class="enlaceAdjunto">
          {{ enlace }}
        </div>
      </a>
    </div>

    <div class="controles">
      <img
        src="@/assets/iconos/quote.png"
        alt="Cita"
        title="Citar esta respuesta"
        class="botonInsertar"
        @click="emitirSolicitudCita"
      />
      <div
        class="controlRespuesta"
        id="bEliminar"
        v-if="usuarioSuperadministrador"
        @click="eliminarse"
      >
        Eliminar
      </div>
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import Interpolacion from "./Interpolacion.vue";
export default {
  components: { Interpolacion },
  name: "Respuesta",
  props: {
    estaRespuesta: {
      type: Object,
    },
    idConversacion: String,
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
      if (this.usuario.id == this.estaRespuesta.infoAutor.id) {
        return true;
      }
      return false;
    },
  },
  methods: {
    emitirSolicitudCita(){
      var quote={
        mensaje: this.estaRespuesta.mensaje,
        interpolaciones:this.estaRespuesta.interpolaciones,
        infoAutor:this.estaRespuesta.infoAutor,
        fecha:this.estaRespuesta.fecha 
      }

      quote.interpolaciones.forEach(interpolacion=>{
        delete interpolacion.__typename;
      })
      delete quote.infoAutor.__typename;

      this.$emit('meQuierenCitar', quote)
    },
    eliminarse() {
      let dis = this;
      if (!confirm("Eliminando respuesta ¿Continuar?")) {
        return;
      }
      this.$apollo.mutate({
        mutation: gql`
          mutation($idRespuesta: ID!, $idConversacion: ID!) {
            eliminarRespuesta(
              idRespuesta: $idRespuesta
              idConversacion: $idConversacion
            )
          }
        `,
        variables: {
          idRespuesta: this.estaRespuesta.id,
          idConversacion: this.idConversacion,
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
  background-color: rgb(255 205 164);

  border-radius: 15px;
  display: grid;
  grid-template-areas:
    "info info info"
    "autor mensaje adjunto"
    "... enlaceAdjunto enlaceAdjunto"
    "controles controles controles";
  grid-template-columns: 100px 1fr 60px;
  grid-template-rows: 50px 1fr min-content 15px;
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
#zonaCuerpoMensaje {
  grid-area: mensaje;
  width: 100%;
  padding: 10px;
  height: 100%;
}
.mensajeRespuesta {
  white-space: pre-wrap;
  margin-bottom: 15px;
  font-size: 20px;
}
.caritaAutor {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  grid-area: autor;
  align-self: flex-start;
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
#archivo {
  padding: 5px;
}

#imgDownloadArchivo {
  grid-area: adjunto;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background-color: #4bb36b;
}

.enlacesAdjuntos {
  grid-area: enlaceAdjunto;
  justify-self: left;
}
.enlaceAdjunto {
  font-style: italic;
  font-size: 14px;
  word-wrap: break-word;
  border-radius: 15px;
  background-color: rgba(129, 66, 129, 0.349);
  padding: 3px 5px;
  cursor: pointer;
  max-width: 600px;
  margin: 3px;
}
.enlaceAdjunto:hover {
  background-color: rgba(129, 66, 129, 0.733);
}
.botonInsertar {
  border-radius: 50%;
  width: 20px;
  height: 20px;
  cursor: pointer;
}
.botonInsertar:hover {
  background-color: gray;
}
</style>