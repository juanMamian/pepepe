<template>
  <div
    class="atlasProyectos"
    @mousedown.left.exact.self.stop="panningVista = true"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
    @click="idNodoMenuCx = null"
    @mousemove="panVista"
    @mouseup.left="clickFondoAtlas"
    @touchmove.prevent.stop="movimientoMobile"
    @touchstart="iniciaMovimientoTouch"
    @touchend="finTouch"
  >
    <div
      id="botonCallingPosiciones"
      v-if="usuarioSuperadministrador && usuario.username == 'juanMamian'"
      @click.stop="callingPosiciones = !callingPosiciones"
      :style="[
        { backgroundColor: callingPosiciones ? 'green' : 'transparent' },
      ]"
    ></div>

    <div id="centroVista"></div>
    <canvases-atlas-proyectos
      :style="posCuadroDescarga"
      :centroVista="centroVista"
      :centroDescarga="centroDescarga"
      :radioDescarga="radioDescarga"
      :todosNodos="todosNodos"
      :callingPosiciones="callingPosiciones"
      :factorZoom="factorZoom"
      :idNodoSeleccionado="idNodoSeleccionado"
    />
    <div id="contenedorNodos" :style="[posContenedores]">
      <nodo-objetivo
        v-for="objetivo of objetivos"
        :key="objetivo.id"
        :esteObjetivo="objetivo"
        :callingPosiciones="callingPosiciones"
        :idNodoSeleccionado="idNodoSeleccionado"
        :menuCx="idNodoMenuCx && idNodoMenuCx == objetivo.id"
        :factorZoom="factorZoom"
        v-show="idsNodosVisibles.includes(objetivo.id)"
        @click.native="idNodoSeleccionado = objetivo.id"
        @dblclick.native="idNodoPaVentanita = trabajo.id"
        :class="{
          transparentoso:
            idNodoSeleccionado &&
            idNodoSeleccionado != objetivo.id &&
            !idsNodosRequeridosSeleccionado.includes(objetivo.id) &&
            !idsNodosRequierenSeleccionado.includes(objetivo.id),
        }"
      />

      <nodo-trabajo
        v-for="trabajo of trabajos"
        :key="trabajo.id"
        :esteTrabajo="trabajo"
        :idNodoSeleccionado="idNodoSeleccionado"
        :menuCx="idNodoMenuCx && idNodoMenuCx == trabajo.id"
        :factorZoom="factorZoom"
        :callingPosiciones="callingPosiciones"
        :class="{
          transparentoso:
            idNodoSeleccionado &&
            idNodoSeleccionado != trabajo.id &&
            !idsNodosRequeridosSeleccionado.includes(trabajo.id) &&
            !idsNodosRequierenSeleccionado.includes(trabajo.id),
        }"
        v-show="idsNodosVisibles.includes(trabajo.id)"
        @click.native="idNodoSeleccionado = trabajo.id"
        @dblclick.native="idNodoPaVentanita = trabajo.id"
      />

      <div
        id="indicadorCentroDescarga"
        :style="[
          {
            left: centroDescarga.x * factorZoom + 'px',
            top: centroDescarga.y * factorZoom + 'px',
            width: 20 * factorZoom + 'px',
            height: 20 * factorZoom + 'px',
          },
        ]"
        v-show="usuario.username == 'juanMamian'"
      ></div>
      <div
        id="indicadorCentroVista"
        :style="[
          {
            left: centroVista.x * factorZoom + 'px',
            top: centroVista.y * factorZoom + 'px',
            width: 20 * factorZoom + 'px',
            height: 20 * factorZoom + 'px',
          },
        ]"
        v-show="usuario.username == 'juanMamian'"
      ></div>
    </div>

    <ventanita-objetivo
      v-if="idNodoPaVentanita && objetivoEnVentanita && !callingPosiciones"
      class="ventanitaNodo"
      :key="objetivoEnVentanita.id"
      :esteObjetivo="objetivoEnVentanita"
    />
    <ventanita-trabajo
      v-if="idNodoPaVentanita && trabajoEnVentanita && !callingPosiciones"
      class="ventanitaNodo"
      :key="trabajoEnVentanita.id"
      :esteTrabajo="trabajoEnVentanita"
    />

    <loading
      id="loadingNodos"
      v-show="$apollo.queries.todosNodos.loading"
      texto="Descargando información..."
    />
  </div>
</template>

<script>
import gql from "graphql-tag";
import NodoObjetivo from "./NodoObjetivo.vue";
import NodoTrabajo from "./NodoTrabajo.vue";
import CanvasesAtlasProyectos from "./CanvasesAtlasProyectos.vue";
import VentanitaObjetivo from "./VentanitaObjetivo.vue";
import VentanitaTrabajo from "./VentanitaTrabajo.vue";
import Loading from "../utilidades/Loading.vue";

// const fragmentoTrabajos = gql`
//   fragment fragTrabajo on Trabajo {
//     id
//     nombre
//     idProyectoParent
//     coords {
//       x
//       y
//     }
//     estadoDesarrollo
//     vinculos {
//       idRef
//       tipo
//       tipoRef
//     }
//     stuck
//     angulo
//     centroMasa {
//       x
//       y
//     }
//     puntaje
//     nivel
//     turnoNivel
//   }
// `;

// const fragmentoObjetivos = gql`
//   fragment fragObjetivo on Objetivo {
//     id
//     nombre
//     responsables
//     idProyectoParent
//     coords {
//       x
//       y
//     }
//     estado
//     vinculos {
//       idRef
//       tipo
//       tipoRef
//     }
//     stuck
//     angulo
//     centroMasa {
//       x
//       y
//     }
//     puntaje
//     nivel
//     turnoNivel
//   }
// `;

const QUERY_TODOS_NODOS = gql`
  query ($centro: CoordsInput!, $radio: Int!) {
    nodosTrabajosSegunCentro(centro: $centro, radio: $radio) {
      __typename
      ... on Trabajo {
        id
        nombre
        idProyectoParent
        responsables
        coords {
          x
          y
        }
        estadoDesarrollo
        vinculos {
          idRef
          tipo
          tipoRef
        }
        stuck
        angulo
        centroMasa {
          x
          y
        }
        puntaje
        nivel
        turnoNivel
      }
      ... on Objetivo {
        id
        nombre
        responsables
        idProyectoParent
        coords {
          x
          y
        }
        estadoDesarrollo
        vinculos {
          idRef
          tipo
          tipoRef
        }
        stuck
        angulo
        centroMasa {
          x
          y
        }
        puntaje
        nivel
        turnoNivel
      }
    }
  }
`;

export default {
  components: {
    NodoObjetivo,
    CanvasesAtlasProyectos,
    NodoTrabajo,
    VentanitaObjetivo,
    VentanitaTrabajo,
    Loading,
  },
  name: "AtlasProyectos",
  apollo: {
    // trabajos: {
    //   query: QUERY_TRABAJOS,
    //   variables() {
    //     return {
    //       centro: this.centroDescarga,
    //       radio: this.radioDescarga,
    //     };
    //   },
    //   update({ trabajosSegunCentro }) {
    //     return trabajosSegunCentro;
    //   },
    //   skip() {
    //     return !this.radioDescarga;
    //   },
    //   debounce: 1000,
    // },
    // objetivos: {
    //   query: QUERY_OBJETIVOS,
    //   variables() {
    //     return {
    //       centro: this.centroDescarga,
    //       radio: this.radioDescarga,
    //     };
    //   },
    //   update({ objetivosSegunCentro }) {
    //     return objetivosSegunCentro;
    //   },
    //   skip() {
    //     return !this.radioDescarga;
    //   },
    //   debounce: 1000,
    // },
    todosNodos: {
      query: QUERY_TODOS_NODOS,
      variables() {
        return {
          centro: this.centroDescarga,
          radio: this.radioDescarga,
        };
      },
      update({ nodosTrabajosSegunCentro }) {
        return nodosTrabajosSegunCentro;
      },
      skip() {
        return !this.radioDescarga;
      },
    },
  },
  data() {
    return {
      esquinaVistaDecimal: {
        x: -500,
        y: -500,
      },
      centroDescarga: {
        x: 0,
        y: 0,
      },

      radioDescarga: null,
      sizeAtlas: {
        x: 0,
        y: 0,
        diagonal: 0,
      },
      panningVista: false,
      vistaPanned: false,
      hovered: false,

      idNodoSeleccionado: null,
      idNodoPaVentanita: null,
      idNodoMenuCx: null,

      zoom: 100,
      minZoom: 20,
      maxZoom: 200,

      pinching: false,
      lastPinchDistance: 0,

      // proyectos: [],
      // trabajos: [],
      // objetivos: [],
      todosNodos: [],

      callingPosiciones: false,
    };
  },
  methods: {
    desplazarVista(deltaX, deltaY) {
      this.$set(
        this.esquinaVistaDecimal,
        "x",
        this.esquinaVistaDecimal.x - deltaX
      );
      this.$set(
        this.esquinaVistaDecimal,
        "y",
        this.esquinaVistaDecimal.y - deltaY
      );
    },
    panVista(e) {
      if (!this.panningVista) {
        return;
      }
      this.desplazarVista(
        e.movementX / this.factorZoom,
        e.movementY / this.factorZoom
      );
      e.preventDefault();
      this.vistaPanned = true;
    },
    clickFondoAtlas() {
      if (!this.vistaPanned) this.idNodoSeleccionado = null;
      this.panningVista = false;
      this.vistaPanned = false;
    },
    movimientoMobile(e) {
      if (this.pinching) {
        var contenedor = this.$el;
        let posContenedor = contenedor.getBoundingClientRect();

        const posZoom = {
          x:
            Math.round(posContenedor.width / 2 / this.factorZoom) +
            this.esquinaVista.x,
          y:
            Math.round(posContenedor.height / 2 / this.factorZoom) +
            this.esquinaVista.y,
        };

        const proporciones = {
          x:
            (posZoom.x - this.esquinaVistaDecimal.x) /
            (posContenedor.width / this.factorZoom),
          y:
            (posZoom.y - this.esquinaVistaDecimal.y) /
            (posContenedor.height / this.factorZoom),
        };

        var dist = Math.hypot(
          e.touches[0].pageX - e.touches[1].pageX,
          e.touches[0].pageY - e.touches[1].pageY
        );
        var pinch = dist - this.lastPinchDistance;
        pinch = pinch * 0.5;
        this.zoomVista(pinch);
        this.lastPinchDistance = dist;

        this.$set(
          this.esquinaVistaDecimal,
          "x",
          posZoom.x - (posContenedor.width / this.factorZoom) * proporciones.x
        );
        this.$set(
          this.esquinaVistaDecimal,
          "y",
          posZoom.y - (posContenedor.height / this.factorZoom) * proporciones.y
        );
        return;
      }

      const deltaX = e.changedTouches[0].clientX - this.ultimoTouchX;
      const deltaY = e.changedTouches[0].clientY - this.ultimoTouchY;
      this.ultimoTouchX = e.changedTouches[0].clientX;
      this.ultimoTouchY = e.changedTouches[0].clientY;

      this.desplazarVista(deltaX, deltaY);
    },
    iniciaMovimientoTouch(e) {
      if (e.touches.length === 2) {
        var dist = Math.hypot(
          e.touches[0].pageX - e.touches[1].pageX,
          e.touches[0].pageY - e.touches[1].pageY
        );
        this.lastPinchDistance = dist;
        this.pinching = true;
        return;
      }

      this.ultimoTouchX = e.changedTouches[0].clientX;
      this.ultimoTouchY = e.changedTouches[0].clientY;
    },
    finTouch() {
      this.pinching = false;
    },
    zoomVista(deltaZoom, posZoom) {
      const viejoZoom = this.zoom;
      var nuevoZoom = this.zoom + deltaZoom;
      if (nuevoZoom < this.minZoom) {
        this.zoom = this.minZoom;
      } else if (nuevoZoom > this.maxZoom) {
        this.zoom = this.maxZoom;
      } else {
        this.zoom = nuevoZoom;
      }

      //Pan vista de acuerdo con la posición del mouse respecto del atlas
      const distanciaEsquina = {
        x: posZoom.x - this.esquinaVistaDecimal.x,
        y: posZoom.y - this.esquinaVistaDecimal.y,
      };
      const proporcionZoom = viejoZoom / this.zoom;

      this.$set(
        this.esquinaVistaDecimal,
        "x",
        posZoom.x - proporcionZoom * distanciaEsquina.x
      );
      this.$set(
        this.esquinaVistaDecimal,
        "y",
        posZoom.y - proporcionZoom * distanciaEsquina.y
      );
    },
    zoomWheel(e) {
      if (!this.hovered || !e.ctrlKey) {
        return;
      }
      e.preventDefault();
      var contenedor = document.getElementById("contenedorNodos");
      let posContenedor = contenedor.getBoundingClientRect();

      const posZoom = {
        x: Math.round((e.clientX - posContenedor.left) / this.factorZoom),
        y: Math.round((e.clientY - posContenedor.top) / this.factorZoom),
      };

      const factorZoom = 0.2;
      this.zoomVista(-Math.round(e.deltaY * factorZoom), posZoom);

      // const posZoom={
      //   x: Math.round((e.clientX-posContenedor.left)/this.factorZoom)+this.esquinaVista.x,
      //   y: Math.round((e.clientY-posContenedor.top)/this.factorZoom)+this.esquinaVista.y
      // }

      // const proporciones={
      //   x: (posZoom.x-this.esquinaVistaDecimal.x)/(posContenedor.width/this.factorZoom),
      //   y: (posZoom.y-this.esquinaVistaDecimal.y)/(posContenedor.height/this.factorZoom),
      // }

      // const factorZoom=0.2;
      // this.zoomVista(-Math.round(e.deltaY*factorZoom), {x:posZoom.x, y: posZoom.y});

      // this.$set(this.esquinaVistaDecimal, "x", posZoom.x-((posContenedor.width/this.factorZoom)*proporciones.x) );
      // this.$set(this.esquinaVistaDecimal, "y", posZoom.y-((posContenedor.height/this.factorZoom)*proporciones.y) );
    },
  },
  computed: {
    factorZoom() {
      return Number((this.zoom / 100).toFixed(2));
    },
    esquinaVista() {
      return {
        x: Math.round(this.esquinaVistaDecimal.x),
        y: Math.round(this.esquinaVistaDecimal.y),
      };
    },
    centroVista() {
      return {
        x: this.esquinaVista.x + this.sizeAtlas.x / this.factorZoom / 2,
        y: this.esquinaVista.y + this.sizeAtlas.y / this.factorZoom / 2,
      };
    },
    posContenedores() {
      return {
        left: -(this.esquinaVista.x * this.factorZoom) + "px",
        top: -(this.esquinaVista.y * this.factorZoom) + "px",
      };
    },
    posCuadroDescarga() {
      const posx =
        this.centroDescarga.x - this.radioDescarga - this.esquinaVista.x;
      const posy =
        this.centroDescarga.y - this.radioDescarga - this.esquinaVista.y;
      return {
        left: posx * this.factorZoom + "px",
        top: posy * this.factorZoom + "px",
      };
    },
    idsNodosVisibles() {
      return this.todosNodos.map((n) => n.id);
    },
    objetivoSeleccionado() {
      if (!this.idNodoSeleccionado) return null;
      return this.objetivos.find((o) => o.id == this.idNodoSeleccionado);
    },
    trabajoSeleccionado() {
      if (!this.idNodoSeleccionado) return null;
      return this.trabajos.find((t) => t.id == this.idNodoSeleccionado);
    },
    objetivoEnVentanita() {
      if (!this.idNodoPaVentanita) return null;
      return this.objetivos.find((o) => o.id == this.idNodoPaVentanita);
    },
    trabajoEnVentanita() {
      if (!this.idNodoPaVentanita) return null;
      return this.trabajos.find((t) => t.id == this.idNodoPaVentanita);
    },
    nodoSeleccionado() {
      return this.todosNodos.find((n) => n.id === this.idNodoSeleccionado);
    },
    nodosRequierenSeleccionado() {
      if (!this.idNodoSeleccionado) return [];
      return this.todosNodos.filter((n) =>
        n.vinculos
          .filter((v) => v.tipo == "requiere")
          .map((v) => v.idRef)
          .includes(this.idNodoSeleccionado)
      );
    },
    nodosRequeridosSeleccionado() {
      if (!this.idNodoSeleccionado) return [];
      const idsRequeridos = this.nodoSeleccionado.vinculos
        .filter((v) => v.tipo == "requiere")
        .map((v) => v.idRef);
      return this.todosNodos.filter((n) => idsRequeridos.includes(n.id));
    },
    idsNodosRequierenSeleccionado() {
      return this.nodosRequierenSeleccionado.map((n) => n.id);
    },
    idsNodosRequeridosSeleccionado() {
      return this.nodosRequeridosSeleccionado.map((n) => n.id);
    },
    trabajos() {
      return this.todosNodos.filter((n) => n.__typename === "Trabajo");
    },
    objetivos() {
      return this.todosNodos.filter((n) => n.__typename === "Objetivo");
    },
  },
  watch: {
    callingPosiciones(nuevo) {
      if (nuevo) {
        // this.$apollo.queries.proyectos.startPolling(5000);
        // this.$apollo.queries.trabajos.startPolling(5000);
        // this.$apollo.queries.objetivos.startPolling(5000);
        this.$apollo.queries.todosNodos.startPolling(5000);
      } else {
        // this.$apollo.queries.proyectos.stopPolling();
        // this.$apollo.queries.trabajos.stopPolling();
        // this.$apollo.queries.objetivos.stopPolling();
        this.$apollo.queries.todosNodos.stopPolling();
      }
    },
    centroVista(actual) {
      const distanciaCentroDescarga = Math.hypot(
        this.centroDescarga.x - actual.x,
        this.centroDescarga.y - actual.y
      );
      // console.log(`Distancia centro descarga: ${distanciaCentroDescarga}`);
      if (
        this.radioDescarga - distanciaCentroDescarga <
        this.sizeAtlas.diagonal / this.factorZoom / 2
      ) {
        //Hora de actualizar nodos
        console.log(`Reubicando centro descarga`);
        this.radioDescarga = Math.ceil(
          (Math.max(this.sizeAtlas.x, this.sizeAtlas.y) * 2) / this.factorZoom
        );
        this.$set(this.centroDescarga, "x", Math.round(this.centroVista.x));
        this.$set(this.centroDescarga, "y", Math.round(this.centroVista.y));
      }
    },
    idNodoSeleccionado(nuevo) {
      if (!nuevo) {
        this.idNodoPaVentanita = null;
      }
    },
  },
  mounted() {
    var posAtlas = this.$el.getBoundingClientRect();
    console.log(`Atlas: Ancho: ${posAtlas.width}, alto: ${posAtlas.height}`);
    this.$set(this.sizeAtlas, "x", posAtlas.width);
    this.$set(this.sizeAtlas, "y", posAtlas.height);
    this.$set(
      this.sizeAtlas,
      "diagonal",
      Math.hypot(this.sizeAtlas.x, this.sizeAtlas.y)
    );

    this.radioDescarga = Math.ceil(
      (Math.max(this.sizeAtlas.x, this.sizeAtlas.y) * 2) / this.factorZoom
    );
  },
  created() {
    window.addEventListener("wheel", this.zoomWheel, { passive: false });
  },
  removed() {
    window.removeEventListener("wheel", this.zoomWheel);
  },
};
</script>

<style scoped>
.atlasProyectos {
  overflow: hidden;
  position: relative;
}
#proyectoSeleccionado {
  position: absolute;
  top: 2%;
  left: 50%;
  padding: 10px 15px;
  border-radius: 12px;
  text-align: center;
  transform: translateX(-50%);
  background-color: rgba(221, 160, 221, 0.5);
}
#contenedorNodos {
  position: relative;
  z-index: 1;
}
#canvasesAtlasProyectos {
  position: relative;
}
#centroVista {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background-color: orange;
  transform: translate(-50%, -50%);
  position: absolute;
}

#botonCallingPosiciones {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid black;
  position: absolute;
  top: 1%;
  right: 1%;
  cursor: pointer;
  z-index: 100;
}
.ventanitaNodo {
  width: min(400px, 90%);
  position: absolute;
  top: 50px;
  left: 50px;
  z-index: 2;
}
#loadingNodos {
  position: absolute;
  bottom: 1%;
  left: 50%;
  transform: translateX(-50%);
}
#indicadorCentroDescarga {
  width: 50px;
  height: 50px;
  position: absolute;
  background-color: red;
  transform: translate(-50%, -50%);
  border-radius: 50%;
}
#indicadorCentroVista {
  width: 50px;
  height: 50px;
  position: absolute;
  background-color: rgb(0, 60, 255);
  transform: translate(-50%, -50%);
  border-radius: 50%;
}
.transparentoso {
  opacity: 0.2;
}
</style>