<template>
  <div class="creadorConversacion">
    <div id="nombreAccion">Creando una nueva conversacion</div>
    <div id="zonaTitulo">
      <input
        type="text"
        :class="{letrasRojas:tituloIlegal}"
        v-model="titulo"
        class="inputTitulo"
        placeholder="Titulo de la conversación"
      />
    </div>
    <div id="zonaContenido">
      <textarea
        v-model="mensaje"
        :class="{letrasRojas:mensajeIlegal}"
        placeholder="Escribe un mensaje"
        id="inputMensaje"
      />
    </div>
    <div id="controles">
      <img
        src="@/assets/iconos/enviar.png"
        alt="Enviar"
        title="Crear conversación"
        :class="{deshabilitado:(mensajeIlegal==true || tituloIlegal==true)}"
        id="bFinalizar"
        @click="finalizar"
        v-show="!enviandoConversacion"
      />
      <loading texto="Creando conversación..." v-show="enviandoConversacion" />
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import Loading from "../utilidades/Loading.vue";
import { fragmentoConversacion } from "../utilidades/recursosGql";
var charProhibidosMensaje = /[^\n\r a-zA-ZÀ-ž0-9_()":;.,+¡!¿?@=-]/;
const charProhibidosTitulo = /[^ a-zA-ZÀ-ž0-9_():.,-¡!¿?]/;

export default {
  components: { Loading },
  name: "CreadorConversacion",
  props: {
    idForo: String,
    parent:Object,
  },
  data() {
    return {
      titulo: null,
      mensaje: null,
      enviandoConversacion: false,
    };
  },
  methods: {
    finalizar() {
      if (this.tituloIlegal || this.mensajeIlegal) {
        return;
      }

      var input = {
        titulo: this.titulo,
        primeraRespuesta: this.mensaje,
      };
      this.enviandoConversacion = true;
      var dis = this;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation($idForo: ID!, $input: InputIniciarConversacion, $parent:InputParent) {
              iniciarConversacionConPrimerMensajeForo(
                idForo: $idForo,
                input: $input,
                parent: $parent,
              ) {
                ...fragConversacion
              }
            }
            ${fragmentoConversacion}
          `,
          variables: {
            idForo: dis.idForo,
            input,
            parent:dis.parent
          },
        })
        .then(({ data: { iniciarConversacionConPrimerMensajeForo } }) => {
          dis.enviandoConversacion = false;
          dis.$emit(
            "hiceConversacion",
            iniciarConversacionConPrimerMensajeForo
          );
        })
        .catch((error) => {
          dis.enviandoConversacion = false;
          console.log(`Error. E: ${error}`);
        });
    },
  },
  computed: {
    tituloIlegal() {
      if (!this.titulo || this.titulo.length < 1) {
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
  margin: 2px auto;
  padding: 5px 15px;
}
#nombreAccion {
  text-align: center;
  font-size: 19px;
  padding: 5px 10px;
}

.inputTitulo {
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
#bFinalizar {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  cursor: pointer;
}
#bFinalizar:hover {
  background-color: white;
}
</style>