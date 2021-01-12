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
    <div id="nombres">{{estaPersona.nombres}}</div>
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
  margin-bottom: 20px;

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

#nombres{
  position: absolute;
  top: 105%;
  left:50%;
  transform: translateX(-50%);
  text-align: center;
}
</style>