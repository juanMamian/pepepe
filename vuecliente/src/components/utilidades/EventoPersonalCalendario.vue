<template>
  <div
    class="eventoPersonalCalendario"
    :style="[estiloPos, estiloZ]"
    :class="{
      deshabilitado: eliminandose,
      seleccionado,
      bloque: claseOffset === 'bloque' || seleccionado,
      barra: claseOffset === 'barra' && !seleccionado,
    }"
  >
    <div
      id="barra"
      :style="estiloSize"
      :class="{ seleccionado, extranjero }"
    ></div>
    <div
      id="bloque"
      :style="estiloSize"
      :class="{ extranjero, seleccionado, deNodoSolidaridad:esteEvento.tipoParent==='nodoSolidaridad' }"
    >
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
          title="Eliminar este evento"
          v-if="administrador || usuarioSuperadministrador || usuarioProfe"
          @click.stop="eliminarse"
        >
          <img src="@/assets/iconos/trash.svg" alt="Eliminar" />
        </div>
        <div
          class="boton botonControlEvento"
          title="Expandir este evento"
          @click.stop="
            $router.push(
              $route.path + '/ventanaEventoPersonal/' + esteEvento.id
            )
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
import { MixinBasicoEventos, MixinEdicionEventos, MixinEventoCalendario } from "../MixinsEventos";

export default {
  name: "eventoPersonalCalendario",
  components: {},
  props: {
    esteEvento: Object,
    horaPx: Number,
    seleccionado: Boolean,
    infoOffset: Object,
    extranjero: Boolean,
    diaCalendarioOver: Object,
  },
  mixins: [MixinBasicoEventos, MixinEventoCalendario, MixinEdicionEventos],
  data() {
    return {
      mostrando: null,
    };
  },
  methods: {},
  computed: {
    administrador() {
      if (!this.usuarioLogeado) return false;

      return this.usuario.id === this.esteEvento.idPersona;
    },
    modo() {
      return "bloque";
    },
  },
};
</script>

<style scoped>
.eventoPersonalCalendario {
  position: absolute;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  box-sizing: border-box;
  border-width: 2px;
  border-style: solid;
  border-color: white;
  color: rgb(27, 27, 27);
}
.eventoPersonalCalendario.seleccionado {
  border-color: var(--calendarioSelect);
  
}
.eventoPersonalCalendario.barra #bloque {
  display: none;
}
#barra {
  height: 15px;
  background-color: var(--calendarioUsuarioStrong);
  opacity: 1;
}
#barra.extranjero{
  background-color: rgb(65, 65, 65);

}
#bloque {
  height: 100px;  
  background-color: var(--calendarioUsuario);
}

#bloque.deNodoSolidaridad{
  background-color: var(--calendarioNodoSolidaridad);
}
#bloque.extranjero {
  background-color: gray;
}
#bloque.seleccionado {
  height: 100px;
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