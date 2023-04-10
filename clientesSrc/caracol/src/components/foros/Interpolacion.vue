<template>
  <div class="interpolacion">
    <div id="bloqueIframe" v-if="estaInterpolacion.tipo == 'video'">
      <iframe
        id="elIframe"
        ref="elIframe"
        :src="estaInterpolacion.enlaceIframe"
        :style="[altoIframe]"
        frameborder="0"
        v-show="estaInterpolacion.enlaceIframe"
      ></iframe>
    </div>

    <div id="bloqueQuote" v-if="estaInterpolacion.tipo == 'quote'">
      <div id="infoQuote">
        {{ estaInterpolacion.quote.infoAutor.nombres }} escribio:
      </div>
      <div class="quote">
        {{ estaInterpolacion.quote.mensaje }}
        <interpolacion
          v-for="interpolacion of estaInterpolacion.quote.interpolaciones"
          :key="interpolacion.id"
          :estaInterpolacion="interpolacion"
        />
      </div>
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
    if (this.estaInterpolacion.tipo == "video") {
      this.$set(
        this.altoIframe,
        "height",
        this.$refs.elIframe.offsetWidth / 1.77 + "px"
      );
    }
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
#infoQuote {
  font-size: 11px;
  font-style: italic;
  color: gray;
  width: 90%;
  margin: 5px auto;
}

.quote {
  border: 1px solid gray;
  background-color: rgb(197, 144, 107);
  width: 90%;
  margin: 5px auto;
}
</style>