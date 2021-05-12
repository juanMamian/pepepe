<template>
  <div class="cuadroResponder">
    <div id="barraSuperior" v-show="idConversacion">
      <img
        src="@/assets/iconos/mensaje.png"
        alt="Contestar"
        title="Contestar en esta conversación"
        id="imgMensaje"
        @click="toggleCuadroAbierto"
      />
      <span id="tituloCuadro">Envía una respuesta</span>
    </div>

    <textarea
      v-show="cuadroAbierto"
      name="inputMensaje"
      id="inputMensaje"
      :class="{ letrasRojas: mensajeIlegal }"
      v-model="mensaje"
      placeholder="Escribe aquí tu respuesta"
    ></textarea>

    <!--  -->
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
      <br />
      <div id="nombreArchivoSeleccionado" v-show="nombreArchivoSeleccionado">
        {{ nombreArchivoSeleccionado }}
      </div>
    </div>
    <!--  -->
    <div
      id="bloqueAdjuntarEnlace"
      class="bloqueAdjuntar"
      v-show="cuadroAbierto"
    >
      <div id="zonaIntroducirEnlace">
        <img
          src="@/assets/iconos/hypervinculo.png"
          alt="Ajuntar enlace"
          id="imgAdjuntarEnlace"
          title="adjuntar un enlace"
          @click="introduciendoEnlace = true"
        />
        <input
          type="text"
          v-show="introduciendoEnlace === true"
          class="inputAdjuntarEnlace"
          placeholder="escribe o pega el enlace"
          v-model="enlaceAdjuntable"
        />
        <img
          src="@/assets/iconos/success.png"
          alt="Confirmar"
          id="bAceptarAdjuntarEnlace"
          v-show="introduciendoEnlace && !enlaceAdjuntableIlegal"
          @click.stop="
            enlaceAdjunto.push(enlaceAdjuntable);
            enlaceAdjuntable=null;
            introduciendoEnlace = false;
          "
        />
      </div>
      <div class="enlaceAdjuntado" v-for="(enlace, index) of enlaceAdjunto" :key="index">
        <div
          id="nombreEnlaceAdjuntado"          
        >
          <span>{{ enlace }}</span>
        </div>
        <div
          id="bCancelarEnlaceAdjunto"          
          @click.stop="
            enlaceAdjunto.splice(index, 1);            
          "
        >
          <div class="linea1"><div class="linea2"></div></div>
        </div>
      </div>
    </div>

    <!--  -->

    <img
      v-show="cuadroAbierto && !enviandoRespuesta"
      :class="{ deshabilitado: mensajeIlegal }"
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
import {
  fragmentoConversacion,
  fragmentoRespuesta,
} from "../utilidades/recursosGql";
import axios from "axios";

var charProhibidosMensaje = /[^\n\r a-zA-ZÀ-ž0-9_()":;.,+¡!¿?@=-]/;

export default {
  components: { Loading },
  name: "CuadroResponder",
  props: {
    tituloNuevaConversacion: String,
    idConversacion: String,
    idForo: String,
    parent: Object,
  },
  data() {
    return {
      mensaje: null,
      cuadroAbierto: false,
      enviandoRespuesta: false,
      nombreArchivoSeleccionado: null,

      introduciendoEnlace: false,
      enlaceAdjuntable: null,
      enlaceAdjunto: [],
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
        let nuevaRespuesta = {
          infoArchivo: null,
          mensaje: this.mensaje,
        };
        if (this.enlaceAdjunto && this.enlaceAdjunto.length>0) {
          nuevaRespuesta.enlaceAdjunto = this.enlaceAdjunto;
        }
        if (!this.idConversacion) {
          this.crearConversacionConRespuesta(nuevaRespuesta);
        } else {
          this.enviarNuevaRespuesta(nuevaRespuesta);
        }
      } else {
        const archivoAdjunto = inputArchivoAdjunto.files[0];
        const fileType = archivoAdjunto["type"];
        console.log(`subiendo un ${fileType}`);
        datos.append("archivoAdjunto", archivoAdjunto);
        var dis = this;
        axios({
          method: "post",
          url: this.serverUrl + "/api/foros/adjuntarArchivoParaRespuesta",
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
            if (this.enlaceAdjunto && this.enlaceAdjunto.length>0) {
              nuevaRespuesta.enlaceAdjunto = this.enlaceAdjunto;
            }
            if (!this.idConversacion) {
              this.crearConversacionConRespuesta(nuevaRespuesta);
            } else {
              this.enviarNuevaRespuesta(nuevaRespuesta);
            }
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
    crearConversacionConRespuesta(nuevaRespuesta) {
      if (!this.tituloNuevaConversacion) {
        return;
      }
      var input = {
        titulo: this.tituloNuevaConversacion,
        primeraRespuesta: nuevaRespuesta,
      };
      this.enviandoRespuesta = true;
      var dis = this;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation(
              $idForo: ID!
              $input: InputIniciarConversacion
              $parent: InputParent
            ) {
              iniciarConversacionConPrimerMensajeForo(
                idForo: $idForo
                input: $input
                parent: $parent
              ) {
                ...fragConversacion
              }
            }
            ${fragmentoConversacion}
          `,
          variables: {
            idForo: dis.idForo,
            input,
            parent: dis.parent,
          },
        })
        .then(({ data: { iniciarConversacionConPrimerMensajeForo } }) => {
          dis.enviandoRespuesta = false;
          dis.$emit(
            "hiceConversacion",
            iniciarConversacionConPrimerMensajeForo
          );
          this.reset();
        })
        .catch((error) => {
          dis.enviandoRespuesta = false;
          console.log(`Error. E: ${error}`);
        });
    },
    enviarNuevaRespuesta(nuevaRespuesta) {
      if (this.mensajeIlegal) {
        return;
      }

      var dis = this;
      this.enviandoRespuesta = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation(
              $idConversacion: ID!
              $nuevaRespuesta: InputNuevaRespuesta
              $parent: InputParent
            ) {
              postRespuestaConversacion(
                idConversacion: $idConversacion
                nuevaRespuesta: $nuevaRespuesta
                parent: $parent
              ) {
                ...fragRespuesta
              }
            }
            ${fragmentoRespuesta}
          `,
          variables: {
            idConversacion: dis.idConversacion,
            nuevaRespuesta,
            parent: dis.parent,
          },
        })
        .then(({ data: { postRespuestaConversacion } }) => {
          dis.enviandoRespuesta = false;
          this.$emit("hiceRespuesta", postRespuestaConversacion);         
          this.cerrarse();
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
      this.reset();
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
    reset() {
      this.nombreArchivoSeleccionado = null;
      this.$refs.inputArchivoAdjunto.value = null;
      this.mensaje = null;
      (this.enlaceAdjuntable = null), (this.enlaceAdjunto = []);
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
    enlaceAdjuntableIlegal() {
      if (!this.enlaceAdjuntable) return true;
      if (this.enlaceAdjuntable.substr(0, 8) != "https://") {
        console.log(
          `El inicio ${this.enlaceAdjuntable.substr(0, 8)} difiere del esperado`
        );
        return true;
      }

      if (this.enlaceAdjuntable.length < 7) {
        return true;
      }
      return false;
    },
  },
  mounted() {
    console.log(`Revisando si hay idConversacion`);
    if (!this.idConversacion) {
      this.cuadroAbierto = true;
    }
  },
};
</script>

<style scoped>
.cuadroResponder {
  border: 2px solid white;
  margin: 5px;
  border-radius: 10px;
  background-color: #ffcda4;
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
  background-color: #e2a03d;
}
#bEnviar {
  display: block;
  margin: 5px auto;
  cursor: pointer;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  background-color: #f5a25f;
}
#bEnviar:hover {
  background-color: #f7760e;
}
#inputMensaje {
  width: 80%;
  display: block;
  margin: 5px auto;
  min-height: 200px;
  font-size: 20px;
}
#inputArchivoAdjunto {
  display: none;
}
#imgAdjuntar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
  background-color: #f5a25f;
}
#imgAdjuntar:hover {
  background-color: #f7760e;
}
#nombreArchivoSeleccionado {
  background-color: #55b95c;
  padding: 3px;
  border-radius: 10px;
  display: inline-block;
}
/* .bloqueAdjuntar {
  
} */
#zonaIntroducirEnlace {
  display: flex;
  align-items: center;
}
#imgAdjuntarEnlace {
  border-radius: 50%;
  padding: 3px;
  background-color: #f5a25f;
  width: 45px;
  height: 45px;
  cursor: pointer;
}
#imgAdjuntarEnlace:hover {
  background-color: #f7760e;
}
.inputAdjuntarEnlace {
  margin-left: 20px;
  width: 350px;
  padding: 3px 5px;
  border-radius: 10px;
}
.enlaceAdjuntado{
  display: flex;
  align-items: center;
  margin: 3px;
}
#nombreEnlaceAdjuntado {
  width: 400px;
  margin-left: 20px;
  border-radius: 15px;
  background-color: rgba(129, 66, 129, 0.349);
  padding: 5px;  
}
#nombreEnlaceAdjuntado:hover {
  background-color: rgba(129, 66, 129, 0.733);
}
#nombreEnlaceAdjuntado > span {
  font-style: italic;
  font-size: 14px;
  word-wrap: break-word;

  padding: 3px 5px;
}
#bCancelarEnlaceAdjunto {
  display: inline-block;
  width: 20px;
  height: 20px;
  background-color: rgb(219, 74, 74);
  cursor: pointer;
  border-radius: 50%;
  position: relative;
  margin-left: 10px;
}
#bCancelarEnlaceAdjunto:hover {
  background-color: red;
}
#bCancelarEnlaceAdjunto > .linea1 {
  width: 90%;
  height: 2px;
  border-radius: 1px;
  position: absolute;
  top: 48%;
  left: 5%;
  background-color: black;
  transform: rotate(45deg);
}
#bCancelarEnlaceAdjunto > .linea1 > .linea2 {
  background-color: black;
  width: 100%;
  height: 2px;
  border-radius: 1px;
  transform: rotate(90deg);
}
#bAceptarAdjuntarEnlace {
  margin-left: 10px;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  background-color: rgb(138, 192, 194);
  cursor: pointer;
}
#bAceptarAdjuntarEnlace:hover {
  background-color: cadetblue;
}
</style>