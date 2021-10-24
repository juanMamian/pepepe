<template>
  <div id="canvasesAtlasProyectos">
    <canvas
      id="canvasTodosVinculos"
      ref="canvasTodosVinculos"     
      class="canvas"
      v-show="mostrandoTodosVinculos"
      :style="[sizeCanvasVista]"
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
      class="canvas"
      v-show="callingPosiciones"
      :style="[sizeCanvasVista]"
    >
    </canvas>
  </div>
</template>

<script>
var debounce =require("debounce");


export default {
  name: "CanvasesAtlasProyectos",
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
      mostrandoTodosVinculos:true,

      // sizeCanvasVista:{
      //   width: '0px',
      //   height: '0px'
      // }
    };
  },
  props: {            
    idNodoSeleccionado: String,
    todosNodos: Array,
    proyectos:Array,    
    centroVista: Object,
    centroDescarga: Object,
    radioDescarga:Number,    
    callingPosiciones:Boolean,
    factorZoom:Number,    
    
  },
  methods: {
    crearImagenPosiciones(){ 
      console.log(`Creando imagen posiciones`);     
      var lapiz=this.$refs.canvasPosiciones.getContext("2d")
      var nodosRelevantes = this.todosNodos;      

      if(this.idNodoSeleccionado) nodosRelevantes=[this.nodoSeleccionado];
      if (nodosRelevantes <= 1) return;
      console.log(`${nodosRelevantes.length} nodos relevantes`);
      lapiz.canvas.width = (this.radioDescarga*2)*this.factorZoom;
      lapiz.canvas.height = (this.radioDescarga*2)*this.factorZoom;
      
      lapiz.clearRect(
        0,
        0,
        lapiz.canvas.width,
        lapiz.canvas.height
      );

      lapiz.lineWidth=2;
      lapiz.beginPath();
      
      var posicionCanvas={
        x:this.centroDescarga.x-this.radioDescarga,
        y:this.centroDescarga.y-this.radioDescarga,
      }
      nodosRelevantes.forEach(nodo=>{
        lapiz.beginPath();
        lapiz.strokeStyle = nodo.stuck?'red':"#9761d2";

        lapiz.moveTo((nodo.coords.x -posicionCanvas.x)*this.factorZoom, (nodo.coords.y-posicionCanvas.y)*this.factorZoom);
        lapiz.lineTo((nodo.centroMasa.x - posicionCanvas.x)*this.factorZoom, (nodo.centroMasa.y - posicionCanvas.y)*this.factorZoom);
        lapiz.arc((nodo.centroMasa.x - posicionCanvas.x)*this.factorZoom, (nodo.centroMasa.y - posicionCanvas.y)*this.factorZoom, 10, 0, Math.PI*2);
        lapiz.stroke();     
     })

     lapiz.beginPath();    
     nodosRelevantes.forEach(nodo=>{
       if(!nodo.stuck){
        lapiz.strokeStyle = 'blue';
        let nodox=(nodo.coords.x - posicionCanvas.x)*this.factorZoom;
        let nodoy=(nodo.coords.y - posicionCanvas.y)*this.factorZoom;
        lapiz.moveTo(nodox, nodoy);
        
        let vectorx=(Math.cos(nodo.angulo)*100);
        let vectory=(Math.sin(nodo.angulo)*100);
        
        lapiz.lineTo(nodox+vectorx, nodoy+vectory);
       }
       
     })
     lapiz.stroke();

    },
    crearImagenTodosVinculos() {
      // var nodosRelevantes=this.todosNodos;            

      // if (nodosRelevantes.length <= 1) return 
      // console.log(`Dibujando todos vínculos con ${nodosRelevantes.length} nodos`);
      // var posicionCanvas={
      //   x:this.centroDescarga.x-this.radioDescarga,
      //   y:this.centroDescarga.y-this.radioDescarga,
      // }
      // var lapiz = this.$refs.canvasTodosVinculos.getContext("2d");
                        
      // lapiz.canvas.width = Math.round((this.radioDescarga*2)*this.factorZoom);
      // lapiz.canvas.height = Math.round((this.radioDescarga*2)*this.factorZoom);

      // // this.$set(this.sizeCanvasVista, 'width', lapiz.canvas.width+'px');
      // // this.$set(this.sizeCanvasVista, 'height', lapiz.canvas.height+'px');
      
      // lapiz.lineWidth = 2;
      // lapiz.clearRect(0, 0, lapiz.canvas.width, lapiz.canvas.height);
      // lapiz.beginPath();
      // lapiz.strokeStyle = "#b3b3b3";
      // for (let nodo of nodosRelevantes) {
      //   for (let vinculo of nodo.vinculos) {
      //     if (!nodosRelevantes.some((n) => n.id == vinculo.idRef)) continue;
      //     if (vinculo.tipo == "requiere") {
      //       this.dibujarLineaEntreNodos(
      //         nodosRelevantes.find((nodo) => nodo.id == vinculo.idRef),
      //         nodo,
      //         lapiz,
      //         posicionCanvas
      //       );
      //     }
      //   }
      // }
      // lapiz.stroke();
      // this.mostrandoTodosVinculos=true;
    },
    crearImagenVinculosSeleccionado: function () {
      var nodosRelevantes = this.todosNodos;

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

      if (nodosRelevantes.some((n) => n.id == this.idNodoSeleccionado)) {
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
        x: Math.round(20*Math.cos(anguloVinculo)),
        y: Math.round(20*Math.sin(anguloVinculo))
      }
      
      let inicio = {
        x: Math.round(((nodoFrom.coords.x+zonaNodo.x)*this.factorZoom) - (posicion.x*this.factorZoom)),
        y: Math.round(((nodoFrom.coords.y+zonaNodo.y)*this.factorZoom) - (posicion.y*this.factorZoom)),
      };
      let final = {
        x: Math.round(((nodoTo.coords.x-zonaNodo.x)*this.factorZoom) - (posicion.x*this.factorZoom)),
        y: Math.round(((nodoTo.coords.y-zonaNodo.y)*this.factorZoom) - (posicion.y*this.factorZoom)),
      };
      
      lapiz.moveTo(inicio.x, inicio.y);
      lapiz.lineTo(final.x, final.y);
      //ahora la flechita
      const centro = {
        x: Math.round((final.x + inicio.x) / 2),
        y: Math.round((final.y + inicio.y) / 2),
      };
      const longitudAla = Math.round(7*this.factorZoom);
                        

      const puntaAlaIzquierda = {
        x: Math.round(centro.x + longitudAla * Math.cos(anguloVinculo - (3 * Math.PI) / 4)),
        y: Math.round(centro.y + longitudAla * Math.sin(anguloVinculo - (3 * Math.PI) / 4)),
      };
      const puntaAlaDerecha = {
        x: Math.round(centro.x + longitudAla * Math.cos(anguloVinculo + (3 * Math.PI) / 4)),
        y: Math.round(centro.y + longitudAla * Math.sin(anguloVinculo + (3 * Math.PI) / 4)),
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
    esquinasCanvasVinculosSeleccionado(){
      var nodosRelevantes=this.todosNodos.filter(n=>n.id==this.idNodoSeleccionado || n.vinculos.some(v=>v.idRef==this.idNodoSeleccionado));

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
    nodoSeleccionado(){
      if(!this.idNodoSeleccionado)return null;
      return this.todosNodos.find(n=>n.id==this.idNodoSeleccionado);
    },
    sizeCanvasVista(){
      return {
        width: Math.round((this.radioDescarga*2)*this.factorZoom)+"px",
        height: Math.round((this.radioDescarga*2)*this.factorZoom)+"px",
      }
    }
  },
  watch: {
    todosNodos () {
      if (this.todosNodos.length < 1) return;
      this.mostrandoTodosVinculos=false;

      this.debTrazarVinculos();
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
    },
    centroDescarga:{
      handler:function(){
        console.log(`Ocultando todos vínculos`);
        this.mostrandoTodosVinculos=false;
      },
      deep:true      
    }
    // callingPosiciones(nuevo){
    //   if(nuevo){
    //     this.crearImagenPosiciones();
    //   }
    // }

  },
  mounted() {
    this.montado = true;
    // this.crearImagenTodosVinculos();
    // this.crearImagenPosiciones();
    // this.crearImagenVinculosSeleccionado();
  },
};
</script>

<style scoped>
#canvasesAtlasProyectos{
}
.canvas {
  position: absolute;
  pointer-events: none;
}

#canvasTodosVinculos {
  z-index: 0;
  top:0px;
  left:0px;

}

#canvasPosiciones {
  z-index: 0;
  top:0px;
  left:0px;
  background-color: rgba(145, 255, 0, 0.295);

}
</style>