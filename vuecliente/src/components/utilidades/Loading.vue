<template>
  <div class="loading">
    <img src="@/assets/iconos/loading.png" alt="Cargando" id="iconoLoading" />
    <span v-if="texto" :style="[estiloTexto]" class="textoLoading">{{ texto }}</span>
  </div>
</template>

<script>
export default {
  name: "Loading",
  props: {
    texto: {
      type: String,      
    },
    colorLetra: {
      type: String,
      default: "black",
    },
  },
  computed: {
    estiloTexto() {
      return {
        color: this.colorLetra,
      }
    },
  },
};
</script>

<style scoped>
.loading {
  text-align: center;
  pointer-events: none;
  user-select: none;
  display: flex;
  flex-direction: column;
  justify-items: center;
  align-items: center;
}
#iconoLoading {
  animation: rotacion 0.9s linear infinite;
  width: 20px;
}
.textoLoading {
  text-align: center;
  font-size: 11px;
  font-style: italic;
}

@keyframes rotacion {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>