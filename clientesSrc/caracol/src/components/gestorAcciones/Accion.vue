<template lang="">
  <div class="accion" :class="[estaAccion.tipo]">
    <div id="barraPrincipal">
      <div id="icono">
        <img src="@/assets/iconos/equis.svg" alt="Error" v-if="estaAccion.tipo==='error'" />
      </div>
      <div id="mensaje">
        {{ estaAccion.mensaje }}
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "accion",
  props: {
    estaAccion: {
      type: Object,
      required: true,
    },
  },
};
</script>
<style scoped>
.accion {
    padding: 5px 10px;
}

.accion.error {
}

.accion #barraPrincipal {
  display: flex;
  gap: 10px;
  align-items: center;
}
</style>
