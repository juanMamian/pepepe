<template>
  <div id="navBar">
      <div class="botonNav" id="navHome">Home</div>
      <div class="botonNav" id="navAtlas">Atlas de Conocimiento</div>
      <div class="botonNav" id="navProyectos">Proyectos</div>
      <div class="botonNav" id="navTrabajos">Trabajos</div>
      <div class="botonNav" id="navLogin">Login</div>
      

  </div>
</template>

<script>
export default {
    name:"NavBar"

}
</script>

<style>
#navBar{
    display: flex;
}
.botonNav{
    padding-left: 5px;
    padding-right: 5px;
    cursor: pointer;
    user-select: none;
    font-size: 1.2rem;
    font-family: helvetica;
}
#navLogin{
    margin-left: auto;
}
</style>