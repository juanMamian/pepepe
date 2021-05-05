<template>
  <div class="cuadroTexto" :style="[estiloFormato, estiloLayout]">
    <div class="texto" >
        {{esteCuadroTexto.texto}}
    </div>
  </div>
</template>

<script>
export default {
  name: "CuadroTexto",
  props: {
    esteCuadroTexto: Object,
  },
  computed: {
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
</style>