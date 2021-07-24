<template>
  <div id="panelConfiguracionAtlas">
      <img
      src="@/assets/iconos/settings.png"
      alt="Configuración"
      title="Configuración"
      id="grabber"
      @click.stop="abierto = !abierto"      
    />

    <div id="configuracionesGenerales">
        <div class="configuracionGeneral">
            <img src="@/assets/iconos/student.png" alt="Estudiante" title="Cambiar a modo estudiante">
            <img src="@/assets/iconos/clase.png" alt="Experto" title="Cambiar a modo experto">
        </div>
    </div>
  </div>
</template>

<script>
export default {

}
</script>

<style>

</style>