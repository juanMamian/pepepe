<template>
  <div id="canvasDiagramaFlujo">
    <canvas
      id="canvasTodosVinculos"
      ref="canvasTodosVinculos"
      :style="[offsetCanvasTodosVinculos]"
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
    factorZoom:Number,
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
      var lapiz = this.$refs.canvasTodosVinculos.getContext("2d");
      //Calcular el tamaño del diagrama      
      const posicionCanvas={
        x: this.esquinasCanvasTodosVinculos.x1,
        y: this.esquinasCanvasTodosVinculos.y1,
      }

      lapiz.canvas.width = this.esquinasCanvasTodosVinculos.x2 - this.esquinasCanvasTodosVinculos.x1;
      lapiz.canvas.height = this.esquinasCanvasTodosVinculos.y2 - this.esquinasCanvasTodosVinculos.y1;   

      lapiz.lineWidth = 1;
      lapiz.clearRect(0, 0, lapiz.canvas.width, lapiz.canvas.height);
      lapiz.beginPath();
      lapiz.strokeStyle = "#b3b3b3";
      for (let nodo of this.todosNodos) {
        for (let vinculo of nodo.vinculos) {
          if (!this.todosNodos.some((n) => n.id == vinculo.idRef)) continue;

          this.dibujarLineaEntreNodos(
            this.todosNodos.find((nodo) => nodo.id == vinculo.idRef),
            nodo,
            lapiz,
            posicionCanvas
          );
        }
      }
      lapiz.stroke();
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
    dibujarLineaEntreNodos(nodoFrom, nodoTo, lapiz, posicionCanvas) {
      console.log(`trazando con posicion canvas: ${JSON.stringify(posicionCanvas)}`);
      let inicio = {
        x: (nodoFrom.posicion.x*this.factorZoom)-posicionCanvas.x,
        y: (nodoFrom.posicion.y*this.factorZoom)-posicionCanvas.y,
      };
      let final = {
        x: (nodoTo.posicion.x*this.factorZoom)-posicionCanvas.x,
        y: (nodoTo.posicion.y*this.factorZoom)-posicionCanvas.y,
      };

      const distanciaVertical=final.y-inicio.y;
      const largoCodo=Math.round(distanciaVertical*0.5);

      const primeraEsquina={
        x:inicio.x,
        y:inicio.y+largoCodo
      }

      const segundaEsquina={
        x:final.x,
        y:final.y-largoCodo
      }

      lapiz.moveTo(inicio.x, inicio.y);
      lapiz.lineTo(primeraEsquina.x, primeraEsquina.y);
      lapiz.lineTo(segundaEsquina.x, segundaEsquina.y);
      lapiz.lineTo(final.x, final.y);
      //ahora la flechita
      // let centro = {
      //   x: (final.x + inicio.x) / 2,
      //   y: (final.y + inicio.y) / 2,
      // };
      // let longitudAla = 7;
      // let anguloVinculo = Math.atan(
      //   (final.y - inicio.y) / (final.x - inicio.x)
      // );
      // if (final.y - inicio.y < 0 && final.x - inicio.x < 0)
      //   anguloVinculo += Math.PI;
      // if (final.y - inicio.y > 0 && final.x - inicio.x < 0)
      //   anguloVinculo += Math.PI;
      // //anguloVinculo=anguloVinculo*180/Math.PI;

      // let puntaAlaIzquierda = {
      //   x: centro.x + longitudAla * Math.cos(anguloVinculo - (3 * Math.PI) / 4),
      //   y: centro.y + longitudAla * Math.sin(anguloVinculo - (3 * Math.PI) / 4),
      // };
      // let puntaAlaDerecha = {
      //   x: centro.x + longitudAla * Math.cos(anguloVinculo + (3 * Math.PI) / 4),
      //   y: centro.y + longitudAla * Math.sin(anguloVinculo + (3 * Math.PI) / 4),
      // };
      // this.lapiz.moveTo(centro.x, centro.y);
      // this.lapiz.lineTo(puntaAlaIzquierda.x, puntaAlaIzquierda.y);
      // this.lapiz.moveTo(centro.x, centro.y);
      // this.lapiz.lineTo(puntaAlaDerecha.x, puntaAlaDerecha.y);
    },
  },
  computed:{
    esquinasCanvasTodosVinculos(){
      var nodosRelevantes=this.todosNodos;

      if (nodosRelevantes.length <= 1) return {
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0,        
      };

      let bordes = {};
      console.log(`Calculando esquinas con ${nodosRelevantes.length} nodos`);
      bordes.top = nodosRelevantes.reduce((acc, n) => {
        //console.log(`Reduciendo ${n.nombre} con coords: ${n.posicion}`);
        return n.posicion.y > acc ? n.posicion.y : acc;
      }, 0);
      bordes.bot = nodosRelevantes.reduce((acc, n) => {
        return n.posicion.y < acc ? n.posicion.y : acc;
      }, 0);
      bordes.left = nodosRelevantes.reduce((acc, n) => {
        return n.posicion.x < acc ? n.posicion.x : acc;
      }, 0);
      bordes.right = nodosRelevantes.reduce((acc, n) => {
        return n.posicion.x > acc ? n.posicion.x : acc;
      }, 0);

      return {
        x1: bordes.left*this.factorZoom,
        y1: bordes.bot*this.factorZoom,
        x2: (bordes.right+2)*this.factorZoom,
        y2: (bordes.top+2)*this.factorZoom
      }
    },
    offsetCanvasTodosVinculos(){
      return {
        left:  this.esquinasCanvasTodosVinculos.x1 + "px",
        top: this.esquinasCanvasTodosVinculos.y1 + "px",

        width: (this.esquinasCanvasTodosVinculos.x2-this.esquinasCanvasTodosVinculos.x1) + "px",
        height: (this.esquinasCanvasTodosVinculos.y2-this.esquinasCanvasTodosVinculos.y1) + "px",
      }
    }

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
    factorZoom(){
      this.crearImagenTodosVinculos();
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
#canvasDiagramaFlujo{
  position: relative;
}
.canvas{
  position: absolute
}
</style>