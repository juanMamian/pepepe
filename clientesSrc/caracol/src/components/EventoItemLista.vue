<template>
  <div class="eventoItemLista" :class="{deshabilitado: eliminandose}">
    <div id="barraSuperior">
      <!-- <div id="zona1">
        <div id="zonaNombre">
          <input
            @keypress.enter.prevent="guardarNuevoNombre"
            ref="inputNuevoNombre"
            v-model="nuevoNombre"
            style="width: 250px"
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
      </div> -->
      <div id="zonaInfoHorario" style="display: flex">
        <div id="horarioInicio" class="infoHorario">
          {{ dateInicioLegible +', ' +duracionLegible}}
        </div>        
      </div>
      <div id="zonaBotones">
        <div
          class="boton botonControlEvento"
          title="Expandir este evento"
          @click.stop="
            $router.push($route.path + '/ventanaEventoPublico/' + esteEvento.id)
          "
        >
          <img src="@/assets/iconos/expand.svg" alt="Expandir" />
        </div>
        <div
          class="boton botonMostrar"
          @click="
            mostrando = mostrando === 'descripcion' ? null : 'descripcion'
          "
        >
          <img src="@/assets/iconos/exclamationCircle.svg" alt="Informacion" />
        </div>
        <div
          class="boton"
          id="botonEliminarse"
          style="margin-left: min(20px, 3%)"
          @click="eliminarse"
          v-show="administrador || usuarioSuperadministrador"
        >
          <img src="@/assets/iconos/trash.svg" alt="Eliminar" />
        </div>
      </div>
    </div>
    <div id="barraInfo">
      <div id="zonaNombre">
        <input
          @keypress.enter.prevent="guardarNuevoNombre"
          ref="inputNuevoNombre"
          v-model="nuevoNombre"
          style="width: 250px"
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
    </div>
    <div
      id="zonaDescripcion"
      class="zonaPrimerNivel"
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
        ref="inputNuevoDescripcion"
        class="inputTextoNodo"
        :class="{ letrasRojas: nuevoDescripcionIlegal }"
        v-model="nuevoDescripcion"
        v-show="editandoDescripcion"
      />
      <div class="contenedorBotonesCampo" v-show="editandoDescripcion">
        <img
          src="@/assets/iconos/save.svg"
          class="botonGuardarCampo"
          alt="Guardar"
          title="Guardar descripción"
          id="botonGuardarDescripcion"
          @click="guardarNuevoDescripcion"
        />
        <img
          src="@/assets/iconos/equis.svg"
          class="botonGuardarCampo"
          alt="Cancelar"
          title="Cancelar edición"
          id="botonCancelarEdicionDescripcion"
          @click="editandoDescripcion = false"
        />
      </div>
      <loading v-show="enviandoNuevoDescripcion" texto="Enviando..." />
    </div>
  </div>
</template>

<script>
import { MixinBasicoEventos, MixinBasicoEventosPublicos, MixinEdicionEventos, MixinEdicionEventosPublicos } from "./MixinsEventos";
import Loading from "./utilidades/Loading.vue";
export default {
  components: { Loading },
  name: "EventoItemLista",
  props: {
    esteEvento: Object,
  },
  mixins: [MixinBasicoEventos, MixinEdicionEventos, MixinEdicionEventosPublicos, MixinBasicoEventosPublicos],
  data() {
    return {
      mostrando: null,
      eliminandose:false,
    };
  },
};
</script>

<style scoped>
#barraSuperior {
  display: flex;
}
#zona1 {
  display: flex;
}
#zonaBotones {
  margin-left: auto;
  display: flex;
  align-items: center;
}
#botonEliminarse {
  margin-left: max(15px, 2%);
}
.infoHorario {
  font-size: 14px;
  color: gray;
}
#infoDuracion {
  color: var(--paletaMain);
  font-weight: bold;
}
#zonaBotones .boton {
  margin: 0px min(15px, 2%);
}
#elNombre{
  font-size: 12px;
  font-style: italic;
}
</style>