<template>
  <div class="ventanaBloqueHorario" @click="idPersonaMenuCx = null">
    <div id="fondoGris" @click.self.stop="$emit('cerrarme')"></div>
    <div id="laPropiaVentana" :style="[{ backgroundColor: miColor }]">
      <div id="titulo">
        {{ esteBloque.nombreEspacio }}
      </div>

      <div id="infoBasica">
        <div class="info">
          {{ diasSemana[esteBloque.diaSemana] }}.
          {{ toTiempoFormateado(minutosInicio) }} -
          {{ toTiempoFormateado(minutosFinal) }}
        </div>
      </div>

      <div class="seccionListaUsuarios">
        <div class="barraListaUsuarios">
          <div class="nombreListaUsuarios">Coordina</div>
        </div>

        <div class="listaPersonas">
          <icono-persona-autonomo
            :idPersona="esteBloque.idAdministradorEspacio"
          />
        </div>
      </div>

      <div class="seccionListaUsuarios">
        <div class="barraListaUsuarios">
          <div class="nombreListaUsuarios">Asisten</div>
          <div class="contenedorControles">
            <div
              class="boton"
              @click="iniciarAdicionAsistente"
              v-if="usuarioSuperadministrador || usuarioAdministrador"
            >
              <img src="@/assets/iconos/join.png" alt="Agregar" style="" />
            </div>
          </div>
        </div>

        <div class="listaPersonas" v-show="!mostrandoBuscadorAsistentes">
          <icono-persona-autonomo
            v-for="idAsistente of idsAsistentes"
            :key="idAsistente"
            :idPersona="idAsistente"
            :seleccionado="idAsistente === idPersonaSeleccionado"
            :opcionesMenuCx="opcionesAsistentes"
            :menuContextual="idPersonaMenuCx === idAsistente"
            @click.stop="
              idPersonaSeleccionado =
                idPersonaSeleccionado === idAsistente ? null : idAsistente
            "
            @click.native.right.stop.prevent="idPersonaMenuCx = idAsistente"
            @remover="removerAsistente(idAsistente)"
          />
        </div>

        <div
          id="zonaAdicionarAsistente"
          v-show="mostrandoBuscadorAsistentes"          
        >
          <div class="zonaInformacion" style="display: flex">
            <div class="informacion" style="display: flex">
              <loading
                v-show="$apollo.queries.participantesCasaMaestraVida.loading"
              />
              Adicionando asistentes
            </div>

            <div class="contenedorControles" style="margin-left: auto">
              <div class="boton" @click="mostrandoBuscadorAsistentes = false">
                <img src="@/assets/iconos/equis.svg" alt="Salir" style="" />
              </div>
            </div>
          </div>
          <div id="zonaInputBuscador" :class="{deshabilitado:  $apollo.queries.participantesCasaMaestraVida.loading}" style="width: 100%">
            <input
              type="text"
              ref="inputTextoBuscador"
              id="inputTextoBuscador"
              placeholder="buscar"
              @keypress.enter="setTextoBusqueda"
            />
          </div>
          <div
            class="listaPersonas"
            :class="{ deshabilitado: addingAsistente ||  $apollo.queries.participantesCasaMaestraVida.loading }"
          >
            <icono-persona-autonomo
              v-for="idAdicionable of idsPersonasAdicionablesOrdenadas"
              :key="idAdicionable"
              :idPersona="idAdicionable"
              :seleccionado="idAdicionable === idPersonaSeleccionado"
              @click.stop="
                idPersonaSeleccionado =
                  idPersonaSeleccionado === idAdicionable ? null : idAdicionable
              "
              @dblclick.native.stop="addComoAsistente(idAdicionable)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import IconoPersonaAutonomo from "../usuario/IconoPersonaAutonomo.vue";
import Loading from "../utilidades/Loading.vue";
import stringSimilarity from "string-similarity";

const diasSemana = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

export default {
  components: { IconoPersonaAutonomo, Loading },
  name: "VentanaBloqueHorario",
  props: {
    esteBloque: Object,
    miColor: String,
  },
  apollo: {
    participantesCasaMaestraVida: {
      query: gql`
        query {
          participantesCasaMaestraVida {
            id
            nombres
            apellidos
          }
        }
      `,
    },
  },
  data() {
    return {
      participantesCasaMaestraVida: [],
      idPersonaSeleccionado: null,
      idPersonaMenuCx: null,
      mostrandoBuscadorAsistentes: false,

      textoBusqueda: "",
      versionBusqueda: 0,

      addingAsistente: false,

      opcionesAsistentes: [
        {
          textoVisible: "Remover",
          evento: "remover",
        },
      ],

      diasSemana,
    };
  },
  computed: {
    idsAsistentes() {
      return this.esteBloque.idsParticipantesConstantes;
    },
    personasAdicionables() {
      return this.participantesCasaMaestraVida.filter(
        (persona) =>
          !this.esteBloque.idsParticipantesConstantes.includes(persona.id)
      );
    },
    idsPersonasAdicionables() {
      return this.personasAdicionables.map((persona) => persona.id);
    },
    personasAdicionablesOrdenadas() {
      var versionBusqueda = this.versionBusqueda;
      if (!this.textoBusqueda || this.textoBusqueda.length <= 2) {
        return this.personasAdicionables;
      }
      var textoBusqueda = this.textoBusqueda;
      console.log("Version " + versionBusqueda);
      if (this.versionBusqueda < 0) {
        console.log("Error desconocido");
        return;
      }
      return [...this.personasAdicionables].sort((a, b) => {
        let res =
          stringSimilarity.compareTwoStrings(
            b.nombres + b.apellidos,
            textoBusqueda
          ) -
          stringSimilarity.compareTwoStrings(
            a.nombres + a.apellidos,
            textoBusqueda
          );

        return res;
      });
    },
    idsPersonasAdicionablesOrdenadas() {
      return this.personasAdicionablesOrdenadas.map((p) => p.id);
    },
    usuarioAdministrador() {
      return this.esteBloque.idAdministradorEspacio === this.usuario.id;
    },
    minutosInicio() {
      return Math.round(this.esteBloque.millisInicio / 60000);
    },
    minutosFinal() {
      return Math.round(this.esteBloque.millisFinal / 60000);
    },
  },
  methods: {
    iniciarAdicionAsistente() {
      this.mostrandoBuscadorAsistentes = true;
    },
    setTextoBusqueda() {
      var nuevoString = this.$refs.inputTextoBuscador.value;
      this.textoBusqueda = nuevoString;
      this.versionBusqueda++;
    },
    addComoAsistente(idAsistente) {
      if (!this.usuarioAdministrador && !this.usuarioSuperadministrador) {
        return;
      }

      this.addingAsistente = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idEspacio: ID!, $idIteracion: ID!, $idAsistente: ID!) {
              addAsistenteIteracionSemanalEspacio(
                idEspacio: $idEspacio
                idIteracion: $idIteracion
                idAsistente: $idAsistente
              ) {
                id
                idsParticipantesConstantes
              }
            }
          `,
          variables: {
            idEspacio: this.esteBloque.idEspacio,
            idIteracion: this.esteBloque.id,
            idAsistente,
          },
        })
        .then(() => {
          this.addingAsistente = false;
        })
        .catch((error) => {
          this.addingAsistente = false;
          console.log(`Error ${error}`);
        });
    },
    removerAsistente(idAsistente) {
      if (!this.usuarioAdministrador && !this.usuarioSuperadministrador) {
        return;
      }

      this.removingAsistente = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idEspacio: ID!, $idIteracion: ID!, $idAsistente: ID!) {
              removeAsistenteIteracionSemanalEspacio(
                idEspacio: $idEspacio
                idIteracion: $idIteracion
                idAsistente: $idAsistente
              ) {
                id
                idsParticipantesConstantes
              }
            }
          `,
          variables: {
            idEspacio: this.esteBloque.idEspacio,
            idIteracion: this.esteBloque.id,
            idAsistente,
          },
        })
        .then(() => {
          this.removingAsistente = false;
        })
        .catch((error) => {
          this.removingAsistente = false;
          console.log(`Error ${error}`);
        });
    },
    toTiempoFormateado(minutos) {
      var horas = Math.floor(minutos / 60);
      if (String(horas).length < 2) {
        horas = "0" + horas;
      }

      var minutosSolos = String(Math.round(minutos - horas * 60));

      if (minutosSolos.length < 2) {
        minutosSolos = "0" + minutosSolos;
      }

      return horas + ":" + minutosSolos;
    },
  },
};
</script>

<style scoped>
#fondoGris {
  position: fixed;
  background-color: rgba(0, 0, 0, 0.411);
  top: 0%;
  left: 0%;
  width: 100vw;
  height: 100vh;
}

#laPropiaVentana {
  position: fixed;
  top: 8%;
  left: 50%;
  transform: translate(-50%, -0%);
  width: min(700px, 95%);
  min-height: 400px;
  max-height: 90%;
  overflow-y: scroll;
  z-index: 1;
  background-color: rgb(218 218 218);
}

#titulo {
  padding: 20px 20px;
  text-align: center;
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 20px;
}

#infoBasica {
  padding: 20px 20px;
}
.barraListaUsuarios {
  background-color: rgb(169 169 169);
  padding: 10px 20px;
  display: flex;
  align-items: center;
}

.barraListaUsuarios .contenedorControles {
  margin-left: auto;
}

.zonaInformacion {
  display: flex;
  align-items: center;
  padding: 10px 10px;
}

#inputTextoBuscador {
  display: block;
  margin: 10px auto;
  font-size: 20px;
  padding: 5px 10px;
  border-radius: 5px;
  background-color: rgba(255, 255, 255, 0.267);
}
</style>
