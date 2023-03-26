<template>
  <div
    class="enlacesNodoConocimiento"
    :style="[estiloPosicion]"
  >
    <transition-group tag="div">
      <div
        class="vinculo vinculoGris"
        v-for="vinculo of vinculosGrises"
        :key="vinculo.id"
        :style="[vinculo.estilo, altoVinculos]"
        :class="{
          irrelevante:
            idNodoSeleccionado &&
            esteNodo.id != idNodoSeleccionado &&
            (!enAmbitoNodoSeleccionado ||
              (!idsNodosPreviosSeleccionado.includes(vinculo.idRef) &&
                !idsNodosContinuacionSeleccionado.includes(vinculo.idRef) &&
                vinculo.idRef != idNodoSeleccionado)),
          inaccesible: vinculo.inaccesible,
        }"
      >
        <div class="flechaVinculo" :style="[sizeFlecha]"></div>
      </div>
    </transition-group>
    <div
      class="fuerza"
      v-show="callingPosiciones"
      :style="[estiloFuerzaColision, { opacity: nodoSeleccionado ? 1 : 0.3 }]"
      id="fuerzaColision"
    ></div>
    <div
      class="fuerza"
      v-show="callingPosiciones"
      :style="[estiloFuerzaCentroMasa, { opacity: nodoSeleccionado ? 1 : 0.3 }]"
      id="fuerzaCentroMasa"
    ></div>
  </div>
</template>

<script>
export default {
  name: "EnlacesNodoConocimiento",
  props: {
    yo: Object,
    idNodoSeleccionado: String,
    idsNodosPreviosSeleccionado: Array,
    idsNodosContinuacionSeleccionado: Array,
    conectadoSeleccionado: Boolean,
    esteNodo: Object,
    todosNodos: Array,
    factorZoom: Number,
    callingPosiciones: Boolean,
    nodoSeleccionado: Object,
    childSeleccionado: Boolean,
    idsTodosNodosRender: Array,
    esquinasDiagrama: Object,
    transicionarPosicionNodos: Boolean,
    idsNodosPresentesCabeza: Array,
    redibujarEnlaces: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      esquinasSeleccionado: {
        x1: 0,
        x2: 0,
        y1: 0,
        y2: 0,
      },
      posicionSeleccionado: {
        x: 0,
        y: 0,
      },
      factorFuerza: 15,

      vinculosGrises: [],

    
    };
  },
  methods: {
    drawVinculos() {
      var vGrises = JSON.parse(
        JSON.stringify(
          this.esteNodo.vinculos.filter(
            (v) =>
              v.rol === "target" && this.idsTodosNodosRender.includes(v.idRef)
          )
        )
      );

      vGrises.forEach((v) => {
        const coordsFrom = this.todosNodos.find((n) => n.id === v.idRef).coords;
        const paralelas = {
          x: coordsFrom.x - this.posNodo.x,
          y: coordsFrom.y - this.posNodo.y,
        };
        const angulo = Math.PI + Math.atan2(paralelas.y, paralelas.x);
        const modulo = Math.hypot(paralelas.x, paralelas.y);

        const esEnlaceSuperado =
          (v.rol === "target" &&
            this.idsNodosPresentesCabeza.includes(this.esteNodo.id)) ||
          (v.rol === "source" &&
            this.idsNodosPresentesCabeza.includes(v.idRef));

        const esEnlacePorSuperar =
          (v.rol === "source" &&
            !this.idsNodosPresentesCabeza.includes(this.esteNodo.id)) ||
          (v.rol === "target" &&
            this.idsNodosPresentesCabeza.includes(v.idRef));

        const esEnlaceInaccesible = !esEnlaceSuperado && !esEnlacePorSuperar;

        let backgroundColor = "black";

        if (esEnlacePorSuperar) {
          backgroundColor = "var(--atlasConocimientoAvailable)";
        }
        if (esEnlaceInaccesible) {
          backgroundColor = "black";
        }
        if (esEnlaceSuperado) {
          backgroundColor = "var(--atlasConocimientoCheck)";
        }

        v.inaccesible = esEnlaceInaccesible;

        v.estilo = {
          transform: "rotate(" + angulo + "rad)",
          top: Math.round((paralelas.y - 1) * this.factorZoom) + "px",
          left: Math.round(paralelas.x * this.factorZoom) + "px",
          width: Math.round(modulo * this.factorZoom) + "px",
          backgroundColor,
          borderLeftColor: backgroundColor,
        };
      });

      this.vinculosGrises = vGrises;
    },
  },

  computed: {
   
    estiloPosicion() {
      const posXAjustada =
        this.esteNodo.autoCoords.x - this.esquinasDiagrama.x1;
      const posYAjustada =
        this.esteNodo.autoCoords.y - this.esquinasDiagrama.y1;
      return {
        left: posXAjustada * this.factorZoom + "px",
        top: posYAjustada * this.factorZoom + "px",
      };
    },

    estiloFuerzaColision() {
      // var paralelas={
      //   x: this.esteNodo.fuerzaColision.fuerza*Math.cos(this.esteNodo.fuerzaColision.direccion),
      //   y: this.esteNodo.fuerzaColision.fuerza*Math.sin(this.esteNodo.fuerzaColision.direccion),
      // }
      return {
        transform: "rotate(" + this.esteNodo.fuerzaColision.direccion + "rad)",
        // top: Math.round((paralelas.y - 1) * this.factorZoom) + "px",
        // left: Math.round(paralelas.x * this.factorZoom) + "px",
        top: "0px",
        left: "0px",
        width:
          Math.ceil(
            this.esteNodo.fuerzaColision.fuerza *
              this.factorFuerza *
              this.factorZoom
          ) + "px",
      };
    },
    estiloFuerzaCentroMasa() {
      // var paralelas={
      //   x: this.esteNodo.fuerzaCentroMasa.fuerza*Math.cos(this.esteNodo.fuerzaCentroMasa.direccion),
      //   y: this.esteNodo.fuerzaCentroMasa.fuerza*Math.sin(this.esteNodo.fuerzaCentroMasa.direccion),
      // }
      return {
        transform:
          "rotate(" + this.esteNodo.fuerzaCentroMasa.direccion + "rad)",
        // top: Math.round((paralelas.y - 1) * this.factorZoom) + "px",
        // left: Math.round(paralelas.x * this.factorZoom) + "px",
        top: "0px",
        left: "0px",
        width:
          Math.round(
            this.esteNodo.fuerzaCentroMasa.fuerza *
              this.factorFuerza *
              this.factorZoom
          ) + "px",
      };
    },

    altoVinculos() {
      return {
        height: Math.ceil(1 * this.factorZoom) + "px",
      };
    },
    sizeFlecha() {
      return {
        borderWidth: Math.round(7 * this.factorZoom) + "px",
      };
    },

    posNodo() {
      return this.esteNodo.coords;
    },    
    
    seleccionado() {
      if (!this.nodoSeleccionado) {
        return false;
      }
      return this.nodoSeleccionado.id === this.esteNodo.id;
    },
    enAmbitoNodoSeleccionado() {
      console.log("checking if enlace enAmbitoNodoSeleccionado");
      return (
        this.idNodoSeleccionado &&
        (this.idsNodosPreviosSeleccionado.includes(this.esteNodo.id) ||
          this.idsNodosContinuacionSeleccionado.includes(this.esteNodo.id))
      );
    },
  },
};
</script>

<style scoped>
.enlacesNodoConocimiento {
  position: relative;
  width: 1px;
  overflow: visible;
}

.enlaces {
  position: absolute;
  pointer-events: none;
}
.vinculo {
  position: absolute;
  transform-origin: 0% 0%;
  /* transition: left 3s, top 3s; */
}

.vinculoGris.inaccesible {
  opacity: 0.2;
}

.vinculoGris.irrelevante {
  opacity: 0.02;
}
.fuerza {
  position: absolute;
  transform-origin: 0% 0%;
  height: 3px;
}
#fuerzaColision {
  background-color: red;
}
#fuerzaCentroMasa {
  background-color: yellow;
}
.flechaVinculo {
  width: 1px;
  height: 1px;
  border-style: solid;
  border-color: transparent;
  border-left-color: inherit;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.vinculoGris {
  background-color: black;
}
.fade-enter-active {
  animation: fade 0.5s;
}
.fade-leave-active {
  animation: fade 0.5s reverse;
}

@keyframes fade {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>