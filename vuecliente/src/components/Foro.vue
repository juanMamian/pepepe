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
          :class="{seleccionable:conversacionAbierta}"
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
              {{categoria.creandoConversacion ? 'Cancelar' : 'Crear conversación'}}
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
            :usuarioMiembro="usuarioMiembro"
            v-show="
              idConversacionSeleccionada == conversacion.id ||
              !conversacionAbierta
            "
            @click.native="idConversacionSeleccionada = conversacion.id"                   
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
  margin: 0px auto;
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
  background-color:#d2d2d2;
}
.barraSuperiorCategorias:not(.seleccionable) {
  background-color:  #BDC2BF;
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
  padding-left: 0px;
}
.seleccionable{
  background-color:#BDC2BF;
  cursor: pointer;
}
.seleccionable:hover{
  background-color: #d2d2d2;
}
</style>