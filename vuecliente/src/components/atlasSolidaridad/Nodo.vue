<template>
  <div
    class="nodo"
    :class="{ seleccionado, deshabilitado: enviandoQueryGeneral }"
    :style="[estiloPosicion, estiloZeta, estiloSize, estiloTransicion]"
    @mousedown.left="agarrado = callingPosiciones ? false : true"
    @mouseup.left="guardarPosicion"
    @mousemove="arrastrarNodo"
  >
    <div id="zonaArrastre" v-show="agarrado"></div>

    <div id="bolita" :style="[estiloBolita]" :class="{ transparentoso }">
      <svg
        aria-hidden="true"
        focusable="false"
        data-prefix="fas"
        data-icon="cog"
        class="svg-inline--fa fa-cog fa-w-16 iconoFondo"
        role="img"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
        v-if="esteNodo.tipoNodo === 'trabajo'"
      >
        <path
          :fill="colorIcono"
          d="M487.4 315.7l-42.6-24.6c4.3-23.2 4.3-47 0-70.2l42.6-24.6c4.9-2.8 7.1-8.6 5.5-14-11.1-35.6-30-67.8-54.7-94.6-3.8-4.1-10-5.1-14.8-2.3L380.8 110c-17.9-15.4-38.5-27.3-60.8-35.1V25.8c0-5.6-3.9-10.5-9.4-11.7-36.7-8.2-74.3-7.8-109.2 0-5.5 1.2-9.4 6.1-9.4 11.7V75c-22.2 7.9-42.8 19.8-60.8 35.1L88.7 85.5c-4.9-2.8-11-1.9-14.8 2.3-24.7 26.7-43.6 58.9-54.7 94.6-1.7 5.4.6 11.2 5.5 14L67.3 221c-4.3 23.2-4.3 47 0 70.2l-42.6 24.6c-4.9 2.8-7.1 8.6-5.5 14 11.1 35.6 30 67.8 54.7 94.6 3.8 4.1 10 5.1 14.8 2.3l42.6-24.6c17.9 15.4 38.5 27.3 60.8 35.1v49.2c0 5.6 3.9 10.5 9.4 11.7 36.7 8.2 74.3 7.8 109.2 0 5.5-1.2 9.4-6.1 9.4-11.7v-49.2c22.2-7.9 42.8-19.8 60.8-35.1l42.6 24.6c4.9 2.8 11 1.9 14.8-2.3 24.7-26.7 43.6-58.9 54.7-94.6 1.5-5.5-.7-11.3-5.6-14.1zM256 336c-44.1 0-80-35.9-80-80s35.9-80 80-80 80 35.9 80 80-35.9 80-80 80z"
        ></path>
      </svg>
      <svg
        aria-hidden="true"
        focusable="false"
        data-prefix="fas"
        data-icon="star"
        class="svg-inline--fa fa-star fa-w-18 iconoFondo"
        role="img"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 576 512"
        v-else
        :class="{ transparentoso }"
      >
        <path
          :fill="colorIcono"
          d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z"
        ></path>
      </svg>
    </div>
    <div
      id="iconoPlegado"
      v-show="
        (esteNodo.vinculos && esteNodo.vinculos.length > 0) ||
        esteNodo.responsables.length > 0
      "
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
    <img
      src="@/assets/iconos/maximizar.png"
      alt="abrir"
      class="bAbrirNodo"
      title="Ampliar información"
      v-show="seleccionado && !enVentanita"
      @click.left.stop="$emit('meAbrieron')"
      @mouseup.left.stop=""
      @mousedown.left.stop=""
    />
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
      v-show="menuCx && usuarioLogeado"
    >
      <div class="tituloSeccionMenuCx" v-show="usuarioLogeado">Yo...</div>
      <div class="botonesSeccionMenuCx" v-show="usuarioLogeado">
        <div
          class="botonMenuCx"
          v-show="
            usuarioLogeado &&
            nodoYo &&
            !nodoYo.vinculos.map((v) => v.idRef).includes(esteNodo.id)
          "
          :class="{ deshabilitado: enviandoEditVinculos }"
          @click.stop="crearRequerimento(usuario.id, 'usuario', esteNodo.id)"
        >
          Requiero este nodo
        </div>
        <div
          class="botonMenuCx"
          v-show="
            usuarioLogeado &&
            nodoYo &&
            nodoYo.vinculos.map((v) => v.idRef).includes(esteNodo.id)
          "
          :class="{ deshabilitado: enviandoEditVinculos }"
          @click.stop="eliminarRequerimento(usuario.id, 'usuario', esteNodo.id)"
        >
          No requiero este nodo
        </div>
        <div
          class="botonMenuCx"
          v-show="
            usuarioLogeado &&
            requeridoPorSeleccionado &&
            !childSeleccionado &&
            (usuarioSuperadministrador || esteNodo.administradores.length < 1)
          "
          :class="{ deshabilitado: enviandoEditVinculos }"
          @click.stop="crearParenting(usuario.id, 'usuario', esteNodo.id)"
        >
          Me adueño de este nodo
        </div>
      </div>

      <template
        v-if="idNodoSeleccionado != null && idNodoSeleccionado != esteNodo.id && idNodoSeleccionado != usuario.id"
      >
        <div class="tituloSeccionMenuCx">El nodo seleccionado...</div>
        <div class="botonesSeccionMenuCx">
          <div
            class="botonMenuCx"
            @click.stop="eliminarRequerimento(idNodoSeleccionado, nodoSeleccionado.__typename.charAt(0).toLowerCase() + nodoSeleccionado.__typename.slice(1), esteNodo.id)"
            v-show="
              requeridoPorSeleccionado &&
              (usuarioResponsableAmplioNodoSeleccionado ||
                usuarioSuperadministrador)
            "
            :class="{ deshabilitado: enviandoEditVinculos }"
          >
            Ya no requiere este nodo
          </div>
          <div
            class="botonMenuCx"
            :class="{ deshabilitado: enviandoEditVinculos }"
            v-show="
              (usuarioResponsableAmplioNodoSeleccionado ||
                usuarioSuperadministrador) &&
              !requeridoPorSeleccionado &&
              !requiereAlSeleccionado
            "
            @click.stop="crearRequerimento(idNodoSeleccionado, nodoSeleccionado.__typename.charAt(0).toLowerCase()+nodoSeleccionado.__typename.slice(1), esteNodo.id)"
          >
            Requiere este elemento
          </div>
          <div
            class="botonMenuCx"
            :class="{ deshabilitado: enviandoEditVinculos }"
            v-show="
              usuarioSuperadministrador &&
              requeridoPorSeleccionado &&
              !childSeleccionado &&
              idNodoSeleccionado != usuario.id
            "
            @click.stop="crearParenting(idNodoSeleccionado, nodoSeleccionado.__typename.charAt(0).toLowerCase()+nodoSeleccionado.__typename.slice(1), esteNodo.id)"
          >
            Se adueña de este elemento
          </div>
        </div>
      </template>
      <template v-if="usuarioResponsableAmplio">
        <div class="tituloSeccionMenuCx">Crear nuevo...</div>
        <div class="botonesSeccionMenuCx">
          <div
            class="botonMenuCx"
            :class="{ deshabilitado: creandoSubNodo }"
            @click.stop="
              crearNuevoNodoUnder({ tipoNodo: 'trabajo' })
            "
          >
            Trabajo
          </div>
          <div
            class="botonMenuCx"
            v-if="esteNodo.tipoNodo != 'trabajo'"
            :class="{ deshabilitado: creandoSubNodo }"
            @click.stop="
              crearNuevoNodoUnder({ tipoNodo: 'objetivo' })
            "
          >
            Objetivo
          </div>
        </div>
      </template>
      <div
        class="botonMenuCx"
        v-show="
          (usuarioSuperadministrador || usuarioAdministrador) &&
          (!idNodoSeleccionado || seleccionado)
        "
        :class="{
          deshabilitado: !usuarioAdministrador && !usuarioSuperadministrador,
        }"
        @click.stop="eliminarse"
      >
        Eliminar
      </div>
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import Loading from "../utilidades/Loading.vue";
import {
  MixinEdicionVinculosNodoSolidaridad,
  MixinGeneralNodoSolidaridad,
  MixinNodoAtlas,
  MixinPermisosUsuarioNodoSolidaridad,
  MixinVisualesNodosSolidaridad,
} from "./ConfiguracionNodoSolidaridad";

export default {
  components: { Loading },
  props: {
    nodoYo: Object,
  },
  name: "nodo",
  mixins: [
    MixinEdicionVinculosNodoSolidaridad,
    MixinPermisosUsuarioNodoSolidaridad,
    MixinGeneralNodoSolidaridad,
    MixinVisualesNodosSolidaridad,
    MixinNodoAtlas,
  ],
  data() {
    return {
      agarrado: false,
      arrastrandoNodo: 0,
      umbralArrastreNodo: 10,
      montado: false,
    };
  },
  methods: {
    arrastrarNodo(e) {
      if (
        !this.agarrado ||
        (this.usuarioAdministrador === false &&
          this.usuarioSuperadministrador === false)
      ) {
        return;
      }
      this.arrastrandoNodo =
        this.arrastrandoNodo + Math.abs(e.movementX) + Math.abs(e.movementY);
      if (this.arrastrandoNodo < this.umbralArrastreNodo) {
        return;
      }
      var contenedor = document.getElementById("contenedorNodos");
      let posContenedor = contenedor.getBoundingClientRect();

      let nuevoTop = Math.round(
        (e.clientY - posContenedor.top) / this.factorZoom
      );
      let nuevoLeft = Math.round(
        (e.clientX - posContenedor.left) / this.factorZoom
      );

      const stepPosx = 25;
      const stepPosy = 15;

      nuevoLeft = nuevoLeft - (nuevoLeft % stepPosx);
      nuevoTop = nuevoTop - (nuevoTop % stepPosy);

      this.$set(this.posicion, "x", nuevoLeft);
      this.$set(this.posicion, "y", nuevoTop);
    },
    guardarPosicion() {
      if (this.arrastrandoNodo < this.umbralArrastreNodo) {
        this.agarrado = false;
        return;
      }
      if (!this.usuarioAdministrador && !this.usuarioSuperadministrador) {
        this.agarrado = false;
        return;
      }
      this.arrastrandoNodo = 0;
      this.agarrado = false;

      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idNodo: ID!, $nuevaPosicion: CoordsInput) {
              setPosicionNodoSolidaridad(
                idNodo: $idNodo
                nuevaPosicion: $nuevaPosicion
              ) {
                id
                coords {
                  x
                  y
                }
              }
            }
          `,
          variables: {
            idNodo: this.esteNodo.id,
            nuevaPosicion: this.posicion,
          },
        })
        .then(() => {
          console.log(`Posición guardada`);
          this.$emit("meMovi");
        })
        .catch((error) => {
          console.log(`Error. E: ${error}`);
        });
    },
  },
};
</script>

<style scoped>
@import "./estilosNodoAtlas.css";
</style>