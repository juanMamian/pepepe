<template>
  <div id="herramientasEdicion">
    <img
      src="@/assets/iconos/puntero.png"
      class="bHerramientasEdicion"
      :class="{hSeleccionada:herramientaSeleccionada=='puntero'}"
      @click.stop="
        $emit('puntero');
        herramientaSeleccionada = 'puntero';
      "
      @mousedown.stop=""
    />
    <img
      src="@/assets/iconos/texto.png"
      class="bHerramientasEdicion"
      :class="{hSeleccionada:herramientaSeleccionada=='texto'}"
      @click.stop="
        $emit('creacionTexto');
        herramientaSeleccionada = 'texto';
      "
      @mousedown.stop=""
    />
    <img
      src="@/assets/iconos/imagen.png"
      class="bHerramientasEdicion"
      :class="{hSeleccionada:herramientaSeleccionada=='imagen'}"
      @click.stop="
        $emit('creacionImagen');
        herramientaSeleccionada = 'imagen';
      "
      @mousedown.stop=""
    />

  </div>
</template>

<script>
export default {
  name: "HerramientasEdicion",
  data() {
    return {
      herramientaSeleccionada: 'puntero',
    };
  },
  methods:{
      reset(){
          this.herramientaSeleccionada='puntero';
      }
  }
};
</script>

<style scoped>
#herramientasEdicion {
  padding: 20px 10px;
  background-color: rgb(185, 126, 185);
  border: 2px solid rgb(46, 0, 46);
  user-select: none;
}
.bHerramientasEdicion {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  padding: 5px;
  cursor: pointer;
  display: block;
  margin:2px 0px;
}
.bHerramientasEdicion:hover {
  background-color: rgba(128, 0, 128, 0.507);
}
.hSeleccionada{
  background-color: rgba(128, 0, 128, 0.507);
}
</style>