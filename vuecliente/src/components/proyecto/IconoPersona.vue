<template>
  <div
    class="iconoPersona"
    :class="{ yo: soyYo }"
  >
    <img
      id="fotografia"
      :src="this.serverUrl + '/api/usuarios/fotografias/' + estaPersona.id"
      alt=""
    />
  </div>
</template>

<script>
export default {
  name: "IconoPersona",
  data() {
    return {
      
    };
  },
  props: {
    estaPersona: Object,
    aceptado: Boolean,
  },
  computed: {
    soyYo: function () {
      return this.$store.state.usuario.id == this.estaPersona.id ? true : false;
    },
  },
};
</script>

<style scoped>
.iconoPersona {
  cursor: pointer;
  position: relative;
  border-radius: 50%;
  user-select: none;
  width: 70px;
  height: 70px;
}

#fotografia {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  position: absolute;
  pointer-events: none;
}

.yo {
  border: 2px solid purple;
}
</style>