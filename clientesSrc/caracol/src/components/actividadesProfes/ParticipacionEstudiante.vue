<template>
  <div
    class="participacionEstudiante"
    :class="{
      participacionPropia: participacionDelPropioEstudiante,
      participacionOtro: !participacionDelPropioEstudiante,
    }"
  >
    <div id="autorParticipacion">
      {{ estaParticipacion.infoAutor.nombres }}
      {{ estaParticipacion.infoAutor.apellidos }} - {{ fechaFormateada }}
    </div>
    <textarea
      disabled
      id="comentario"
      v-model="estaParticipacion.comentario"
      :class="{
        comentarioPropio: participacionDelPropioEstudiante,
        comentarioOtro: !participacionDelPropioEstudiante,
      }"
    ></textarea>
    <div id="archivo">
      <a :href="estaParticipacion.archivo.googleDriveDirectLink">
        <img
          src="@/assets/iconos/downloadFile.png"
          alt="Descargar archivo"
          id="imgDownloadArchivo"
          v-if="
            estaParticipacion.archivo &&
            estaParticipacion.archivo.googleDriveDirectLink
          "
        />
      </a>
    </div>
    <div
      class="enlacesAdjuntos"
      v-show="
        estaParticipacion.enlaceAdjunto &&
        estaParticipacion.enlaceAdjunto.length > 0
      "
    >
      <a
        target="_blank"
        :href="enlace"
        :key="index"
        v-for="(enlace, index) of estaParticipacion.enlaceAdjunto"
      >
        <div
          class="enlaceAdjunto"
          :key="index"
          v-for="(enlace, index) of estaParticipacion.enlaceAdjunto"
        >
          {{ enlace }}
        </div>
      </a>
    </div>
    <div
      id="controlesParticipacion"
      v-if="
        usuarioAdministradorActividadesEstudiantiles == true ||
        usuarioSuperadministrador
      "
    >
      <div
        id="bEliminarParticipacion"
        class="controlesParticipacion hoverGris"
        @click="eliminarse"
      >
        Eliminar
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import FileDownload from "js-file-download";

export default {
  name: "ParticipacionEstudiante",
  props: {
    estaParticipacion: {
      type: Object,
    },
    indice: Number,
    idEstudianteDesarrollo: String,
  },
  methods: {
    descargarArchivo() {
      let direccion = this.estaParticipacion.archivo.accesible;
      console.log(`solicitando archivo a ${direccion}`);
      axios({
        method: "get",
        url: direccion,
        responseType: "blob",
      })
        .then((res) => {
          console.log(`Respuesta: ${JSON.stringify(res)}`);
          FileDownload(
            res.data,
            parseInt(this.indice) +
              1 +
              " - Respuesta_" +
              this.estaParticipacion.infoAutor.nombres +
              "." +
              this.estaParticipacion.archivo.extension
          );
        })
        .catch((error) => {
          console.log(`Error: ${JSON.stringify(error)}`);
          alert("Archivo no encontrado");
        });
    },
    eliminarse() {
      if (!confirm("¿Seguro de que quieres eliminar este mensaje?")) {
        return;
      }
      this.$emit("eliminandose", this.estaParticipacion.id);
    },
  },
  computed: {
    participacionDelPropioEstudiante: function () {
      return this.idEstudianteDesarrollo == this.estaParticipacion.infoAutor.id;
    },
    fechaFormateada() {
      return new Date(this.estaParticipacion.fechaUpload);
    },
  },
};
</script>

<style scoped>
.participacionEstudiante {
  padding: 10px;
  border-bottom-style: groove;
}
.participacionPropia {
  border-bottom: 2px solid rgb(75, 11, 21);
}

.participacionOtro {
  border-bottom: 2px solid rgb(22, 57, 73);
}
#comentario {
  color: black;
  border-radius: 5px;
  resize: none;
  padding: 5px 7px;
  width: 80%;
  margin-left: auto;
  max-width: auto;
  min-height: 180px;
  font-size: 18px;
}

.comentarioPropio {
  background-color: salmon;
  border: 2px solid rgb(165, 52, 39);
}
.comentarioOtro {
  background-color: rgb(114, 207, 250);
  border: 2px solid rgb(22, 57, 73);
}
#archivo {
  margin-top: 10px;
}
#imgDownloadArchivo {
  width: 50px;
  height: 50px;
  cursor: pointer;
  margin-left: auto;
  margin-right: auto;
  border-radius: 50%;
  background-color: rgb(194, 137, 137);
}
#imgDownloadArchivo:hover {
  background-color: indianred;
}
#autorParticipacion {
  font-size: 10px;
  margin: 5px 5px;
  color: gray;
}
.controlesParticipacion {
  cursor: pointer;
}
#bEliminarParticipacion:hover {
  background-color: red;
}
.enlaceAdjunto {
  font-style: italic;
  font-size: 14px;
  word-wrap: break-word;
  border-radius: 15px;
  background-color: rgb(187, 116, 187);
  padding: 3px 5px;
  cursor: pointer;
  max-width: 600px;
}
</style>