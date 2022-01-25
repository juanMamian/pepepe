<template>
  <div
    class="nodoPersona nodo"
    :class="{ seleccionado, deshabilitado: enviandoQueryGeneral }"
    :style="[
      estiloPosicion,
      estiloZeta,
      estiloSize,      
    ]"
  >
    <div id="bolita" :style="[estiloBolita]" :class="{ transparentoso }">
      <img
        id="fotografia"
        class="iconoFondo"
        :src="
          this.serverUrl + '/api/usuarios/fotografias/' + esteNodo.id
        "
        v-show="fotografiaEnabled"
        @load="fotografiaEnabled = true"
        alt="Usuario"
      />
    </div>

    <div
      id="iconoPlegado"
      v-show="esteNodo.vinculos && esteNodo.vinculos.length > 0"
      :class="{ deshabilitado: waitingFetchChildren }"
      @click.stop="toggleDesplegar"
      :style="{
        borderColor:
          waitingFetchChildren || transparentoso
            ? 'transparent'
            : desplegado
            ? 'var(--atlasNaranja)'
            : 'gray',
      }"
    >
      <img
        src="@/assets/iconos/folder.svg"
        v-show="!desplegado && !waitingFetchChildren"
        alt="Plegado"
        title="Desplegar"
        style="filter: var(--atlasFilterGris)"
        :class="{ transparentoso }"
      />
      <img
        src="@/assets/iconos/folderOpen.svg"
        v-show="desplegado && !waitingFetchChildren"
        alt="Desplegado"
        title="Plegar"
        style="filter: var(--atlasFilterGris)"
        :class="{ transparentoso }"
      />
      <loading texto="" v-show="waitingFetchChildren" />
    </div>

    <div
      id="cartelNombre"
      :style="[estiloCartelNombre, colorCartelNombre]"
      :class="{
        transparentoso,
        completa:
          seleccionado || requeridoPorSeleccionado || requiereAlSeleccionado,
      }"
    >
      <div id="nombre" draggable="false">
        <!-- <img
          src="@/assets/iconos/estrella.png"
          alt=""
          class="iconoNodo"
          draggable="false"
          :style="{width: Math.round(17*factorZoom)+'px'}"
          :class="{
            iconoCompletado: esteNodo.estadoDesarrollo === 'completado',
          }"
        /> -->
        {{
          callingPosiciones
            ? esteNodo.fuerzaColision.fuerza.toFixed(2) +
              "-" +
              esteNodo.fuerzaColision.direccion.toFixed(2)
            : esteNodo.nombre
        }}
      </div>
    </div>

    <div
      id="menuContextual"
      @mouseup.stop=""
      @mousedown.stop=""
      v-show="menuCx"
    >
      <template v-if="usuarioResponsableAmplio">
        <div class="tituloSeccionMenuCx">Crear nuevo...</div>
        <div class="botonesSeccionMenuCx">
          <div
            class="botonMenuCx"
            :class="{ deshabilitado: creandoSubNodo }"
            @click.stop="crearNuevoNodoUnder({ tipoNodo: 'trabajo' })"
          >
            Trabajo
          </div>
          <div
            class="botonMenuCx"
            v-if="esteNodo.tipoNodo != 'trabajo'"
            :class="{ deshabilitado: creandoSubNodo }"
            @click.stop="crearNuevoNodoUnder({ tipoNodo: 'objetivo' })"
          >
            Objetivo
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import Loading from "../utilidades/Loading.vue";
import {
  MixinEdicionVinculosNodoSolidaridad,
  MixinNodoAtlas,
  MixinPermisosUsuarioNodoSolidaridad,
} from "./ConfiguracionNodoSolidaridad";
export default {
  components: { Loading },
  props: {
    esteNodo: Object,
    esNodoYo:Boolean
  },
  name: "NodoPersona",
  mixins: [MixinNodoAtlas, MixinPermisosUsuarioNodoSolidaridad, MixinEdicionVinculosNodoSolidaridad],
  data() {
    return {
      montado: true,

      fotografiaEnabled: false,
      enviandoQueryGeneral: false,


      size: {
        x: 50,
        y: 50,
      },
    };
  },
  computed: {
    colorCartelNombre() {
      var color = "var(--atlasGris)";
      var borde = "1px solid black";

      if (this.esNodoYo) {
        color = "rgb(180 117 148)";
        borde = "1px solid var(--atlasMorado)";
      }

      if (this.seleccionado) {
        borde = "1px solid var(--atlasNaranja)";
        color = "var(--atlasNaranja)";
      }
      return {
        backgroundColor: color,
        border: borde,
      };
    },
    
    nodoPersonaResponsableSeleccionado(){
        return this.nodoSeleccionado.responsables.includes(this.esteNodo.id);
    }
  },
  methods: {    
  },
  mounted() {
    this.montado = true;
  },
};
</script>

<style scoped>
@import "./estilosNodoAtlas.css";
</style>

<style scoped>
#fotografia {
  width: 100%;
  height: 100%;
}
#bolita {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
</style>