<template>
  <div class="foro">
    <div id="zonaCategorias" class="zonaPrimerNivel">
      <div
        :key="categoria.id"
        v-for="categoria of esteForo.categorias"
        class="categoria"
      >
        <div
          class="barraSuperiorCategorias"
          @click="idConversacionSeleccionada = null"
        >
          <div class="nombreCategoria">{{ categoria.nombre }}</div>
          <div id="controlesCategoria">
            <div
              class="controlesCategoria hoverGris botonesControles"
              id="bCrearConversacion"
              @click="
                categoria.creandoConversacion = !categoria.creandoConversacion
              "
            >
              Crear conversación
            </div>
          </div>
        </div>
        <div class="zonaConversaciones">
          <creador-conversacion
            v-if="
              usuarioLogeado &&
              (categoria.visibilidad == 'publica' || usuarioMiembro == true) &&
              categoria.creandoConversacion == true
            "
            v-show="categoria.creandoConversacion"
            @crearConversacion="
              crearConversacionConPrimeraRespuesta($event, categoria.id)
            "
          />
          <conversacion
            v-for="conversacion of categoria.conversaciones"
            :key="conversacion.id"
            :estaConversacion="conversacion"
            :seleccionado="idConversacionSeleccionada == conversacion.id"
            v-show="
              idConversacionSeleccionada == conversacion.id ||
              !conversacionAbierta
            "
            @click.native="idConversacionSeleccionada = conversacion.id"
            @respuestaEliminada="
              eliminarRespuestaCache($event, conversacion.id, categoria.id)
            "
            @tengoNuevaRespuesta="
              pushRespuestaCache($event, conversacion.id, categoria.id)
            "
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import CreadorConversacion from "./foros/CreadorConversacion.vue";
import { fragmentoConversacion } from "./utilidades/recursosGql";
import Conversacion from "./foros/Conversacion.vue";

const QUERY_FORO = gql`
  query($idForo: ID!) {
    foro(idForo: $idForo) {
      id
      acceso
      miembros {
        ...fragResponsables
      }
      categorias {
        id
        nombre
        conversaciones {
          ...fragConversacion
        }
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
        data.foro.categorias.forEach((c) => {
          c.creandoConversacion = false;
        });
        return data.foro;
      },
      skip() {
        return !this.idForo;
      },
    },
  },
  props: {
    idForo: String,
  },
  data() {
    return {
      esteForo: {
        miembros: [],
      },
      creandoNuevaConversacion: false,
      idConversacionSeleccionada: null,
    };
  },
  methods: {
    crearConversacionConPrimeraRespuesta(evento, idCategoria) {
      let dis = this;
      console.log(
        `Creando conversacion con args. ${JSON.stringify(
          evento
        )} en la categoria ${idCategoria}`
      );
      let input = {
        titulo: evento.conversacion.titulo,
        primeraRespuesta: evento.primeraRespuesta.mensaje,
      };
      this.$apollo.mutate({
        mutation: gql`
          mutation(
            $idForo: ID!
            $idCategoria: ID!
            $input: InputIniciarConversacion
          ) {
            iniciarConversacionConPrimerMensajeForo(
              idForo: $idForo
              idCategoria: $idCategoria
              input: $input
            ) {
              ...fragConversacion
            }
          }
          ${fragmentoConversacion}
        `,
        variables: {
          idForo: dis.esteForo.id,
          idCategoria,
          input,
        },
        update(store, { data: { iniciarConversacionConPrimerMensajeForo } }) {
          console.log(`Updating cache`);
          let cache = store.readQuery({
            query: QUERY_FORO,
            variables: { idForo: dis.idForo },
          });
          let laCategoria = cache.foro.categorias.find(
            (c) => c.id == idCategoria
          );
          laCategoria.conversaciones.push(
            iniciarConversacionConPrimerMensajeForo
          );
          store.writeQuery({
            query: QUERY_FORO,
            variables: { idForo: dis.idForo },
            data: cache,
          });
          console.log(`Cache actualizado`);
        },
      });
    },
    eliminarRespuestaCache(idRespuesta, idConversacion, idCategoria) {
      console.log(
        `Eliminando del cache la respuesta ${idRespuesta} de la conversación ${idConversacion} de la categoria ${idCategoria}`
      );
      let store = this.$apollo.provider.defaultClient;
      let cache = store.readQuery({
        query: QUERY_FORO,
        variables: { idForo: this.idForo },
      });
      let laCategoria = cache.foro.categorias.find((c) => c.id == idCategoria);
      if (!laCategoria) {
        console.log(`Categoria no encontrada`);
        return;
      }
      let laConversacion = laCategoria.conversaciones.find(
        (c) => c.id == idConversacion
      );
      if (!laConversacion) {
        console.log(`La conversación no encontrada`);
        return;
      }
      let indexR = laConversacion.respuestas.findIndex(
        (r) => r.id == idRespuesta
      );
      if (indexR > -1) {
        laConversacion.respuestas.splice(indexR, 1);
        if (laConversacion.respuestas.length < 1) {
          let indexC = laCategoria.conversaciones.findIndex(
            (c) => c.id == idConversacion
          );
          if (indexC > -1) {
            laCategoria.conversaciones.splice(indexC, 1);
          }
        }
      } else {
        console.log(`Respuesta no encontrada`);
      }
      store.writeQuery({
        query: QUERY_FORO,
        variables: { idForo: this.idForo },
        data: cache,
      });
    },
    pushRespuestaCache(nuevaRespuesta, idConversacion, idCategoria) {
      console.log(
        `Pushing una nueva respuesta con id ${nuevaRespuesta} al cache`
      );
      let store = this.$apollo.provider.defaultClient;
      let cache = store.readQuery({
        query: QUERY_FORO,
        variables: { idForo: this.idForo },
      });
      let laCategoria = cache.foro.categorias.find((c) => c.id == idCategoria);
      if (!laCategoria) {
        console.log(`Categoria no encontrada`);
        return;
      }
      let laConversacion = laCategoria.conversaciones.find(
        (c) => c.id == idConversacion
      );
      if (!laConversacion) {
        console.log(`La conversación no encontrada`);
        return;
      }
      laConversacion.respuestas.push(nuevaRespuesta);
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
      return this.esteForo.categorias.some((c) =>
        c.conversaciones.some(
          (conv) => conv.id == this.idConversacionSeleccionada
        )
      );
    },
  },
};
</script>

<style scoped>
.foro {
  border: 2px solid black;
  background-color: rgb(241, 241, 241);
  margin: 5px auto;
}
#nombreForo {
  text-align: center;
  font-size: 22px;
  margin-bottom: 20px;
}

.nombreCategoria {
  font-size: 18px;
}
.barraSuperiorCategorias {
  display: flex;
  background-color: rgb(146, 236, 236);
}
#controlesCategoria {
  margin-left: auto;
  display: flex;
  flex-flow: row-reverse;
}
.controlesCategoria {
  margin-left: 10px;
}
.botonesControles {
  padding: 3px 5px;
  cursor: pointer;
}
.zonaConversaciones {
  padding-left: 10px;
}
</style>