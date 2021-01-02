<template>
  <canvas id="canvasVinculos"></canvas>
</template>

<script>
export default {
  name: "CanvasVinculos",
  data() {
    return {
      montado: false,
    };
  },
  props: {
    nodoSeleccionado: {
      type:Object,
      default(){
        return{
          id:"-1",
          vinculos:[]
        }
      }
    },
    nodoRelevante: [Object],
    todosNodos: Array,
    centroVista: Object,
    actualizar: Number,
  },
  methods: {
    dibujarVinculos() {
      this.$el.width = this.$el.offsetWidth;
      this.$el.height = this.$el.offsetHeight;

      this.ctx.lineWidth = 2;
      this.ctx.strokeStyle = "#888888";
      this.ctx.clearRect(0, 0, this.$el.width, this.$el.height);

      this.ctx.beginPath();
      
      if (Array.isArray(this.nodoSeleccionado.vinculos)) {
      
        for (let vinculo of this.nodoSeleccionado.vinculos) {      
          if (vinculo.rol == "source") {
            this.dibujarLineaEntreNodos(
              this.nodoSeleccionado,
              this.todosNodos.find((nodo) => nodo.id == vinculo.idRef)
            );
          } else if (vinculo.rol == "target") {
            this.dibujarLineaEntreNodos(
              this.todosNodos.find((nodo) => nodo.id == vinculo.idRef),
              this.nodoSeleccionado
            );
          }
        }
      }
      this.ctx.stroke();
    },
    dibujarLineaEntreNodos(nodoFrom, nodoTo) {
      let inicio = {
        x: nodoFrom.coordsManuales.x - this.centroVista.x,
        y: nodoFrom.coordsManuales.y - this.centroVista.y,
      };
      let final = {
        x: nodoTo.coordsManuales.x - this.centroVista.x,
        y: nodoTo.coordsManuales.y - this.centroVista.y,
      };
      
      this.ctx.moveTo(inicio.x, inicio.y);
      this.ctx.lineTo(final.x, final.y);
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
      this.ctx.moveTo(centro.x, centro.y);
      this.ctx.lineTo(puntaAlaIzquierda.x, puntaAlaIzquierda.y);
      this.ctx.moveTo(centro.x, centro.y);
      this.ctx.lineTo(puntaAlaDerecha.x, puntaAlaDerecha.y);
    },
  },
  watch: {
    actualizar: function () {
      console.log(`actualizandoVinculos. Nodo seleccionado: ${this.nodoSeleccionado.id}`);
      this.dibujarVinculos();
    },
  },
  mounted() {
    this.ctx = this.$el.getContext("2d");
    this.montado = true;
  },
};
</script>

<style>
</style>