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
      }"
      name="mensaje"
      id="mensaje"
      ref="mensaje"
      cols="30"
      rows="10"
      v-show="cuadroAbierto"
      placeholder="Escribe un mensaje"
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
import { fragmentoDesarrollo } from '../utilidades/recursosGql';

var charProhibidosMensaje = /[^\n\r a-zA-ZÀ-ž0-9_():;.,+¡!¿?@*=-]/;

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
    nuevoDesarrollo:Boolean,
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
            "/api/actividadesProfes/adjuntarArchivoParaRespuestaActividadEstudiantil",
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
      console.log(`Enviando nueva respuesta: ${JSON.stringify(nuevaRespuesta)}`);
      this.$apollo
        .mutate({
          mutation: gql`
          mutation($idGrupo:ID, $idActividad:ID, $idDesarrollo:ID, $nuevaRespuesta:InputNuevaRespuestaActividadEstudiantil, $nuevoDesarrollo: Boolean){
            publicarRespuestaActividadEstudiantil(idGrupo: $idGrupo, idActividad: $idActividad, idDesarrollo:$idDesarrollo, nuevaRespuesta:$nuevaRespuesta, nuevoDesarrollo:$nuevoDesarrollo){
                nuevaRespuesta{
                  ...fragParticipacion
                }
                nuevoDesarrollo{
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
          }
        )
        .catch((error) => {
          this.enviandoRespuesta = false;
          console.log(`Error publicando respuesta. E: ${JSON.stringify(error.errors)}`);
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
    "adjuntar mensaje ..."
    "........ loading ......"
    "........ enviar .......";
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

#mensaje {
  border-radius: 5px;
  resize: none;
  padding: 5px 7px;
  grid-area: mensaje;
  display: block;
  font-size: 22px;
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

#nombreArchivoSeleccionado {
  grid-area: adjuntar;
  opacity: 0.8;
  color: gray;
  font-style: italic;
  font-size: 12px;
  word-wrap: break-word;
}
#nombreArchivoSeleccionado:hover {
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

@media only screen and (max-width: 500px) {
  #iconoMensaje {
    width: 20px;
    height: 20px;
  }
  #imgAdjuntar {
    width: 25px;
    height: 25px;
  }
}

#inputArchivoAdjunto {
  display: none;
}

.miParticipacion .loading {
  grid-area: loading;
}
</style>