<template>
  <div class="loading">
    <span class="textoLoading">{{ texto }}</span>
  </div>
</template>

<script>
export default {
name:"Loading",
props:{
    texto:{
        type:String,
        default:"Cargando..."
    }
}
}
</script>

<style scoped>
.loading {
  text-align: center;
  pointer-events: none;
  user-select: none;
}
.textoLoading {
  text-align: center;
  font-size: 11px;
  font-style: italic;
  border-radius: 10px;
  border: 2px solid purple;
  padding: 3px 5px;
  background-color: rgba(128, 0, 128, 0.192);
  box-shadow: 2px 2px 2px 2px rgb(190, 190, 190);
  animation-name: parpadeo;
  animation-duration: 2s;
  animation-iteration-count: infinite;
}

@keyframes parpadeo{
    0% {opacity:0.3}
    50%{opacity:0.9}
    100% {opacity:0.3}
}
</style>