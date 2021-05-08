<template>
  <div
    class="conversacion"
    :class="{ seleccionado, deshabilitado: seleccionado && loading }"
  >
    <div class="tituloConversacion">
      <img
        src="@/assets/iconos/conversacion.png"
        alt="Conversacion"
        class="imagenConversacion"
      />
      {{ estaConversacion.titulo }}
      <span class="datosConversacion">
        <span
          class="dato datoRespuestasNoLeidas"
          title="Respuestas nuevas en esta conversación"
          v-show="
            estaConversacion.cantidadRespuestas >
            cantidadRespuestasLeidasUsuario
          "
        >
          {{
            estaConversacion.cantidadRespuestas -
            cantidadRespuestasLeidasUsuario
          }}
        </span>
        <span
          class="dato datoCantidadRespuestas"
          title="Cantidad de respuestas en esta conversación"
        >
          {{ estaConversacion.cantidadRespuestas }}
        </span>
      </span>
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
        ref="cuadroResponder"
        :parent="parent"
        v-if="
          usuarioLogeado &&
          (estaConversacion.acceso == 'publico' || usuarioMiembro == true) &&
          estaConversacion.id
        "
        v-show="numPaginaSeleccionada == numPaginas"
        :idConversacion="estaConversacion.id"
        @hiceRespuesta="addRespuesta($event)"
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

const QUERY_RESPUESTAS = gql`
  query($idConversacion: ID!, $pagina: Int!) {
    respuestasPaginaDeConversacion(
      idConversacion: $idConversacion
      pagina: $pagina
    ) {
      pagina
      numPaginas
      respuestas {
        ...fragRespuesta
      }
    }
  }
  ${fragmentoRespuesta}
`;

export default {
  components: { Respuesta, CuadroResponder },
  name: "Conversacion",
  apollo: {
    numPaginas: {
      query: QUERY_RESPUESTAS,
      variables() {
        return {
          idConversacion: this.estaConversacion.id,
          pagina: this.numPaginaSeleccionada,
        };
      },
      update({
        respuestasPaginaDeConversacion: { pagina, numPaginas, respuestas },
      }) {
        console.log(
          `Llenando con ${respuestas.length} respuestas la pagina ${pagina} de ${numPaginas}`
        );
        this.$set(this.respuestasPorPagina, pagina, respuestas);
        if (this.numPaginaSeleccionada != pagina) {
          this.numPaginaSeleccionada = pagina;
        }
        this.loading = false;
        return numPaginas;
      },
      skip() {
        return !this.seleccionado;
      },
      fetchPolicy: "no-cache",
    },
  },
  data() {
    return {
      numPaginas: 0,
      numPaginaSeleccionada: 0,
      respuestasPorPagina: {},
      loading: true,
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
    idForo: String,
    parent: Object,
    seleccionado: Boolean,
    usuarioMiembro: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    addRespuesta(nuevaRespuesta) {
      var targetPagina = this.numPaginas;
      if (
        this.respuestasPorPagina[targetPagina].length >= 5 ||
        targetPagina < 1
      ) {
        targetPagina++;
        if (!this.respuestasPorPagina[targetPagina]) {
          this.$set(this.respuestasPorPagina, targetPagina, []);
        }
      }
      console.log(`Pushing en targetPagina ${targetPagina}`);
      this.respuestasPorPagina[targetPagina].push(nuevaRespuesta);
      this.$refs.cuadroResponder.cerrarse();
      if (this.numPaginaSeleccionada != targetPagina) {
        this.numPaginaSeleccionada = targetPagina;
      }
    },
    updateRespuestaEliminada(idRespuesta, pagina) {
      console.log(`Respuesta ${idRespuesta} eliminada de la pagina ${pagina}`);
      if (this.numPaginas == 1 && this.respuestasPorPagina[1].length < 2) {
        console.log(`Era la ultima respuesta`);
        this.$emit("meElimine");
      } else {
        console.log(`Refreshing respuestas pagina`);
        this.$apollo.queries.numPaginas.refresh();
      }
    },
  },
  computed: {
    cantidadRespuestasLeidasUsuario() {
      if (this.usuario && this.usuario.foros) {
        const infoForo = this.usuario.foros.find(
          (f) => f.idForo == this.idForo
        );
        if (!infoForo) {
          return 0;
        }
        const infoConversacion = infoForo.conversaciones.find(
          (c) => c.idConversacion == this.estaConversacion.id
        );
        if (!infoConversacion) {
          return 0;
        }
        return infoConversacion.respuestasLeidas;
      } else {
        return 0;
      }
    },
  },
};
</script>

<style scoped>
.conversacion {
  background-color: #ffd0aa;
  border: 1px solid white;
  padding: 0px 0px;
}
.conversacion:hover {
  background-color: #f7b57f;
}
.seleccionado {
  background-color: #f7b57f;
}
.respuesta {
  margin: 5px;
}
.conversacion:not(.seleccionado) {
  cursor: pointer;
}
.tituloConversacion {
  padding: 15px 0px;
  margin: 5px;
  font-weight: bold;
  display: grid;
  align-items: center;
  grid-template-columns: 35px 1fr 50px;
  color: #9c1a1a;
}
.imagenConversacion {
  width: 30px;
  height: 30px;
  margin-right: 10px;
}
.datosConversacion {
  padding: 10px 0px;
}
.dato {
  margin: 0px 3px;
  cursor: pointer;
  border-radius: 10px;
  padding: 3px;
  text-align: center;
  font-size: 12px;
}

.datoRespuestasNoLeidas {
  border: 1px solid chocolate;
  background-color: rgb(243, 206, 180);
}

.datoCantidadRespuestas {
  border: 1px solid rgb(75, 73, 73);
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
  padding: 3px 5px;
  margin: 2px;
  border-radius: 5px;
  cursor: pointer;
  background-color: #f7b57f;

}

.selectorPagina:hover {
    background-color: #ffd0aa;

}
.selectorSeleccionado {
    background-color: #ffd0aa;

  pointer-events: none;
  font-weight: bold;
}

@media only screen and (min-width: 768px) {
.tituloConversacion {
  padding: 15px 10px;
  margin: 5px;
  font-weight: bold;
  display: grid;
  align-items: center;
  grid-template-columns: 65px 1fr 90px;
  color: #9c1a1a;
}
.imagenConversacion {
  width: 50px;
  height: 50px;
  margin-right: 10px;
}
.dato {
  margin: 0px 4px;
  cursor: pointer;
  border-radius: 10px;
  padding: 6px;
  text-align: center;
  font-size: 14px;

}
}
</style>