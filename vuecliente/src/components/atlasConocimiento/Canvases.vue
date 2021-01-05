<template>
  <div id="canvases">
    <canvas
      id="canvasTodosVinculos"
      ref="canvasTodosVinculos"
      :style="[posicionRelativaCanvasTodosVinculos, sizeCanvasTodosVinculos]"
      class="canvas"
    ></canvas>
    <canvas
      id="canvasVinculosSeleccionado"
      ref="canvasVinculosSeleccionado"
      :style="[posicionRelativaCanvasTodosVinculos, sizeCanvasTodosVinculos]"
      class="canvas"
    ></canvas>
  </div>
</template>

<script>
export default {
  name: "Canvases",
  data() {
    return {
      montado: false,

      lapiz: null,
      posicionCanvasTodosVinculos: {
        top: 0,
        left: 0,
      },
      sizeCanvasTodosVinculos: {
        width: 0,
        height: 0,
      },
      posicionCanvasActivo: {
        x: 0,
        y: 0,
      },
    };
  },
  props: {
    nodoSeleccionado: {
      type: Object,
      default() {
        return {
          id: "-1",
          vinculos: [],
        };
      },
    },
    nodoRelevante: [Object],
    todosNodos: Array,
    centroVista: Object,
    actualizar: Number,
  },
  methods: {
    crearImagenTodosVinculos: function () {
      if (this.todosNodos.length <= 1) return;

      this.lapiz = this.$refs.canvasTodosVinculos.getContext("2d");
      //Calcular el tamaño del diagrama
      let bordesCanvasTodosVinculos = {};

      bordesCanvasTodosVinculos.top = this.todosNodos.reduce((acc, n) => {
        return n.coordsManuales.y > acc ? n.coordsManuales.y : acc;
      }, 0);
      bordesCanvasTodosVinculos.bot = this.todosNodos.reduce((acc, n) => {
        return n.coordsManuales.y < acc ? n.coordsManuales.y : acc;
      }, 0);
      bordesCanvasTodosVinculos.left = this.todosNodos.reduce((acc, n) => {
        return n.coordsManuales.x < acc ? n.coordsManuales.x : acc;
      }, 0);
      bordesCanvasTodosVinculos.right = this.todosNodos.reduce((acc, n) => {
        return n.coordsManuales.x > acc ? n.coordsManuales.x : acc;
      }, 0);

      console.log(
        `Bordes del diagrama quedaron: ${JSON.stringify(
          bordesCanvasTodosVinculos
        )}`
      );

      let anchoDiagrama = parseInt(
        bordesCanvasTodosVinculos.right - bordesCanvasTodosVinculos.left
      );
      let altoDiagrama = parseInt(
        bordesCanvasTodosVinculos.top - bordesCanvasTodosVinculos.bot
      );

      if (anchoDiagrama > 5000 || altoDiagrama > 5000) {
        console.log(`ALERTA. Diagrama demasiado grande`);
      }

      this.$set(
        this.posicionCanvasTodosVinculos,
        "y",
        bordesCanvasTodosVinculos.bot
      );
      this.$set(
        this.posicionCanvasTodosVinculos,
        "x",
        bordesCanvasTodosVinculos.left
      );

      this.posicionCanvasActivo = this.posicionCanvasTodosVinculos;

      this.$set(this.sizeCanvasTodosVinculos, "width", anchoDiagrama + "px");
      this.$set(this.sizeCanvasTodosVinculos, "height", altoDiagrama + "px");

      this.lapiz.canvas.width = anchoDiagrama;
      this.lapiz.canvas.height = altoDiagrama;

      this.$refs.canvasVinculosSeleccionado.width = anchoDiagrama;
      this.$refs.canvasVinculosSeleccionado.height = altoDiagrama;

      this.lapiz.lineWidth = 2;
      this.lapiz.clearRect(0, 0, anchoDiagrama, altoDiagrama);
      this.lapiz.beginPath();
      this.lapiz.strokeStyle = "#888888";

      for (let nodo of this.todosNodos) {
        for (let vinculo of nodo.vinculos) {
          if (vinculo.rol == "source") {
            this.dibujarLineaEntreNodos(
              nodo,
              this.todosNodos.find((nodo) => nodo.id == vinculo.idRef)
            );
          }
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
        //this.lapiz.lineWidth=4;
        this.lapiz.strokeStyle = "#008000";

        //Lineas verdes de salida
        for (let vinculo of this.nodoSeleccionado.vinculos) {
          if (!this.todosNodos.some((n) => n.id == vinculo.idRef)) {
            console.log(`ALERTA. Vinculo a ${vinculo.idRef} huerfano`);
            continue;
          }
          if (vinculo.rol == "source") {
            let otroNodo = this.todosNodos.find((n) => n.id == vinculo.idRef);
            this.dibujarLineaEntreNodos(this.nodoSeleccionado, otroNodo);
          }
        }
        this.lapiz.stroke();
        //Lineas rojas de dependencias

        this.lapiz.beginPath();
        this.lapiz.strokeStyle = "#b80e0e";
        for (let vinculo of this.nodoSeleccionado.vinculos) {
          if (!this.todosNodos.some((n) => n.id == vinculo.idRef)) {
            console.log(`ALERTA. Vinculo a ${vinculo.idRef} huerfano`);
            continue;
          }
          if (vinculo.rol == "target") {
            let otroNodo = this.todosNodos.find((n) => n.id == vinculo.idRef);
            this.dibujarLineaEntreNodos(otroNodo, this.nodoSeleccionado);
          }
        }
        this.lapiz.stroke();
      }
    },
    dibujarLineaEntreNodos(nodoFrom, nodoTo) {
      let inicio = {
        x: nodoFrom.coordsManuales.x - this.posicionCanvasActivo.x,
        y: nodoFrom.coordsManuales.y - this.posicionCanvasActivo.y,
      };
      let final = {
        x: nodoTo.coordsManuales.x - this.posicionCanvasActivo.x,
        y: nodoTo.coordsManuales.y - this.posicionCanvasActivo.y,
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
    trazarVinculosDeNodoRecursivamente(
      idNodo,
      rol,
      nivelesRestantes,
      blacklist
    ) {
      nivelesRestantes--;
      let esteNodo = this.todosNodos.find((n) => n.id == idNodo);

      for (let vinculo of esteNodo.vinculos) {
        if (vinculo.rol != rol) continue;
        let nodoRef = this.todosNodos.find((n) => n.id == vinculo.idRef);
        if (!nodoRef) {
          console.log(`ALERTA. idRef del vinculo no estaba entre los nodos`);
          continue;
        }
        blacklist.push(nodoRef.id);
        if (rol == "target") {
          this.dibujarLineaEntreNodos(nodoRef, esteNodo);
          blacklist.push(nodoRef.id);
        } else if (rol == "source") {
          this.dibujarLineaEntreNodos(esteNodo, nodoRef);
        }
        if (
          nivelesRestantes > 0 &&
          !blacklist.some((idN) => idN == nodoRef.id)
        ) {
          blacklist = this.trazarVinculosDeNodoRecursivamente(
            nodoRef.id,
            rol,
            nivelesRestantes,
            blacklist
          );
        }
      }
      return blacklist;
    },
  },
  computed: {
    posicionRelativaCanvasTodosVinculos() {
      let top = this.posicionCanvasTodosVinculos.y - this.centroVista.y;
      let left = this.posicionCanvasTodosVinculos.x - this.centroVista.x;
      return {
        top: top + "px",
        left: left + "px",
      };
    },
    posicionRelativaCanvasVinculosSeleccionado: function () {
      let top = this.posicionCanvasVinculosSeleccionado.y - this.centroVista.y;
      let left = this.posicionCanvasVinculosSeleccionado.x - this.centroVista.x;
      return {
        top: top + "px",
        left: left + "px",
      };
    },
    tamaño: function () {
      return {
        width: this.sizeDiagrama.right - this.sizeDiagrama.left + "px",
        height: this.sizeDiagrama.top - this.sizeDiagrama.bot + "px",
      };
    },
  },
  watch: {
    todosNodos: function () {
      console.log(`Redibujando lineas`);
      this.crearImagenTodosVinculos();
      this.crearImagenVinculosSeleccionado();
    },
    nodoSeleccionado: function () {
      this.crearImagenVinculosSeleccionado();
    },
  },
  mounted() {
    this.montado = true;
  },
};
</script>

<style>
.canvas {
  position: absolute;
}
#canvasVinculosSeleccionado {
  border: 2px solid pink;
}
#canvasTodosVinculos {
  z-index: 0;
  border: 2px solid green;
}
</style>