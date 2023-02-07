<template>
  <div class="selectorConjunto" :class="{seleccionado}">
    <div id="zonaIcono">
      <img
        src="@/assets/iconos/userNodes.png"
        alt="Coleccion"
        style="height: 30px"
      />
    </div>

    <div id="zonaInformacion">
      <div id="nombre">
        {{ estaColeccion.nombre }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "SelectorConjunto",
  props: {
    seleccionado: Boolean,
    estaColeccion:Object,
  },
  data() {
    return {};
  },
};
</script>

<style scoped>
.selectorConjunto {
  display: flex;
  gap: 10px;
  align-items: center;
  width: min(200px, 90vw);
  min-height: 100px;
  padding: 10px 20px;
  border-radius: 15px;
    background-color: var(--atlasConocimientoAvailable);
}
.selectorConjunto.seleccionado{
    border: 2px solid var(--atlasConocimientoSeleccion);
}
#zonaInformacion{
    display: flex;
    justify-content: center;
    align-items: center;
    flex-grow: 1;
}
</style>