<template>
  <div id="visorNodoConocimiento">
    <div id="layout">
      <div id="barraLateral"></div>
      <iframe id="visor" :src="direccionNodo"></iframe>
    </div>
  </div>
</template>

<script>
export default {
  name: "VisorNodoConocimiento",
  computed: {
    direccionNodo: function () {
      return (
        this.serverUrl +
        "/atlas/contenidosNodos/" +
        this.$route.params.idNodo
      );
    },
  },
  mounted() {
    console.log(`data server addres:: ${this.serverUrl}`);
  },
};
</script>

<style scoped>
#layout {
  width: 100%;
  height: 100%;

  display: grid;
  grid-template-columns: 250px 1fr;
}

#barraLateral {
  grid-column: 1/2;
}

#visor {
  grid-column: 2/3;
  width: 100%;
  height: 100%;
}
</style>
