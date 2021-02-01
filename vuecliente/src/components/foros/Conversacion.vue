<template>
  <div class="conversacion" :class="{ seleccionado }">
    <div class="tituloConversacion">
      <img
        src="@/assets/iconos/conversacion.png"
        alt="Conversacion"
        class="imagenConversacion"
      />
      {{ estaConversacion.titulo }}
    </div>
    <div
      class="zonaSelectorPaginas"
      v-if="numPaginas > 0"
      v-show="seleccionado"
    >
      <div
        class="selectorPagina"
        :class="{ selectorSeleccionado: index == numPaginaSeleccionada }"
        v-for="index in numPaginas"
        :key="index"
        @click="numPaginaSeleccionada = index"
      >
        {{ index }}
      </div>
    </div>
    <div class="zonaRespuestas" v-show="seleccionado">
      <div class="zonaPaginas">
        <div
          class="pagina"
          v-for="index in numPaginas"
          :key="'pagina' + index"
          v-show="numPaginaSeleccionada == index"
        >
          pagina{{ index }}
          <respuesta
            v-for="respuesta of respuestasPorPagina[index]"
            :key="respuesta.id"
            :idConversacion="estaConversacion.id"
            :estaRespuesta="respuesta"
            @meElimine="updateRespuestaEliminada(respuesta.id, index)"
          />
        </div>
      </div>
      <cuadro-responder
        v-if="usuarioMiembro"
        @enviarRespuesta="enviarNuevaRespuesta($event)"
      />
    </div>

    <div class="controlesConversacion">
      <!-- <div class="bEliminarConversacion">Eliminar</div> -->
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import CuadroResponder from "./CuadroResponder.vue";
import Respuesta from "./Respuesta.vue";
import { fragmentoRespuesta } from "../utilidades/recursosGql";

const QUERY_PAGINAS = gql`
  query($idConversacion: ID!) {
    numPaginasConversacion(idConversacion: $idConversacion)
  }
`;

const QUERY_RESPUESTAS = gql`
  query($idConversacion: ID!, $pagina: Int!) {
    respuestasPaginaDeConversacion(
      idConversacion: $idConversacion
      pagina: $pagina
    ) {
      ...fragRespuesta
    }
  }
  ${fragmentoRespuesta}
`;

export default {
  components: { Respuesta, CuadroResponder },
  name: "Conversacion",
  apollo: {
    numPaginas: {
      query: QUERY_PAGINAS,
      variables() {
        return { idConversacion: this.estaConversacion.id };
      },
      update(respuesta) {
        for (let i = 1; i <= this.numPaginasConversacion; i++) {
          this.respuestasPorPagina[i] = [];
        }
        this.numPaginaSeleccionada = respuesta.numPaginasConversacion;
        return respuesta.numPaginasConversacion;
      },
      skip() {
        return !this.seleccionado;
      },
    },
  },
  data() {
    return {
      numPaginas: 0,
      numPaginaSeleccionada: null,
      respuestasPorPagina: {},
    };
  },
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
    usuarioMiembro: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    enviarNuevaRespuesta(nuevaRespuesta) {
      let dis = this;
      console.log(
        `Enviando nueva respuesta a la conversación con id ${this.estaConversacion.id}`
      );
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
          idConversacion: dis.estaConversacion.id,
          nuevaRespuesta,
        },
        update(store, { data: { postRespuestaConversacion } }) {
          let paginaTarget = dis.numPaginas;
          console.log(`pagina target: ${paginaTarget}`);
          if (dis.respuestasPorPagina[paginaTarget].length >= 10) {
            paginaTarget++;
          }
          if (!dis.respuestasPorPagina[paginaTarget]) {
            dis.numPaginas = paginaTarget;
            dis.$set(dis.respuestasPorPagina, paginaTarget, []);
          }
          dis.respuestasPorPagina[paginaTarget].push(postRespuestaConversacion);
          dis.numPaginaSeleccionada = paginaTarget;
        },
      });
    },
    getRespuestasPagina(pagina) {
      this.$apollo
        .query({
          query: QUERY_RESPUESTAS,
          variables: {
            idConversacion: this.estaConversacion.id,
            pagina,
          },
          fetchPolicy: "cache-and-netowrk",
        })
        .then(({ data: { respuestasPaginaDeConversacion } }) => {
          this.$set(
            this.respuestasPorPagina,
            pagina,
            respuestasPaginaDeConversacion
          );
          console.log(`Respuestas de pagina ${pagina} descargadas`);
        })
        .catch((error) => {
          console.log(
            `Error descardando respuestas de pagina ${pagina}. E: ${error}`
          );
        });
    },
    updateRespuestaEliminada(idRespuesta, pagina) {
      console.log(`Respuesta ${idRespuesta} eliminada de la pagina ${pagina}`);
      let indexR = this.respuestasPorPagina[pagina].findIndex(
        (r) => r.id == idRespuesta
      );
      if (indexR > -1) {
        this.respuestasPorPagina[pagina].splice(indexR, 1);
        for (var i = pagina; i < this.numPaginas; i++) {
          console.log(`pushpoping en pagina ${pagina}`);
          this.respuestasPorPagina[pagina].push(
            this.respuestasPorPagina[pagina + 1][0]
          );
          this.respuestasPorPagina[pagina + 1].splice(0, 1);
        }
        if (this.respuestasPorPagina[i].length < 1) {
          console.log(`Pagina ${i} quedó vacía`);
          this.$delete(this.respuestasPorPagina, i);
          this.numPaginas = i - 1;
        }
        if (!this.respuestasPorPagina[this.numPaginaSeleccionada]) {
          this.numPaginaSeleccionada--;
        }
      } else {
        console.log(`Respuesta no existía`);
      }
    },
  },
  watch: {
    numPaginaSeleccionada() {
      if (this.numPaginaSeleccionada < 1) {
        return;
      }
      console.log(`pag seleccionada: ${this.numPaginaSeleccionada}`);
      this.getRespuestasPagina(this.numPaginaSeleccionada);
    },
  },
};
</script>

<style scoped>
.conversacion {
  background-color: #bdc2bf;
  border: 1px solid #023004;
  padding: 0px 0px;
}
.conversacion:hover {
  background-color: #d2d2d2;
}
.seleccionado {
  background-color: #d2d2d2;
}
.respuesta {
  margin: 5px;
}
.conversacion:not(.seleccionado) {
  cursor: pointer;
}
.tituloConversacion {
  padding: 15px 10px;
  margin: 5px;
  font-weight: bold;
  display: flex;
  align-items: center;
}
.imagenConversacion {
  width: 50px;
  height: 50px;
  margin-right: 10px;
}

.zonaRespuestas {
  padding-left: 0px;
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
.zonaSelectorPaginas {
  display: flex;
  padding: 2px 10px;
}
.selectorPagina {
  border: 1px solid black;
  padding: 3px;
  cursor: pointer;
}

.selectorPagina:hover {
  background-color: gray;
}
.selectorSeleccionado {
  background-color: gray;
  pointer-events: none;
}
</style>