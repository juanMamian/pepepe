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
    <div id="bloque" :style="estiloSize" :class="{ extranjero, seleccionado }">
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
      <div id="contenedorControlesEvento" :class="{ seleccionado }">
        <div
          class="boton botonControlEvento"
          title="Asistir a este evento"
          v-if="usuarioLogeado && !administrador"
          @click.stop="crearEventoPersonalUnder"
        >
          <img src="@/assets/iconos/calendarPlus.svg" alt="Asistir" />
        </div>
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
  </div>
</template>

<script>
import {
  MixinBasicoEventosPublicos,
  MixinEventosPublicosUseEventosPersonalesUnder,
  MixinBasicoEventos,
  MixinEventoCalendario,
} from "../MixinsEventos";

export default {
  name: "EventoPublicoCalendario",
  components: {},
  props: {
    extranjero: Boolean,
  },
  mixins: [
    MixinBasicoEventos,
    MixinBasicoEventosPublicos,
    MixinEventoCalendario,
    MixinEventosPublicosUseEventosPersonalesUnder,
  ],
  data() {
    return {
      mostrando: null,
    };
  },
  methods: {},
  computed: {
    administrador() {
      if (!this.usuarioLogeado) return false;

      return this.usuario.id === this.esteEvento.idAdministrador;
    },
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
  height: 100px;

  background-color: var(--calendarioPublico);
}
#bloque.extranjero {
  opacity: 0.6;
}
#bloque.seleccionado {
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
</style>