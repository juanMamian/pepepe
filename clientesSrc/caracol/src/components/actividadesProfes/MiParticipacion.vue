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
      v-model="mensaje"
      :class="{
        mensajePropio: participacionEstudiante,
        mensajeOtro: !participacionEstudiante,
        letrasRojas: mensajeIlegal,
      }"
      name="mensaje"
      id="mensaje"
      ref="mensaje"
      cols="30"
      rows="10"
      v-show="cuadroAbierto"
      placeholder="Escribe un mensaje"
    ></textarea>

    <div
      id="bloqueAdjuntarArchivo"
      class="bloqueAdjuntar"
      v-show="cuadroAbierto"
    >
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
      <div id="nombreArchivoSeleccionado" v-show="nombreArchivoSeleccionado">
        <span>{{ nombreArchivoSeleccionado }}</span>
      </div>
    </div>
    <div
      id="bloqueAdjuntarArchivo"
      class="bloqueAdjuntar"
      v-show="cuadroAbierto"
    >
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
      <div id="nombreEnlaceAdjuntado" v-show="enlaceAdjunto && !introduciendoEnlace">
        <span >{{
          enlaceAdjunto
        }}</span>
      </div>
      <div
        id="bCancelarEnlaceAdjunto"
        v-show="enlaceAdjunto"
        @click.stop="enlaceAdjunto = null; enlaceAdjuntable=null;"
      >
        <div class="linea1"><div class="linea2"></div></div>
      </div>
      <img
        src="@/assets/iconos/success.png"
        alt="enviar"
        id="bAceptarAdjuntarEnlace"
        v-show="introduciendoEnlace && !enlaceAdjuntableIlegal"
        @click.stop="
          enlaceAdjunto = enlaceAdjuntable;
          introduciendoEnlace = false;
        "
      />
    </div>

    <loading
      v-show="enviandoRespuesta"
      :texto="'Enviando respuesta...'"
    /><br />
    <div
      id="enviar"
      v-show="cuadroAbierto"
      :class="{ deshabilitado: mensajeIlegal }"
    >
      <img
        :class="{ deshabilitado: enviandoRespuesta }"
        src="@/assets/iconos/enviar.png"
        alt="Enviar respuesta"
        id="imgEnviar"
        title="Enviar"
        @click="evaluarAdjunto"
      />
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Loading from "../utilidades/Loading.vue";
import gql from "graphql-tag";
import { fragmentoDesarrollo } from "../utilidades/recursosGql";

var charProhibidosMensaje = /[^\n\r a-zA-ZÀ-ž0-9_():;.,+¡!¿?@*="-]/;

export default {
  name: "MiParticipacion",
  components: {
    Loading,
  },
  data() {
    return {
      mensaje: "",
      nombreArchivoSeleccionado: null,
      cuadroAbierto: false,
      enviandoRespuesta: false,
      introduciendoEnlace: false,
      enlaceAdjuntable: null,
      enlaceAdjunto: null,
    };
  },
  props: {
    idActividad: String,
    idGrupo: String,
    participacionEstudiante: {
      type: Boolean,
      default: false,
    },
    idDesarrollo: String,
    nuevoDesarrollo: Boolean,
  },
  methods: {
    abrirSelectorDeArchivos() {
      this.$refs.inputArchivoAdjunto.click();
    },
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
          infoArchivo: {
            idGoogleDrive: "",
            googleDriveDirectLink: "",
            extension: "",
            nombre: "",
          },
          mensaje: this.mensaje,
        };
        if (this.enlaceAdjunto) {
          console.log(`Con enlace adjunto ${this.enlaceAdjunto}`);

          nuevaRespuesta.enlaceAdjunto = [this.enlaceAdjunto];
        }
        this.enviarNuevaRespuesta(nuevaRespuesta);
      } else {
        const archivoAdjunto = inputArchivoAdjunto.files[0];
        const fileType = archivoAdjunto["type"];
        console.log(`subiendo un ${fileType}`);
        datos.append("archivoAdjunto", archivoAdjunto);
        var dis = this;
        axios({
          method: "post",
          url:
            this.serverUrl +
            "/api/actividadesProfes/adjuntarArchivoParaRespuestaActividadEstudiantil",
          data: datos,
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: "Bearer " + this.usuario.token,
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
            if (this.enlaceAdjunto) {
              console.log(`Con enlace adjunto ${this.enlaceAdjunto}`);
              nuevaRespuesta.enlaceAdjunto = [this.enlaceAdjunto];
            }
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
      this.$apollo
        .mutate({
          mutation: gql`
            mutation(
              $idGrupo: ID
              $idActividad: ID
              $idDesarrollo: ID
              $nuevaRespuesta: InputNuevaRespuestaActividadEstudiantil
              $nuevoDesarrollo: Boolean
            ) {
              publicarRespuestaActividadEstudiantil(
                idGrupo: $idGrupo
                idActividad: $idActividad
                idDesarrollo: $idDesarrollo
                nuevaRespuesta: $nuevaRespuesta
                nuevoDesarrollo: $nuevoDesarrollo
              ) {
                nuevaRespuesta {
                  ...fragParticipacion
                }
                nuevoDesarrollo {
                  ...fragDesarrollo
                }
              }
            }
            ${fragmentoDesarrollo}
          `,
          variables: {
            idGrupo: this.idGrupo,
            idActividad: this.idActividad,
            idDesarrollo: this.idDesarrollo,
            nuevaRespuesta,
            nuevoDesarrollo: this.nuevoDesarrollo,
          },
        })
        .then(
          ({
            data: {
              publicarRespuestaActividadEstudiantil: {
                nuevaRespuesta,
                nuevoDesarrollo,
              },
            },
          }) => {
            this.enviandoRespuesta = false;
            console.log(`Respuesta publicada`);
            if (nuevoDesarrollo) {
              this.$emit("hiceDesarrollo", nuevoDesarrollo);
            } else {
              this.$emit("hiceRespuesta", nuevaRespuesta);
            }
            this.mensaje = "";
            this.$refs.inputArchivoAdjunto.value = null;
            this.nombreArchivoSeleccionado = null;
            this.enlaceAdjunto = null;
            this.enlaceAdjuntable = null;
          }
        )
        .catch((error) => {
          this.enviandoRespuesta = false;
          console.log(
            `Error publicando respuesta. E: ${JSON.stringify(error.errors)}`
          );
        });
      //Parte vieja
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
        this.mensaje = "";
        this.$refs.inputArchivoAdjunto.value = null;
        this.nombreArchivoSeleccionado = null;
        this.cuadroAbierto = false;
        this.enlaceAdjunto = null;
        this.enlaceAdjuntable = null;
      }
    },
  },
  computed: {
    mensajeIlegal() {
      if (this.mensaje.length < 1) {
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
};
</script>

<style scoped>
.miParticipacion {
  border: 2px solid pink;
  border-radius: 10px;
  padding: 10px;
  position: relative;
}

.participacionPropia {
  border: 2px solid pink;
}

.participacionOtro {
  border: 2px solid rgb(22, 57, 73);
}
#titulo {
  text-align: center;
}

#iconoMensaje {
  margin-left: 10px;
  width: 30px;
  height: 30px;
  cursor: pointer;
  background-color: rgb(156, 204, 156);
  border-radius: 50%;
  float: right;
}

#iconoMensaje:hover {
  background-color: rgb(68, 129, 68);
}

#mensaje {
  border-radius: 5px;
  width: 90%;
  resize: none;
  padding: 5px 7px;
  display: block;
  font-size: 22px;
  margin: 3px auto;
}
.bloqueAdjuntar {
  display: flex;
  align-items: center;
}

.mensajePropio {
  background-color: salmon;
  border: 2px solid rgb(165, 52, 39);
}
.mensajeOtro {
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

#nombreArchivoSeleccionado {
  padding: 20px 3px;
  margin-left: 20px;
}

#nombreArchivoSeleccionado > span {
  font-style: italic;
  font-size: 14px;
  word-wrap: break-word;
  border-radius: 15px;
  background-color: rgb(129, 66, 129);
  padding: 3px 5px;
}

#imgAdjuntarEnlace {
  border-radius: 50%;
  padding: 3px;
  background-color: rgb(156, 214, 216);
  width: 45px;
  height: 45px;
  cursor: pointer;
}
#imgAdjuntarEnlace:hover {
  background-color: cadetblue;
}
.inputAdjuntarEnlace {
  margin-left: 20px;
  width: 350px;
  padding: 3px 5px;
  border-radius: 10px;
}
#nombreEnlaceAdjuntado {
  max-width: 500px;
  margin-left: 20px;
  border-radius: 15px;
  background-color: rgb(129, 66, 129);
  padding: 5px;
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

#enviar {
  text-align: center;
}

@media only screen and (max-width: 500px) {
  #iconoMensaje {
    width: 20px;
    height: 20px;
  }
  #imgAdjuntar {
    width: 30px;
    height: 30px;
  }
}

#inputArchivoAdjunto {
  display: none;
}
</style>