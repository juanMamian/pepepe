<template>
  <div
    class="cuadroTexto"
    :style="[estiloLayout]"
    @click="playAudio"
    :class="{
      conAudio: esteCuadroTexto.audio,
      deshabilitado: updatingInfo,
      enPaginaSeleccionada: paginaSeleccionada,
    }"
  >
    <div
      class="texto"
      :style="[estiloFormato, estiloFontSize, estiloVisibilidadTexto]"
      ref="texto"
      @click="iniciarEdicionTexto"
    >
      {{ esteCuadroTexto.texto }}
    </div>
    <textarea
      ref="inputNuevoTexto"
      id="inputNuevoTexto"
      :style="[estiloFormato, estiloFontSizeInput]"
      v-model="nuevoTexto"
      v-show="editandoTexto"
    ></textarea>

    <textarea
      ref="dummyInput"
      id="dummyInputTexto"
      :style="[estiloFormato, estiloInputDummy]"
      v-model="nuevoTexto"
    >
    </textarea>

    <img
      src="@/assets/iconos/guardar.png"
      alt="guardar"
      title="Guardar cambios"
      id="bGuardarTexto"
      v-show="editandoTexto"
      @click.stop="guardarNuevoTexto"
    />

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

      <div class="boton" v-show="!uploadingAudio" :class="{deshabilitado:uploadingAudio}" @click="$refs.inputAudio.click()">
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

    <div
      class="textoDummy"
      :style="[estiloFormato, estiloDummy]"
      ref="textoDummy"
    >
      {{ esteCuadroTexto.texto }}
    </div>
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
        :class="{ enDuda: posicionZeta != esteCuadroTexto.posicionZeta }"
        title="Arrastrar"
      >
        {{ posicionZeta }}
      </div>
    </div>

    <div
      id="resizeHandle"
      :style="[sizeResizeHandle]"
      v-show="seleccionado"
      @mousedown.left.stop="iniciarResize"
      @mousemove="resize"
      @mouseup="finResize"
    >
      <div id="bolitaResizeHandle"></div>
    </div>

    <audio type="audio/ogg" v-if="esteCuadroTexto.audio" ref="audio">
      <source :src="urlAudio" type="audio/ogg" />
    </audio>
  </div>
</template>

<script>
import { gql } from "apollo-server-core";
import debounce from "debounce";
import axios from "axios";
import Loading from './utilidades/Loading.vue';
export default {
  components: { Loading },
  name: "CuadroTexto",
  props: {
    idLibro: String,
    idPagina: String,
    esteCuadroTexto: Object,
    sizePagina: Object,
    seleccionado: Boolean,
    paginaSeleccionada: Boolean,
    zBase: Number,
  },
  data() {
    return {
      fontSizeDummy: 10,
      fontSizeInputDummy: 10,
      fontSizeTexto: 10,
      fontSizeInput: 10,

      resizing: false,
      dragging: false,

      posicionZeta: 0,
      posicion: {
        x: null,
        y: null,
      },
      size: {
        x: null,
        y: null,
      },
      updatingInfo: false,

      nuevoTexto: null,
      editandoTexto: false,
      mostrandoAcciones: false,

      uploadingAudio:false,
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
    estiloFormato() {
      return {
        textAlign: this.esteCuadroTexto.formato.alineacion,
        color: this.esteCuadroTexto.formato.colorLetra,
        fontFamily:
          this.esteCuadroTexto.formato.tipoLetra + ", 'Nunito', sans-serif",
      };
    },
    estiloFontSize() {
      return {
        fontSize: this.fontSizeTexto + "px",
      };
    },
    estiloVisibilidadTexto() {
      return {
        visibility: this.editandoTexto ? "hidden" : "visible",
      };
    },
    estiloFontSizeInput() {
      return {
        fontSize: this.fontSizeInput + "px",
      };
    },
    estiloDummy() {
      return {
        fontSize: this.fontSizeDummy + "px",
      };
    },
    estiloInputDummy() {
      return {
        fontSize: this.fontSizeInputDummy + "px",
      };
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
        "/apiCuentos/audioTexto/" +
        this.idLibro +
        "/" +
        this.idPagina +
        "/" +
        this.esteCuadroTexto.id
      );
    },
  },
  methods: {
    playAudio() {
      if (!this.esteCuadroTexto.audio) return;
      console.log(`Reproduciendo`);
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

        var nuevox = e.clientX - cuadroPos.x - 5;
        var nuevoy = e.clientY - cuadroPos.y - 5;

        if (nuevox < 15 || nuevoy < 15) {
          console.log(`Offlimits`);
          return;
        }

        // if (
        //   e.clientY > cuadroPos.y + this.sizePagina.y
        // ) {
        //   nuevox = this.sizePagina.x - cuadroPos.x;
        // }

        // if (
        //   e.clientY > cuadroPos.y + this.sizePagina.y
        // ) {
        //   nuevoy = this.sizePagina.y - cuadroPos.y;
        // }

        var nuevoxP = Math.round((nuevox * 100) / this.sizePagina.x);
        var nuevoyP = Math.round((nuevoy * 100) / this.sizePagina.y);

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
      this.fontSizeDummy = 10;
      this.$nextTick(() => {
        this.findFontSize();

        this.$apollo.mutate({
          mutation: gql`
            mutation (
              $idLibro: ID!
              $idPagina: ID!
              $idCuadroTexto: ID!
              $nuevoSize: CoordsInput!
            ) {
              updateSizeCuadroTexto(
                idLibro: $idLibro
                idPagina: $idPagina
                idCuadroTexto: $idCuadroTexto
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
            idCuadroTexto: this.esteCuadroTexto.id,
            nuevoSize: this.size,
          },
        });
      });
    },

    findFontSize() {
      if (
        !this.esteCuadroTexto ||
        !this.esteCuadroTexto.texto ||
        this.esteCuadroTexto.texto.length < 1
      )
        return;
      let hTexto = this.$refs.texto.offsetHeight;
      let hDummy = this.$refs.textoDummy.offsetHeight;
      let wDummy = this.$refs.textoDummy.scrollWidth;
      let wTexto = this.$refs.texto.offsetWidth;
      // if (!confirm("continuar")) {
      //   return;
      // }

      if (hDummy >= hTexto || wDummy >= wTexto) {
        this.fontSizeDummy = this.fontSizeDummy - 2;
        this.$nextTick(() => {
          let hTexto = this.$refs.texto.offsetHeight;
          let hDummy = this.$refs.textoDummy.offsetHeight;
          let wDummy = this.$refs.textoDummy.scrollWidth;
          let wTexto = this.$refs.texto.offsetWidth;

          if ((hDummy < hTexto && wDummy < wTexto) || this.fontSizeDummy < 5) {
            this.fontSizeTexto = this.fontSizeDummy;
            this.fontSizeInput = this.fontSizeDummy;
            return;
          } else {
            this.findFontSize();
          }
        });
      } else if (hDummy < hTexto && wDummy < wTexto) {
        this.fontSizeDummy = this.fontSizeDummy + 2;
        this.$nextTick(() => {
          let hTexto = this.$refs.texto.offsetHeight;
          let hDummy = this.$refs.textoDummy.offsetHeight;
          let wDummy = this.$refs.textoDummy.scrollWidth;
          let wTexto = this.$refs.texto.offsetWidth;

          if (
            hDummy >= hTexto ||
            wDummy >= wTexto ||
            this.fontSizeDummy > 100
          ) {
            this.fontSizeDummy = this.fontSizeDummy - 2;

            this.fontSizeTexto = this.fontSizeDummy;
            this.fontSizeInput = this.fontSizeDummy;

            return;
          } else {
            this.findFontSize();
          }
        });
      }
    },
    findFontSizeInput() {
      if (!this.nuevoTexto || this.nuevoTexto.length < 1) return;
      let hInput = this.$refs.inputNuevoTexto.offsetHeight;
      let hDummy = this.$refs.dummyInput.scrollHeight;
      let wDummy = this.$refs.dummyInput.scrollWidth;
      let wInput = this.$refs.inputNuevoTexto.offsetWidth;

      if (hDummy >= hInput || wDummy >= wInput) {
        this.fontSizeInputDummy = this.fontSizeInputDummy - 2;
        this.$nextTick(() => {
          let hInput = this.$refs.inputNuevoTexto.offsetHeight;
          let hDummy = this.$refs.dummyInput.scrollHeight;
          let wDummy = this.$refs.dummyInput.scrollWidth;
          let wInput = this.$refs.inputNuevoTexto.offsetWidth;

          if (
            (hDummy < hInput && wDummy < wInput) ||
            this.fontSizeInputDummy < 5
          ) {
            this.fontSizeInput = this.fontSizeInputDummy;
            return;
          } else {
            this.findFontSizeInput();
          }
        });
      } else if (hDummy < hInput && wDummy < wInput) {
        this.fontSizeInputDummy = this.fontSizeInputDummy + 2;
        this.$nextTick(() => {
          let hInput = this.$refs.inputNuevoTexto.offsetHeight;
          let hDummy = this.$refs.dummyInput.scrollHeight;
          let wDummy = this.$refs.dummyInput.scrollWidth;
          let wInput = this.$refs.inputNuevoTexto.offsetWidth;

          if (
            hDummy >= hInput ||
            wDummy >= wInput ||
            this.fontSizeInputDummy > 100
          ) {
            this.fontSizeInputDummy = this.fontSizeInputDummy - 2;
            this.fontSizeInput = this.fontSizeInputDummy;
            return;
          } else {
            this.findFontSizeInput();
          }
        });
      }
    },

    guardarNuevoTexto() {
      if (this.nuevoTexto.length > 3000) {
        alert("Texto demasiado largo");
        return;
      }
      if (this.nuevoTexto == this.esteCuadroTexto.texto) {
        console.log(`Texto no modificado`);
        this.editandoTexto = false;
        return;
      }
      this.updatingInfo = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation (
              $idLibro: ID!
              $idPagina: ID!
              $idCuadroTexto: ID!
              $nuevoTexto: String!
            ) {
              updateTextoCuadroTextoCuento(
                idLibro: $idLibro
                idPagina: $idPagina
                idCuadroTexto: $idCuadroTexto
                nuevoTexto: $nuevoTexto
              ) {
                id
                texto
              }
            }
          `,
          variables: {
            idLibro: this.idLibro,
            idPagina: this.idPagina,
            idCuadroTexto: this.esteCuadroTexto.id,
            nuevoTexto: this.nuevoTexto,
          },
        })
        .then(() => {
          this.editandoTexto = false;
          this.updatingInfo = false;
        })
        .catch((error) => {
          console.log(`Error. E: ${error}`);
          this.updatingInfo = false;
        });
    },
    iniciarEdicionTexto() {
      if (this.seleccionado) {
        this.fontSizeInput = this.fontSizeTexto;
        this.fontSizeInputDummy = this.fontSizeTexto;
        this.nuevoTexto = this.esteCuadroTexto.texto;
        this.editandoTexto = true;
        this.$nextTick(() => {
          this.$refs.inputNuevoTexto.focus();
        });
      }
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
            $idCuadroTexto: ID!
            $nuevoPosicion: CoordsInput!
          ) {
            updatePosicionCuadroTexto(
              idLibro: $idLibro
              idPagina: $idPagina
              idCuadroTexto: $idCuadroTexto
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
          idCuadroTexto: this.esteCuadroTexto.id,
          nuevoPosicion: this.posicion,
        },
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
      datos.append("idCuadroTexto", this.esteCuadroTexto.id);
      datos.append("audio", this.$refs.inputAudio.files[0]);

      this.uploadingAudio = true;
      axios({
        method: "post",
        url: this.serverUrl + "/apiCuentos/subirArchivoAudioCuadroTexto",
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

    toggleMostrandoAcciones() {
      this.mostrandoAcciones = !this.mostrandoAcciones;
    },
    eliminarse() {
      if (
        !confirm(
          "Eliminando cuadro de texto. Esta operación no se puede deshacer. ¿Continuar?"
        )
      ) {
        return;
      }
      this.updatingInfo = true;
      console.log(`Eliminando un cuadro de texto`);
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idLibro: ID!, $idPagina: ID!, $idCuadroTexto: ID!) {
              eliminarCuadroTextoLibro(
                idLibro: $idLibro
                idPagina: $idPagina
                idCuadroTexto: $idCuadroTexto
              )
            }
          `,
          variables: {
            idLibro: this.idLibro,
            idPagina: this.idPagina,
            idCuadroTexto: this.esteCuadroTexto.id,
          },
        })
        .then(({ data: { eliminarCuadroTextoLibro } }) => {
          console.log(`Resultado: ${eliminarCuadroTextoLibro}`);
          if (eliminarCuadroTextoLibro) {
            this.$emit("meElimine");
          }
        })
        .catch((error) => {
          console.log(`Error. E: ${error}`);
          this.updatingInfo = false;
        });
    },

    guardarPosicionZeta: debounce(function () {
      console.log(`Guardando posición zeta`);
      if (this.posicionZeta == this.esteCuadroTexto.posicionZeta) return;
      this.$apollo.mutate({
        mutation: gql`
          mutation (
            $idLibro: ID!
            $idPagina: ID!
            $idCuadroTexto: ID!
            $nuevoPosicionZ: Int!
          ) {
            setPosicionZCuadroTexto(
              idLibro: $idLibro
              idPagina: $idPagina
              idCuadroTexto: $idCuadroTexto
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
          idCuadroTexto: this.esteCuadroTexto.id,
          nuevoPosicionZ: this.posicionZeta,
        },
      });
    }, 3000),
  },
  watch: {
    nuevoTexto() {
      this.$nextTick(() => {
        this.findFontSizeInput();
      });
    },
    esteCuadroTexto() {
      this.$nextTick(() => {
        this.findFontSize();
      });
    },
    seleccionado(nuevo) {
      if (nuevo == false) {
        this.guardarNuevoTexto();
        this.mostrandoAcciones = false;
      }
    },
    posicionZeta() {
      this.guardarPosicionZeta();
    },
  },
  mounted() {
    this.$set(this.posicion, "x", this.esteCuadroTexto.posicion.x);
    this.$set(this.posicion, "y", this.esteCuadroTexto.posicion.y);

    this.$set(this.size, "x", this.esteCuadroTexto.size.x);
    this.$set(this.size, "y", this.esteCuadroTexto.size.y);

    this.posicionZeta = this.esteCuadroTexto.posicionZeta;
    this.$nextTick(() => {
      this.findFontSize();
    });
  },
};
</script>

<style>
.texto {
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  white-space: pre-wrap;
}
.cuadroTexto {
  position: absolute;
  resize: both;

  border-width: 1px;
  border-style: solid;
}
.cuadroTexto:not(.enPaginaSeleccionada) {
  border-color: transparent;
}
.enPaginaSeleccionada {
  border-color: purple;
}

#botonMostrarAcciones {
  position: absolute;
  top: 0px;
  left: calc(100%+5px);
}
.textoDummy {
  width: 99%;
  border: 1px solid pink;
  overflow-x: scroll;
  position: absolute;
  left: -100%;
  pointer-events: none;
  white-space: pre-wrap;
  visibility: hidden;
}
#dummyInputTexto {
  width: 99%;
  height: 99%;
  overflow-x: scroll;
  border: 1px solid pink;
  visibility: hidden;
  pointer-events: none;
  position: absolute;
  left: -100%;
  border: none;
  margin: 0px;
  padding: 0px;
  box-sizing: border-box;
  word-wrap: normal;
}
#inputNuevoTexto {
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 0, 0.459);

  box-sizing: border-box;
  resize: none;
  overflow: hidden;
  display: block;
  border: none;
  margin: 0px;
  padding: 0px;
  word-wrap: normal;
}
#inputNuevoTexto:hover {
  outline: none;
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

#bGuardarTexto {
  width: 30px;
  height: 30px;
  padding: 5px;
  border-radius: 50%;
  cursor: pointer;
  background-color: rgba(128, 0, 128, 0.212);
  position: absolute;
  top: 110%;
  left: 50%;
  transform: translateX(-50%);
}
#bGuardarTexto:hover {
  background-color: rgba(128, 0, 128, 0.637);
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
#bEliminarCuadroTexto {
  width: 30px;
  height: 30px;
  padding: 5px;
  border-radius: 50%;
  cursor: pointer;
  background-color: rgba(128, 0, 128, 0.212);
}
#bEliminarCuadroTexto:hover {
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
</style>