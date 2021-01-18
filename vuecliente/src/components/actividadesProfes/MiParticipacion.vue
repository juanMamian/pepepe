<template>
  <div class="miParticipacion">
    <div id="titulo">Enviar respuesta</div>
    <img
      src="/iconos/mensaje.png"
      alt="Enviar respuesta"
      id="iconoMensaje"
      @click="abrirCerrar"
    /><br />
    <textarea
      v-model="comentario"
      name="comentario"
      id="comentario"
      ref="comentario"
      cols="30"
      rows="10"
      v-show="cuadroAbierto"
    ></textarea>
    <div id="adjuntarArchivo" v-show="cuadroAbierto">
      <input
        type="file"
        id="inputArchivoAdjunto"
        ref="inputArchivoAdjunto"
        @change="actualizarNombreDeArchivo"
      />
      <img
        src="/iconos/adjuntar.png"
        alt="Ajuntar archivo"
        id="imgAdjuntar"
        @click="abrirSelectorDeArchivos"
      />
      <div id="nombreArchivoSeleccionado">:{{ nombreArchivoSeleccionado }}</div>
    </div>
    <div id="enviar" v-show="cuadroAbierto">
      <img
        src="/iconos/enviar.png"
        alt="Enviar respuesta"
        id="imgEnviar"
        @click="enviarRespuesta"
      />
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "MiParticipacion",
  data() {
    return {
      comentario: "",
      nombreArchivoSeleccionado: null,
      cuadroAbierto: false,
    };
  },
  props: {
    idActividad: String,
  },
  methods: {
    abrirSelectorDeArchivos() {
      this.$refs.inputArchivoAdjunto.click();
    },
    enviarRespuesta() {
      if (!this.$refs.inputArchivoAdjunto.value) {
        console.log(`El input de archivo adjunto estaba vacio`);
      }

      let dis = this;
      let inputArchivoAdjunto = this.$refs.inputArchivoAdjunto;
      var datos = new FormData();
      const comentario = this.comentario;
      const archivoAdjunto = inputArchivoAdjunto.files[0];
      const fileType = archivoAdjunto["type"];
      console.log(`subiendo un ${fileType}`);
      datos.append("archivoAdjunto", archivoAdjunto);
      datos.append("comentario", comentario);
      datos.append("idActividad", this.idActividad);
      datos.append("idEstudiante", this.idEstudiante);
      axios({
        method: "post",
        url: this.serverUrl + "/api/actividadesProfes/publicarRespuesta",
        data: datos,
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: "Bearer " + this.$store.state.token,
        },
      })
        .then((res) => {
          console.log(`res: ${JSON.stringify(res)}`);
          dis.$emit("reloadMiDesarrollo");
          dis.comentario = "";
          dis.$refs.inputArchivoAdjunto.value = null;
          this.nombreArchivoSeleccionado = null;
        })
        .catch((error) => {
          console.log(`Errores: ${error}`);
          if (error.response) {
            if (error.response.data.msjUsuario) {
              alert(error.response.data.msjUsuario);
            }
          }
        });
    },
    actualizarNombreDeArchivo() {
      if (!this.$refs.inputArchivoAdjunto.value) {
        console.log(`Nullificando el nombre de archivo seleccionado`);
        this.nombreArchivoSeleccionado = null;
        return;
      }
      this.nombreArchivoSeleccionado = this.$refs.inputArchivoAdjunto.files[0].name;
    },
    abrirCerrar() {
      if (!this.cuadroAbierto) {
        this.cuadroAbierto = true;
      } else {
        this.comentario = "";
        this.$refs.inputArchivoAdjunto.value = null;
        this.nombreArchivoSeleccionado = null;
        this.cuadroAbierto = false;
      }
    },
  },
};
</script>

<style scoped>
.miParticipacion {
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
}
#imgEnviar {
  width: 50px;
  height: 50px;
  cursor: pointer;
  margin-left: auto;
  margin-right: auto;
}
#imgAdjuntar {
  width: 50px;
  height: 50px;
  cursor: pointer;
}
#iconoMensaje {
  margin-left: auto;
  margin-right: auto;
  width: 60px;
  height: 60px;
  display: block;
  cursor: pointer;
}
#adjuntarArchivo {
  text-align: left;
}
#enviar {
  text-align: center;
}
#inputArchivoAdjunto {
  display: block;
}
#titulo {
  text-align: center;
  margin-bottom: 15px;
}
</style>