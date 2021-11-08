<template>
  <div class="cuadroTexto" :style="[estiloFormato, estiloLayout]">
    <div class="texto" ref="texto" :style="[estiloFontSize]">
      {{ esteCuadroTexto.texto }}
    </div>
    <div
      class="textoDummy"
      :style="[estiloFormato, estiloDummy]"
      ref="textoDummy"
    >
      {{ esteCuadroTexto.texto }}
    </div>
  </div>
</template>

<script>
export default {
  name: "CuadroTexto",
  props: {
    esteCuadroTexto: Object,
  },
  data() {
    return {
      fontSizeDummy: 10,
      fontSizeTexto: 10,
    };
  },
  computed: {
    estiloDummy() {
      return {
        fontSize: this.fontSizeDummy + "px",
      };
    },
    estiloFontSize() {
      return {
        fontSize: this.fontSizeTexto + "px",
      };
    },
    estiloFormato() {
      return {
        textAlign: this.esteCuadroTexto.formato.alineacion,
        color: this.esteCuadroTexto.formato.colorLetra,
        fontFamily:
          this.esteCuadroTexto.formato.tipoLetra + ", 'Nunito', sans-serif",
      };
    },
    estiloLayout() {
      return {
        top: this.esteCuadroTexto.posicion.y + "%",
        left: this.esteCuadroTexto.posicion.x + "%",

        width: this.esteCuadroTexto.size.x + "%",
        height: this.esteCuadroTexto.size.y + "%",

        zIndex: this.esteCuadroTexto.posicionZeta,
      };
    },
  },
  methods: {
    findFontSize() {
      if (
        !this.esteCuadroTexto ||
        !this.esteCuadroTexto.texto ||
        this.esteCuadroTexto.texto.length < 1
      )
        return;
      let hTexto = this.$refs.texto.offsetHeight;
      let hDummy = this.$refs.textoDummy.offsetHeight;
      let wDummy = this.$refs.textoDummy.scrollWidth;
      let wTexto = this.$refs.texto.offsetWidth;
      // if (!confirm("continuar")) {
      //   return;
      // }

      if (hDummy >= hTexto || wDummy >= wTexto) {
        console.log(`Reduciendo font size`);
        this.fontSizeDummy = this.fontSizeDummy - 2;
        this.$nextTick(() => {
          let hTexto = this.$refs.texto.offsetHeight;
          let hDummy = this.$refs.textoDummy.offsetHeight;
          let wDummy = this.$refs.textoDummy.scrollWidth;
          let wTexto = this.$refs.texto.offsetWidth;

          if ((hDummy < hTexto && wDummy < wTexto) || this.fontSizeDummy < 5) {
            this.fontSizeTexto = this.fontSizeDummy;
            this.fontSizeInput = this.fontSizeDummy;
            return;
          } else {
            this.findFontSize();
          }
        });
      } else if (hDummy < hTexto && wDummy < wTexto) {
        console.log(`Aumentando font size`);

        this.fontSizeDummy = this.fontSizeDummy + 2;
        this.$nextTick(() => {
          let hTexto = this.$refs.texto.offsetHeight;
          let hDummy = this.$refs.textoDummy.offsetHeight;
          let wDummy = this.$refs.textoDummy.scrollWidth;
          let wTexto = this.$refs.texto.offsetWidth;

          if (
            hDummy >= hTexto ||
            wDummy >= wTexto ||
            this.fontSizeDummy > 100
          ) {
            this.fontSizeDummy = this.fontSizeDummy - 2;

            this.fontSizeTexto = this.fontSizeDummy;
            this.fontSizeInput = this.fontSizeDummy;

            return;
          } else {
            this.findFontSize();
          }
        });
      }
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.findFontSize();
    });
  },
};
</script>

<style>
.cuadroTexto {
  position: absolute;
}
.texto {
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  white-space: pre-wrap;
}

.textoDummy {
  width: 99%;
  border: 1px solid pink;
  overflow-x: scroll;
  position: absolute;
  left: -100%;
  pointer-events: none;
  white-space: pre-wrap;
  visibility: hidden;
}
</style>