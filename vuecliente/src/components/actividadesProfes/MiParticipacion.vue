<template>
  <div
    class="miParticipacion"
    :class="{
      participacionPropia: participacionEstudiante,
      participacionOtro: !participacionEstudiante,
    }"
  >
    <div id="titulo">
      Responder
      <img
        src="@/assets/iconos/mensaje.png"
        alt="Enviar respuesta"
        id="iconoMensaje"
        :title="cuadroAbierto ? 'cerrar' : 'abrir'"
        @click="abrirCerrar"
      /><br />
    </div>

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

var charProhibidosComentario = /[^\n\r a-zA-ZÀ-ž0-9_():;.,+¡!¿?@=-]/;

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
      comentario = comentario.replace(charProhibidosComentario, " ");

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
        .then(() => {
          this.enviandoRespuesta = false;          
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
  position: relative;
  display: grid;
  grid-template-columns: 10% 1fr 10%;
  grid-template-rows: 10% 1fr 15px 60px;
  grid-template-areas:
    "........ titulo ..."
    "adjuntar comentario ..."
    "........ loading ......"
    "........ enviar ......."
    ;
}

.participacionPropia {
  border: 2px solid pink;
}

.participacionOtro {
  border: 2px solid rgb(22, 57, 73);
}
#titulo {
  text-align: center;
  grid-area: titulo;
}

#iconoMensaje {
  position: absolute;
  right: 10px;
  top: 10px;
  margin-left: 10px;
  width: 30px;
  height: 30px;
  cursor: pointer;
  background-color: rgb(156, 204, 156);
  border-radius: 50%;
}


#iconoMensaje:hover {
  background-color: rgb(68, 129, 68);
}

#comentario {
  border-radius: 5px;
  resize: none;
  padding: 5px 7px;
  grid-area: comentario;
  display: block;
  font-size: 22px;
}

.comentarioPropio {
  background-color: salmon;
  border: 2px solid rgb(165, 52, 39);
}
.comentarioOtro {
  background-color: rgb(114, 207, 250);
  border: 2px solid rgb(22, 57, 73);
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

#imgEnviar {
  width: 50px;
  height: 50px;
  cursor: pointer;

  grid-area: enviar;
  border-radius: 50%;
  background-color: rgb(153, 130, 204);
}
#imgEnviar:hover {
  background-color: rgb(137, 108, 199);
}

#nombreArchivoSeleccionado{
  grid-area: adjuntar;
  opacity: 0.8;
  color: gray;
  font-style: italic;
  font-size: 12px;
  word-wrap: break-word;
}
#nombreArchivoSeleccionado:hover{
  opacity: 1;
}

#adjuntarArchivo {
  text-align: left;
  grid-area: adjuntar;
}
#enviar {
  text-align: center;
  grid-area: enviar;
}

@media only screen and (max-width:500px) {
  #iconoMensaje {
  width: 20px;
  height: 20px;
  }
  #imgAdjuntar{
    width:25px;
    height:25px;
  }
}

#inputArchivoAdjunto {
  display: none;
}

.miParticipacion .loading{
  grid-area: loading;
}
</style>