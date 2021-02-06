<template>
  <div class="cuadroResponder">
    <div id="barraSuperior">
      <img
        src="@/assets/iconos/mensaje.png"
        alt="Contestar"
        title="Contestar en esta conversación"
        id="imgMensaje"
        @click="toggleCuadroAbierto"
      />
      <span id="tituloCuadro">Envía una respuesta</span>
    </div>
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
      <br>
      <div id="nombreArchivoSeleccionado" v-show="nombreArchivoSeleccionado">{{ nombreArchivoSeleccionado }}</div>
    </div>
    <textarea
      v-show="cuadroAbierto"
      name="inputMensaje"
      id="inputMensaje"
      :class="{ letrasRojas: mensajeIlegal }"
      v-model="mensaje"
      placeholder="Escribe aquí tu respuesta"
    ></textarea>

    <img
      v-show="cuadroAbierto && !enviandoRespuesta && !mensajeIlegal"
      src="@/assets/iconos/enviar.png"
      alt="Enviar"
      title="Enviar respuesta"
      id="bEnviar"
      @click="evaluarAdjunto"
    />
    <loading texto="Enviando respuesta..." v-show="enviandoRespuesta" />
  </div>
</template>

<script>
import gql from "graphql-tag";
import Loading from "../utilidades/Loading.vue";
import { fragmentoRespuesta } from "../utilidades/recursosGql";
import axios from 'axios';

var charProhibidosMensaje = /[^\n\r a-zA-ZÀ-ž0-9_():;.,+¡!¿?@=-]/;

export default {
  components: { Loading },
  name: "CuadroResponder",
  props: {
    idConversacion: String,
  },
  data() {
    return {
      mensaje: null,
      cuadroAbierto: false,
      enviandoRespuesta: false,
      nombreArchivoSeleccionado: null,
    };
  },
  methods: {
    evaluarAdjunto() {
      if (this.mensajeIlegal) {
        return;
      }
      this.enviandoRespuesta = true;
      let inputArchivoAdjunto = this.$refs.inputArchivoAdjunto;
      var datos = new FormData();

      if (!inputArchivoAdjunto.value) {
        console.log(`El input de archivo adjunto estaba vacio`);
        let nuevaRespuesta = {
              infoArchivo: null,
              mensaje: this.mensaje,
            };
        this.enviarNuevaRespuesta(nuevaRespuesta);
      } else {
        const archivoAdjunto = inputArchivoAdjunto.files[0];
        const fileType = archivoAdjunto["type"];
        console.log(`subiendo un ${fileType}`);
        datos.append("archivoAdjunto", archivoAdjunto);
        var dis=this;
        axios({
          method: "post",
          url:
            this.serverUrl +
            "/api/foros/adjuntarArchivoParaRespuesta",
          data: datos,
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: "Bearer " + this.$store.state.token,
          },
        })
          .then(({ data: { infoArchivo } }) => {
            //Se ha subido el archivo. Ahora publicar la respuesta

            //Creando la nueva participacion

            let nuevaRespuesta = {
              infoArchivo: {
                idGoogleDrive: infoArchivo.idGoogleDrive,
                googleDriveDirectLink: infoArchivo.googleDriveDirectLink,
                extension: infoArchivo.extensionDeArchivo,
                nombre: infoArchivo.extensionDeArchivo,
              },
              mensaje: dis.mensaje,
            };

            this.enviarNuevaRespuesta(nuevaRespuesta);
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
      }
    },
    enviarNuevaRespuesta(nuevaRespuesta) {
      if (this.mensajeIlegal) {
        return;
      }
      console.log(`Enviando respuesta`);
      
      var dis = this;
      this.enviandoRespuesta = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation(
              $idConversacion: ID!
              $nuevaRespuesta: InputNuevaRespuesta
            ) {
              postRespuestaConversacion(
                idConversacion: $idConversacion
                nuevaRespuesta: $nuevaRespuesta
              ) {
                ...fragRespuesta
              }
            }
            ${fragmentoRespuesta}
          `,
          variables: {
            idConversacion: dis.idConversacion,
            nuevaRespuesta,
          },
        })
        .then(({ data: { postRespuestaConversacion } }) => {
          dis.enviandoRespuesta = false;
          this.$emit("hiceRespuesta", postRespuestaConversacion);
        })
        .catch((error) => {
          dis.enviandoRespuesta = false;
          console.log(`Error. E: ${error}`);
        });
    },
    toggleCuadroAbierto() {
      this.cuadroAbierto = !this.cuadroAbierto;
    },
    cerrarse() {
      this.mensaje = null;
      this.cuadroAbierto = false;
    },
    actualizarNombreDeArchivo() {
      if (!this.$refs.inputArchivoAdjunto.value) {
        console.log(`Nullificando el nombre de archivo seleccionado`);
        this.nombreArchivoSeleccionado = null;
        return;
      }
      this.nombreArchivoSeleccionado = this.$refs.inputArchivoAdjunto.files[0].name;
    },
    abrirSelectorDeArchivos() {
      this.$refs.inputArchivoAdjunto.click();
    },
  },
  computed: {
    mensajeIlegal() {
      if (!this.mensaje || this.mensaje.length < 1) {
        return true;
      }
      if (charProhibidosMensaje.test(this.mensaje)) {
        return true;
      }
      return false;
    },
  },
};
</script>

<style scoped>
.cuadroResponder {
  border: 2px solid rgb(3, 49, 87);
  background-color: rgb(194, 213, 238);
  margin: 5px;
  border-radius: 10px;
}
#barraSuperior {
  display: flex;
  align-items: center;
}
#imgMensaje {
  margin: 5px;
  cursor: pointer;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  background-color: green;
}
#bEnviar {
  display: block;
  margin: 5px auto;
  cursor: pointer;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  background-color: green;
}
#bEnviar:hover {
    background-color: rgb(84, 224, 103);  
}
#inputMensaje {
  width: 80%;
  display: block;
  margin: 5px auto;
  min-height: 200px;
  font-size: 20px;
}
#inputArchivoAdjunto{
  display: none;
}
#imgAdjuntar{
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
  background-color: #ecd1d1;
}
#imgAdjuntar:hover{
  background-color: #55b95c;  
}
#nombreArchivoSeleccionado{
    background-color: #55b95c;  
    padding: 3px;
    border-radius: 10px;
    display: inline-block;
}
</style>