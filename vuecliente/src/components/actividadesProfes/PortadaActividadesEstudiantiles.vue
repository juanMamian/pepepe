<template>
  <div class="portadaActividadesEstudiantiles">
    <div id="cuadroCentro">
      <center><h3 id="titulo">¡Hola!</h3></center>
      <p>Selecciona uno de tus profes para ver las actividades que te ha enviado</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "PortadaActividadesEstudiantiles",
  data() {
    let mensaje = "Escoje una";
    return {
      mensaje,
    };
  },
};
</script>

<style scoped>
.portadaActividadesEstudiantiles {
  display: grid;
  grid-template-columns: 1fr min(90%, 500px) 1fr;
  grid-template-rows: 1fr minmax(20%, 300px) 1fr;
  grid-template-areas:
    "...... ..... ......"
    "....... centro ......"
    "....... ........ ......";
}
#cuadroCentro {
    grid-area: centro;
    border:2px solid orangered;
    background-color: rgb(243 213 176);
    padding: 10px 20px;
    border-radius: 10px;
    text-align: center;
    font-size: 25px;
}
</style>