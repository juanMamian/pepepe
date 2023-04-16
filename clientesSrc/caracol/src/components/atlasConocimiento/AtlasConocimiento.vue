<template>
  <div
    class="atlasConocimiento"
    @click="clickFuera"
  >
    <RouterView id="viewerNodo" />

    <div id="contenedorOverlays">
      <gestor-colecciones
        ref="gestorColecciones"
        v-show="
          !conectandoNodosColeccion &&
          $route?.params?.tipoBrowse != 'browseNodo'
        "
        :opcionNull="$route.params?.tipoBrowse === 'mapa' ? 'Atlas' : ''"
        :conectandoNodosColeccion="conectandoNodosColeccion"
        @coleccionSeleccionada="coleccionSeleccionada = $event"
        @setConectandoNodosColeccion="conectandoNodosColeccion = $event"
      >
      </gestor-colecciones>

      <div
        class="anuncio anuncioSeleccion"
        id="anuncioConectandoNodos"
        v-show="conectandoNodosColeccion"
      >
        <img src="@/assets/iconos/plugSolid.svg" alt="Nodos" />
        Editando nodos de
        <span
          style="
            margin-left: -5px;
            font-weight: bold;
            color: var(--atlasConocimientoSeleccion);
          "
          >{{ coleccionSeleccionada ? coleccionSeleccionada.nombre : "" }}</span
        >
        <div
          class="boton"
          id="botonCancelarConectarNodosColeccion"
          @click.stop="conectandoNodosColeccion = false"
        >
          <img src="@/assets/iconos/equis.svg" alt="Cancelar" />
        </div>
      </div>
      <div
        v-if="
          conectandoNodosColeccion &&
          coleccionSeleccionada &&
          idNodoSeleccionado
        "
        class="botonTexto"
        id="botonToggleNodoColeccion"
        @click.stop="toggleNodoColeccion"
      >
        <Loading v-show="togglingNodoColeccion" />
        <img
          src="@/assets/iconos/plugSolid.svg"
          alt="Conectar"
          v-show="
            !nodoSeleccionadoBelongsColeccionSeleccionada &&
            !togglingNodoColeccion
          "
        />
        <img
          src="@/assets/iconos/equis.svg"
          alt="Desconectar"
          v-show="
            nodoSeleccionadoBelongsColeccionSeleccionada &&
            !togglingNodoColeccion
          "
        />
        <span>{{
          nodoSeleccionadoBelongsColeccionSeleccionada
            ? "Desconectar"
            : "Conectar"
        }}</span>
      </div>
      <buscador-nodos-conocimiento
        @nodoSeleccionado="reactToNodoBuscadoSeleccionado"
        ref="buscadorNodos"
      />

      <div
        id="botonCallingPosiciones"
        v-if="usuarioSuperadministrador && usuario.username == 'juanMamian'"
        @click.stop="iniciarCallingPosiciones"
        :class="{ deshabilitado: callingPosiciones }"
        :style="[
          { backgroundColor: callingPosiciones ? 'green' : 'transparent' },
        ]"
      ></div>

      <div id="zonaLocalizadores" @click.stop="">
        <div
          class="boton controlColeccion"
          :class="{
            deshabilitado: idsNodosActivosAccesiblesInexplorados.length < 1,
          }"
          @click="localizarNext('accesible')"
        >
          <img
            src="@/assets/iconos/atlas/locationCrosshair.svg"
            alt="Localizar"
          />
        </div>
        <div
          class="boton controlColeccion"
          @click="localizarNext('olvidado')"
          :class="{
            deshabilitado: idsNodosActivosOlvidados.length < 1,
          }"
        >
          <img
            src="@/assets/iconos/atlas/locationCrosshair.svg"
            alt="Localizar"
            style="filter: var(--filtroAtlasRepaso)"
          />
        </div>
        <div
          class="boton controlColeccion"
          @click="localizarNext('top')"
          :class="{
            deshabilitado: !idsNodosTop || idsNodosTop.length < 1,
          }"
        >
          <img
            src="@/assets/iconos/atlas/locationCrosshair.svg"
            alt="Localizar"
            style="filter: var(--filtroAtlasTop)"
          />
        </div>
      </div>
    </div>

    <mapa-atlas
      v-if="$route.params?.tipoBrowse === 'mapa'"
      :idNodoSeleccionado="idNodoSeleccionado"
      :nodoCreandoDependencia="nodoCreandoDependencia"
      :coleccionSeleccionada="coleccionSeleccionada"
      :conectandoNodosColeccion="conectandoNodosColeccion"
      ref="mapaAtlas"
      @settedIdsNodosActivosAccesiblesInexplorados="
        setIdsNodosActivosAccesiblesInexplorados($event, 'mapaAtlas')
      "
      @settedIdsNodosTop="setIdsNodosActivosTop($event, 'mapaAtlas')"
      @seleccionNodo="seleccionNodo"
    />

    <browse-coleccion
      v-if="tipoBrowse === 'browseColeccion' && $route?.params?.idBrowsed"
      :idNodoSeleccionado="idNodoSeleccionado"
      @seleccionNodo="seleccionNodo"
      :idColeccion="$route.params.idBrowsed"
    />
    <browse-nodo
      @seleccionNodo="seleccionNodo"
      :idNodoSeleccionado="idNodoSeleccionado"
      v-if="
        $route?.params?.tipoBrowse === 'browseNodo' && $route?.params?.idBrowsed
      "
      :idNodo="$route.params.idBrowsed"
    />

    <controles-nodo
      :yo="yo"
      ref="controlesNodo"
      :idNodoSeleccionado="idNodoSeleccionado"
      :nodoCreandoDependencia="nodoCreandoDependencia"
      @click.stop=""
      @iniciarCrearDependenciaNodo="marcarNodoEsperandoDependencia($event)"
      @cancelarCreandoDependencia="nodoCreandoDependencia = null"
      @nodoEliminado="reactToNodoEliminado"
      @centerEnTarget="centerEnTarget"
    />
  </div>
</template>

<script>
import { gql } from "@apollo/client/core";
import ControlesNodo from "./controlesNodo.vue";
import BrowseColeccion from "./browse/BrowseColeccion.vue";
import BrowseNodo from "./browse/BrowseNodo.vue";
import MapaAtlas from "./MapaAtlas.vue";
import { RouterView } from "vue-router";
import PieProgreso from "../utilidades/PieProgreso.vue";
import { QUERY_DATOS_USUARIO_NODOS } from "./fragsAtlasConocimiento";
import GestorColecciones from "./GestorColecciones.vue";
import Loading from "../utilidades/Loading.vue";
import BuscadorNodosConocimiento from "./BuscadorNodosConocimiento.vue";

export default {
  components: {
    MapaAtlas,
    PieProgreso,
    ControlesNodo,
    RouterView,
    BrowseColeccion,
    BrowseNodo,
    GestorColecciones,
    Loading,
    BuscadorNodosConocimiento,
  },
  name: "AtlasConocimiento",
  apollo: {
    yo: {
      query: QUERY_DATOS_USUARIO_NODOS,
      skip() {
        return !this.usuario?.id;
      },
    },
  },
  data() {
    return {
      togglingNodoColeccion: false,

      gettingNodoNext: false,
      indexLocalizadorAccesibles: 0,
      indexLocalizadorOlvidados: 0,
      indexLocalizadorTops: 0,

      callingPosiciones: false,

      coleccionSeleccionada: null,
      conectandoNodosColeccion: false,

      idNodoSeleccionado: null,
      nodoCreandoDependencia: null,

      idsNodosActivosAccesiblesInexplorados: [],
      idsNodosActivosOlvidados: [],
      idsNodosTop: [],
    };
  },
  computed: {
    nodoSeleccionadoBelongsColeccionSeleccionada() {
      if (!this.idNodoSeleccionado || !this.coleccionSeleccionada) {
        return false;
      }
      return this.coleccionSeleccionada.idsNodos.includes(
        this.idNodoSeleccionado
      );
    },
    tipoBrowse() {
      return this.$route?.params?.tipoBrowse;
    },
    idNodoTarget() {
      return this.yo?.atlas?.idNodoTarget;
    },
  },
  methods: {
    zoomWheel(e) {
      if (this.$refs.controlesNodo?.zoomWheel(e)) {
        console.log("wheel atrapado en controlesNodo");
        return;
      }
      if (this.tipoBrowse==='mapa' && this.$refs?.mapaAtlas) {
        this.$refs.mapaAtlas.zoomWheel(e);
      }
    },
    toggleNodoColeccion() {
      if (!this.idNodoSeleccionado || !this.coleccionSeleccionada) {
        return;
      }
      this.togglingNodoColeccion = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idColeccion: ID!, $idNodo: ID!, $idUsuario: ID!) {
              toggleNodoColeccionNodosAtlasConocimientoUsuario(
                idColeccion: $idColeccion
                idNodo: $idNodo
                idUsuario: $idUsuario
              ) {
                id
                idsNodos
                idsRed
              }
            }
          `,
          variables: {
            idColeccion: this.coleccionSeleccionada.id,
            idNodo: this.idNodoSeleccionado,
            idUsuario: this.usuario.id,
          },
        })
        .then(() => {
          this.togglingNodoColeccion = false;
        })
        .catch((error) => {
          console.log("Error: " + error);
          this.togglingNodoColeccion = false;
        });
    },
    clickFuera() {
      this.seleccionNodo();
      this.$refs.controlesNodo.clickFuera();
      if (this.$refs?.buscadorNodos) {
        this.$refs.buscadorNodos.cerrarBusqueda();
      }
      if(this.$refs.mapaAtlas){
        this.$refs.mapaAtlas.cerrarMenuContextual();
      }
    },
    localizarNext(tipo) {
      let nodoNext = null;
      let idNodoNext = null;
      if (tipo === "accesible") {
        if (this.idsNodosActivosAccesiblesInexplorados.length < 1) {
          return;
        }
        this.indexLocalizadorAccesibles++;
        if (
          this.indexLocalizadorAccesibles >=
          this.idsNodosActivosAccesiblesInexplorados.length
        ) {
          this.indexLocalizadorAccesibles = 0;
        }
        idNodoNext =
          this.idsNodosActivosAccesiblesInexplorados[
            this.indexLocalizadorAccesibles
          ];
      } else if (tipo === "olvidado") {
        if (this.idsNodosActivosOlvidados.length < 1) {
          return;
        }
        this.indexLocalizadorOlvidados++;
        if (
          this.indexLocalizadorOlvidados >= this.idsNodosActivosOlvidados.length
        ) {
          this.indexLocalizadorOlvidados = 0;
        }
        idNodoNext =
          this.idsNodosActivosOlvidados[this.indexLocalizadorOlvidados];
      } else if (tipo === "top") {
        if (!this.idsNodosTop || this.idsNodosTop.length < 1) {
          return;
        }
        this.indexLocalizadorTops++;
        if (this.indexLocalizadorTops >= this.idsNodosTop.length) {
          this.indexLocalizadorTops = 0;
        }
        console.log("saltando al nodo top " + this.indexLocalizadorTops);
        console.log(`De ${this.idsNodosTop.length}`);
        idNodoNext = this.idsNodosTop[this.indexLocalizadorTops];
        console.log(`Con id ${idNodoNext}`);
      }

      if (nodoNext) {
        this.centrarEnNodo(nodoNext);
        this.seleccionNodo(nodoNext);
        return;
      }
      var dis = this;

      if (idNodoNext) {
        this.gettingNodoNext = true;
        this.$apollo
          .query({
            query: gql`
              query ($idNodo: ID!) {
                nodo(idNodo: $idNodo) {
                  id
                  nombre
                  autoCoords
                }
              }
            `,
            variables: {
              idNodo: idNodoNext,
            },
            fetchPolicy: "cache-first",
          })
          .then(({ data: { nodo } }) => {
            this.gettingNodoNext = false;
            this.centrarEnNodo(nodo);
            this.seleccionNodo(nodo.id);
            return;
          })
          .catch((error) => {
            this.gettingNodoNext = false;
            console.log(`Error getting nodo next: ${error}`);
          });
      }
    },
    centrarEnNodo(nodo) {
      if (this.tipoBrowse === "mapa") {
        this.$refs.mapaAtlas.centrarEnNodo(nodo);
      }
    },
    setIdsNodosActivosAccesiblesInexplorados(ids, source) {
      if (source === "mapaAtlas" && this.tipoBrowse === "mapa") {
        this.idsNodosActivosAccesiblesInexplorados = ids;
      }
    },
    setIdsNodosActivosTop(ids, source) {
      if (source === "mapaAtlas" && this.tipoBrowse === "mapa") {
        this.idsNodosTop = ids;
      }
    },
    iniciarCallingPosiciones() {
      var ciclos = prompt("¿Cuantos ciclos?");
      if (isNaN(ciclos)) {
        return;
      }

      ciclos = Math.round(ciclos);
      if (ciclos < 1) {
        return;
      }
      console.log(`Enviando reposicionamiento de ${ciclos} ciclos`);
      this.callingPosiciones = true;

      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($ciclos: Int!) {
              posicionarNodosConocimientoByFuerzas(ciclos: $ciclos)
            }
          `,
          variables: {
            ciclos,
          },
        })
        .then(() => {
          this.callingPosiciones = false;
        })
        .catch((error) => {
          this.callingPosiciones = false;
          console.log(`Error: ${error}`);
        });
    },
    reactToNodoBuscadoSeleccionado(nodo) {
      console.log("reacting to nodo buscado seleccionado");
      if (this.$route?.params?.tipoBrowse === "mapa" && this.$refs?.mapaAtlas) {
        this.$refs.mapaAtlas.centrarEnNodoById(nodo.id);
      }
    },
    centerEnTarget() {
      if (this.$route?.params?.tipoBrowse === "mapa" && this.$refs?.mapaAtlas) {
        if (this.idNodoTarget) {
          this.$refs.mapaAtlas.centrarEnNodoById(this.idNodoTarget);
        }
      }
    },
    reactToNodoEliminado(idNodo) {
      if (this.$refs?.mapaAtlas) {
        this.$refs.mapaAtlas.reactToNodoEliminado(idNodo);
      }
      if(idNodo===this.idNodoSeleccionado){
        this.seleccionNodo(null);
      }
    },
    seleccionNodo(idNodo) {
      if (this.nodoCreandoDependencia) {
        if (idNodo === this.nodoCreandoDependencia.id) {
          return;
        }
        this.$refs.controlesNodo.crearDependenciaNodo(idNodo);
        return;
      }
      this.idNodoSeleccionado = idNodo;
    },
    marcarNodoEsperandoDependencia(nodo) {
      this.nodoCreandoDependencia = nodo;
    },
  },
  watch: {
    coleccionSeleccionada(col, prev) {
      if (!col || !prev || col.id != prev.id) {
        this.idNodoSeleccionado = null;
      }
      if (this.$route.params?.tipoBrowse === "browseColeccion" && col?.id) {
        this.$router.push({
          name: "atlas",
          params: { idBrowsed: col.id, tipoBrowse: "browseColeccion" },
        });
      }
    },
  },
  created() {
    window.addEventListener("wheel", this.zoomWheel, { passive: false });
    // watch for resize
  },
  destroyed() {
    window.removeEventListener("wheel", this.zoomWheel, { passive: false });
  },
};
</script>

<style scoped>
@import "./estilosGlobalesAtlasConocimiento.css";
</style>

<style>
:root {
  --atlasConocimientoFondo: #f3eff5;
  --atlasConocimientoCheck: #3f7d20;
  --atlasConocimientoAvailable: #c087ed;
  --atlasConocimientoRepasar: #e2c044;
  --atlasConocimientoRepaso: #ff5f5f;
  --atlasConocimientoBaseNodo: #d9d9d9;
  --atlasConocimientoSeleccion: #ad58d8;
  --atlasConocimientoSubseleccion: #ad58d87c;
  --atlasConocimientoTop: #3066be;

  --filtroAtlasSeleccion: invert(43%) sepia(84%) saturate(539%)
    hue-rotate(236deg) brightness(88%) contrast(92%);

  --filtroAtlasTop: invert(33%) sepia(98%) saturate(632%) hue-rotate(185deg)
    brightness(89%) contrast(93%);

  --filtroAtlasAvailable: invert(79%) sepia(70%) saturate(443%)
    hue-rotate(349deg) brightness(92%) contrast(91%);
  --filtroAtlasCheck: invert(34%) sepia(99%) saturate(407%) hue-rotate(56deg)
    brightness(95%) contrast(81%);

  --filtroAtlasRepaso: invert(76%) sepia(39%) saturate(654%) hue-rotate(4deg)
    brightness(95%) contrast(93%);
}
</style>
<style scoped>
.atlasConocimiento {
  position: relative;
}

#viewerNodo {
  height: 100%;
}

#contenedorOverlays {
  position: absolute;
  height: 100%;
  width: 100%;
  top: 0px;
  left: 0px;
  z-index: 2;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
}

#anuncioConectandoNodos {
  pointer-events: all;
  width: fit-content;
}

#zonaNodoTarget {
  margin: 10px auto;

  display: flex;
  align-items: center;
  padding: 10px;
  max-width: min(400px, 50%);
  z-index: 50;
}

#botonCancelarNodoTarget {
  width: 25px;
  height: 25px;

  background-color: var(--mainColor);
  margin-left: 10px;
}

#iconoNodoTarget {
  width: 25px;
  height: 25px;
  border-radius: 50%;
  margin: 0px 10px;
  align-self: center;
}

#nombreNodoTarget {
  background-color: var(--atlasConocimientoSeleccion);
  padding: 5px 10px;
  padding-right: 20px;
  border-radius: 9px;
  cursor: pointer;
  font-size: 13px;
  display: flex;
  align-items: center;
}

.gestorColecciones {
  pointer-events: all;
  margin: 0px auto;
  z-index: 1;
}

#botonToggleNodoColeccion {
  pointer-events: all;
  width: fit-content;
  margin: 10px auto;
}

#buscadorNodosConocimiento {
  pointer-events: all;
  position: absolute;
  top: 1%;
  right: 1%;
  /* transform: translateX(-50%); */
  z-index: 1;
  width: min(100vh, 350px);
}

#botonCallingPosiciones {
  pointer-events: all;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid black;
  position: absolute;
  top: 10%;
  right: 1%;
  cursor: pointer;
  z-index: 1;
}

#simboloDescargandoNodos {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 100;
}

.visorNodoConocimiento {
  width: 100%;
  min-height: 100%;
  position: absolute;
  top: 0px;
  left: 0px;
  z-index: 1000;
  background-color: whitesmoke;
}

#barraInferior {
  position: absolute;
  bottom: 12px;
  padding: 10px;
  display: flex;
  flex-direction: row-reverse;
  right: 0px;
  box-sizing: border-box;
}

#barraInferior .boton {
  height: 30px;
  width: 30px;
  margin: 0px 5px;
  z-index: 0;
}

.fadeOut-leave-to {
  opacity: 0;
}

.fadeOut-leave-active {
  transition: opacity 1s;
}

.fadeOut-leave {
  opacity: 1;
}

.controlesNodo {
  z-index: 100;
}

/* #region localizadores */
#zonaLocalizadores {
  position: fixed;
  bottom: 0px;
  right: 20px;
  display: flex;
  gap: 10px;
  justify-content: center;
  align-items: center;
  padding: 20px 20px;
  pointer-events: all;
}

/* #endregion */

/* #region Windowing */

#indicadorCentroNodosVisibles {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: red;
}

/* #endregion */
</style>
