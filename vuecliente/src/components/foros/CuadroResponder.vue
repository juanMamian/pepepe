<template>
  <div class="cuadroResponder">
    <div id="barraSuperior">
      <img
        src="@/assets/iconos/mensaje.png"
        alt="Contestar"
        title="Contestar en esta conversación"
        id="imgMensaje"
        @click="toggleCuadroAbierto"
      />
      <span id="tituloCuadro">Envía una respuesta</span>
    </div>
    <textarea
      v-show="cuadroAbierto"
      name="inputMensaje"
      id="inputMensaje"
      :class="{ letrasRojas: mensajeIlegal }"
      v-model="mensaje"
      placeholder="Escribe aquí tu respuesta"
    ></textarea>

    <img
      v-show="cuadroAbierto && !enviandoRespuesta"
      src="@/assets/iconos/enviar.png"
      alt="Enviar"
      title="Enviar respuesta"
      id="bEnviar"
      @click="enviarRespuesta"
    />
    <loading texto="Enviando respuesta..." v-show="enviandoRespuesta" />
  </div>
</template>

<script>
import gql from 'graphql-tag';
import Loading from "../utilidades/Loading.vue";
import { fragmentoRespuesta } from '../utilidades/recursosGql';
var charProhibidosMensaje = /[^\n\r a-zA-ZÀ-ž0-9_():;.,+¡!¿?@=-]/;

export default {
  components: { Loading },
  name: "CuadroResponder",
  props: {
    idConversacion: String,
  },
  data() {
    return {
      mensaje: null,
      cuadroAbierto: false,
      enviandoRespuesta:false,
    };
  },
  methods: {
    enviarRespuesta() {      
      if (this.mensajeIlegal) {
        return;
      }
      var nuevaRespuesta={
        mensaje:this.mensaje
      }
      var dis=this;
      this.enviandoRespuesta=true;
      this.$apollo.mutate({
        mutation: gql`
          mutation($idConversacion: ID!, $nuevaRespuesta: InputNuevaRespuesta) {
            postRespuestaConversacion(
              idConversacion: $idConversacion
              nuevaRespuesta: $nuevaRespuesta
            ) {
              ...fragRespuesta
            }
          }
          ${fragmentoRespuesta}
        `,
        variables: {
          idConversacion: dis.idConversacion,
          nuevaRespuesta,
        }        
      }).then(({data:{postRespuestaConversacion}})=>{
        dis.enviandoRespuesta=false;        
        this.$emit("hiceRespuesta", postRespuestaConversacion);
      }).catch((error)=>{
        dis.enviandoRespuesta=false;
        console.log(`Error. E: ${error}`);
      })

      ;
    },
    toggleCuadroAbierto() {
      this.cuadroAbierto = !this.cuadroAbierto;
    },
    cerrarse() {
      this.mensaje = null;
      this.cuadroAbierto = false;
    },
  },
  computed: {
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
.cuadroResponder {
  border: 2px solid rgb(3, 49, 87);
  background-color: rgb(194, 213, 238);
  margin: 5px;
  border-radius: 10px;
}
#barraSuperior {
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