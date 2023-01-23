<template>
  <div
    class="enlacesNodoConocimiento"
    v-show="nodoRender"
    :style="[estiloPosicion]"
  >
    <transition-group tag="div">
      <div
        class="vinculo vinculoGris"
        v-for="vinculo of vinculosGrises"
        :key="vinculo.id"
        :style="[vinculo.estilo, altoVinculos]"
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
    };
  },

  computed: {
    continuacionDeSeleccionado() {
      if (!this.nodoSeleccionado) return false;
      if (
        this.nodoSeleccionado.vinculos.some((v) => v.idRef === this.esteNodo.id)
      )
        return true;
      return false;
    },
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
    vinculosGrises() {
      var vGrises = JSON.parse(
        JSON.stringify(
          this.esteNodo.vinculos.filter(
            (v) =>
              v.rol === "target" && this.idsTodosNodosRender.includes(v.idRef)
          )
        )
      );

      var idsRelevantesSeleccionado = [];

      if (this.idNodoSeleccionado) {
        idsRelevantesSeleccionado = this.idsNodosPreviosSeleccionado;
        idsRelevantesSeleccionado = idsRelevantesSeleccionado.concat([
          this.idNodoSeleccionado,
        ]);
      }

      vGrises.forEach((v) => {
        const coordsFrom = this.todosNodos.find((n) => n.id === v.idRef).coords;
        const paralelas = {
          x: coordsFrom.x - this.posNodo.x,
          y: coordsFrom.y - this.posNodo.y,
        };
        const angulo = Math.PI + Math.atan2(paralelas.y, paralelas.x);
        const modulo = Math.hypot(paralelas.x, paralelas.y);
        const entreNodosPreviosSeleccionado =
          this.idNodoSeleccionado &&
          idsRelevantesSeleccionado.includes(this.esteNodo.id) &&
          idsRelevantesSeleccionado.includes(v.idRef);

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

        let opacity = 0.3;
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

        if (this.idNodoSeleccionado) {
          opacity=0.05;
          if (entreNodosPreviosSeleccionado) {
            opacity = 0.7;
            if(esEnlaceInaccesible){
              opacity=0.2;
            }
          }
        }

        v.estilo = {
          transform: "rotate(" + angulo + "rad)",
          top: Math.round((paralelas.y - 1) * this.factorZoom) + "px",
          left: Math.round(paralelas.x * this.factorZoom) + "px",
          width: Math.round(modulo * this.factorZoom) + "px",
          backgroundColor,
          opacity,
          borderLeftColor: backgroundColor,
        };
      });

      return vGrises;
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
    desplegado() {
      if (
        !this.usuario ||
        !this.usuario.id ||
        !this.yo ||
        !this.yo.atlasSolidaridad ||
        !this.yo.atlasSolidaridad.idsNodosDesplegados
      )
        return false;

      return this.yo.atlasSolidaridad.idsNodosDesplegados.includes(
        this.esteNodo.id
      );
    },
    nodoRender() {
      if (this.usuario && this.esteNodo.id === this.usuario.id) return true;
      return this.idsTodosNodosRender.includes(this.esteNodo.id);
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