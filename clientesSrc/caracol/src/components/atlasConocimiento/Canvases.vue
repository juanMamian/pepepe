<template>
  <div id="canvases">
    <canvas
      id="canvasTodosVinculos"
      ref="canvasTodosVinculos"
      :style="[offsetCanvasTodosVinculos]"
      class="canvas"
    ></canvas>
    <canvas
      id="canvasVinculosSeleccionado"
      ref="canvasVinculosSeleccionado"
      :style="[offsetCanvasVinculosSeleccionado]"
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
import debounce from 'debounce';


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
    factorZoom:Number,
  },
  methods: {
    crearImagenPosiciones(){
      
      this.lapiz=this.$refs.canvasPosiciones.getContext("2d")
      var nodosRelevantes = this.todosNodos;

      if(this.nodoSeleccionado && this.nodoSeleccionado.id.length>4) nodosRelevantes=[this.nodoSeleccionado];
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
      var nodosRelevantes=this.todosNodos;
      if (this.idNodoTarget) {
        nodosRelevantes = this.todosNodos.filter(n=>this.idsNecesariosParaTarget.includes(n.id) || n.id==this.idNodoTarget);
      }

      if (nodosRelevantes.length <= 1) return 

      var lapiz = this.$refs.canvasTodosVinculos.getContext("2d");
                        
      lapiz.canvas.width = this.esquinasCanvasTodosVinculos.x2 - this.esquinasCanvasTodosVinculos.x1;
      lapiz.canvas.height = this.esquinasCanvasTodosVinculos.y2 - this.esquinasCanvasTodosVinculos.y1;

      const posicionCanvas={
        x: this.esquinasCanvasTodosVinculos.x1,
        y: this.esquinasCanvasTodosVinculos.y1,
      }
      lapiz.lineWidth = 1;
      lapiz.clearRect(0, 0, lapiz.canvas.width, lapiz.canvas.height);
      lapiz.beginPath();
      lapiz.strokeStyle = "#b3b3b3";
      for (let nodo of nodosRelevantes) {
        for (let vinculo of nodo.vinculos) {
          if (!nodosRelevantes.some((n) => n.id == vinculo.idRef)) continue;
          if (vinculo.rol == "source") {
            this.dibujarLineaEntreNodos(
              nodo,
              nodosRelevantes.find((nodo) => nodo.id == vinculo.idRef),
              lapiz,
              posicionCanvas
            );
          }
        }
      }
      lapiz.stroke();
    },
    crearImagenVinculosSeleccionado: function () {

      var nodosRelevantes = this.todosNodos;

      if (this.idNodoTarget) {
        nodosRelevantes = this.todosNodos.filter(n=>this.idsNecesariosParaTarget.includes(n.id) || n.id==this.idNodoTarget);
      }

      if (nodosRelevantes <= 1) return;

      var lapiz = this.$refs.canvasVinculosSeleccionado.getContext("2d");

      lapiz.canvas.width = this.esquinasCanvasVinculosSeleccionado.x2 - this.esquinasCanvasVinculosSeleccionado.x1;
      lapiz.canvas.height = this.esquinasCanvasVinculosSeleccionado.y2 - this.esquinasCanvasVinculosSeleccionado.y1; 

      const posicionCanvas={
        x: this.esquinasCanvasVinculosSeleccionado.x1,
        y: this.esquinasCanvasVinculosSeleccionado.y1,
      }

      lapiz.clearRect(
        0,
        0,
        lapiz.canvas.width,
        lapiz.canvas.height
      );

      

      if (nodosRelevantes.some((n) => n.id == this.nodoSeleccionado.id)) {
        //Lineas verdes de posiblidades
        lapiz.beginPath();
        lapiz.lineWidth = 2;
        lapiz.strokeStyle = "#008000";

        //Lineas verdes de salida
        for (let vinculo of this.nodoSeleccionado.vinculos) {
          if (!nodosRelevantes.some((n) => n.id == vinculo.idRef)) {
            console.log(`ALERTA. Vinculo a ${vinculo.idRef} huerfano`);
            continue;
          }
          if (vinculo.rol == "source") {
            let otroNodo = nodosRelevantes.find((n) => n.id == vinculo.idRef);
            this.dibujarLineaEntreNodos(this.nodoSeleccionado, otroNodo, lapiz, posicionCanvas);
          }
        }
        lapiz.stroke();
        //Lineas rojas de dependencias

        lapiz.beginPath();
        lapiz.strokeStyle = "#b80e0e";
        for (let vinculo of this.nodoSeleccionado.vinculos) {
          if (!nodosRelevantes.some((n) => n.id == vinculo.idRef)) {
            console.log(`ALERTA. Vinculo a ${vinculo.idRef} huerfano`);
            continue;
          }
          if (vinculo.rol == "target") {
            let otroNodo = nodosRelevantes.find((n) => n.id == vinculo.idRef);
            this.dibujarLineaEntreNodos(otroNodo, this.nodoSeleccionado, lapiz, posicionCanvas);
          }
        }
        lapiz.stroke();
      }
    },
    dibujarLineaEntreNodos(nodoFrom, nodoTo, lapiz, posicion) {
      
      var anguloVinculo = Math.atan(
        (nodoTo.coords.y - nodoFrom.coords.y) / (nodoTo.coords.x - nodoFrom.coords.x)
      );

      if (nodoTo.coords.y - nodoFrom.coords.y < 0 && nodoTo.coords.x - nodoFrom.coords.x < 0)
        anguloVinculo += Math.PI;
      if (nodoTo.coords.y - nodoFrom.coords.y > 0 && nodoTo.coords.x - nodoFrom.coords.x < 0)
        anguloVinculo += Math.PI;

      const zonaNodo={
        x: 25*Math.cos(anguloVinculo),
        y: 25*Math.sin(anguloVinculo)
      }
      
      let inicio = {
        x: ((nodoFrom.coords.x+zonaNodo.x)*this.factorZoom) - posicion.x,
        y: ((nodoFrom.coords.y+zonaNodo.y)*this.factorZoom) - posicion.y,
      };
      let final = {
        x: ((nodoTo.coords.x-zonaNodo.x)*this.factorZoom) - posicion.x,
        y: ((nodoTo.coords.y-zonaNodo.y)*this.factorZoom) - posicion.y,
      };

      

      lapiz.moveTo(inicio.x, inicio.y);
      lapiz.lineTo(final.x, final.y);
      //ahora la flechita
      const centro = {
        x: (final.x + inicio.x) / 2,
        y: (final.y + inicio.y) / 2,
      };
      const longitudAla = parseInt(7*this.factorZoom);
            

      
      //anguloVinculo=anguloVinculo*180/Math.PI;

      const puntaAlaIzquierda = {
        x: centro.x + longitudAla * Math.cos(anguloVinculo - (3 * Math.PI) / 4),
        y: centro.y + longitudAla * Math.sin(anguloVinculo - (3 * Math.PI) / 4),
      };
      const puntaAlaDerecha = {
        x: centro.x + longitudAla * Math.cos(anguloVinculo + (3 * Math.PI) / 4),
        y: centro.y + longitudAla * Math.sin(anguloVinculo + (3 * Math.PI) / 4),
      };
      lapiz.moveTo(centro.x, centro.y);
      lapiz.lineTo(puntaAlaIzquierda.x, puntaAlaIzquierda.y);
      lapiz.moveTo(centro.x, centro.y);
      lapiz.lineTo(puntaAlaDerecha.x, puntaAlaDerecha.y);
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
    debTrazarVinculos:debounce(function(){
      this.crearImagenTodosVinculos();
    }, 1000)
  },
  computed: {
    esquinasCanvasTodosVinculos(){
      var nodosRelevantes=this.todosNodos;

      if (this.idNodoTarget) {
        nodosRelevantes = this.todosNodos.filter(n=>this.idsNecesariosParaTarget.includes(n.id) || n.id==this.idNodoTarget);
      }

      if (nodosRelevantes.length <= 1) return {
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0,        
      };

      let bordes = {};
      bordes.top = nodosRelevantes.reduce((acc, n) => {
        //console.log(`Reduciendo ${n.nombre} con coords: ${n.posicion}`);
        return n.coords.y > acc ? n.coords.y : acc;
      }, 0);
      bordes.bot = nodosRelevantes.reduce((acc, n) => {
        return n.coords.y < acc ? n.coords.y : acc;
      }, 0);
      bordes.left = nodosRelevantes.reduce((acc, n) => {
        return n.coords.x < acc ? n.coords.x : acc;
      }, 0);
      bordes.right = nodosRelevantes.reduce((acc, n) => {
        return n.coords.x > acc ? n.coords.x : acc;
      }, 0);

      return {
        x1: bordes.left*this.factorZoom,
        y1: bordes.bot*this.factorZoom,
        x2: bordes.right*this.factorZoom,
        y2: bordes.top*this.factorZoom
      }
    },
    offsetCanvasTodosVinculos(){
      return {
        left:  this.esquinasCanvasTodosVinculos.x1 + "px",
        top: this.esquinasCanvasTodosVinculos.y1 + "px",

        width: (this.esquinasCanvasTodosVinculos.x2-this.esquinasCanvasTodosVinculos.x1) + "px",
        height: (this.esquinasCanvasTodosVinculos.y2-this.esquinasCanvasTodosVinculos.y1) + "px",
      }
    },
    esquinasCanvasVinculosSeleccionado(){
      var nodosRelevantes=this.todosNodos.filter(n=>n.id==this.nodoSeleccionado.id || n.vinculos.some(v=>v.idRef==this.nodoSeleccionado.id));

      if (this.idNodoTarget) {
        nodosRelevantes = nodosRelevantes.filter(n=>this.idsNecesariosParaTarget.includes(n.id) || n.id==this.idNodoTarget);
      }

      if (nodosRelevantes.length <= 1) return {
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0,        
      };

      let bordes = {};
      bordes.top = nodosRelevantes.reduce((acc, n) => {
        //console.log(`Reduciendo ${n.nombre} con coords: ${n.posicion}`);
        return n.coords.y > acc ? n.coords.y : acc;
      }, 0);
      bordes.bot = nodosRelevantes.reduce((acc, n) => {
        return n.coords.y < acc ? n.coords.y : acc;
      }, 0);
      bordes.left = nodosRelevantes.reduce((acc, n) => {
        return n.coords.x < acc ? n.coords.x : acc;
      }, 0);
      bordes.right = nodosRelevantes.reduce((acc, n) => {
        return n.coords.x > acc ? n.coords.x : acc;
      }, 0);

      return {
        x1: bordes.left*this.factorZoom,
        y1: bordes.bot*this.factorZoom,
        x2: bordes.right*this.factorZoom,
        y2: bordes.top*this.factorZoom
      }
    },
    offsetCanvasVinculosSeleccionado(){
      return {
        left:  this.esquinasCanvasVinculosSeleccionado.x1 + "px",
        top: this.esquinasCanvasVinculosSeleccionado.y1 + "px",

        width: (this.esquinasCanvasVinculosSeleccionado.x2-this.esquinasCanvasVinculosSeleccionado.x1) + "px",
        height: (this.esquinasCanvasVinculosSeleccionado.y2-this.esquinasCanvasVinculosSeleccionado.y1) + "px",
      }
    },
    sizeCanvasTodosVinculos(){
      var nodosRelevantes = this.todosNodos;
      if (this.idNodoTarget) {
        nodosRelevantes = this.todosNodos.filter(n=>this.idsNecesariosParaTarget.includes(n.id) || n.id==this.idNodoTarget);
      }

      if (nodosRelevantes.length <= 1) return {
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
    factorZoom(){
      this.debTrazarVinculos();
    }
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

#canvasTodosVinculos {
  z-index: 0;
}
</style>