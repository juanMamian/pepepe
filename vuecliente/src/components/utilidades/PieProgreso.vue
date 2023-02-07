<template>
  <div class="pieProgreso">
    <div id="circuloVacio" :style="[estiloCirculoVacio]">
      <div id="numeroProgreso">{{ progreso.toFixed(cifrasDecimales) }}%</div>
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
    progreso: {
      type: Number,
      default: 0,
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
  },
  data() {
    return {};
  },
  computed: {
    estiloCirculoVacio() {
      return {
        width: this.size + "px",
        height: this.size + "px",
      };
    },
    estiloCanvasProgreso() {
      return {
        width: this.size + "px",
        height: this.size + "px",
      };
    },
  },
  methods: {
    trazarGraph() {
      const lapiz = this.$refs.canvasProgreso.getContext("2d");
      const centroCirculo = Math.round(this.size / 2);
      const progresoRads = ((2 * Math.PI) / 100) * this.progreso - Math.PI / 2;

      lapiz.clearRect(0, 0, this.size, this.size);
      lapiz.beginPath();
      lapiz.strokeStyle = "#04AA6D";
      lapiz.lineWidth = 5;
      lapiz.arc(
        centroCirculo,
        centroCirculo,
        Math.round(centroCirculo * 0.8),
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
  background-color: #f5f5f59c;
  position: relative;
  border-radius: 50%;
}

#numeroProgreso {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 11px;
}
</style>