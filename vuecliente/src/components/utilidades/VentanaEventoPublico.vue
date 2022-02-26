<template>
  <div class="ventanaEventoPublico">
    <div id="zonaCobertura">
      <div id="laVentana">
        <loading texto="" v-show="$apollo.queries.esteEvento.loading"/>
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

            <div id="zonaParticipantes" v-show="mostrando === 'participantes'">
              <div id="bloqueMaxParticipantes" class="bloqueCampo">
                <div class="nombreCampo">Maximo:</div>
                <div class="valorCampo">
                  <input
                    @keypress.enter.prevent="guardarNuevoLimiteDeCupos"
                    ref="inputNuevoLimiteDeCupos"
                    v-model="nuevoLimiteDeCupos"
                    @click.stop=""
                    @blur="guardarNuevoLimiteDeCupos"
                    v-show="editandoLimiteDeCupos"
                    type="number"
                    class="inputNuevoLimiteDeCupos inputLimiteDeCuposCosa"
                    :class="{ deshabilitado: enviandoNuevoLimiteDeCupos }"
                  />
                  <loading texto="" v-show="enviandoNuevoLimiteDeCupos" />
                  <div
                    id="elLimiteDeCupos"
                    :class="{
                      deshabilitado: enviandoNuevoLimiteDeCupos,
                      administrador,
                    }"
                    v-show="!editandoLimiteDeCupos"
                    @click="toggleEditandoLimiteDeCupos"
                  >
                    {{ esteEvento.limiteDeCupos || "Sin límite" }}
                  </div>
                </div>

                <div class="boton" style="margin-left:20px" @click="broadcastAFuturoMaximoParticipantes" title="Fijar este valor para todos los eventos futuros de este espacio">
                  <img src="@/assets/iconos/broadcastTower.svg" alt="Todos">
                </div>
              </div>
              <div id="listaParticipantes">
                <info-participante-evento-publico
                  :estaParticipacion="participacion"
                  v-for="participacion of esteEvento.eventosEnmarcados"
                  :key="participacion.id"
                  :eventoPublico="esteEvento"
                  :duracionEventoPublico="duracionMinutos"
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
import { fragmentoEventoPublico } from "./fragsCalendario";
import IconoPersonaAutonomo from "../usuario/IconoPersonaAutonomo.vue";
import {
  MixinBasicoEventos,
  MixinBasicoEventosPublicos,
  MixinEdicionEventos,
  MixinEdicionEventosPublicos,
  MixinVentanaEvento,
} from "../MixinsEventos";
import InfoParticipanteEventoPublico from "./InfoParticipanteEventoPublico.vue";
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
      fetchPolicy: "cache-and-network"
    },
  },
  components: {
    Loading,
    IconoPersonaAutonomo,
    InfoParticipanteEventoPublico,
  },
  mixins: [
    MixinBasicoEventos,
    MixinBasicoEventosPublicos,
    MixinEdicionEventos,
    MixinEdicionEventosPublicos,
    MixinVentanaEvento,
  ],
  data() {
    return {
      
    };
  },
  methods: {
    broadcastAFuturoMaximoParticipantes(){
      console.log(`Se fijará que todos los eventos futuros de este espacio tengan ${this.esteEvento.limiteDeCupos}`);

      if(!confirm('Se fijará que todos los eventos de este espacio (Posteriores a este) tendrán un límite de cupos de '+this.esteEvento.limiteDeCupos+'. ¿Continuar?')){
        return
      }

      this.$apollo.mutate({
        mutation: gql`
          mutation($idEspacio: ID!, $dateFrom: Date!, $limiteDeCupos: Int!){
            setLimiteDeCuposEventosPublicosEspacioFromDate(idEspacio: $idEspacio, dateFrom: $dateFrom, limiteDeCupos: $limiteDeCupos)                        
          }
        `,
        variables:{
          idEspacio: this.esteEvento.idParent,
          dateFrom: this.dateInicio,
          limiteDeCupos: this.esteEvento.limiteDeCupos,

        }
      }).then(()=>{

      }).catch((error)=>{
        console.log(`Error: ${error}`);
      })
    }
  },
  computed: {
    
  },
};
</script>

<style scoped>
.ventanaEventoPublico {
  position: fixed;
  top: 0px;
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
  background-color: var(--paletaMain);
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
  margin: 10px min(30px, 2vw);
  border: 1px solid black;
  padding: 10px 0px;
}
</style>