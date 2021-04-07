<template>
  <div
    class="pagina"
    :style="[estiloColumna, estiloSize, estiloApariencia]"
    :class="{
      seleccionada,
      deshabilitado: uploadingInfo,
      segundoPlano,
      cursorTexto: creandoTexto,
      cursorImagen: creandoImagen,
    }"
    @mousedown.left.stop="accionCrearElemento"
    @mousemove="resizeFantasmaElemento"
    @mouseup="endDibujandoElemento"
    @click="idElementoSeleccionado = null"
  >
    <div class="zonaControlesPagina" v-show="seleccionada">
      <img
        src="@/assets/iconos/delete.png"
        class="bControlesPagina bEliminarPagina"
        title="Eliminar esta página"
        @click="eliminarse"
      />
      <img
        src="@/assets/iconos/paletaColores.png"
        alt="Color"
        class="bControlesPagina bSelectColorPagina"
        title="Seleccionar color de la página"
        @click.stop="$refs.inputColorPagina.click()"
      />
    </div>

    <input type="color" v-model="colorSeleccionado" style="display:none" @change="guardarNuevoColor" ref="inputColorPagina">

    <herramientas-edicion
      v-show="seleccionada"
      ref="herramientasEdicion"
      @creacionTexto="
        desactivarHerramientas();
        creandoTexto = true;
      "
      @creacionImagen="
        desactivarHerramientas();
        creandoImagen = true;
      "
      @mousedown.stop=""
      @mouseup.stop=""
    />

    <div
      id="fantasmaTexto"
      class="fantasmaElemento"
      :style="[estiloLayoutFantasmaTexto]"
      v-show="dibujandoTexto"
    ></div>
    <div
      id="fantasmaImagen"
      class="fantasmaElemento"
      :style="[estiloLayoutFantasmaImagen]"
      v-show="dibujandoImagen"
    ></div>

    <cuadro-imagen
      v-for="cuadroImagen of estaPagina.cuadrosImagen"
      class="elementoPagina"
      :ref="'cuadroImagen' + cuadroImagen.id"
      :class="{ primerPlano: idElementoSeleccionado == cuadroImagen.id }"
      :key="cuadroImagen.id"
      :esteCuadroImagen="cuadroImagen"
      :idLibro="idLibro"
      :idPagina="estaPagina.id"
      :sizePagina="size"
      :seleccionado="idElementoSeleccionado == cuadroImagen.id && seleccionada"
      :paginaSeleccionada="seleccionada"
      :zBase="zElementos"
      @click.native="resolverSeleccion($event, cuadroImagen.id)"
      @meElimine="$emit('elimineCuadroImagen', cuadroImagen.id)"
    />

    <cuadro-texto
      v-for="cuadroTexto of estaPagina.cuadrosTexto"
      class="elementoPagina"
      :class="{ primerPlano: idElementoSeleccionado == cuadroTexto.id }"
      :key="cuadroTexto.id"
      :esteCuadroTexto="cuadroTexto"
      :idLibro="idLibro"
      :idPagina="estaPagina.id"
      :sizePagina="size"
      :seleccionado="idElementoSeleccionado == cuadroTexto.id && seleccionada"
      :paginaSeleccionada="seleccionada"
      :zBase="zElementos"
      @click.native="resolverSeleccion($event, cuadroTexto.id)"
      @meElimine="$emit('elimineCuadroTexto', cuadroTexto.id)"
    />
  </div>
</template>

<script>
import { gql } from "apollo-server-core";
import CuadroImagen from "./CuadroImagen.vue";
import CuadroTexto from "./CuadroTexto.vue";
import HerramientasEdicion from "./HerramientasEdicion.vue";
import { fragmentoCuadroImagen, fragmentoCuadroTexto } from "./Libro.vue";
export default {
  components: { CuadroImagen, CuadroTexto, HerramientasEdicion },
  name: "Pagina",
  props: {
    estaPagina: Object,
    paginaDerecha: Boolean,
    preparada: {
      type: Boolean,
      default: false,
    },
    visible: {
      type: Boolean,
    },
    idLibro: String,
    seleccionada: Boolean,
    segundoPlano: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      ancho: 450,
      alto: 600,
      uploadingInfo: false,
      colorSeleccionado: "#ffffff",

      creandoTexto: false,
      creandoImagen: false,

      dibujandoTexto: false,
      dibujandoImagen: false,

      zElementos:100,

      posFantasmaTexto: {
        x: 0,
        y: 0,
      },
      sizeFantasmaTexto: {
        x: 30,
        y: 30,
      },

      posFantasmaImagen: {
        x: 0,
        y: 0,
      },
      sizeFantasmaImagen: {
        x: 30,
        y: 30,
      },

      idElementoSeleccionado: null,
    };
  },
  computed: {
    estiloColumna() {
      if (this.paginaDerecha) {
        return {
          gridColumn: "1/2",
          justifySelf: "right",
        };
      }
      return null;
    },
    estiloSize() {
      return {
        width: this.ancho + "px",
        height: this.alto + "px",
      };
    },
    size() {
      return {
        x: this.ancho,
        y: this.alto,
      };
    },
    estiloApariencia() {
      return {
        backgroundColor: this.colorSeleccionado,
      };
    },
    estiloLayoutFantasmaTexto() {
      return {
        top: this.posFantasmaTexto.y + "px",
        left: this.posFantasmaTexto.x + "px",
        width: this.sizeFantasmaTexto.x + "px",
        height: this.sizeFantasmaTexto.y + "px",
      };
    },
    estiloLayoutFantasmaImagen() {
      return {
        top: this.posFantasmaImagen.y + "px",
        left: this.posFantasmaImagen.x + "px",
        width: this.sizeFantasmaImagen.x + "px",
        height: this.sizeFantasmaImagen.y + "px",
      };
    },
  },
  methods: {
    eliminarse() {
      if (
        !confirm(
          "Eliminando página. Esta operación no se puede deshacer. ¿Continuar?"
        )
      ) {
        return;
      }
      this.uploadingInfo = true;
      console.log(`Eliminando una página`);
      this.$apollo
        .mutate({
          mutation: gql`
            mutation($idLibro: ID!, $idPagina: ID!) {
              eliminarPaginaDeLibro(idLibro: $idLibro, idPagina: $idPagina)
            }
          `,
          variables: {
            idLibro: this.idLibro,
            idPagina: this.estaPagina.id,
          },
        })
        .then(({ data: { eliminarPaginaDeLibro } }) => {
          console.log(`Resultado: ${eliminarPaginaDeLibro}`);
          if (eliminarPaginaDeLibro) {
            this.$emit("meElimine");
          }
        })
        .catch((error) => {
          console.log(`Error. E: ${error}`);
          this.uploadingInfo = false;
        });
    },
    desactivarHerramientas() {
      this.creandoTexto = false;
      this.creandoImagen = false;
    },
    accionCrearElemento(e) {
      const posPagina = this.$el.getBoundingClientRect();
      const posClick = {
        x: e.clientX - posPagina.left,
        y: e.clientY - posPagina.top,
      };

      if (this.creandoTexto) {
        this.dibujandoTexto = true;
        this.$set(this.posFantasmaTexto, "x", Math.floor(posClick.x));
        this.$set(this.posFantasmaTexto, "y", Math.floor(posClick.y));

        this.$set(this.sizeFantasmaTexto, "x", 30);
        this.$set(this.sizeFantasmaTexto, "y", 30);
      } else if (this.creandoImagen) {
        this.dibujandoImagen = true;
        this.$set(this.posFantasmaImagen, "x", Math.floor(posClick.x));
        this.$set(this.posFantasmaImagen, "y", Math.floor(posClick.y));

        this.$set(this.sizeFantasmaImagen, "x", 30);
        this.$set(this.sizeFantasmaImagen, "y", 30);
      }
    },
    resizeFantasmaElemento(e) {
      const posPagina = this.$el.getBoundingClientRect();
      const posClick = {
        x: e.clientX - posPagina.left,
        y: e.clientY - posPagina.top,
      };

      if (this.dibujandoTexto) {
        let sizeFantasma = {
          x: posClick.x - this.posFantasmaTexto.x,
          y: posClick.y - this.posFantasmaTexto.y,
        };

        if (sizeFantasma.x < 30) {
          sizeFantasma.x = 30;
        }
        if (sizeFantasma.y < 30) {
          sizeFantasma.y = 30;
        }

        this.$set(this.sizeFantasmaTexto, "x", Math.floor(sizeFantasma.x));
        this.$set(this.sizeFantasmaTexto, "y", Math.floor(sizeFantasma.y));
      }

      if (this.dibujandoImagen) {
        let sizeFantasma = {
          x: posClick.x - this.posFantasmaImagen.x,
          y: posClick.y - this.posFantasmaImagen.y,
        };

        if (sizeFantasma.x < 30) {
          sizeFantasma.x = 30;
        }
        if (sizeFantasma.y < 30) {
          sizeFantasma.y = 30;
        }

        this.$set(this.sizeFantasmaImagen, "x", Math.floor(sizeFantasma.x));
        this.$set(this.sizeFantasmaImagen, "y", Math.floor(sizeFantasma.y));
      }
    },
    endDibujandoElemento() {
      if (this.dibujandoTexto) {
        console.log(`Creando cuadroTexto`);
        this.dibujandoTexto = false;
        this.$refs.herramientasEdicion.reset();
        this.crearTextoFromFantasma();
      } else if (this.dibujandoImagen) {
        console.log(`Creando cuadro de imágen`);
        this.dibujandoImagen = false;
        this.$refs.herramientasEdicion.reset();
        this.crearCuadroImagenFromFantasma();
      }
      this.desactivarHerramientas();
    },
    crearCuadroImagenFromFantasma() {
      var datosPosicion = {
        x: Math.round((this.posFantasmaImagen.x * 100) / this.$el.offsetWidth),
        y: Math.round((this.posFantasmaImagen.y * 100) / this.$el.offsetHeight),
      };

      var datosSize = {
        x: Math.round((this.sizeFantasmaImagen.x * 100) / this.$el.offsetWidth),
        y: Math.round(
          (this.sizeFantasmaImagen.y * 100) / this.$el.offsetHeight
        ),
      };

      this.$apollo
        .mutate({
          mutation: gql`
            mutation(
              $idLibro: ID!
              $idPagina: ID!
              $datosPosicion: CoordsInput!
              $datosSize: CoordsInput!
            ) {
              crearCuadroImagenPaginaLibro(
                idLibro: $idLibro
                idPagina: $idPagina
                datosPosicion: $datosPosicion
                datosSize: $datosSize
              ) {
                ...fragCuadroImagen
              }
            }
            ${fragmentoCuadroImagen}
          `,
          variables: {
            idLibro: this.idLibro,
            idPagina: this.estaPagina.id,
            datosPosicion,
            datosSize,
          },
        })
        .then(({ data: { crearCuadroImagenPaginaLibro } }) => {
          this.$emit("tengoNuevoCuadroImagen", crearCuadroImagenPaginaLibro);
        })
        .catch((error) => {
          console.log(`Error en mutación de crear cuadro imágen. E: ${error}`);
        });
    },
    crearTextoFromFantasma() {
      console.log(
        `Enviando con ${JSON.stringify(this.idLibro)}, ${JSON.stringify(
          this.estaPagina.id
        )}, ${JSON.stringify(this.posFantasmaTexto)}, ${JSON.stringify(
          this.sizeFantasmaTexto
        )}`
      );

      var datosPosicion = {
        x: Math.round((this.posFantasmaTexto.x * 100) / this.$el.offsetWidth),
        y: Math.round((this.posFantasmaTexto.y * 100) / this.$el.offsetHeight),
      };

      var datosSize = {
        x: Math.round((this.sizeFantasmaTexto.x * 100) / this.$el.offsetWidth),
        y: Math.round((this.sizeFantasmaTexto.y * 100) / this.$el.offsetHeight),
      };

      this.$apollo
        .mutate({
          mutation: gql`
            mutation(
              $idLibro: ID!
              $idPagina: ID!
              $datosPosicion: CoordsInput!
              $datosSize: CoordsInput!
            ) {
              crearCuadroTextoPaginaLibro(
                idLibro: $idLibro
                idPagina: $idPagina
                datosPosicion: $datosPosicion
                datosSize: $datosSize
              ) {
                ...fragCuadroTexto
              }
            }
            ${fragmentoCuadroTexto}
          `,
          variables: {
            idLibro: this.idLibro,
            idPagina: this.estaPagina.id,
            datosPosicion,
            datosSize,
          },
          errorPolicy: "all",
        })
        .then(({ data: { crearCuadroTextoPaginaLibro } }) => {
          this.$emit("tengoNuevoCuadroTexto", crearCuadroTextoPaginaLibro);
        })
        .catch((error) => {
          console.log(`Error. E: ${error.message}`);
          console.log(`Hubo ${error.graphQLErrors} errores graphql`);
        });
    },
    resolverSeleccion(e, idElemento) {
      if (this.seleccionada) {
        e.stopPropagation();
        this.idElementoSeleccionado = idElemento;
      }
    },
    guardarNuevoColor(){
      console.log(`Guardando nuevo color de página.`);
      
      this.$apollo.mutate({
        mutation:gql`
          mutation($idLibro:ID!, $idPagina:ID!, $nuevoColor:String!){
            setNuevoColorPaginaLibro(idLibro:$idLibro, idPagina: $idPagina, nuevoColor:$nuevoColor){
              id
              color
            }
          }
        `,
        variables:{
          idLibro:this.idLibro,
          idPagina:this.estaPagina.id,
          nuevoColor:this.$refs.inputColorPagina.value
        }
      }).then(()=>{
        console.log(`Nuevo color guardado`);
      }).catch((error)=>{
        console.log(`Error guardando el nuevo color de página. E: ${error}`);        
        this.colorSeleccionado=this.estaPagina.color;
      })
    }
  },
  mounted(){
    this.colorSeleccionado=this.estaPagina.color;
  }
};
</script>

<style scoped>
.pagina {
  border: 2px solid black;
  position: relative;

  user-select: none;
}
.cursorTexto {
  cursor: url("~../assets/iconos/punteroTexto.png"), default;
}
.cursorImagen {
  cursor: url("~../assets/iconos/punteroImagen.png"), default;
}
.segundoPlano {
  opacity: 0.3;
}

.primerPlano {
  z-index: 500;
}
.seleccionada {
  border-color: purple;
  z-index: 2;
}

.zonaControlesPagina {
  text-align: center;
  padding: 10px;
  position: absolute;
  top: -60px;
  left: 50%;
  transform: translateX(-50%);
}

.bControlesPagina {
  width: 30px;
  height: 30px;
  border-radius: 50%;

  cursor: pointer;
  display: inline-block;
  background-color: rgba(189, 111, 189, 0.185);
}
.bControlesPagina:hover {
  background-color: rgba(189, 111, 189, 0.555);
}

#herramientasEdicion {
  position: absolute;
  top: 150px;
  left: -100px;
}
.fantasmaElemento {
  position: absolute;
  border: 3px dotted purple;
  border-radius: 5px;
  background-color: rgba(128, 0, 128, 0.205);
  box-sizing: border-box;
}
</style>