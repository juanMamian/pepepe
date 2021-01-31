<template>
  <div class="conversacion" :class="{ seleccionado }">
    <div class="tituloConversacion">
      {{ estaConversacion.titulo }}
    </div>

    <div class="zonaRespuestas" v-show="seleccionado">
      <respuesta
        v-for="respuesta of estaConversacion.respuestas"
        :key="respuesta.id"
        :estaRespuesta="respuesta"
        @meElimine="$emit('respuestaEliminada', respuesta.id)"
      />
      <cuadro-responder @enviarRespuesta="enviarNuevaRespuesta($event)" />
    </div>

    <div class="controlesConversacion">
      <!-- <div class="bEliminarConversacion">Eliminar</div> -->
    </div>
  </div>
</template>

<script>
import gql from 'graphql-tag';
import CuadroResponder from "./CuadroResponder.vue";
import Respuesta from "./Respuesta.vue";
import { fragmentoRespuesta } from '../utilidades/recursosGql';
export default {
  components: { Respuesta, CuadroResponder },
  name: "Conversacion",
  props: {
    estaConversacion: {
      type: Object,
      default() {
        return {
          respuestas: [],
        };
      },
    },
    seleccionado: Boolean,
  },
  methods: {
    enviarNuevaRespuesta(nuevaRespuesta) {
        let dis=this;
      console.log(
        `Enviando nueva respuesta a la conversación con id ${this.estaConversacion.id}`
      );
      this.$apollo.mutate({
          mutation:gql`
            mutation($idConversacion:ID!, $nuevaRespuesta: InputNuevaRespuesta){
                postRespuestaConversacion(idConversacion:$idConversacion, nuevaRespuesta:$nuevaRespuesta){
                    ...fragRespuesta
                }
            }
            ${fragmentoRespuesta}
          `,
          variables:{
              idConversacion:dis.estaConversacion.id,
              nuevaRespuesta
          },
          update(store, {data:{postRespuestaConversacion}}){              
              dis.$emit("tengoNuevaRespuesta", postRespuestaConversacion);
          }
      })
    },
  },
};
</script>

<style scoped>
.conversacion {
  background-color: #d8f3d9;
  border: 2px solid #023004;
  padding: 5px 10px;
}
.conversacion:not(.seleccionado) {
  cursor: pointer;
}
.zonaRespuestas {
  padding-left: 10px;
}
.controlesConversacion {
  display: flex;
  flex-flow: row-reverse;
}
.bEliminarConversacion {
  padding: 3px;
}
.bEliminarConversacion:hover {
  padding: 3px;
  background-color: red;
  cursor: pointer;
}
</style>