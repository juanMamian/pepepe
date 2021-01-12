<template>
  <div class="actividadProfe">
      <div id="nombre">{{estaActividad.nombre}}</div>
  </div>

</template>

<script>
export default {
name:"ActividadProfe",
apollo:{

},
props:{
    estaActividad:Object
}
}
</script>

<style>

.actividadProfe{
    border: 2px solid rgb(219, 214, 219);
    padding: 5px 15px;
}

#nombre {
  padding-top: 10px;
  padding-bottom: 10px;
  margin-top: 10px;
  text-align: center;
  font-weight: bold;
  font-size: 18px;
}


</style>