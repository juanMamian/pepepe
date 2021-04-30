<template>
  <div class="iconoNodoConocimiento">
    <img
      src="@/assets/iconos/target.png"
      alt="Objetivo"
      v-show="esTarget"
      class="imagenTarget"
    />
    <img
      :src="this.serverUrl + '/api/atlas/iconos/' + esteNodo.id"
      alt=""
      class="iconoNodo"
      ref="iconoNodo"
    />
    <div id="nombre" ref="nombre">
      {{ esteNodo.nombre }}
    </div>
  </div>
</template>

<script>
export default {
  name: "IconoNodoConocimiento",
  data() {
    return {};
  },
  props:{
      esteNodo:Object,
      esTarget:Boolean
  }
};
</script>

<style scoped>

.iconoNodo {
  position: absolute;
  top: 0px;
  left: 0px;
  pointer-events: none;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
  box-shadow: 2px 2px 2px 2px grey;
  border-radius: 50%;
  user-select: none;
}
.iconoNodoConocimiento {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-size: 100% 100%;
  cursor: pointer;  
  position: relative;
  pointer-events: all;
  background-color: rgba(128, 128, 128, 0.349);
}
#nombre {
  font-size: 12px;
  position: absolute;
  top: 105%;
  min-height: 10px;
  min-width: 20px;
  text-align: center;
  /* width: 160%; */
  padding: 5px;
  left: 50%;
  transform: translateX(-50%);
  border: 1px solid rgb(5, 102, 109);
  border-radius: 3px;
}
#nombre:not(.nombreSeleccionado){
  background-color: lightblue;

}
.nombreSeleccionado{
  background-color: rgb(108, 179, 202);
}
#menuContextual {
  position: absolute;
  top: 110%;
  left: 110%;
  min-width: 140px;
  padding: 5px;
  z-index: 10;
  background-color: rgb(177, 177, 159);
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.2),
    0 1px 5px 0 rgba(0, 0, 0, 0.12);
}
.botonMenuCx {
  cursor: pointer;
  font-size: 14px;
}
.seccionMenuCx {
  font-size: 15px;
  color: rgb(71, 71, 71);
}
.botonMenuCx:hover {
  background-color: gray;
}

.imagenTarget{
  width: 180%;
  position:absolute;
  top: -40%;
  left: -40%;
  z-index: 10;
  opacity: 0.86;

}
</style>