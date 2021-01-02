<template>
  <div id="app">
    <login-area/>
    <atlas-conocimiento />
  </div>
</template>

<script>
import AtlasConocimiento from "./components/AtlasConocimiento.vue";
import LoginArea from './components/LoginArea.vue';

export default {
  name: "App",
  components: {
    AtlasConocimiento,
    LoginArea,
  },
};
</script>

<style>
body {
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
#atlasConocimiento {
  grid-row: 3/4;
  background: #edebe9 linear-gradient(to bottom, #dbd7d1, #edebe9 116px)
    no-repeat;
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.2),
    0 1px 5px 0 rgba(0, 0, 0, 0.12);
}
</style>
