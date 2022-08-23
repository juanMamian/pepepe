<template>
  <div
    class="cuadroImagen"
    :style="[estiloLayout]"
    @click="playAudio"
    :class="{
      conAudio: esteCuadroImagen.audio,
      deshabilitado: updatingInfo,
      enPaginaSeleccionada: paginaSeleccionada,
    }"
  >
    <img
      :src="urlImagen + '?v=' + versionImagen"
      alt="ilustracion"
      class="imagenContenido"
      @load="imagenLoaded = true"
    />

    <img
      src="@/assets/iconos/loading.png"
      alt="Cargando"
      class="simboloLoading"
      v-if="!imagenLoaded"
    />

    <div id="zHandlers" v-show="seleccionado">
      <div
        class="zHandler"
        id="bSendBack"
        title="Mover hacia atrás"
        @click="posicionZeta = posicionZeta > 0 ? posicionZeta - 1 : 0"
      ></div>
      <div
        class="zHandler"
        id="bBringFront"
        title="Mover hacia adelante"
        @click="posicionZeta++"
      ></div>
    </div>

    <div
      id="dragHandle"
      v-show="seleccionado"
      :style="sizeDragHandle"
      @mousedown.left.stop="iniciarDrag"
      @mousemove="drag"
      @mouseup="finDrag"
    >
      <div
        id="bolitaDragHandle"
        :class="{ enDuda: posicionZeta != esteCuadroImagen.posicionZeta }"
        title="arrastrar"
      >
        {{ posicionZeta }}
      </div>
    </div>

    <div
      id="resizeHandle"
      :style="[sizeResizeHandle]"
      v-show="seleccionado"
      @mousedown.left="iniciarResize"
      @mousemove="resize"
      @mouseup="finResize"
    >
      <div id="bolitaResizeHandle"></div>
    </div>

    <div
      class="boton"
      id="botonMostrarAcciones"
      v-show="seleccionado && !mostrandoAcciones"
      @click="toggleMostrandoAcciones"
    >
      <img src="@/assets/iconos/editar.png" alt="Editar" />
    </div>

    <div id="zonaAcciones" v-show="mostrandoAcciones && seleccionado">
      <div class="boton botonAccion" title="Eliminar cuadro de texto">
        <img
          src="@/assets/iconos/delete.png"
          alt="Eliminar"
          @click="eliminarse"
        />
      </div>

      <div
        class="boton"
        v-show="!uploadingAudio"
        :class="{ deshabilitado: uploadingAudio }"
        @click="$refs.inputAudio.click()"
      >
        <img src="@/assets/iconos/audioFile.svg" alt="Audio" />
      </div>
      <loading v-show="uploadingAudio" />
      <input
        type="file"
        @change="uploadAudio"
        ref="inputAudio"
        id="inputAudio"
        v-show="false"
      />
    </div>

    <input
      type="file"
      id="inputArchivoImagen"
      style="display: none"
      ref="inputArchivoImagen"
      @change="uploadArchivoCuadroImagen"
    />

    <audio type="audio/ogg" v-if="esteCuadroImagen.audio" ref="audio">
      <source :src="urlAudio" type="audio/ogg" />
    </audio>
  </div>
</template>

<script>
import { gql } from "apollo-server-core";
import axios from "axios";
import debounce from "debounce";
export default {
  name: "cuadroImagen",
  props: {
    esteCuadroImagen: Object,
    idLibro: String,
    idPagina: String,
    sizePagina: Object,
    seleccionado: Boolean,
    archivoCuadroImagenPagina: Object,
    paginaSeleccionada: Boolean,
    zBase: Number,
  },
  data() {
    return {
      posicionZeta: 0,
      resizing: false,
      dragging: false,
      posicion: {
        x: null,
        y: null,
      },
      size: {
        x: null,
        y: null,
      },
      updatingInfo: false,
      versionImagen: 0,
      imagenLoaded: false,

      mostrandoAcciones: false,

      uploadingAudio: false,
    };
  },
  computed: {
    estiloLayout() {
      return {
        top: this.posicion.y + "%",
        left: this.posicion.x + "%",

        width: this.size.x + "%",
        height: this.size.y + "%",

        zIndex: this.seleccionado
          ? this.zBase + this.posicionZeta + 100
          : this.zBase + this.posicionZeta,
      };
    },
    urlImagen() {
      return (
        this.serverUrl +
        "/apiCuentos/imagenCuento/" +
        this.idLibro +
        "/" +
        this.idPagina +
        "/" +
        this.esteCuadroImagen.id
      );
    },
    sizeResizeHandle() {
      return {
        width: this.resizing ? 200 + "px" : 10 + "px",
        height: this.resizing ? 200 + "px" : 10 + "px",
      };
    },
    sizeDragHandle() {
      return {
        width: this.dragging ? 200 + "px" : 10 + "px",
        height: this.dragging ? 200 + "px" : 10 + "px",
      };
    },
    urlAudio() {
      return (
        this.serverUrl +
        "/apiCuentos/audioImagen/" +
        this.idLibro +
        "/" +
        this.idPagina +
        "/" +
        this.esteCuadroImagen.id
      );
    },
  },
  methods: {
    playAudio() {
      if (!this.esteCuadroImagen.audio) return;
      this.$refs.audio.play();
    },
    iniciarResize() {
      this.resizing = true;
    },
    resize(e) {
      if (this.resizing) {
        var cuadroPos = {
          x: this.$el.getBoundingClientRect().left,
          y: this.$el.getBoundingClientRect().top,
        };

        const nuevox = e.clientX - cuadroPos.x - 5;
        const nuevoy = e.clientY - cuadroPos.y - 5;

        var nuevoxP = Math.floor((nuevox * 100) / this.sizePagina.x);
        var nuevoyP = Math.floor((nuevoy * 100) / this.sizePagina.y);

        if (this.posicion.x + nuevoxP > 100)
          nuevoxP = Math.floor(100 - this.posicion.x);
        if (this.posicion.y + nuevoyP > 100)
          nuevoyP = Math.floor(100 - this.posicion.y);

        this.$set(this.size, "x", nuevoxP);
        this.$set(this.size, "y", nuevoyP);
      }
    },
    finResize() {
      this.resizing = false;

      this.$apollo.mutate({
        mutation: gql`
          mutation (
            $idLibro: ID!
            $idPagina: ID!
            $idCuadroImagen: ID!
            $nuevoSize: CoordsInput!
          ) {
            updateSizeCuadroImagen(
              idLibro: $idLibro
              idPagina: $idPagina
              idCuadroImagen: $idCuadroImagen
              nuevoSize: $nuevoSize
            ) {
              id
              size {
                x
                y
              }
            }
          }
        `,
        variables: {
          idLibro: this.idLibro,
          idPagina: this.idPagina,
          idCuadroImagen: this.esteCuadroImagen.id,
          nuevoSize: this.size,
        },
      });
    },

    iniciarDrag() {
      this.dragging = true;
    },
    drag(e) {
      if (this.dragging) {
        console.log(`Dragging`);
        const elemPagina = this.$el.closest(".pagina");
        const posPagina = elemPagina.getBoundingClientRect();
        var posMouse = {
          x: e.clientX - posPagina.left,
          y: e.clientY - posPagina.top,
        };
        var nuevaPos = {
          x: posMouse.x - this.$el.offsetWidth / 2,
          y: posMouse.y + 20,
        };

        if (nuevaPos.x + this.$el.offsetWidth > elemPagina.offsetWidth) {
          nuevaPos.x = elemPagina.offsetWidth - this.$el.offsetWidth;
        }
        if (nuevaPos.x < 0) {
          nuevaPos.x = 0;
        }

        if (nuevaPos.y + this.$el.offsetHeight > elemPagina.offsetHeight) {
          nuevaPos.y = elemPagina.offsetHeight - this.$el.offsetHeight;
        }
        if (nuevaPos.y < 0) {
          nuevaPos.y = 0;
        }

        var nuevaPosP = {
          x: Math.round((nuevaPos.x * 100) / elemPagina.offsetWidth),
          y: Math.round((nuevaPos.y * 100) / elemPagina.offsetHeight),
        };

        this.posicion = nuevaPosP;
      }
    },
    finDrag() {
      this.dragging = false;
      this.$apollo.mutate({
        mutation: gql`
          mutation (
            $idLibro: ID!
            $idPagina: ID!
            $idCuadroImagen: ID!
            $nuevoPosicion: CoordsInput!
          ) {
            updatePosicionCuadroImagen(
              idLibro: $idLibro
              idPagina: $idPagina
              idCuadroImagen: $idCuadroImagen
              nuevoPosicion: $nuevoPosicion
            ) {
              id
              posicion {
                x
                y
              }
            }
          }
        `,
        variables: {
          idLibro: this.idLibro,
          idPagina: this.idPagina,
          idCuadroImagen: this.esteCuadroImagen.id,
          nuevoPosicion: this.posicion,
        },
      });
    },

    toggleMostrandoAcciones() {
      this.mostrandoAcciones = !this.mostrandoAcciones;
    },

    uploadArchivoCuadroImagen() {
      var datos = new FormData();
      if (!this.$refs.inputArchivoImagen.value) {
        console.log(`No había archivo seleccionado`);
        return;
      }
      datos.append("idLibro", this.idLibro);
      datos.append("idPagina", this.idPagina);
      datos.append("idCuadroImagen", this.esteCuadroImagen.id);
      datos.append("imagen", this.$refs.inputArchivoImagen.files[0]);

      axios({
        method: "post",
        url: this.serverUrl + "/apiCuentos/subirArchivoCuadroImagen",
        data: datos,
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: "Bearer " + this.$store.state.token,
        },
      })
        .then(({ res }) => {
          console.log(`Resultado de upload archivo: ${res}`);
          this.versionImagen++;
        })
        .catch((error) => {
          console.log(`Error uploading archivo de cuadroImagen. E: ${error}`);
        });
    },
    uploadAudio() {
      var datos = new FormData();
      if (!this.$refs.inputAudio.value) {
        console.log(`No había archivo seleccionado`);
        return;
      }
      datos.append("idLibro", this.idLibro);
      datos.append("idPagina", this.idPagina);
      datos.append("idCuadroImagen", this.esteCuadroImagen.id);
      datos.append("audio", this.$refs.inputAudio.files[0]);

      this.uploadingAudio = true;
      axios({
        method: "post",
        url: this.serverUrl + "/apiCuentos/subirArchivoAudioCuadroImagen",
        data: datos,
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: "Bearer " + this.$store.state.token,
        },
      })
        .then(({ res }) => {
          console.log(`Resultado de upload archivo de audio: ${res}`);
          this.uploadingAudio = false;
        })
        .catch((error) => {
          this.uploadingAudio = false;
          console.log(`Error uploading archivo de audio. E: ${error}`);
        });
    },
    guardarPosicionZeta: debounce(function () {
      if (this.posicionZeta == this.esteCuadroImagen.posicionZeta) return;
      console.log(`Guardando posición zeta`);
      this.$apollo.mutate({
        mutation: gql`
          mutation (
            $idLibro: ID!
            $idPagina: ID!
            $idCuadroImagen: ID!
            $nuevoPosicionZ: Int!
          ) {
            setPosicionZCuadroImagen(
              idLibro: $idLibro
              idPagina: $idPagina
              idCuadroImagen: $idCuadroImagen
              nuevoPosicionZ: $nuevoPosicionZ
            ) {
              id
              posicionZeta
            }
          }
        `,
        variables: {
          idLibro: this.idLibro,
          idPagina: this.idPagina,
          idCuadroImagen: this.esteCuadroImagen.id,
          nuevoPosicionZ: this.posicionZeta,
        },
      });
    }, 3000),

    eliminarse() {
      if (
        !confirm(
          "Eliminando cuadro de imagen. Esta operación no se puede deshacer. ¿Continuar?"
        )
      ) {
        return;
      }
      this.updatingInfo = true;
      console.log(`Eliminando un cuadro de imagen`);
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idLibro: ID!, $idPagina: ID!, $idCuadroImagen: ID!) {
              eliminarCuadroImagenLibro(
                idLibro: $idLibro
                idPagina: $idPagina
                idCuadroImagen: $idCuadroImagen
              )
            }
          `,
          variables: {
            idLibro: this.idLibro,
            idPagina: this.idPagina,
            idCuadroImagen: this.esteCuadroImagen.id,
          },
        })
        .then(({ data: { eliminarCuadroImagenLibro } }) => {
          console.log(`Resultado: ${eliminarCuadroImagenLibro}`);
          if (eliminarCuadroImagenLibro) {
            this.$emit("meElimine");
          }
        })
        .catch((error) => {
          console.log(`Error. E: ${error}`);
          this.updatingInfo = false;
        });
    },
  },
  watch: {
    posicionZeta() {
      console.log(`Cambio de posicion zeta`);
      this.guardarPosicionZeta();
    },
  },
  mounted() {
    console.log(`Montado`);
    this.$set(this.posicion, "x", this.esteCuadroImagen.posicion.x);
    this.$set(this.posicion, "y", this.esteCuadroImagen.posicion.y);

    this.$set(this.size, "x", this.esteCuadroImagen.size.x);
    this.$set(this.size, "y", this.esteCuadroImagen.size.y);

    this.posicionZeta = this.esteCuadroImagen.posicionZeta;

    if (this.esteCuadroImagen.sinArchivo) {
      console.log(`Abriendo el input de archivo`);
      this.$refs.inputArchivoImagen.click();
    }
  },
};
</script>

<style scoped>
.cuadroImagen {
  position: absolute;
  border-width: 1px;
  border-style: solid;
}
.cuadroImagen:not(.enPaginaSeleccionada) {
  border-color: transparent;
}
.enPaginaSeleccionada {
  border-color: purple;
}
.imagenContenido {
  width: 100%;
  height: 100%;
  z-index: 0;
}
#botonMostrarAcciones {
  position: absolute;
  top: 0px;
  left: calc(100%+5px);
}
#zonaAcciones {
  position: absolute;
  top: -0px;
  left: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
}
#resizeHandle {
  position: absolute;
  top: 100%;
  left: 100%;

  border-radius: 50%;
  transform: translate(-50%, -50%);

  cursor: pointer;
  border: 1px solid purple;
}
#bolitaResizeHandle {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: green;
}

#dragHandle {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  cursor: pointer;
  border: 1px solid purple;
}
#bolitaDragHandle {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: green;
  text-align: center;
}
.conAudio {
  cursor: pointer;
}

#bEliminarCuadroImagen {
  width: 30px;
  height: 30px;
  padding: 5px;
  border-radius: 50%;
  cursor: pointer;
  background-color: rgba(128, 0, 128, 0.212);
  position: absolute;
  top: -40px;
  right: -35px;
}
#bEliminarCuadroImagen:hover {
  background-color: rgba(128, 0, 128, 0.637);
}

#zHandlers {
  position: absolute;
  top: -33px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(104, 7, 104, 0.534);
  border-radius: 13px;
  padding: 5px 10px;
  display: grid;
  grid-template-columns: 16px 30px 16px;
}

.zHandler {
  border-radius: 50%;
  width: 15px;
  height: 15px;
  cursor: pointer;
}
#bSendBack {
  background-color: rgba(8, 83, 8, 0.377);
  grid-column: 1/2;
}
#bSendBack:hover {
  background-color: rgba(8, 83, 8, 0.61);
}
#bBringFront {
  background-color: rgb(8, 83, 8);
  grid-column: 3/4;
}
#bBringFront:hover {
  background-color: rgb(4, 56, 4);
}
.enDuda {
  color: purple;
}

.simboloLoading {
  width: 50px;
  height: 50px;

  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50% -50%);
  z-index: -1;
}
</style>