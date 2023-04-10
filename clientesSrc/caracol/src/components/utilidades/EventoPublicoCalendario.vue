<template>
  <div
    class="eventoPublicoCalendario"
    :style="[estiloPos, estiloZ]"
    :class="{
      deshabilitado: eliminandose,
      seleccionado,
      bloque: claseOffset === 'bloque' || seleccionado,
      barra: claseOffset === 'barra' && !seleccionado,
    }"
  >
    <div id="barra" :style="estiloSize" :class="{ seleccionado, administrador }"></div>
    <div id="bloque" :style="estiloSize" :class="{ extranjero, seleccionado }" style="position:relative">
      <div id="zonaNombre">
        <div
          id="elNombre"
          :class="{
            administrador,
          }"
        >
          {{ esteEvento.nombre }}
        </div>
      </div>
      <div id="cantidadAsistentes" v-if="esteEvento.eventosEnmarcados && esteEvento.eventosEnmarcados.length>0">
        <img src="@/assets/iconos/user.svg" alt="User" style="height:13px; margin-right: 6px">
        {{esteEvento.eventosEnmarcados.length}}{{esteEvento.limiteDeCupos?'/'+esteEvento.limiteDeCupos:''}}
      </div>
      <icono-persona-autonomo :class="{seleccionado}" style="margin: 0px auto" v-if="idUsuarioTarget!=esteEvento.idAdministrador || true" :idPersona="esteEvento.idAdministrador" :factorEscala="'0.7'" />
      <div id="contenedorControlesEvento" :class="{ seleccionado }">
        <div
          class="boton botonControlEvento"
          title="Asistir a este evento"
          v-if="usuarioLogeado && idUsuarioTarget!=esteEvento.idAdministrador"
          v-show="!creandoEventoPersonalUnder"
          @click.stop="crearEventoPersonalUnder"
        >
          <img src="@/assets/iconos/calendarPlus.svg" alt="Asistir" />
        </div>
        <loading v-show="creandoEventoPersonalUnder" />
        <div
          class="boton botonControlEvento"
          title="Eliminar este evento"
          v-if="administrador || usuarioSuperadministrador"
          @click.stop="eliminarse"
        >
          <img src="@/assets/iconos/trash.svg" alt="Eliminar" />
        </div>
        <div
          class="boton botonControlEvento"
          title="Expandir este evento"
          @click.stop="
            $router.push($route.path + '/ventanaEventoPublico/' + esteEvento.id)
          "
        >
          <img src="@/assets/iconos/expand.svg" alt="Expandir" />
        </div>
      </div>
    </div>
    <div id="contenedorMarcasTiempo" v-show="seleccionado">
      <div class="marcaTiempo" id="marcaTiempoInicio" @click="setHoraInicio" :class="{deshabilitado: enviandoNuevoDateInicio}">{{horaInicioLegible}}</div>
      <div class="marcaTiempo" id="marcaTiempoFinal" @click="setHoraFinal" :class="{deshabilitado: enviandoNuevoDateFinal}">{{horaFinalLegible}}</div>
    </div>
  </div>
</template>

<script>
import {
  MixinBasicoEventosPublicos,
  MixinEventosPublicosUseEventosPersonalesUnder,
  MixinBasicoEventos,
  MixinEventoCalendario,
  MixinEdicionEventos,
} from "../MixinsEventos";
import IconoPersonaAutonomo from '../usuario/IconoPersonaAutonomo.vue';
import Loading from './Loading.vue';

export default {
  name: "EventoPublicoCalendario",
  components: {IconoPersonaAutonomo, Loading},
  props: {
    extranjero: Boolean,
  },
  mixins: [
    MixinBasicoEventos,
    MixinBasicoEventosPublicos,
    MixinEventoCalendario,
    MixinEventosPublicosUseEventosPersonalesUnder,
    MixinEdicionEventos
  ],
  data() {
    return {
      mostrando: null,
    };
  },
  methods: {},
  computed: {
    
  },
};
</script>

<style scoped>
.eventoPublicoCalendario {
  position: absolute;
  box-sizing: border-box;
  border-width: 2px;
  border-style: solid;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-color: white;
  color: rgb(48, 48, 48);
}
.eventoPublicoCalendario.seleccionado {
  border-color: var(--calendarioSelect);
}
.eventoPublicoCalendario.barra #bloque {
  display: none;
}
#barra {
  height: 15px;
  background-color: var(--calendarioPublicoStrong);
  opacity: 1;
}
#barra.administrador{
  background-color: var(--calendarioUsuarioStrong);
}
#barra.seleccionado {
  opacity: 1;
}
#bloque {
  height: 160px;

  background-color: var(--calendarioPublico);
}
#bloque.extranjero {
  opacity: 0.6;
}
#bloque.seleccionado {
  opacity: 1;
}
#cantidadAsistentes{
  display: flex;
  font-size: 11px;
  align-items: center;
  justify-content: center;
}
.iconoPersonaAutonomo.seleccionado{
  opacity: 1;
}
#contenedorControlesEvento {
  display: flex;
  position: absolute;
  bottom: 10px;
  left: 50%;
  align-items: center;
  flex-direction: row-reverse;
  transform: translateX(-50%);
  box-sizing: border-box;
  padding: 0px 5%;
}
#contenedorControlesEvento:not(.seleccionado) {
  display: none;
}
#contenedorControlesEvento.seleccionado {
  display: flex;
}

#contenedorControlesEvento .boton {
  height: 15px;
  margin: 0px 5%;
}
#elNombre {
  text-align: center;
  font-size: 10px;
  padding: 5px 3px;
}
.inputNuevoNombre {
  width: 100%;
  box-sizing: border-box;
  font-size: 11px;
}

#contenedorMarcasTiempo{
  position: absolute;
  width: 100%;
  top:102%;
  
}
.marcaTiempo{
  font-size: 13px;
  color: orange;
  position: absolute;
  cursor:pointer;
  background-color: rgba(0, 0, 0, 0.349);
  padding: 5px;
}
#marcaTiempoInicio{
  right: 100%;
  transform: translateX(50%);
}
#marcaTiempoFinal{
  left: 100%;
  transform: translateX(-50%);
}
</style>