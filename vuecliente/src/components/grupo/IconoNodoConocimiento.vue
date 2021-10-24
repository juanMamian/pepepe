<template>
  <div class="iconoNodoConocimiento">
    <img
      id="icono"
      :src="this.serverUrl + '/api/atlas/iconos/' + esteNodo.id"
      alt=""
    />
    <div id="nombre">{{ esteNodo.nombre }}</div>

    <div id="menuCx">
      <div class="botonMenuCx" id="verContenido">Entrar</div>
      <div class="botonMenuCx" id="verEnAtlas">Ver en atlas</div>
    </div>
  </div>
</template>

<script>
export default {
  name: "IconoNodoConocimiento",
  props: {
    esteNodo: Object,
  },
};
</script>

<style scoped>
.iconoNodoConocimiento {
  width: 50px;
  height: 50px;
}
#icono {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  position: absolute;
  pointer-events: none;
}
#menuCx {
  position: absolute;
  background-color: rgb(177, 177, 159);
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.2),
    0 1px 5px 0 rgba(0, 0, 0, 0.12);
}
.botonMenuCx {
  font-size: 12px;
  padding: 3px 8px;
  cursor: pointer;
}
</style>