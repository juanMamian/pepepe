<template>
  <div id="canvasDiagramaFlujo">
    <canvas
      id="canvasTodosVinculos"
      ref="canvasTodosVinculos"
      class="canvas"
    ></canvas>
    <canvas
      id="canvasVinculosSeleccionado"
      ref="canvasVinculosSeleccionado"
      :style="[sizeCanvasTodosVinculos]"
      class="canvas"
    ></canvas>
  </div>
</template>

<script>
export default {
  name: "CanvasDiagramaFlujo",
  props: {
    todosNodos: Array,
    nodoSeleccionado: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      sizeCanvasTodosVinculos: {
        width: 0,
        height: 0,
      },
    };
  },
  methods: {
    crearImagenTodosVinculos: function () {
      if (this.todosNodos.length <= 1) return;
      this.lapiz = this.$refs.canvasTodosVinculos.getContext("2d");
      //Calcular el tamaño del diagrama
      let bordesCanvasTodosVinculos = {};

      bordesCanvasTodosVinculos.top = this.todosNodos.reduce((acc, n) => {
        return n.posicion.y > acc ? n.posicion.y : acc;
      }, 0);
      bordesCanvasTodosVinculos.bot = this.todosNodos.reduce((acc, n) => {
        return n.posicion.y < acc ? n.posicion.y : acc;
      }, 0);
      bordesCanvasTodosVinculos.left = this.todosNodos.reduce((acc, n) => {
        return n.posicion.x < acc ? n.posicion.x : acc;
      }, 0);
      bordesCanvasTodosVinculos.right = this.todosNodos.reduce((acc, n) => {
        return n.posicion.x > acc ? n.posicion.x : acc;
      }, 0);

      let anchoDiagrama = parseInt(
        bordesCanvasTodosVinculos.right - bordesCanvasTodosVinculos.left
      );
      let altoDiagrama = parseInt(
        bordesCanvasTodosVinculos.top - bordesCanvasTodosVinculos.bot
      );

      if (anchoDiagrama > 5000 || altoDiagrama > 5000) {
        console.log(`ALERTA. Diagrama demasiado grande`);
      }

      this.$set(this.sizeCanvasTodosVinculos, "width", anchoDiagrama + "px");
      this.$set(this.sizeCanvasTodosVinculos, "height", altoDiagrama + "px");

      this.lapiz.canvas.width = anchoDiagrama;
      this.lapiz.canvas.height = altoDiagrama;

      this.$refs.canvasVinculosSeleccionado.width = anchoDiagrama;
      this.$refs.canvasVinculosSeleccionado.height = altoDiagrama;

      this.lapiz.lineWidth = 1;
      this.lapiz.clearRect(0, 0, anchoDiagrama, altoDiagrama);
      this.lapiz.beginPath();
      this.lapiz.strokeStyle = "#b3b3b3";
      for (let nodo of this.todosNodos) {
        for (let vinculo of nodo.vinculos) {
          if (!this.todosNodos.some((n) => n.id == vinculo.idRef)) continue;

          this.dibujarLineaEntreNodos(
            this.todosNodos.find((nodo) => nodo.id == vinculo.idRef),
            nodo
          );
        }
      }
      this.lapiz.stroke();
    },
    crearImagenVinculosSeleccionado: function () {
      this.lapiz = this.$refs.canvasVinculosSeleccionado.getContext("2d");
      this.lapiz.clearRect(
        0,
        0,
        this.lapiz.canvas.width,
        this.lapiz.canvas.height
      );

      if (this.todosNodos.some((n) => n.id == this.nodoSeleccionado.id)) {
        //Lineas verdes de posiblidades
        this.lapiz.beginPath();
        this.lapiz.lineWidth = 2;
        this.lapiz.strokeStyle = "#008000";

        //Lineas verdes de salida
        for (let vinculo of this.nodoSeleccionado.vinculos) {
          if (!this.todosNodos.some((n) => n.id == vinculo.idRef)) {
            console.log(`ALERTA. Vinculo a ${vinculo.idRef} huerfano`);
            continue;
          }

          let otroNodo = this.todosNodos.find((n) => n.id == vinculo.idRef);
          this.dibujarLineaEntreNodos(otroNodo, this.nodoSeleccionado);
        }
        this.lapiz.stroke();
        //Lineas rojas de dependencias

        
      }
    },
    dibujarLineaEntreNodos(nodoFrom, nodoTo) {
      let inicio = {
        x: nodoFrom.posicion.x,
        y: nodoFrom.posicion.y,
      };
      let final = {
        x: nodoTo.posicion.x,
        y: nodoTo.posicion.y,
      };

      this.lapiz.moveTo(inicio.x, inicio.y);
      this.lapiz.lineTo(final.x, final.y);
      //ahora la flechita
      let centro = {
        x: (final.x + inicio.x) / 2,
        y: (final.y + inicio.y) / 2,
      };
      let longitudAla = 7;
      let anguloVinculo = Math.atan(
        (final.y - inicio.y) / (final.x - inicio.x)
      );
      if (final.y - inicio.y < 0 && final.x - inicio.x < 0)
        anguloVinculo += Math.PI;
      if (final.y - inicio.y > 0 && final.x - inicio.x < 0)
        anguloVinculo += Math.PI;
      //anguloVinculo=anguloVinculo*180/Math.PI;

      let puntaAlaIzquierda = {
        x: centro.x + longitudAla * Math.cos(anguloVinculo - (3 * Math.PI) / 4),
        y: centro.y + longitudAla * Math.sin(anguloVinculo - (3 * Math.PI) / 4),
      };
      let puntaAlaDerecha = {
        x: centro.x + longitudAla * Math.cos(anguloVinculo + (3 * Math.PI) / 4),
        y: centro.y + longitudAla * Math.sin(anguloVinculo + (3 * Math.PI) / 4),
      };
      this.lapiz.moveTo(centro.x, centro.y);
      this.lapiz.lineTo(puntaAlaIzquierda.x, puntaAlaIzquierda.y);
      this.lapiz.moveTo(centro.x, centro.y);
      this.lapiz.lineTo(puntaAlaDerecha.x, puntaAlaDerecha.y);
    },
  },
  watch: {
    todosNodos: function () {
      if (this.todosNodos.length < 1) return;
      this.crearImagenTodosVinculos();
      this.crearImagenVinculosSeleccionado();
    },
    nodoSeleccionado: function () {
      this.crearImagenVinculosSeleccionado();
    },
  },
  mounted() {
    this.montado = true;
    this.crearImagenTodosVinculos();
    this.crearImagenVinculosSeleccionado();
  },
};
</script>

<style scoped>
</style>