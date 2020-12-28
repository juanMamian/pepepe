<template>
  <div id="app">
    <atlas-conocimiento/>
  </div>
</template>

<script>
import AtlasConocimiento from './components/AtlasConocimiento.vue'

export default {
  name: 'App',
  components: {
    AtlasConocimiento
    
  }
}
</script>

<style>
body{
  margin: 0px;
  width: 100%;
  height: 100vh;
}
#app {
width: 100%;
height: 100%;  
display: grid;
grid-template-rows: 20px 20px 1fr 5px;
row-gap: 5px;
padding-left: 5px;
padding-right: 5px;
box-sizing: border-box;
}
#atlasConocimiento{
  grid-row: 3/4;
  background-color: grey;
}
</style>
