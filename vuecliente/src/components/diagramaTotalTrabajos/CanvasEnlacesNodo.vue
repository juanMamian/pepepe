<template>
  <div id="canvasEnlacesNodo">
    <canvas
      v-show="!seleccionado"
      ref="enlacesGrises"
      class="enlacesGrises enlaces"
      :style="[offset]"
    >
    </canvas>
    <canvas
      v-show="seleccionado"
      ref="enlacesVerdes"
      class="enlacesVerdes enlaces"
      :style="[offset]"
    >
    </canvas>
  </div>
</template>

<script>
export default {
  name: "CanvasEnlacesNodo",
  props: {
    esteNodo: Object,
    todosNodos: Array,
    factorZoom: Number,
    nodoSeleccionado: Object,
    redibujarEnlaces: {
      type: Number,
      default: 0,
    },
  },
  methods: {
    trazarVinculosGrises() {
      var lapiz = this.$refs.enlacesGrises.getContext("2d");
      lapiz.canvas.width =
        (this.esquinas.x2 - this.esquinas.x1) * this.factorZoom;
      lapiz.canvas.height =
        (this.esquinas.y2 - this.esquinas.y1) * this.factorZoom;

      lapiz.lineWidth = 2;
      lapiz.clearRect(0, 0, lapiz.canvas.width, lapiz.canvas.height);
      lapiz.beginPath();
      lapiz.strokeStyle = "#b3b3b3";

      this.nodosRequeridos.forEach((nodoRequerido) => {
        this.dibujarLineaEntreNodos(
          nodoRequerido,
          this.esteNodo,
          lapiz,
          this.posicion
        );
      });
      lapiz.stroke();
    },
    trazarVinculosRequeridos() {
      var lapiz = this.$refs.enlacesVerdes.getContext("2d");
      lapiz.canvas.width =
        (this.esquinas.x2 - this.esquinas.x1) * this.factorZoom;
      lapiz.canvas.height =
        (this.esquinas.y2 - this.esquinas.y1) * this.factorZoom;

      lapiz.lineWidth = 2;
      lapiz.clearRect(0, 0, lapiz.canvas.width, lapiz.canvas.height);
      lapiz.beginPath();
      lapiz.strokeStyle = "#d55f18";

      this.nodosRequeridos.forEach((nodoRequerido) => {
        this.dibujarLineaEntreNodos(
          nodoRequerido,
          this.esteNodo,
          lapiz,
          this.posicion
        );
      });
      lapiz.stroke();
    },
    dibujarLineaEntreNodos(nodoFrom, nodoTo, lapiz, posicion) {
      var anguloVinculo = Math.atan(
        (nodoTo.coords.y - nodoFrom.coords.y) /
          (nodoTo.coords.x - nodoFrom.coords.x)
      );

      if (
        nodoTo.coords.y - nodoFrom.coords.y < 0 &&
        nodoTo.coords.x - nodoFrom.coords.x < 0
      )
        anguloVinculo += Math.PI;
      if (
        nodoTo.coords.y - nodoFrom.coords.y > 0 &&
        nodoTo.coords.x - nodoFrom.coords.x < 0
      )
        anguloVinculo += Math.PI;

      const zonaNodo = {
        x: Math.round(20 * Math.cos(anguloVinculo)),
        y: Math.round(20 * Math.sin(anguloVinculo)),
      };

      let inicio = {
        x: Math.round(
          (nodoFrom.coords.x + zonaNodo.x) * this.factorZoom -
            posicion.x * this.factorZoom
        ),
        y: Math.round(
          (nodoFrom.coords.y + zonaNodo.y) * this.factorZoom -
            posicion.y * this.factorZoom
        ),
      };
      let final = {
        x: Math.round(
          (nodoTo.coords.x - zonaNodo.x) * this.factorZoom -
            posicion.x * this.factorZoom
        ),
        y: Math.round(
          (nodoTo.coords.y - zonaNodo.y) * this.factorZoom -
            posicion.y * this.factorZoom
        ),
      };

      lapiz.moveTo(inicio.x, inicio.y);
      lapiz.lineTo(final.x, final.y);
      //ahora la flechita
      const centro = {
        x: Math.round((final.x + inicio.x) / 2),
        y: Math.round((final.y + inicio.y) / 2),
      };
      const longitudAla = Math.round(7 * this.factorZoom);

      const puntaAlaIzquierda = {
        x: Math.round(
          centro.x + longitudAla * Math.cos(anguloVinculo - (3 * Math.PI) / 4)
        ),
        y: Math.round(
          centro.y + longitudAla * Math.sin(anguloVinculo - (3 * Math.PI) / 4)
        ),
      };
      const puntaAlaDerecha = {
        x: Math.round(
          centro.x + longitudAla * Math.cos(anguloVinculo + (3 * Math.PI) / 4)
        ),
        y: Math.round(
          centro.y + longitudAla * Math.sin(anguloVinculo + (3 * Math.PI) / 4)
        ),
      };
      lapiz.moveTo(centro.x, centro.y);
      lapiz.lineTo(puntaAlaIzquierda.x, puntaAlaIzquierda.y);
      lapiz.moveTo(centro.x, centro.y);
      lapiz.lineTo(puntaAlaDerecha.x, puntaAlaDerecha.y);
    },
  },
  computed: {
    idsNodosRequeridos() {
      return this.esteNodo.vinculos
        .filter((v) => v.tipo === "requiere")
        .map((v) => v.idRef);
    },
    nodosRequeridos() {
      return this.todosNodos.filter((n) =>
        this.idsNodosRequeridos.includes(n.id)
      );
    },
    cantidadNodosRequeridos(){
        return this.nodosRequeridos.length;
    },
    esquinas() {
      const nodosInvolucrados = this.todosNodos.filter(
        (n) =>
          this.idsNodosRequeridos.includes(n.id) || n.id === this.esteNodo.id
      );
      console.log(`${nodosInvolucrados.length} nodos involucrados`);
      const x1 = nodosInvolucrados.reduce((acc, n) => {
        if (n.coords.x < acc) {
          return n.coords.x;
        } else {
          return acc;
        }
      }, this.esteNodo.coords.x);
      const x2 = nodosInvolucrados.reduce((acc, n) => {
        if (n.coords.x > acc) {
          return n.coords.x;
        } else {
          return acc;
        }
      }, this.esteNodo.coords.x);
      const y1 = nodosInvolucrados.reduce((acc, n) => {
        if (n.coords.y < acc) {
          return n.coords.y;
        } else {
          return acc;
        }
      }, this.esteNodo.coords.y);
      const y2 = nodosInvolucrados.reduce((acc, n) => {
        if (n.coords.y > acc) {
          return n.coords.y;
        } else {
          return acc;
        }
      }, this.esteNodo.coords.y);

      return {
        x1,
        x2,
        y1,
        y2,
      };
    },
    posicion() {
      return {
        x: this.esquinas.x1,
        y: this.esquinas.y1,
      };
    },
    offset() {
      return {
        left: this.esquinas.x1 * this.factorZoom + "px",
        top: this.esquinas.y1 * this.factorZoom + "px",
        width: (this.esquinas.x2 - this.esquinas.x1) * this.factorZoom + "px",
        height: (this.esquinas.y2 - this.esquinas.y1) * this.factorZoom + "px",
      };
    },
    apariencia() {
      if (
        this.nodoSeleccionado &&
        this.nodoSeleccionado.id === this.esteNodo.id
      ) {
        return {
          backgroundColor: "rgba(128, 255, 0, 0.39)",
        };
      }
      return {
        backgroundColor: "rgba(128, 255, 0, 0)",
      };
    },
    seleccionado() {
      if (!this.nodoSeleccionado) {
        return false;
      }
      return this.nodoSeleccionado.id === this.esteNodo.id;
    },
    
  },
  mounted() {
    this.trazarVinculosGrises();
    this.trazarVinculosRequeridos();
  },
  watch: {
    redibujarEnlaces() {
      this.trazarVinculosGrises();
      this.trazarVinculosRequeridos();
    },
    cantidadNodosRequeridos(){
        this.trazarVinculosGrises();
        this.trazarVinculosRequeridos();
    }
  },
};
</script>

<style scoped>
.enlaces {
  position: absolute;
  pointer-events: none;
}
</style>