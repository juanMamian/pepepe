<template>
  <div class="cuadroResponder">
      <div id="barraSuperior">
    <img
      src="@/assets/iconos/mensaje.png"
      alt="Contestar"
      title="Contestar en esta conversación"
      id="imgMensaje"
    />
    <span id="tituloCuadro">Envía una respuesta</span>
    </div>
    <textarea
      name="inputMensaje"
      id="inputMensaje"
      :class="{letrasRojas:mensajeIlegal}"
      v-model="mensaje"
      placeholder="Escribe aquí tu respuesta"
    ></textarea>

    <img src="@/assets/iconos/enviar.png" alt="Enviar" title="Enviar respuesta" id="bEnviar" @click="enviarRespuesta">
  </div>
</template>

<script>
var charProhibidosMensaje = /[^\n\r a-zA-ZÀ-ž0-9_():;.,+¡!¿?@=-]/;

export default {
    name:"CuadroResponder",
    data(){
        return {
            mensaje:null
        }
    },
    methods:{
        enviarRespuesta(){
            if(this.mensajeIlegal){
                return
            }
            this.$emit("enviarRespuesta", {mensaje: this.mensaje});
        }
    },
    computed:{
    mensajeIlegal() {
      if (!this.mensaje || this.mensaje.length < 1) {
        return true;
      }
      if (charProhibidosMensaje.test(this.mensaje)) {
        return true;
      }
      return false;
    },
    }

};
</script>

<style scoped>
.cuadroResponder {
  border: 2px solid rgb(3, 49, 87);
  background-color: rgb(194, 213, 238);
  margin-top: 5px;
  border-radius: 10px;
}
#barraSuperior{
    display: flex;
    align-items: center;
}
#imgMensaje {
  
  margin: 5px;
  cursor: pointer;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  background-color: green;
}
#bEnviar {
  display: block;
  margin: 5px auto;
  cursor: pointer;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  background-color: green;
}
#inputMensaje {
  width: 80%;
  display: block;
  margin: 5px auto;
  min-height: 200px;
  font-size: 20px;
}
</style>