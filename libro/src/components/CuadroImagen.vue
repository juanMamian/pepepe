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
    />

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
      @mousedown.left="iniciarResize"
      @mousemove="resize"
      @mouseup="finResize"
    >
      <div id="bolitaResizeHandle"></div>
    </div>

    <img
      src="@/assets/iconos/delete.png"
      alt="Eliminar"
      title="Eliminar cuadro de imagen"
      id="bEliminarCuadroImagen"
      v-show="seleccionado"
      @click="eliminarse"
    />

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
  },
  data() {
    return {
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
          mutation(
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
          mutation(
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
            mutation($idLibro: ID!, $idPagina: ID!, $idCuadroImagen: ID!) {
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
  mounted() {
    console.log(`Montado`);
    this.$set(this.posicion, "x", this.esteCuadroImagen.posicion.x);
    this.$set(this.posicion, "y", this.esteCuadroImagen.posicion.y);

    this.$set(this.size, "x", this.esteCuadroImagen.size.x);
    this.$set(this.size, "y", this.esteCuadroImagen.size.y);

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
</style>