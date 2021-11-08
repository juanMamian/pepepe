<template>
  <div
    class="cuadroImagen"
    :style="[estiloLayout]"
    @click="playAudio"
    :class="{
      conAudio: esteCuadroImagen.audio,
    }"
  >
    <img src="@/assets/iconos/loading.png" alt="Cargando" class="simboloLoading" v-if="imagenLoaded==false">

    <img
      :src="urlImagen + '?v=' + versionImagen"
      alt="ilustracion"
      draggable="false"
      class="imagenContenido"
      @load="imagenLoaded=true"      
    />


    <audio type="audio/ogg" v-if="esteCuadroImagen.audio" ref="audio">
      <source :src="urlAudio" type="audio/ogg" />
    </audio>
  </div>
</template>

<script>

export default {
  name: "cuadroImagen",
  props: {
    esteCuadroImagen: Object,
    idLibro: String,
    idPagina: String,
    sizePagina: Object,
  },
  data() {
    return {
      versionImagen: 0,
      imagenLoaded:false,
    };
  },
  computed: {
    estiloLayout() {
      return {
        top: this.esteCuadroImagen.posicion.y + "%",
        left: this.esteCuadroImagen.posicion.x + "%",

        width: this.esteCuadroImagen.size.x + "%",
        height: this.esteCuadroImagen.size.y + "%",

        zIndex: this.esteCuadroImagen.posicionZeta,
      };
    },
    urlImagen() {
      return (
        this.serverUrl +
        "/apiCuentos/imagenCuento/" +
        this.idLibro +
        "/" +
        this.idPagina +
        "/" +
        this.esteCuadroImagen.id
      );
    },   
    urlAudio() {
      return (
        this.serverUrl +
        "/apiCuentos/audioImagen/" +
        this.idLibro +
        "/" +
        this.idPagina +
        "/" +
        this.esteCuadroImagen.id
      );
    },
  },
  methods: {
    playAudio() {
      if (!this.esteCuadroImagen.audio) return;
      this.$refs.audio.play();
    },    
  },  
 
};
</script>

<style scoped>
.cuadroImagen {
  position: absolute;
}

.imagenContenido {
  width: 100%;
  height: 100%;
  user-select: none;
  z-index: 0;
  pointer-events: none;
}

.conAudio {
  cursor: pointer;
}

.enDuda {
  color: purple;
}


.simboloLoading{
  width: 50px;
  height: 50px;
  animation: girar 1.5s;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
  pointer-events: none;
  user-select: none;
  position: absolute;
  top:50%;
  left:50%;
  transform: translate(-50% -50%);
  z-index: -1;
}

@keyframes girar{
  0%{transform: rotateZ(0deg);}
  100%{transform: rotateZ(360deg);}
}
</style>