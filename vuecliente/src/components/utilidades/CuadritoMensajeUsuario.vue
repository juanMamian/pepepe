<template>
  <div class="cuadritoMensajeUsuario" :class="{ mostrar }">
    <div class="boton" id="botonDismiss">
      <img
        src="@/assets/iconos/equis.svg"
        alt="Equis"
        style=""
        @click="dismiss"
      />
    </div>
    <div id="mensaje" v-if="mensajes && mensajes.length > 0">
      {{ mensajes[mensajes.length - 1] }}
    </div>
  </div>
</template>

<script>
export default {
  name: "CuadritoMensajeUsuario",
  props: {
    mensajes: Array,
  },
  data() {
    return {
      mostrar: false,
      idOcultador:null,
    };
  },
  methods: {
    dismiss() {
      this.mostrar = false;
    },
  },
  watch: {
    mensajes() {
      this.mostrar = true;
      this.idOcultador=setTimeout(()=>{
        this.mostrar=false;
      }, 6000)
    },
  },
};
</script>

<style scoped>
.cuadritoMensajeUsuario {
  border: 2px solid var(--mainColorDark);
  border-radius: 10px;
  background-color: var(--mainColor);
  font-size: 12px;
  padding: 5px 5px;
  position: fixed;
  bottom: -100%;
  left: 50%;
  transform: translateX(-50%);
  transition: bottom 0.3s;
}
.cuadritoMensajeUsuario.mostrar {
  bottom: 50px;
}
.cuadritoMensajeUsuario:not(.mostrar) {
  bottom: -100%;
}

#botonDismiss {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background-color: whitesmoke;
  position: absolute;
  top: 0px;
  right: 0px;
  transform: translate(50%, -50%);
}
</style>