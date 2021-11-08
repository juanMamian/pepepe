<template>
  <div class="enlacesNodo" v-show="nodoVisible" :style="[estiloPosicion, {opacity: !nodoSeleccionado || nodoSeleccionado.id===esteNodo.id?'1':'0.2'}]">
    <transition-group name="fade" tag="div">
      <div
        class="vinculo vinculoGris"
        v-for="vinculo of vinculosGrises"
        :key="vinculo.id"
        :style="[vinculo.estilo, altoVinculos]"        
      >
        <div class="flechaVinculo" :style="[sizeFlecha]"></div>
      </div>
    </transition-group>    
  </div>
</template>

<script>
export default {
  name: "EnlacesNodo",
  props: {
    yo: Object,
    esteNodo: Object,
    todosNodos: Array,
    factorZoom: Number,
    nodoSeleccionado: Object,
    childSeleccionado: Boolean,
    idsNodosVisibles: Array,
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
    };
  },
 
  computed: {
    estiloPosicion() {
      return {
        left: this.esteNodo.coords.x * this.factorZoom + "px",
        top: this.esteNodo.coords.y * this.factorZoom + "px",
      };
    },
    vinculosGrises() {
      var vGrises = JSON.parse(
        JSON.stringify(
          this.esteNodo.vinculos.filter(
            (v) =>
              v.tipo === "requiere" && this.idsNodosVisibles.includes(v.idRef)
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

        v.estilo = {
          transform: "rotate(" + angulo + "rad)",
          top: Math.round(((paralelas.y-(1)) * this.factorZoom)) + "px",
          left: Math.round(((paralelas.x) * this.factorZoom)) + "px",
          width: Math.round(modulo * this.factorZoom) + "px",
          backgroundColor: this.seleccionado?'#ef7229':'gray'
        };
      });

      return vGrises;
    },

    altoVinculos() {
      return {
        height: Math.round(2 * this.factorZoom) + "px",
      };
    },
    sizeFlecha(){
      return {
        borderWidth: Math.round(7*this.factorZoom)+'px',
          borderLeftColor: this.seleccionado?'#ef7229':'gray'

      }
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
    plegado() {
      if (
        !this.usuario ||
        !this.usuario.id ||
        !this.yo ||
        !this.yo.atlasSolidaridad ||
        !this.yo.atlasSolidaridad.idsNodosPlegados
      )
        return false;

      return this.yo.atlasSolidaridad.idsNodosPlegados.includes(
        this.esteNodo.id
      );
    },
    nodoVisible() {
      return this.idsNodosVisibles.includes(this.esteNodo.id);
    },
    requiereSeleccionado() {
      if (!this.nodoSeleccionado) return false;
      return this.esteNodo.vinculos.some(
        (v) => v.tipo === "requiere" && v.idRef === this.nodoSeleccionado.id
      );
    },
    
  },
};
</script>

<style scoped>
.enlacesNodo {
  position: relative;
}
.enlaces {
  position: absolute;
  pointer-events: none;
}
.vinculo {
  position: absolute;
  transform-origin: 0% 0%;
}

.flechaVinculo{
  width:1px;
  height: 1px;
  border-style:solid;
  border-color: transparent;
  border-left-color: gray;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%)
}

.vinculoGris {
  background-color: gray;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>