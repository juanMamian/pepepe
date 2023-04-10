<template>
  <div class="foro">
    <div class="barraSuperiorForo">
      <div id="anuncio" v-show="idConversacionSeleccionada === null">
        Conversaciones
      </div>
      <div
        id="bRegresarConversaciones"
        v-show="idConversacionSeleccionada != null"
        @click="
          idConversacionSeleccionada = null;
          $apollo.queries.numPaginas.refetch();
        "
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
      <!-- <creador-conversacion
        v-if="
          usuarioLogeado &&
          (esteForo.acceso == 'publico' || usuarioMiembro == true) &&
          esteForo.id
        "
        :idForo="esteForo.id"
        :parent="parent"
        v-show="creandoConversacion"
        @hiceConversacion="addConversacion($event)"
      /> -->
      <div
        id="zonaCrearConversacion"
        v-if="
          usuarioLogeado &&
          (esteForo.acceso == 'publico' || usuarioMiembro == true) &&
          esteForo.id
        "
        v-show="creandoConversacion"
      >
        <h3>Creando conversación</h3>
        <input
          type="text"
          v-model="tituloNuevaConversacion"
          id="inputTituloNuevaConversacion"
          placeholder="Titulo de la nueva conversación"
          :class="{ letrasRojas: tituloNuevaConversacionIlegal }"
        />
        <cuadro-responder
          :idForo="esteForo.id"
          :parent="parent"
          :tituloNuevaConversacion="tituloNuevaConversacion"
          :class="{ deshabilitado: tituloNuevaConversacionIlegal }"
          @hiceConversacion="addConversacion($event)"
        />
      </div>

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
          :idForo="idForo"
          :parent="parent"
          v-show="
            idConversacionSeleccionada == conversacion.id ||
            !conversacionAbierta
          "
          @click.native="idConversacionSeleccionada = conversacion.id"
          @meAbrieron="
            setTodaConversacionLeida(conversacion.id)
          "
          @meElimine="refreshPagina"
          @respuestaPublicada="
            setTodaConversacionLeida(
              conversacion.id,
              conversacion.cantidadRespuestas
            )
          "
        />
      </div>
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
// import CreadorConversacion from "./foros/CreadorConversacion.vue";
import { fragmentoConversacion } from "./utilidades/recursosGql";
import Conversacion from "./foros/Conversacion.vue";
import CuadroResponder from "./foros/CuadroResponder.vue";

const charProhibidosTituloNuevaConversacion = /[^ a-zA-ZÀ-ž0-9_():.,-¡!¿?]/;

const QUERY_FORO = gql`
  query($idForo: ID!) {
    foro(idForo: $idForo) {
      id
      acceso
      miembros
    }
  }
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
  components: { Conversacion, CuadroResponder },
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
        this.conversacionesPorPagina[pagina] = conversaciones;
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

      tituloNuevaConversacion: null,
    };
  },
  methods: {
    addConversacion(nuevaConversacion) {
      this.creandoConversacion = false;
      // var targetPagina = this.numPaginas;
      // console.log(`Target página: ${targetPagina}`);
      // if (
      //   this.conversacionesPorPagina[targetPagina].length >= 6 ||
      //   targetPagina < 1
      // ) {
      //   targetPagina++;
      //   if (!this.conversacionesPorPagina[targetPagina]) {
      //     this.$set(this.conversacionesPorPagina, targetPagina, []);
      //   }
      // }
      // console.log(`Pushing en targetPagina ${targetPagina}`);
      // this.conversacionesPorPagina[targetPagina].push(nuevaConversacion);
      this.setTodaConversacionLeida(nuevaConversacion.id);

      // if (this.numPaginaSeleccionada != targetPagina) {
      //   this.numPaginaSeleccionada = targetPagina;
      // }
      this.tituloNuevaConversacion = null;
      this.numPaginaSeleccionada=1;
      this.$apollo.queries.numPaginas.refetch();


    },
    refreshPagina() {
      //let store = this.$apollo.provider.defaultClient;
      this.idConversacionSeleccionada = null;
      this.$apollo.queries.numPaginas.refresh();
    },    
    setTodaConversacionLeida(idConversacion) {
      if (!this.usuario || !this.usuario.id) {
        return;
      } else {
        console.log(`Setting toda conversación leida`);

        this.$apollo
          .mutate({
            mutation: gql`
              mutation($idUsuario: ID!, $idForo: ID!, $idConversacion: ID!) {
                setTodasRespuestasConversacionLeidasPorUsuario(
                  idUsuario: $idUsuario
                  idForo: $idForo
                  idConversacion: $idConversacion
                )
              }
            `,
            variables: {
              idUsuario: this.usuario.id,
              idForo: this.idForo,
              idConversacion,
            },
          })
          .then(
            ({ data: { setTodasRespuestasConversacionLeidasPorUsuario } }) => {
              console.log(
                `Resultado: ${setTodasRespuestasConversacionLeidasPorUsuario}`
              );

              this.$store.commit("setRespuestasLeidasConversacionUsuario", {
                idForo: this.idForo,
                idConversacion,
                respuestasLeidas: setTodasRespuestasConversacionLeidasPorUsuario,
              });
            }
          )
          .catch((error) => {
            console.log(`Error. E: ${error}`);
          });
      }
    },
    setConversacionLeida(idConversacion, cantidadRespuestasLeidas) {
      if (!this.usuario || !this.usuario.id) {
        return;
      } else {
        console.log(`Setting conversación leida`);

        this.$apollo
          .mutate({
            mutation: gql`
              mutation(
                $idUsuario: ID!
                $idForo: ID!
                $idConversacion: ID!
                $cantidadRespuestasLeidas: Int!
              ) {
                setCantidadRespuestasConversacionLeidasPorUsuario(
                  idUsuario: $idUsuario
                  idForo: $idForo
                  idConversacion: $idConversacion
                  cantidadRespuestasLeidas: $cantidadRespuestasLeidas
                )
              }
            `,
            variables: {
              idUsuario: this.usuario.id,
              idForo: this.idForo,
              idConversacion,
              cantidadRespuestasLeidas: parseInt(cantidadRespuestasLeidas),
            },
          })
          .then(
            ({
              data: { setCantidadRespuestasConversacionLeidasPorUsuario },
            }) => {
              console.log(
                `Resultado: ${setCantidadRespuestasConversacionLeidasPorUsuario}`
              );
              if (setCantidadRespuestasConversacionLeidasPorUsuario) {
                this.$store.commit("setRespuestasLeidasConversacionUsuario", {
                  idForo: this.idForo,
                  idConversacion,
                  respuestasLeidas: cantidadRespuestasLeidas,
                });
              }
            }
          )
          .catch((error) => {
            console.log(`Error. E: ${error}`);
          });
      }
    },
  },
  computed: {
    usuarioMiembro() {
      if (this.esteForo.acceso == "publico") {
        return true;
      } else if (this.esteForo.acceso == "privado") {
        if (this.esteForo.miembros.includes(this.usuario.id)) {
          return true;
        }
      }
      return false;
    },
    conversacionAbierta() {
      return this.idConversacionSeleccionada;
    },
    tituloNuevaConversacionIlegal() {
      if (
        !this.tituloNuevaConversacion ||
        this.tituloNuevaConversacion.length < 1
      ) {
        return true;
      }
      if (
        charProhibidosTituloNuevaConversacion.test(this.tituloNuevaConversacion)
      ) {
        return true;
      }
      return false;
    },
  },
};
</script>

<style scoped>
.foro {
  border: 2px solid white;
  background-color: rgb(239 158 93);
  margin: 0px auto;
}
#nombreForo {
  text-align: center;
  font-size: 22px;
  margin-bottom: 20px;
}

.barraSuperiorForo {
  display: grid;
  grid-template-columns: 1fr 100px 1fr;
}

#bRegresarConversaciones {
  padding: 15px 5px;
  text-align: center;
  cursor: pointer;
  border-radius: 7px;
  grid-column: 2/3;
  justify-self: center;
  align-self: center;
  border: 1px solid black;
  margin: 10px;
  background-color: #f5a25f;
}
#bRegresarConversaciones:hover {
  background-color: #f8cba6;
}
#controlesForo {
  margin-left: auto;
  display: flex;
  flex-flow: row-reverse;
  grid-column: 3/4;
}
.controlesForo {
  margin-left: 10px;
}
.botonesControles {
  padding: 3px 5px;
  cursor: pointer;
}
.botonesControles:hover {
  background-color: #f8cba6;
}
.zonaConversaciones {
  padding-left: 0px;
}

.zonaSelectorPagina {
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
#anuncio {
  padding: 5px 5px;
}
#zonaCrearConversacion {
  border: 2px solid cadetblue;
  border-radius: 10px;
  padding: 10px;
  background-color: rgba(95, 158, 160, 0.329);
}
#inputTituloNuevaConversacion {
  font-size: 20px;
  padding: 3px 5px;
  width: min(80%, 500px);
}
</style>