<template>
  <div class="interpolacion">
    <div id="bloqueIframe">
      <iframe
        id="elIframe"
        ref="elIframe"
        :src="estaInterpolacion.enlaceIframe"
        :style="[altoIframe]"
        frameborder="0"
        v-if="estaInterpolacion.tipo == 'video'"
        v-show="estaInterpolacion.enlaceIframe"
      ></iframe>
    </div>

    <div id="bloqueMensaje">
      <div id="elMensaje">
        {{ estaInterpolacion.mensaje }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Interpolacion",
  props: {
    estaInterpolacion: Object,
  },
  data() {
    return {
      altoIframe: {
        height: "200px",
      },
    };
  },
  mounted() {
    this.$set(
      this.altoIframe,
      "height",
      this.$refs.elIframe.offsetWidth / 1.77 + "px"
    );
  },
};
</script>

<style scoped>
#elIframe {
  width: min(500px, 80%);
  margin: 0px auto;
  display: block;
}
#elMensaje {
  width: 100%;
  font-size: 20px;
  resize: none;
  white-space: pre-wrap;
  margin-top: 15px;
  margin-bottom: 15px;
}
</style>