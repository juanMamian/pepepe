<template>
  <div class="participacionEstudiante">
    <textarea disabled id="comentario" v-model="estaParticipacion.comentario"></textarea>
    <div id="archivo">
      <img
        src="/iconos/downloadFile.png"
        alt="Descargar archivo"
        id="imgDownloadArchivo"
        @click="descargarArchivo"
      />
    </div>
  </div>
</template>

<script>
import axios from "axios";
import FileDownload from "js-file-download";


export default {
  name: "ParticipacionEstudiante",
  props: {
    estaParticipacion: Object,
    indice: Number,
    nombreEstudiante: String
  },
  methods:{
      descargarArchivo() {
      let direccion =
        this.serverUrl +
        "/" +
        "api/actividadesProfes/evidencia" +
        "/" +
        this.estaParticipacion.id +
        "."+
        this.estaParticipacion.archivo.extension       
        ;
      console.log(`solicitando archivo a ${direccion}`);
      axios({
        method: "get",
        url: direccion,
        responseType: "blob",
      })
        .then((res) => {
          console.log(`Respuesta: ${JSON.stringify(res)}`);
          FileDownload(res.data, "Evidencia-"+this.nombreEstudiante + "."+this.estaParticipacion.archivo.extension);
        })
        .catch((error) => {
          console.log(`Error: ${JSON.stringify(error)}`);
          alert("Archivo no encontrado");
        });
    },
  }
};
</script>

<style scoped>
.participacionEstudiante {
  background-color: rgb(253, 249, 253);
  border: 2px solid pink;
  border-radius: 10px;
  padding: 10px;
}
#comentario {
  background-color: salmon;
  border: 2px solid rgb(165, 52, 39);
  border-radius: 5px;
  resize: none;
  padding: 5px 7px;
  width: 80%;
  margin-left: auto;
  max-width: auto;
  min-height: 100px;
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
}
</style>