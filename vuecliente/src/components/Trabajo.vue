<template>
  <div id="trabajo">{{esteTrabajo.nombre}}</div>
</template>

<script>
export default {
  name: "Trabajo",
  props: {
    esteTrabajo: Object,
  },
};
</script>

<style scoped>
</style>