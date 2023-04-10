<template>
  <div class="pieProgreso">
    <div id="circuloVacio" :style="[estiloCirculoVacio]">
      <div id="contenidoExterno">
        <slot>
  
        </slot>
      </div>
      <div id="numeroProgreso" v-if="mostrarNumero" :style="[estiloNumero]">
        <span v-if="progreso">{{ progreso.toFixed(cifrasDecimales) }} </span>
        <!-- <span id="simboloPorcentaje" >%</span> -->

      </div>
      <canvas
        id="canvasProgreso"
        ref="canvasProgreso"
        :width="size"
        :height="size"
        :style="[estiloCanvasProgreso]"
      >
      </canvas>
    </div>
  </div>
</template>

<script>
export default {
  name: "PieProgreso",
  props: {
    colorProgreso:{
      type: String,
      default: '#3f7d20'
    },
    mostrarNumero:{
      type: Boolean,
      default: true
    },
    progreso: {
      type: Number,
      default: 0,
    },
    factorArco:{
      type: Number,
      default: 0.12,
    },
    cifrasDecimales: {
      type: Number,
      default() {
        return 0;
      },
    },
    size: {
      type: Number,
      default: 40,
    },
    colorFondo:{
      type: String,
      default: 'transparent'
    }
  },
  data() {
    return {};
  },
  computed: {
    estiloCirculoVacio() {
      return {
        width: this.size + "px",
        height: this.size + "px",
        backgroundColor: this.colorFondo
      };
    },
    estiloCanvasProgreso() {
      return {
        width: this.size + "px",
        height: this.size + "px",
      };
    },
    estiloNumero(){
      let fSize=70;

      if(this.progreso>=100){
        fSize=60;
      }

      return{
        fontSize: fSize+'%'
      }
    }
  },
  methods: {
    trazarGraph() {
      const lapiz = this.$refs.canvasProgreso.getContext("2d");
      const radioCirculo = Math.round(this.size / 2);
      const progresoRads = ((2 * Math.PI) / 100) * this.progreso - Math.PI / 2;

      lapiz.clearRect(0, 0, this.size, this.size);
      lapiz.beginPath();
      lapiz.strokeStyle = this.colorProgreso || "#04AA6D";
      lapiz.lineWidth = Math.round(this.size * this.factorArco);
      lapiz.arc(
        radioCirculo,
        radioCirculo,
        Math.round(radioCirculo * (1-this.factorArco)),
        -(Math.PI / 2),
        progresoRads
      );

      lapiz.stroke();
    },
  },
  watch: {
    progreso() {
      this.trazarGraph();
    },
  },
  mounted() {
    this.trazarGraph();
  },
};
</script>

<style scoped>
#circuloVacio {
  position: relative;
  border-radius: 50%;
}

#numeroProgreso {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 60%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

#contenidoExterno{
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

#simboloPorcentaje{
  font-size: 40%;
}
</style>