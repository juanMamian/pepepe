<template>
  <div id="canvases">
    <canvas
      id="canvasTodosVinculos"
      ref="canvasTodosVinculos"
      :style="[estiloPosicionRelativaCanvas, sizeCanvasTodosVinculos]"
      class="canvas"
    ></canvas>
    <canvas
      id="canvasVinculosSeleccionado"
      ref="canvasVinculosSeleccionado"
      :style="[estiloPosicionRelativaCanvas, sizeCanvasTodosVinculos]"
      class="canvas"
    ></canvas>
    <canvas
      id="canvasPosiciones"
      ref="canvasPosiciones"
      :style="[estiloPosicionRelativaCanvas, sizeCanvasTodosVinculos]"
      class="canvas"
      v-show="callingPosiciones"
    >

    </canvas>
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
    idsNecesariosParaTarget:Array,
    nodoRelevante: [Object],
    idNodoTarget: String,
    todosNodos: Array,
    centroVista: Object,
    actualizar: Number,

    callingPosiciones:Boolean,
  },
  methods: {
    crearImagenPosiciones(){
      
      console.log(`Creando imagen posiciones`);
      this.lapiz=this.$refs.canvasPosiciones.getContext("2d")
      var nodosRelevantes = this.todosNodos;
      console.log(`Con ${nodosRelevantes.length} nodos relevantes`);

      if(this.nodoSeleccionado && this.nodoSeleccionado.id.length>4) nodosRelevantes=[this.nodoSeleccionado];
      console.log(`Con ${nodosRelevantes.length} nodos relevantes`);
      if (nodosRelevantes <= 1) return;

      this.lapiz.canvas.width=parseInt(this.sizeCanvasTodosVinculos.width);
      this.lapiz.canvas.height=parseInt(this.sizeCanvasTodosVinculos.height);
      
      this.lapiz.clearRect(
        0,
        0,
        this.lapiz.canvas.width,
        this.lapiz.canvas.height
      );

      this.lapiz.lineWidth=2;
      this.lapiz.beginPath();

      nodosRelevantes.forEach(nodo=>{
        this.lapiz.beginPath();
        this.lapiz.strokeStyle = nodo.stuck?'red':"#9761d2";

        this.lapiz.moveTo(nodo.coords.x -this.posicionCanvasActivo.x, nodo.coords.y-this.posicionCanvasActivo.y);
        this.lapiz.lineTo(nodo.centroMasa.x - this.posicionCanvasActivo.x, nodo.centroMasa.y - this.posicionCanvasActivo.y);
        this.lapiz.arc(nodo.centroMasa.x - this.posicionCanvasActivo.x, nodo.centroMasa.y - this.posicionCanvasActivo.y, 10, 0, Math.PI*2);
        this.lapiz.stroke();     
     })

     this.lapiz.beginPath();    
     nodosRelevantes.forEach(nodo=>{
       if(!nodo.stuck){
        this.lapiz.strokeStyle = 'blue';
        let nodox=nodo.coords.x -this.posicionCanvasActivo.x;
        let nodoy=nodo.coords.y-this.posicionCanvasActivo.y
        this.lapiz.moveTo(nodox, nodoy);
        
        let vectorx=(Math.cos(nodo.angulo)*100);
        let vectory=(Math.sin(nodo.angulo)*100);
        
        this.lapiz.lineTo(nodox+vectorx, nodoy+vectory);
       }
       
     })
     this.lapiz.stroke();

    },
    crearImagenTodosVinculos: function () {
      var nodosRelevantes = this.todosNodos;
      if (this.idNodoTarget) {
        nodosRelevantes = this.todosNodos.filter(n=>this.idsNecesariosParaTarget.includes(n.id) || n.id==this.idNodoTarget);
      }

      if (nodosRelevantes <= 1) return;

      this.lapiz = this.$refs.canvasTodosVinculos.getContext("2d");
      //Calcular el tamaño del diagrama
      
      this.posicionCanvasActivo = this.posicionCanvasTodosVinculos;
      
      this.lapiz.canvas.width = parseInt(this.sizeCanvasTodosVinculos.width);
      this.lapiz.canvas.height = parseInt(this.sizeCanvasTodosVinculos.height);

      this.lapiz.lineWidth = 1;
      this.lapiz.clearRect(0, 0, this.lapiz.canvas.width, this.lapiz.canvas.height);
      this.lapiz.beginPath();
      this.lapiz.strokeStyle = "#b3b3b3";
      for (let nodo of nodosRelevantes) {
        for (let vinculo of nodo.vinculos) {
          if (!nodosRelevantes.some((n) => n.id == vinculo.idRef)) continue;
          if (vinculo.rol == "source") {
            this.dibujarLineaEntreNodos(
              nodo,
              nodosRelevantes.find((nodo) => nodo.id == vinculo.idRef)
            );
          }
        }
      }
      this.lapiz.stroke();
    },
    crearImagenVinculosSeleccionado: function () {

      var nodosRelevantes = this.todosNodos;

      if (this.idNodoTarget) {
        nodosRelevantes = this.todosNodos.filter(n=>this.idsNecesariosParaTarget.includes(n.id) || n.id==this.idNodoTarget);
      }

      if (nodosRelevantes <= 1) return;

      this.lapiz = this.$refs.canvasVinculosSeleccionado.getContext("2d");
      this.lapiz.clearRect(
        0,
        0,
        this.lapiz.canvas.width,
        this.lapiz.canvas.height
      );

      this.lapiz.canvas.width = parseInt(this.sizeCanvasTodosVinculos.width);
      this.lapiz.canvas.height = parseInt(this.sizeCanvasTodosVinculos.height);

      if (nodosRelevantes.some((n) => n.id == this.nodoSeleccionado.id)) {
        //Lineas verdes de posiblidades
        this.lapiz.beginPath();
        this.lapiz.lineWidth = 2;
        this.lapiz.strokeStyle = "#008000";

        //Lineas verdes de salida
        for (let vinculo of this.nodoSeleccionado.vinculos) {
          if (!nodosRelevantes.some((n) => n.id == vinculo.idRef)) {
            console.log(`ALERTA. Vinculo a ${vinculo.idRef} huerfano`);
            continue;
          }
          if (vinculo.rol == "source") {
            let otroNodo = nodosRelevantes.find((n) => n.id == vinculo.idRef);
            this.dibujarLineaEntreNodos(this.nodoSeleccionado, otroNodo);
          }
        }
        this.lapiz.stroke();
        //Lineas rojas de dependencias

        this.lapiz.beginPath();
        this.lapiz.strokeStyle = "#b80e0e";
        for (let vinculo of this.nodoSeleccionado.vinculos) {
          if (!nodosRelevantes.some((n) => n.id == vinculo.idRef)) {
            console.log(`ALERTA. Vinculo a ${vinculo.idRef} huerfano`);
            continue;
          }
          if (vinculo.rol == "target") {
            let otroNodo = nodosRelevantes.find((n) => n.id == vinculo.idRef);
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
    sizeCanvasTodosVinculos(){
      var nodosRelevantes = this.todosNodos;
      if (this.idNodoTarget) {
        nodosRelevantes = this.todosNodos.filter(n=>this.idsNecesariosParaTarget.includes(n.id) || n.id==this.idNodoTarget);
      }

      if (nodosRelevantes <= 1) return {
        width:"0px",
        height:"0px",
      };

      let bordesCanvasTodosVinculos = {};

      bordesCanvasTodosVinculos.top = nodosRelevantes.reduce((acc, n) => {
        return n.coordsManuales.y > acc ? n.coordsManuales.y : acc;
      }, 0);
      bordesCanvasTodosVinculos.bot = nodosRelevantes.reduce((acc, n) => {
        return n.coordsManuales.y < acc ? n.coordsManuales.y : acc;
      }, 0);
      bordesCanvasTodosVinculos.left = nodosRelevantes.reduce((acc, n) => {
        return n.coordsManuales.x < acc ? n.coordsManuales.x : acc;
      }, 0);
      bordesCanvasTodosVinculos.right = nodosRelevantes.reduce((acc, n) => {
        return n.coordsManuales.x > acc ? n.coordsManuales.x : acc;
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

      return {
        width: anchoDiagrama+"px",
        height: altoDiagrama+"px"
      }
      // this.$set(this.sizeCanvasTodosVinculos, "width", anchoDiagrama + "px");
      // this.$set(this.sizeCanvasTodosVinculos, "height", altoDiagrama + "px");
      
      
    },
    estiloPosicionRelativaCanvas() {
      let top = this.posicionCanvasTodosVinculos.y - this.centroVista.y;
      let left = this.posicionCanvasTodosVinculos.x - this.centroVista.x;
      return {
        top: top + "px",
        left: left + "px",
      };
    },
  },
  watch: {
    todosNodos: function () {
      console.log(`Cambio en todos nodos`);
      if (this.todosNodos.length < 1) return;
      this.crearImagenTodosVinculos();
      if(this.callingPosiciones)this.crearImagenPosiciones();
      this.crearImagenVinculosSeleccionado();
    },
    nodoSeleccionado: function () {
      if(!this.callingPosiciones)this.crearImagenVinculosSeleccionado();
      if(this.callingPosiciones)this.crearImagenPosiciones();

    },
    idNodoTarget() {
      console.log(`Trazando todos vínculos teniendo en cuenta el target`);
      this.crearImagenTodosVinculos();
    },
  },
  mounted() {
    this.montado = true;
    this.crearImagenTodosVinculos();
    this.crearImagenPosiciones();
    this.crearImagenVinculosSeleccionado();
  },
};
</script>

<style scoped>
.canvas {
  position: absolute;
}
#canvasVinculosSeleccionado {
}
#canvasTodosVinculos {
  z-index: 0;
}
</style>