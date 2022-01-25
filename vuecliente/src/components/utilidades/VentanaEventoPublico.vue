<template>
  <div class="ventanaEventoPublico" :style="[colorVentana]">
    <div id="barraSuperior">
      <div class="boton" title="Cerrar" style="margin-left:auto" @click="cerrarVentana">
        <img src="@/assets/iconos/times.svg" alt="Salir" />
      </div>

      <div
        class="boton"
        title="Repetir este evento"        
        @click="mostrandoZonaRepetir = !mostrandoZonaRepetir"
      >
        <img src="@/assets/iconos/hourglass.svg" alt="Repetir" />
      </div>
    </div>

    <div
      id="zonaRepetir"
      v-show="mostrandoZonaRepetir"
    >
      <div class="instruccion" style="margin-bottom:10px">Repetir este evento...</div>

      <select name="" id="selectFrecuenciaRepetir" v-model="periodoRepetir">
        <option value="diariamente">Diariamente</option>
        <option value="semanalmente">Semanalmente</option>
      </select>
      <div id="bloqueCantidadRepetir" style="margin: 10px auto">
        <input
          type="number"
          :min="minRepetir"
          :max="maxRepetir"
          style="width: 50px; margin-right: 20px"
          name=""
          id="inputCantidadRepetir"
          v-model="cantidadRepetir"
        />
        {{ cantidadRepetir > 1 ? "veces" : "vez" }}
       
      </div>
        <div class="boton" style="margin: 10px auto;" title="Aceptar" @click="repetirEvento(cantidadRepetir, periodoRepetir)">
          <img src="@/assets/iconos/check.svg" alt="Aceptar" />
        </div>
    </div>
    <div id="zonaNombre">
      <input
        @keypress.enter.prevent="guardarNuevoNombre"
        ref="inputNuevoNombre"
        v-model="nuevoNombre"
        @click.stop=""
        @blur="editandoNombre = false"
        @keydown="keydownInputNuevoNombre"
        v-show="editandoNombre"
        type="text"
        class="inputNuevoNombre inputNombreCosa"
        :class="{ deshabilitado: enviandoNuevoNombre }"
      />
      <loading texto="" v-show="enviandoNuevoNombre" />
      <div
        id="elNombre"
        :class="{
          deshabilitado: enviandoNuevoNombre,
          administrador,
        }"
        v-show="!editandoNombre"
        @click="toggleEditandoNombre"
      >
        {{ esteEvento.nombre }}
      </div>
    </div>

    <div id="zonaTiempos">
      <div id="bloqueHorarioInicio" class="bloqueCampo">
        <div class="nombreCampo">Inicio</div>
        <div class="valorCampo" @click.stop="iniciarEdicionHorarioInicio">
          <div id="horarioInicio" v-show="!editandoHorarioInicio">
            {{ horarioInicioLegible }}
          </div>
          <input
            type="time"
            id="inputHorarioInicio"
            v-show="editandoHorarioInicio"
            ref="inputHorarioInicio"
            :class="{ deshabilitado: enviandoNuevoDateInicio }"
            @blur="editandoHorarioInicio = false"
            @change="updateHorarioInicio"
          />
        </div>
      </div>

      <div id="bloqueHorarioFinal" class="bloqueCampo">
        <div class="nombreCampo">Final</div>
        <div class="valorCampo" @click.stop="iniciarEdicionHorarioFinal">
          <div id="horarioFinal" v-show="!editandoHorarioFinal">
            {{ horarioFinalLegible }}
          </div>
          <input
            type="time"
            id="inputHorarioFinal"
            v-show="editandoHorarioFinal"
            ref="inputHorarioFinal"
            :class="{ deshabilitado: enviandoNuevoDateFinal }"
            @blur="editandoHorarioFinal = false"
            @change="updateHorarioFinal"
          />
        </div>
      </div>
    </div>

    <div id="bloqueLugar" v-if="esteEvento.lugar" class="bloqueCampo">
      <div class="nombreCampo">Lugar</div>
      <div class="valorCampo">
        {{ esteEvento.lugar }}
      </div>
    </div>

    <div class="bloqueAdministrador bloqueCampo">
      <div class="nombreCampo">Administra</div>
      <div class="valorCampo" style="opacity: 0.9">
        <icono-persona-autonomo
          :factorEscala="'0.5'"
          :idPersona="esteEvento.idAdministrador"
        />
      </div>
    </div>

    <div id="contenedorSelectoresMostrar">
      <div
        class="boton"
        :class="{
          deshabilitado:
            (!esteEvento.descripcion ||
              esteEvento.descripcion.length < 1) &&
            !administrador,
        }"
        :style="{
          borderColor: mostrando === 'descripcion' ? 'white' : 'black',
        }"
        @click="mostrando = 'descripcion'"
        :title="mostrando === 'descripcion' ? '' : 'Mostrar descripción'"
      >
        <img src="@/assets/iconos/info.svg" alt="Descripción" />
      </div>
      <div
        class="boton"
        :style="{
          borderColor: mostrando === 'participantes' ? 'white' : 'black',
        }"
        @click="mostrando = 'participantes'"
        :title="
          mostrando === 'participantes'
            ? ''
            : 'Mostrar participantes del evento'
        "
      >
        <img src="@/assets/iconos/user.svg" alt="Participantes" />
      </div>
    </div>

    <div id="zonaContenidoMostrando">
      <div
        id="zonaDescripcion"
        class="zonaInformacion"
        v-show="mostrando === 'descripcion'"
      >
        <div
          id="descripcion"
          class="contenidoTexto"
          ref="descripcion"
          v-show="!editandoDescripcion"
          @click="toggleEditandoDescripcion"
        >
          {{ esteEvento.descripcion }}
        </div>

        <textarea
          id="inputNuevoDescripcion"
          class="inputTexto"
          ref="inputNuevoDescripcion"
          :class="{ letrasRojas: nuevoDescripcionIlegal }"
          v-model="nuevoDescripcion"
          v-show="editandoDescripcion"
        />
        <div class="contenedorBotonesCampo" v-show="editandoDescripcion">
          <img
            src="@/assets/iconos/save.svg"
            class="boton botonGuardarCampo"
            alt="Guardar"
            title="Guardar descripción"
            id="botonGuardarDescripcion"
            @click="guardarNuevoDescripcion"
          />
          <img
            src="@/assets/iconos/equis.svg"
            class="boton botonGuardarCampo"
            alt="Cancelar"
            title="Cancelar edición"
            id="botonCancelarEdicionDescripcion"
            @click="editandoDescripcion = false"
          />
        </div>
        <loading v-show="enviandoNuevoDescripcion" texto="Enviando..." />
      </div>

      <div id="zonaParticipantes"></div>
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import Loading from "./Loading.vue";
import { fragmentoEventoPublico } from "./fragsCalendario";
import IconoPersonaAutonomo from "../usuario/IconoPersonaAutonomo.vue";
import debounce from "debounce";
import {MixinBasicoEventos, MixinEdicionEventos} from "../MixinsEventos";
const QUERY_ESTE_EVENTO = gql`
  query ($idEvento: ID!) {
    eventoPublico(idEvento: $idEvento) {
      ...fragEventoPublico
    }
  }
  ${fragmentoEventoPublico}
`;

export default {
  name: "VentanaEvento",
  apollo: {
    esteEvento: {
      query: QUERY_ESTE_EVENTO,
      variables() {
        return {
          idEvento: this.$route.params.idEvento,
        };
      },
      update({ eventoPublico }) {
        return eventoPublico;
      },
    },
  },
  components: {
    Loading,
    IconoPersonaAutonomo,
  },
  mixins:[MixinBasicoEventos, MixinEdicionEventos],
  data() {
    return {
      mostrando: null,      
            esteEvento: {},

      editandoHorarioInicio: false,
      editandoHorarioFinal: false,

      mostrandoZonaRepetir: false,
      periodoRepetir: "diariamente",
      cantidadRepetir: 1,
      
    };
  },
  methods: {
    
    cerrarVentana() {
      const indexEsteSubpath = this.$route.path.search("ventanaEventoPublico");
      const pathParent = this.$route.path.substring(0, indexEsteSubpath - 1);
      this.$router.push(pathParent);
    },
    iniciarEdicionHorarioInicio() {
      if (!this.administrador && !this.usuarioSuperadministrador) return;

      this.$refs.inputHorarioInicio.value = this.horaInicioString;
      this.editandoHorarioInicio = true;
      this.$nextTick(() => {
        this.$refs.inputHorarioInicio.focus();
      });
    },    
    updateHorarioInicio: debounce(function (e) {
      const nuevoTime = e.target.value;
      const horas = parseInt(nuevoTime.substring(0, 2));
      const minutos = parseInt(nuevoTime.substring(3));
      console.log(
        `nuevoTime: ${nuevoTime}. ${horas} horas y ${minutos} minutos`
      );
      const actualDateFinal = new Date(this.esteEvento.horarioFinal);
      var dateInicio = new Date(this.esteEvento.horarioInicio);
      console.log(`Actual date: ${dateInicio}`);
      dateInicio.setHours(horas);
      dateInicio.setMinutes(minutos);
      console.log(`Nueva date inicio: ${dateInicio}`);
      if (dateInicio > actualDateFinal) {
        return;
      }

      this.enviandoNuevoDateInicio = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($nuevoDate: Date!, $tipoEvento: String!, $idEvento: ID!) {
              setDateInicioEvento(
                nuevoDate: $nuevoDate
                tipoEvento: $tipoEvento
                idEvento: $idEvento
              )
            }
          `,
          variables: {
            nuevoDate: dateInicio,
            tipoEvento: "eventoPublico",
            idEvento: this.esteEvento.id,
          },
        })
        .then(({ data: { setDateInicioEvento } }) => {
          if (setDateInicioEvento) {
            const store = this.$apollo.provider.defaultClient;
            const cache = store.readQuery({
              query: QUERY_ESTE_EVENTO,
              variables: {
                idEvento: this.esteEvento.id,
              },
            });
            var nuevoCache = JSON.parse(JSON.stringify(cache));

            nuevoCache.eventoPublico.horarioInicio = dateInicio;
            store.writeQuery({
              query: QUERY_ESTE_EVENTO,
              variables: {
                idEvento: this.esteEvento.id,
              },
              data: nuevoCache,
            });
            this.enviandoNuevoDateInicio = false;
            this.editandoHorarioInicio = false;
          }
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
          this.enviandoNuevoDateInicio = false;
        });
      // const nuevoDate=this.
    }, 1000),
    iniciarEdicionHorarioFinal() {
      if (!this.administrador && !this.usuarioSuperadministrador) return;
      console.log(`Iniciando edicion`);
      this.$refs.inputHorarioFinal.value = this.horaFinalString;
      this.editandoHorarioFinal = true;
      this.$nextTick(() => {
        this.$refs.inputHorarioFinal.focus();
      });
    },
    updateHorarioFinal: debounce(function (e) {
      const nuevoTime = e.target.value;
      const horas = parseInt(nuevoTime.substring(0, 2));
      const minutos = parseInt(nuevoTime.substring(3));
      console.log(
        `nuevoTime: ${nuevoTime}. ${horas} horas y ${minutos} minutos`
      );
      const actualDateInicio = new Date(this.esteEvento.horarioInicio);
      var dateFinal = new Date(this.esteEvento.horarioFinal);
      console.log(`Actual date: ${dateFinal}`);
      dateFinal.setHours(horas);
      dateFinal.setMinutes(minutos);
      console.log(`Nueva date final: ${dateFinal}`);
      if (dateFinal < actualDateInicio) {
        return;
      }

      this.enviandoNuevoDateFinal = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($nuevoDate: Date!, $tipoEvento: String!, $idEvento: ID!) {
              setDateFinalEvento(
                nuevoDate: $nuevoDate
                tipoEvento: $tipoEvento
                idEvento: $idEvento
              )
            }
          `,
          variables: {
            nuevoDate: dateFinal,
            tipoEvento: "eventoPublico",
            idEvento: this.esteEvento.id,
          },
        })
        .then(({ data: { setDateFinalEvento } }) => {
          if (setDateFinalEvento) {
            const store = this.$apollo.provider.defaultClient;
            const cache = store.readQuery({
              query: QUERY_ESTE_EVENTO,
              variables: {
                idEvento: this.esteEvento.id,
              },
            });
            var nuevoCache = JSON.parse(JSON.stringify(cache));

            nuevoCache.eventoPublico.horarioFinal = dateFinal;
            store.writeQuery({
              query: QUERY_ESTE_EVENTO,
              variables: {
                idEvento: this.esteEvento.id,
              },
              data: nuevoCache,
            });
            this.enviandoNuevoDateFinal = false;
            this.editandoHorarioFinal = false;
          }
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
          this.enviandoNuevoDateFinal = false;
        });
      // const nuevoDate=this.
    }, 1000),
  },
  computed: {        
    colorVentana() {
      return {
        backgroundColor: "var(--paletaMain)",
      };
    },    
    horaInicioString() {
      return new Date(this.esteEvento.horarioInicio)
        .toTimeString()
        .substring(0, 5);
    },
    horaFinalString() {
      return new Date(this.esteEvento.horarioFinal)
        .toTimeString()
        .substring(0, 5);
    },
  },
  
};
</script>

<style scoped>
#barraSuperior {
  padding: 10px;
  display: flex;
  flex-direction: row-reverse;
}
.ventanaEventoPublico {
  box-shadow: 3px 4px 4px rgba(0, 0, 0, 0.25);
  font-family: Salsa, cursive;
  border-radius: 7px;
}
#zonaRepetir {
  margin-right: auto;
  background-color: rgba(255, 255, 255, 0.103);
  width: min(50%, 300px);
  font-size: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
#zonaNombre {
  text-align: center;
  margin: 8% auto;
}

.bloqueCampo {
  display: flex;
  width: min(200px, 90%);
  margin: 3% auto;
  font-size: 11px;
}
.valorCampo {
  margin-left: auto;
  font-family: Poppins, sans-serif;
  opacity: 0.6;
}
#contenedorSelectoresMostrar {
  display: flex;
  justify-content: center;
  margin: 10px auto;
}
#contenedorSelectoresMostrar .boton {
  border-width: 1px;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  border-style: solid;
  padding: 3px;
  box-sizing: border-box;
  margin: 0px 2%;
}
#zonaContenidoMostrando {
  min-height: 100px;
}
#zonaDescripcion {
  height: 100%;
}
#zonaDescripcion textarea {
  margin: 0px auto;
  display: block;
  width: 90%;
  min-height: 60px;
}
#descripcion {
  height: 100%;
  border: 1px solid white;
  border-radius: 10px;
  padding: 15px 10px;
  margin: 10px;
}
</style>