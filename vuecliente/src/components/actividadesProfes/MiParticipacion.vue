<template>
  <div
    class="miParticipacion"
    :class="{
      participacionPropia: participacionEstudiante,
      participacionOtro: !participacionEstudiante,
    }"
  >
    <div id="titulo">Responder</div>
    <img
      src="@/assets/iconos/mensaje.png"
      alt="Enviar respuesta"
      id="iconoMensaje"
      :title="cuadroAbierto ? 'cerrar' : 'abrir'"
      @click="abrirCerrar"
    /><br />
    <textarea
      v-model="comentario"
      :class="{
        comentarioPropio: participacionEstudiante,
        comentarioOtro: !participacionEstudiante,
      }"
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
        accept="application/pdf, .png, .jpg, .jpeg, image/png, image/jpg, image/jpeg"
        @change="actualizarNombreDeArchivo"
      />
      <img
        src="@/assets/iconos/adjuntar.png"
        alt="Ajuntar archivo"
        id="imgAdjuntar"
        title="adjuntar un archivo"
        @click="abrirSelectorDeArchivos"
      />
      <div id="nombreArchivoSeleccionado">{{ nombreArchivoSeleccionado }}</div>
    </div>
    <loading
      v-show="enviandoRespuesta"
      :texto="'Enviando respuesta...'"
    /><br />
    <div id="enviar" v-show="cuadroAbierto">
      <img
        :class="{ deshabilitado: enviandoRespuesta }"
        src="@/assets/iconos/enviar.png"
        alt="Enviar respuesta"
        id="imgEnviar"
        title="Enviar"
        @click="enviarRespuesta"
      />
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Loading from "../utilidades/Loading.vue";

var charProhibidosComentario = /[^ a-zA-ZÀ-ž0-9_():;.,+¡!¿?@=-]/g;

export default {
  name: "MiParticipacion",
  components: {
    Loading,
  },
  data() {
    return {
      comentario: "",
      nombreArchivoSeleccionado: null,
      cuadroAbierto: false,
      enviandoRespuesta: false,
    };
  },
  props: {
    idActividad: String,
    participacionEstudiante: {
      type: Boolean,
      default: false,
    },
    enDesarrollo: {
      type: String,
      default: "0",
    },
  },
  methods: {
    abrirSelectorDeArchivos() {
      this.$refs.inputArchivoAdjunto.click();
    },
    enviarRespuesta() {
      this.enviandoRespuesta = true;
      let dis = this;
      let inputArchivoAdjunto = this.$refs.inputArchivoAdjunto;
      var datos = new FormData();
      var comentario = this.comentario.trim();
      comentario = comentario.replace(charProhibidosComentario, "");

      if (comentario == "") {
        alert("¡Tu mensaje está vacío!");
        this.enviandoRespuesta = false;
        return;
      }
      if (!inputArchivoAdjunto.value) {
        console.log(`El input de archivo adjunto estaba vacio`);
      } else {
        const archivoAdjunto = inputArchivoAdjunto.files[0];
        const fileType = archivoAdjunto["type"];
        console.log(`subiendo un ${fileType}`);
        datos.append("archivoAdjunto", archivoAdjunto);
      }
      datos.append("comentario", comentario);
      datos.append("idActividad", this.idActividad);
      datos.append("idEstudiante", this.idEstudiante);
      datos.append("idDesarrollo", this.enDesarrollo);
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
          this.enviandoRespuesta = false;
          console.log(`res: ${JSON.stringify(res)}`);
          dis.$emit("reloadDesarrollo");
          dis.comentario = "";
          dis.$refs.inputArchivoAdjunto.value = null;
          this.nombreArchivoSeleccionado = null;
        })
        .catch((error) => {
          this.enviandoRespuesta = false;
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

.participacionPropia {
  border: 2px solid pink;
}

.participacionOtro {
  border: 2px solid rgb(22, 57, 73);
}

#comentario {
  border-radius: 5px;
  resize: none;
  padding: 5px 7px;
}

.comentarioPropio {
  background-color: salmon;
  border: 2px solid rgb(165, 52, 39);
}
.comentarioOtro {
  background-color: rgb(114, 207, 250);
  border: 2px solid rgb(22, 57, 73);
}

#imgEnviar {
  width: 50px;
  height: 50px;
  cursor: pointer;
  margin-left: auto;
  margin-right: auto;
  border-radius: 50%;
  background-color: rgb(153, 130, 204);
}
#imgEnviar:hover {
  background-color: rgb(137, 108, 199);
}
#imgAdjuntar {
  margin-top: 5px;
  margin-bottom: 5px;
  width: 50px;
  height: 50px;
  cursor: pointer;
  border-radius: 50%;
  background-color: rgb(206, 130, 130);
}
#imgAdjuntar:hover {
  background-color: indianred;
}
#iconoMensaje {
  margin-left: auto;
  margin-right: auto;
  width: 60px;
  height: 60px;
  display: block;
  cursor: pointer;
  background-color: rgb(156, 204, 156);
  border-radius: 50%;
}
#iconoMensaje:hover {
  background-color: rgb(68, 129, 68);
}
#adjuntarArchivo {
  text-align: left;
}
#enviar {
  text-align: center;
}
#inputArchivoAdjunto {
  display: none;
}
#titulo {
  text-align: center;
  margin-bottom: 15px;
}
.deshabilitado {
  opacity: 0.5;
  pointer-events: none;
}
</style>