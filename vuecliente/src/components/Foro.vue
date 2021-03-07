<template>
  <div class="foro">
    <div class="barraSuperiorForo">
      <div id="anuncio" v-show="idConversacionSeleccionada === null">
        Conversaciones
      </div>
      <div
        id="bRegresarConversaciones"
        v-show="idConversacionSeleccionada != null"
        @click="idConversacionSeleccionada = null"
      >
        Volver a conversaciones
      </div>
      <div id="controlesForo">
        <div
          class="controlesForo botonesControles"
          id="bCrearConversacion"
          v-if="
            usuarioLogeado &&
            (esteForo.acceso == 'publico' || usuarioMiembro == true) &&
            esteForo.id
          "
          v-show="!conversacionAbierta"
          @click="creandoConversacion = !creandoConversacion"
        >
          {{ creandoConversacion ? "Cancelar" : "Crear conversación" }}
        </div>
      </div>
    </div>
    <div class="zonaConversaciones">
      <creador-conversacion
        v-if="
          usuarioLogeado &&
          (esteForo.acceso == 'publico' || usuarioMiembro == true) &&
          esteForo.id
        "
        :idForo="esteForo.id"
        v-show="creandoConversacion"
        @hiceConversacion="addConversacion($event)"
      />
      <div class="zonaSelectorPagina" v-if="numPaginas && !conversacionAbierta">
        <div
          class="selectorPagina"
          v-for="index in numPaginas"
          :key="index"
          :class="{ selectorSeleccionado: index == numPaginaSeleccionada }"
          @click="numPaginaSeleccionada = index"
        >
          {{ index }}
        </div>
      </div>
      <div class="zonaPaginasConversaciones" v-if="numPaginas">
        <div
          class="paginaConversaciones"
          :key="index"
          v-for="index in numPaginas"
        ></div>
        <conversacion
          v-for="conversacion of conversacionesPorPagina[numPaginaSeleccionada]"
          :key="conversacion.id"
          :estaConversacion="conversacion"
          :seleccionado="idConversacionSeleccionada == conversacion.id"
          :usuarioMiembro="usuarioMiembro"
          :parent="parent"
          v-show="
            idConversacionSeleccionada == conversacion.id ||
            !conversacionAbierta
          "
          @click.native="idConversacionSeleccionada = conversacion.id"
          @meElimine="refreshPagina"
        />
      </div>
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import CreadorConversacion from "./foros/CreadorConversacion.vue";
import {
  fragmentoConversacion,
  fragmentoResponsables,
} from "./utilidades/recursosGql";
import Conversacion from "./foros/Conversacion.vue";

const QUERY_FORO = gql`
  query($idForo: ID!) {
    foro(idForo: $idForo) {
      id
      acceso
      miembros {
        ...fragResponsables
      }
    }
  }
  ${fragmentoResponsables}
`;

const QUERY_CONVERSACIONES_PAGINA = gql`
  query($idForo: ID!, $pagina: Int!) {
    conversacionesPaginaForo(idForo: $idForo, pagina: $pagina) {
      pagina
      numPaginas
      conversaciones {
        ...fragConversacion
      }
    }
  }
  ${fragmentoConversacion}
`;

export default {
  components: { CreadorConversacion, Conversacion },
  name: "Foro",
  apollo: {
    esteForo: {
      query: QUERY_FORO,
      variables() {
        return {
          idForo: this.idForo,
        };
      },
      fetchPolicy: "cache-and-network",
      update: (data) => {
        return data.foro;
      },
      skip() {
        return !this.idForo;
      },
    },
    numPaginas: {
      query: QUERY_CONVERSACIONES_PAGINA,
      variables() {
        return {
          idForo: this.idForo,
          pagina: this.numPaginaSeleccionada,
        };
      },
      fetchPolicy: "no-cache",
      skip() {
        return !this.idForo;
      },
      update({
        conversacionesPaginaForo: { conversaciones, pagina, numPaginas },
      }) {
        if (this.numPaginaSeleccionada != pagina) {
          this.numPaginaSeleccionada = pagina;
        }
        this.$set(this.conversacionesPorPagina, pagina, conversaciones);
        return numPaginas;
      },
    },
  },
  props: {
    idForo: String,
    parent: Object,
  },
  data() {
    return {
      esteForo: {
        miembros: [],
        conversaciones: [],
      },
      idConversacionSeleccionada: null,
      creandoConversacion: false,
      numPaginaSeleccionada: 0,
      conversacionesPorPagina: {},
    };
  },
  methods: {
    addConversacion(nuevaConversacion) {
      this.creandoConversacion = false;
      var targetPagina = this.numPaginas;
      console.log(`Target página: ${targetPagina}`);
      if (
        this.conversacionesPorPagina[targetPagina].length >= 6 ||
        targetPagina < 1
      ) {
        targetPagina++;
        if (!this.conversacionesPorPagina[targetPagina]) {
          this.$set(this.conversacionesPorPagina, targetPagina, []);
        }
      }
      console.log(`Pushing en targetPagina ${targetPagina}`);
      this.conversacionesPorPagina[targetPagina].push(nuevaConversacion);
      if (this.numPaginaSeleccionada != targetPagina) {
        this.numPaginaSeleccionada = targetPagina;
      }
    },
    refreshPagina() {
      //let store = this.$apollo.provider.defaultClient;
      this.idConversacionSeleccionada = null;
      this.$apollo.queries.numPaginas.refresh();
    },
  },
  computed: {
    usuarioMiembro() {
      if (this.esteForo.acceso == "publico") {
        return true;
      } else if (this.esteForo.acceso == "privado") {
        if (
          this.esteForo.miembros.some(
            (m) => m.id == this.$store.state.usuario.id
          )
        ) {
          return true;
        }
      }
      return false;
    },
    conversacionAbierta() {
      return this.idConversacionSeleccionada;
    },
  },
};
</script>

<style scoped>
.foro {
  border: 2px solid black;
  background-color: rgb(241, 241, 241);
  margin: 0px auto;
}
#nombreForo {
  text-align: center;
  font-size: 22px;
  margin-bottom: 20px;
}

.barraSuperiorForo {
  display: flex;
  background-color: #ddfeff;
}

#bRegresarConversaciones {
  padding: 20px 5px;
  text-align: center;
  cursor: pointer;
  border-radius: 10px;
  margin: 10px auto;
  border: 2px solid black;
}
#bRegresarConversaciones:hover{
  background-color: cadetblue;
}
#controlesForo {
  margin-left: auto;
  display: flex;
  flex-flow: row-reverse;
}
.controlesForo {
  margin-left: 10px;
}
.botonesControles {
  padding: 3px 5px;
  cursor: pointer;
}
.botonesControles:hover {
  background-color: #95cccc;
}
.zonaConversaciones {
  padding-left: 0px;
}

.zonaSelectorPagina {
  display: flex;
  padding: 2px 10px;
  background-color: #ddfeff;
}
.selectorPagina {
  border: 1px solid black;
  padding: 3px 5px;
  margin: 2px;
  border-radius: 5px;
  cursor: pointer;
  background-color: #4db9b9;
}

.selectorPagina:hover {
  background-color: #95cccc;
}
.selectorSeleccionado {
  background-color: #95cccc;
  pointer-events: none;
}
#anuncio {
  padding: 5px 5px;
}
</style>