<template>
  <div
    id="atlasProyectos"
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
    <div
      id="proyectoSeleccionado"
      v-show="idProyectoSeleccionado"
      @click="idProyectoSeleccionado = null"
    >
      {{
        idProyectoSeleccionado
          ? proyectos.find((p) => p.id == idProyectoSeleccionado).nombre
          : ""
      }}
    </div>
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
      :idProyectoSeleccionado="idProyectoSeleccionado"
      :nodosDeProyectoSeleccionado="nodosDeProyectoSeleccionado"
    />
    <div id="contenedorNodos" :style="[posContenedores]">
      <centro-proyecto
        v-for="proyecto of proyectos"
        :key="proyecto.id"
        :esteProyecto="proyecto"
        :factorZoom="factorZoom"
        @click.native="idProyectoSeleccionado = proyecto.id"
        :class="{centroProyectoSeleccionado: idProyectoSeleccionado==proyecto.id}"
        v-show="!idProyectoSeleccionado || idProyectoSeleccionado==proyecto.id"
      />
      <nodo-objetivo
        v-for="objetivo of objetivos"
        :key="objetivo.id"
        :esteObjetivo="objetivo"
        :callingPosiciones="callingPosiciones"
        :idNodoSeleccionado="idNodoSeleccionado"
        :menuCx="idNodoMenuCx && idNodoMenuCx == objetivo.id"
        :factorZoom="factorZoom"
        v-show="idsNodosVisibles.includes(objetivo.id)"
      />

      <nodo-trabajo
        v-for="trabajo of trabajos"
        :key="trabajo.id"
        :esteTrabajo="trabajo"
        :idNodoSeleccionado="idNodoSeleccionado"
        :menuCx="idNodoMenuCx && idNodoMenuCx == trabajo.id"
        :factorZoom="factorZoom"
        :callingPosiciones="callingPosiciones"
        v-show="idsNodosVisibles.includes(trabajo.id)"
      />
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import NodoObjetivo from "./NodoObjetivo.vue";
import NodoTrabajo from "./NodoTrabajo.vue";
import CanvasesAtlasProyectos from "./CanvasesAtlasProyectos.vue";
import CentroProyecto from "./CentroProyecto.vue";

const QUERY_TRABAJOS = gql`
  query ($centro: CoordsInput, $radio: Int!) {
    trabajosSegunCentro(centro: $centro, radio: $radio) {
      id
      nombre
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
    }
  }
`;

const QUERY_OBJETIVOS = gql`
  query ($centro: CoordsInput, $radio: Int!) {
    objetivosSegunCentro(centro: $centro, radio: $radio) {
      id
      nombre
      idProyectoParent
      coords {
        x
        y
      }
      estado
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
    }
  }
`;

const QUERY_PROYECTOS = gql`
  query ($centro: CoordsInput, $radio: Int!) {
    proyectosSegunCentro(centro: $centro, radio: $radio) {
      id
      nombre
      centroMasa {
        x
        y
      }
    }
  }
`;

export default {
  components: {
    NodoObjetivo,
    CanvasesAtlasProyectos,
    NodoTrabajo,
    CentroProyecto,
  },
  name: "AtlasProyectos",
  apollo: {
    proyectos: {
      query: QUERY_PROYECTOS,
      variables() {
        return {
          centro: this.centroDescarga,
          radio: this.radioDescarga,
        };
      },
      update({ proyectosSegunCentro }) {
        return proyectosSegunCentro;
      },
      skip() {
        return !this.radioDescarga;
      },
      result() {
        console.log(`Proyectos recibidos`);
        console.log(
          `Estado de la query: ${JSON.stringify(
            this.$apollo.queries.pollInterval
          )}`
        );
      },
      debounce: 1000,
    },
    trabajos: {
      query: QUERY_TRABAJOS,
      variables() {
        return {
          centro: this.centroDescarga,
          radio: this.radioDescarga,
        };
      },
      update({ trabajosSegunCentro }) {
        return trabajosSegunCentro;
      },
      skip() {
        return !this.radioDescarga;
      },
      debounce: 1000,
    },
    objetivos: {
      query: QUERY_OBJETIVOS,
      variables() {
        return {
          centro: this.centroDescarga,
          radio: this.radioDescarga,
        };
      },
      update({ objetivosSegunCentro }) {
        return objetivosSegunCentro;
      },
      skip() {
        return !this.radioDescarga;
      },
      debounce: 1000,
    },
  },
  data() {
    return {
      esquinaVistaDecimal: {
        x: 0,
        y: 0,
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
      idNodoMenuCx: null,
      idProyectoSeleccionado: null,

      zoom: 100,
      minZoom: 20,
      maxZoom: 200,

      pinching: false,
      lastPinchDistance: 0,

      proyectos: [],
      trabajos: [],
      objetivos: [],

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
    todosNodos() {
      return this.trabajos.concat(this.objetivos);
    },
    centroVista() {
      return {
        x: this.esquinaVista.x + this.sizeAtlas.x / 2,
        y: this.esquinaVista.y + this.sizeAtlas.y / 2,
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
      if (!this.idProyectoSeleccionado) {
        return this.todosNodos.map((n) => n.id);
      }
      return this.todosNodos
        .filter((n) => n.idProyectoParent == this.idProyectoSeleccionado)
        .map((n) => n.id);
    },
    nodosDeProyectoSeleccionado(){
      return this.todosNodos.filter(n=>n.idProyectoParent==this.idProyectoSeleccionado)
    }
  },
  watch: {
    callingPosiciones(nuevo) {
      if (nuevo) {
        this.$apollo.queries.proyectos.startPolling(5000);
        this.$apollo.queries.trabajos.startPolling(5000);
        this.$apollo.queries.objetivos.startPolling(5000);
      } else {
        this.$apollo.queries.proyectos.stopPolling();
        this.$apollo.queries.trabajos.stopPolling();
        this.$apollo.queries.objetivos.stopPolling();
      }
    },
    centroVista(actual) {
      const distanciaCentroDescarga = Math.hypot(
        this.centroDescarga.x - actual.x,
        this.centroDescarga.y - actual.y
      );
      if (
        this.radioDescarga - distanciaCentroDescarga <
        this.sizeAtlas.diagonal / 2
      ) {
        //Hora de actualizar nodos
        this.radioDescarga = Math.ceil(
          (Math.max(this.sizeAtlas.x, this.sizeAtlas.y) * 2) / this.factorZoom
        );
        this.$set(this.centroDescarga, "x", Math.round(this.centroVista.x));
        this.$set(this.centroDescarga, "y", Math.round(this.centroVista.y));
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
#atlasProyectos {
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
</style>