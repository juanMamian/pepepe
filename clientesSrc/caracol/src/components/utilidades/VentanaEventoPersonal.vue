<template>
  <div class="ventanaEventoPersonal">
    <div id="zonaCobertura">
      <div id="laVentana">
        <loading texto="" v-show="$apollo.queries.esteEvento.loading" />

        <div id="contenido" v-show="!$apollo.queries.esteEvento.loading">
          <div id="barraSuperior">
            <div
              class="boton"
              title="Cerrar"
              style="margin-left: auto"
              @click="cerrarVentana"
            >
              <img src="@/assets/iconos/times.svg" alt="Salir" />
            </div>

            <div
              class="boton"
              v-if="administrador || usuarioSuperadministrador"
              title="Repetir este evento"
              @click="mostrandoZonaRepetir = !mostrandoZonaRepetir"
            >
              <img src="@/assets/iconos/hourglass.svg" alt="Repetir" />
            </div>
          </div>
          <div id="zonaRepetir" v-show="mostrandoZonaRepetir">
            <div class="instruccion" style="margin-bottom: 10px">
              Repetir este evento...
            </div>

            <select
              name=""
              id="selectFrecuenciaRepetir"
              v-model="periodoRepetir"
            >
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
            <div
              class="boton"
              style="margin: 10px auto"
              title="Aceptar"
              v-show="!enviandoQueryRepetir"
              @click="repetirEvento(cantidadRepetir, periodoRepetir)"
            >
              <img src="@/assets/iconos/check.svg" alt="Aceptar" />
            </div>
            <loading
              texto=""
              v-show="enviandoQueryRepetir"
              style="margin: 10px auto"
            />
          </div>
          <div id="zonaNombre">
            <input
              @keypress.enter.prevent="guardarNuevoNombre"
              ref="inputNuevoNombre"
              v-model="nuevoNombre"
              @click.stop=""
              @blur="guardarNuevoNombre"
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
              <div class="valorCampo">
                <div
                  id="fechaInicio"
                  v-show="!editandoFechaInicio"
                  @click.stop="iniciarEdicionFechaInicio"
                >
                  {{ fechaInicioLegible }}
                </div>
                <input
                  type="date"
                  id="inputFechaInicio"
                  v-show="editandoFechaInicio"
                  ref="inputFechaInicio"
                  @keypress.enter="
                    updateFechaInicioHoldDuration($event.target.value)
                  "
                  @blur="updateFechaInicioHoldDuration($event.target.value)"
                />
                <div
                  id="horaInicio"
                  v-show="!editandoHoraInicio"
                  @click.stop="iniciarEdicionHoraInicio"
                >
                  {{ horaInicioLegible }}
                </div>

                <input
                  type="time"
                  id="inputHoraInicio"
                  v-show="editandoHoraInicio"
                  ref="inputHoraInicio"
                  :class="{ deshabilitado: enviandoSomeHorario }"
                  @blur="updateHoraInicioHoldDuration($event.target.value)"
                  @keypress.enter="
                    updateHoraInicioHoldDuration($event.target.value)
                  "
                />
              </div>
            </div>

            <div id="bloqueDuracion" class="bloqueCampo">
              <div class="nombreCampo">Duracion</div>
              <div class="valorCampo">
                <div
                  id="duracion"
                  v-show="!editandoDuracion"
                  @click.stop="iniciarEdicionDuracion"
                >
                  {{ duracionMinutos
                  }}{{ duracionMinutos != 1 ? " minutos" : " minuto" }}
                </div>
                <input
                  type="number"
                  id="inputDuracion"
                  style="width: 100px"
                  v-show="editandoDuracion"
                  ref="inputDuracion"
                  :class="{ deshabilitado: enviandoSomeHorario }"
                  @blur="updateDuracion($event.target.value)"
                  @keypress.enter="updateDuracion($event.target.value)"
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
              :title="
                mostrando === 'participantes'
                  ? 'Ocultar participantes'
                  : 'Mostrar participantes'
              "
              @click="
                mostrando =
                  mostrando === 'participantes' ? null : 'participantes'
              "
            >
              <img src="@/assets/iconos/users.svg" alt="Participantes" />
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

            <div
              id="zonaParticipantes"
              class="zonaInformacion"
              v-show="mostrando === 'participantes'"
            >
              <div id="listaParticipantes" v-if="esteEvento.idPersona">
                <icono-persona-autonomo
                  v-for="idParticipante of [esteEvento.idPersona].concat(
                    esteEvento.idsParticipantes
                  )"
                  :key="'participante' + idParticipante"
                  :idPersona="idParticipante"
                  :factorEscala="'0.7'"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import Loading from "./Loading.vue";
import { fragmentoEventoPersonal } from "./fragsCalendario";
import {
  MixinBasicoEventos,
  MixinBasicoEventosPersonales,
  MixinEdicionEventos,
  MixinVentanaEvento,
} from "../MixinsEventos";
import IconoPersonaAutonomo from "../usuario/IconoPersonaAutonomo.vue";
const QUERY_ESTE_EVENTO = gql`
  query ($idEvento: ID!) {
    eventoPersonal(idEvento: $idEvento) {
      ...fragEventoPersonal
    }
  }
  ${fragmentoEventoPersonal}
`;

export default {
  name: "VentanaEventoPersonal",
  apollo: {
    esteEvento: {
      query: QUERY_ESTE_EVENTO,
      variables() {
        return {
          idEvento: this.$route.params.idEvento,
        };
      },
      update({ eventoPersonal }) {
        return eventoPersonal;
      },
      fetchPolicy: "cache-and-network",
    },
  },
  components: {
    Loading,
    IconoPersonaAutonomo,
  },
  mixins: [
    MixinBasicoEventos,
    MixinBasicoEventosPersonales,
    MixinEdicionEventos,
    MixinVentanaEvento,
  ],
  data() {
    return {
      mostrandoZonaRepetir: false,
      periodoRepetir: "diariamente",
      cantidadRepetir: 1,
      esteEvento:{
        idsParticipantes:[]
      }
    };
  },
  methods: {},
  computed: {},
};
</script>

<style scoped>
.ventanaEventoPersonal {
  position: fixed;
  top: 100px;
  left: 0px;
  width: 100vw;
  height: 100vh;
  z-index: 100;
}
#laVentana {
  box-shadow: 3px 4px 4px rgba(0, 0, 0, 0.25);
  font-family: Salsa, cursive;
  border-radius: 7px;
  width: min(600px, 90vw);
  height: min(800px, 90vh);
  margin: auto auto;
  background-color: var(--paletaVerde);
}
#barraSuperior {
  padding: 10px;
  display: flex;
  flex-direction: row-reverse;
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
#listaParticipantes {
  border: 1px solid white;
  border-radius: 10px;
  padding: 15px 10px;
  margin: 10px;
  display: flex;
  flex-wrap: wrap;
}
.iconoPersonaAutonomo {
  margin: 10px 15px;
  margin-bottom: 60px;
}
</style>