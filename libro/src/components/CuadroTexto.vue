<template>
  <div
    class="cuadroTexto"
    :style="[estiloLayout]"
    @click="playAudio"
    :class="{ conAudio: esteCuadroTexto.audio, deshabilitado: updatingInfo, enPaginaSeleccionada:paginaSeleccionada }"
  >
    <div
      class="texto"
      :style="[estiloFormato, estiloFontSize, estiloVisibilidadTexto]"
      ref="texto"
      @click="iniciarEdicionTexto"
    >{{ esteCuadroTexto.texto }}</div>
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

    <img
      src="@/assets/iconos/delete.png"
      alt="Eliminar"
      title="Eliminar cuadro de texto"
      id="bEliminarCuadroTexto"
      v-show="seleccionado"
      @click="eliminarse"
    />

    <div
      class="textoDummy"
      :style="[estiloFormato, estiloDummy]"
      ref="textoDummy"
    >
      {{ esteCuadroTexto.texto }}
    </div>

    <div
      id="dragHandle"
      v-show="seleccionado"
      :style="sizeDragHandle"
      @mousedown.left.stop="iniciarDrag"
      @mousemove="drag"
      @mouseup="finDrag"
    >
      <div id="bolitaDragHandle"></div>
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
export default {
  name: "CuadroTexto",
  props: {
    idLibro: String,
    idPagina: String,
    esteCuadroTexto: Object,
    sizePagina: Object,
    seleccionado: Boolean,
    paginaSeleccionada:Boolean,
  },
  data() {
    return {
      fontSizeDummy: 10,
      fontSizeInputDummy: 10,
      fontSizeTexto: 10,
      fontSizeInput: 10,

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

      nuevoTexto: null,
      editandoTexto: false,
    };
  },
  computed: {
    estiloLayout() {
      return {
        top: this.posicion.y + "%",
        left: this.posicion.x + "%",

        width: this.size.x + "%",
        height: this.size.y + "%",
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
            mutation(
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
      console.log(`Ajustando font size texto`);
      let hTexto = this.$refs.texto.offsetHeight;
      let hDummy = this.$refs.textoDummy.offsetHeight;
      let wDummy = this.$refs.textoDummy.scrollWidth;
      let wTexto = this.$refs.texto.offsetWidth;
      // if (!confirm("continuar")) {
      //   return;
      // }
      console.log(`Dummy: ${wDummy}x${hDummy}. Texto: ${wTexto}x${hTexto}`);

      if (hDummy >= hTexto || wDummy >= wTexto) {
        console.log(
          `El dummy es más grande que el texto. Disminuyendo font size`
        );
        this.fontSizeDummy = this.fontSizeDummy - 2;
        this.$nextTick(() => {
          let hTexto = this.$refs.texto.offsetHeight;
          let hDummy = this.$refs.textoDummy.offsetHeight;
          let wDummy = this.$refs.textoDummy.scrollWidth;
          let wTexto = this.$refs.texto.offsetWidth;
          console.log(
            `Ahora: Dummy: ${wDummy}x${hDummy}. texto: ${wTexto}x${hTexto}`
          );

          if ((hDummy < hTexto && wDummy < wTexto) || this.fontSizeDummy < 5) {
            console.log(`Encontrado`);
            this.fontSizeTexto = this.fontSizeDummy;
            this.fontSizeInput = this.fontSizeDummy;
            return;
          } else {
            this.findFontSize();
          }
        });
      } else if (hDummy < hTexto && wDummy < wTexto) {
        console.log(
          `El dummy es más pequeño que el texto. Creciendo font size`
        );
        this.fontSizeDummy = this.fontSizeDummy + 2;
        this.$nextTick(() => {
          let hTexto = this.$refs.texto.offsetHeight;
          let hDummy = this.$refs.textoDummy.offsetHeight;
          let wDummy = this.$refs.textoDummy.scrollWidth;
          let wTexto = this.$refs.texto.offsetWidth;
          console.log(
            `Ahora: Dummy: ${wDummy}x${hDummy}. Texto: ${wTexto}x${hTexto}`
          );
          if (
            hDummy >= hTexto ||
            wDummy >= wTexto ||
            this.fontSizeDummy > 100
          ) {
            console.log(`Encontrado`);
            this.fontSizeDummy = this.fontSizeDummy - 2;
            console.log(`Quedó en ${this.fontSizeDummy}`);
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
      console.log(`Ajustando font size input`);
      let hInput = this.$refs.inputNuevoTexto.offsetHeight;
      let hDummy = this.$refs.dummyInput.scrollHeight;
      let wDummy = this.$refs.dummyInput.scrollWidth;
      let wInput = this.$refs.inputNuevoTexto.offsetWidth;
      // if (!confirm("continuar")) {
      //   return;
      // }
      console.log(`Dummy: ${wDummy}x${hDummy}. Input: ${wInput}x${hInput}`);

      if (hDummy >= hInput || wDummy >= wInput) {
        console.log(
          `El dummy es más grande que el input. Disminuyendo font size`
        );
        this.fontSizeInputDummy = this.fontSizeInputDummy - 2;
        this.$nextTick(() => {
          let hInput = this.$refs.inputNuevoTexto.offsetHeight;
          let hDummy = this.$refs.dummyInput.scrollHeight;
          let wDummy = this.$refs.dummyInput.scrollWidth;
          let wInput = this.$refs.inputNuevoTexto.offsetWidth;
          console.log(
            `Ahora: Dummy: ${wDummy}x${hDummy}. Input: ${wInput}x${hInput}`
          );

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
        console.log(
          `El dummy es más pequeño que el input. Creciendo font size`
        );
        this.fontSizeInputDummy = this.fontSizeInputDummy + 2;
        this.$nextTick(() => {
          let hInput = this.$refs.inputNuevoTexto.offsetHeight;
          let hDummy = this.$refs.dummyInput.scrollHeight;
          let wDummy = this.$refs.dummyInput.scrollWidth;
          let wInput = this.$refs.inputNuevoTexto.offsetWidth;
          console.log(
            `Ahora: Dummy: ${wDummy}x${hDummy}. Input: ${wInput}x${hInput}`
          );
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
            mutation(
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
        this.$nextTick(()=>{
          this.$refs.inputNuevoTexto.focus();
        })
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
          mutation(
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
            mutation($idLibro: ID!, $idPagina: ID!, $idCuadroTexto: ID!) {
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
        this.editandoTexto = false;
      }
    },
  },
  mounted() {
    this.$set(this.posicion, "x", this.esteCuadroTexto.posicion.x);
    this.$set(this.posicion, "y", this.esteCuadroTexto.posicion.y);

    this.$set(this.size, "x", this.esteCuadroTexto.size.x);
    this.$set(this.size, "y", this.esteCuadroTexto.size.y);

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
.cuadroTexto:not(.enPaginaSeleccionada){
  border-color: transparent;
}
.enPaginaSeleccionada{
  border-color:purple;
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

#bEliminarCuadroTexto {
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
#bEliminarCuadroTexto:hover {
  background-color: rgba(128, 0, 128, 0.637);
}
</style>