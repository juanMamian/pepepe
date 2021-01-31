<template>
  <div class="creadorConversacion">
    <div id="nombreAccion">Creando una nueva conversacion</div>
    <div id="zonaTitulo">
      <input
        type="text"
        v-model="titulo"
        id="inputTitulo"
        placeholder="Titulo de la conversación"
      />
    </div>
    <div id="zonaContenido">
      <textarea
        v-model="mensaje"
        placeholder="Escribe un mensaje"
        id="inputMensaje"
      />
    </div>
    <div id="controles">
      <div class="controles hoverGris" id="bFinalizar" @click="finalizar">
        Finalizar
      </div>
    </div>
  </div>
</template>

<script>
var charProhibidosMensaje = /[^\n\r a-zA-ZÀ-ž0-9_():;.,+¡!¿?@=-]/;
const charProhibidosTitulo = /[^ a-zA-ZÀ-ž0-9_():.,-]/;

export default {
  name: "CreadorConversacion",
  data() {
    return {
      titulo: null,
      mensaje: null,
    };
  },
  methods: {
    finalizar() {
        if(this.tituloIlegal || this.mensajeIlegal){
            return
        }
      let conversacion = {
        titulo: this.titulo,
      };
      let primeraRespuesta = {
        mensaje: this.mensaje,
      };
      this.$emit("crearConversacion", { conversacion, primeraRespuesta });
    },
  },
  computed: {
    tituloIlegal() {
      if (!this.titulo ||this.titulo.length < 1) {
        return true;
      }
      if (charProhibidosTitulo.test(this.titulo)) {
        return true;
      }
      return false;
    },
    mensajeIlegal() {
      if (!this.mensaje || this.mensaje.length < 1) {
        return true;
      }
      if (charProhibidosMensaje.test(this.mensaje)) {
        return true;
      }
      return false;
    },
  },
};
</script>

<style scoped>
.creadorConversacion {
  width: 90%;
  border-radius: 5px;
  border: 2px solid teal;
  margin: 2px auto;
  background-color: rgb(180, 211, 211);
  padding: 5px 15px;
}
#nombreAccion {
  text-align: center;
  font-size: 19px;
  padding: 5px 10px;
}

#inputTitulo {
  font-size: 18px;
  width: 500px;
  margin-bottom: 15px;
}
#inputMensaje {
  font-size: 16px;
  width: 90%;
  min-height: 150px;
}
.controles {
  cursor: pointer;
  padding: 3px;
}
</style>