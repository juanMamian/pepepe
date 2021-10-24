<template>
  <div
    class="atlasProyectos"
    @mousedown.left.exact.self.stop="panningVista = true"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
    @click.right.self.exact.prevent="abrirMenuContextual"
    @mousemove="panVista"
    @mouseup.left="clickFondoAtlas"
    @touchmove.prevent.stop="movimientoMobile"
    @touchstart="iniciaMovimientoTouch"
    @touchend="finTouch"
  >
    <div
      id="botonCallingPosiciones"
      v-if="usuarioSuperadministrador && usuario.username == 'juanMamian'"
      @click.stop="callingPosiciones = !callingPosiciones"
      :style="[
        { backgroundColor: callingPosiciones ? 'green' : 'transparent' },
      ]"
    ></div>
    <transition name="fadeOut">
      <div v-show="showingZoomInfo" id="infoZoom">x{{ factorZoom }}</div>
    </transition>
    <!-- <vista-lista
      ref="vistaLista"
      :todosNodos="todosNodos"
      :cerrar="cerrarListas"
      @centrarEnNodo="centrarEnNodoById($event)"
    /> -->
    <listas
      :todosNodos="todosNodos"
      :cerrar="cerrarListas"
      ref="listas"
      @centrarEnNodo="centrarEnNodoById($event); cerrarListas++"
    />
    <div
      id="menuContextual"
      v-if="usuario && usuario.id"
      v-show="mostrandoMenuContextual"
      :style="[offsetMenuContextual]"
      :class="{ deshabilitado: enviandoQueryNodos }"
    >
      <div
        class="botonMenuContextual"
        id="botonCrearObjetivo"
        v-show="
          usuarioSuperadministrador ||
          (nodoSeleccionado != null &&
            nodoSeleccionado.responsables.includes(usuario.id))
        "
        @mouseup.left.stop=""
        @click.stop="crearNodoEnMenuContextual('objetivo')"
      >
        Crear objetivo
        {{
          idNodoSeleccionado != null &&
          nodoSeleccionado != null &&
          (nodoSeleccionado.responsables.includes(usuario.id) ||
            usuarioSuperadministrador)
            ? "conectado"
            : ""
        }}
      </div>
      <div
        class="botonMenuContextual"
        id="botonCrearObjetivo"
        @click.stop="crearNodoEnMenuContextual('trabajo')"
        @mouseup.left.stop=""
        v-show="
          usuarioSuperadministrador ||
          (nodoSeleccionado != null &&
            nodoSeleccionado.responsables.includes(usuario.id))
        "
      >
        Crear trabajo
        {{
          idNodoSeleccionado != null &&
          nodoSeleccionado != null &&
          (nodoSeleccionado.responsables.includes(usuario.id) ||
            usuarioSuperadministrador)
            ? "conectado"
            : ""
        }}
      </div>
    </div>

    <div id="centroVista" v-show="usuarioSuperadministrador"></div>
    <!-- <canvases-atlas-proyectos
      :style="posCuadroDescarga"
      :centroVista="centroVista"
      :centroDescarga="centroDescarga"
      :radioDescarga="radioDescarga"
      :todosNodos="todosNodos"
      :callingPosiciones="callingPosiciones"
      :factorZoom="factorZoom"
      :idNodoSeleccionado="idNodoSeleccionado"
    /> -->

    <div id="contenedorCanvasNodos" :style="[posContenedores]">
      <canvas-enlaces-nodo
        v-for="nodo of nodosConRequerimentos"
        :yo="yo"
        :key="nodo.id"
        :esteNodo="nodo"
        :todosNodos="todosNodos"
        :factorZoom="factorZoom"
        :nodoSeleccionado="nodoSeleccionado"
        :redibujarEnlaces="redibujarEnlacesNodos"
        :idsNodosVisibles="idsNodosVisibles"
      />
    </div>

    <div id="contenedorNodos" :style="[posContenedores]">
      <!-- <nodo-objetivo
        v-for="objetivo of objetivos"
        :key="objetivo.id"
        :esteObjetivo="objetivo"
        :callingPosiciones="callingPosiciones"
        :idNodoSeleccionado="idNodoSeleccionado"
        :nodoSeleccionado="nodoSeleccionado"
        :menuCx="idNodoMenuCx && idNodoMenuCx == objetivo.id"
        :factorZoom="factorZoom"
        :usuarioAdministradorNodoSeleccionado="
          usuarioAdministradorNodoSeleccionado
        "
        :usuarioResponsableNodoSeleccionado="usuarioResponsableNodoSeleccionado"
        v-show="idsNodosVisibles.includes(objetivo.id)"
        @click.native="idNodoSeleccionado = objetivo.id"
        @click.native.right.exact.stop.prevent="idNodoMenuCx = objetivo.id"
        @dblclick.native="idNodoPaVentanita = objetivo.id"
        @meAbrieron="idNodoPaVentanita = objetivo.id"
        :transparentoso="
          idNodoSeleccionado &&
          idNodoSeleccionado != objetivo.id &&
          !idsNodosRequeridosSeleccionado.includes(objetivo.id) &&
          !idsNodosRequierenSeleccionado.includes(objetivo.id)
        "
        @eliminar="eliminarNodo(objetivo.id, 'objetivo')"
      />

      <nodo-trabajo
        v-for="trabajo of trabajos"
        :key="trabajo.id"
        :esteTrabajo="trabajo"
        :idNodoSeleccionado="idNodoSeleccionado"
        :nodoSeleccionado="nodoSeleccionado"
        :menuCx="idNodoMenuCx && idNodoMenuCx == trabajo.id"
        :factorZoom="factorZoom"
        :callingPosiciones="callingPosiciones"
        :usuarioAdministradorNodoSeleccionado="
          usuarioAdministradorNodoSeleccionado
        "
        :usuarioResponsableNodoSeleccionado="usuarioResponsableNodoSeleccionado"
        :transparentoso="
          idNodoSeleccionado &&
          idNodoSeleccionado != trabajo.id &&
          !idsNodosRequeridosSeleccionado.includes(trabajo.id) &&
          !idsNodosRequierenSeleccionado.includes(trabajo.id)
        "
        v-show="idsNodosVisibles.includes(trabajo.id)"
        @click.native="idNodoSeleccionado = trabajo.id"
        @click.native.right.exact.stop.prevent="idNodoMenuCx = trabajo.id"
        @dblclick.native="idNodoPaVentanita = trabajo.id"
        @meAbrieron="idNodoPaVentanita = trabajo.id"
        @eliminar="eliminarNodo(trabajo.id, 'trabajo')"
      /> -->
      <transition-group name="fade" tag="div">
        <nodo
          :yo="yo"
          v-for="nodo of todosNodos"
          :key="nodo.id"
          :esteNodo="nodo"
          :idNodoSeleccionado="idNodoSeleccionado"
          :nodoSeleccionado="nodoSeleccionado"
          :idsNodosPlegados="idsNodosPlegados"
          :menuCx="idNodoMenuCx && idNodoMenuCx == nodo.id"
          :factorZoom="factorZoom"
          :callingPosiciones="callingPosiciones"
          :usuarioAdministradorNodoSeleccionado="
            usuarioAdministradorNodoSeleccionado
          "
          :usuarioResponsableNodoSeleccionado="
            usuarioResponsableNodoSeleccionado
          "
          :transparentoso="
            idNodoSeleccionado &&
            idNodoSeleccionado != nodo.id &&
            !idsNodosRequeridosSeleccionado.includes(nodo.id) &&
            !idsNodosRequierenSeleccionado.includes(nodo.id)
          "
          :childSeleccionado="nodosChildrenSeleccionado.includes(nodo.id)"
          :parentDeSeleccionado="idNodoParentNodoSeleccionado === nodo.id"
          v-show="idsNodosVisibles.includes(nodo.id)"
          @meMovi="redibujarEnlacesNodos++"
          @click.native="idNodoSeleccionado = nodo.id"
          @click.native.right.exact.stop.prevent="idNodoMenuCx = nodo.id"
          @dblclick.native="idNodoPaVentanita = nodo.id"
          @meAbrieron="idNodoPaVentanita = nodo.id"
          @meElimine="eliminarNodoCache(nodo.id)"
        />
      </transition-group>

      <div
        id="indicadorCentroDescarga"
        :style="[
          {
            left: centroDescarga.x * factorZoom + 'px',
            top: centroDescarga.y * factorZoom + 'px',
            width: 20 * factorZoom + 'px',
            height: 20 * factorZoom + 'px',
          },
        ]"
        v-show="usuario.username == 'juanMamian'"
      ></div>
      <div
        id="indicadorCentroVista"
        :style="[
          {
            left: centroVista.x * factorZoom + 'px',
            top: centroVista.y * factorZoom + 'px',
            width: 20 * factorZoom + 'px',
            height: 20 * factorZoom + 'px',
          },
        ]"
        v-show="usuario.username == 'juanMamian'"
      ></div>
    </div>

    <ventanita-objetivo
      v-if="idNodoPaVentanita && objetivoEnVentanita && !callingPosiciones"
      class="ventanitaNodo"
      :key="objetivoEnVentanita.id"
      :esteObjetivo="objetivoEnVentanita"
      @navegarAlNodo="navegarPaginaNodo"
    />
    <ventanita-trabajo
      v-if="idNodoPaVentanita && trabajoEnVentanita && !callingPosiciones"
      class="ventanitaNodo"
      :key="trabajoEnVentanita.id"
      :esteTrabajo="trabajoEnVentanita"
      @navegarAlNodo="navegarPaginaNodo"
    />

    <panel-control-nodos
      :todosNodos="todosNodos"
      @centrarEnNodo="centrarEnNodoById"
      :mostrandoTrabajos="mostrandoTrabajos"
      :mostrandoObjetivos="mostrandoObjetivos"
      :idsNodosVisibles="idsNodosVisibles"
      @setMostrandoTrabajos="mostrandoTrabajos = $event"
      @setMostrandoObjetivos="mostrandoObjetivos = $event"
    />

    <transition name="fadeOutLento">
      <div id="nombreNodoEmergente" v-show="showingNombreNodoEmergente">
        {{ nodoSeleccionado ? nodoSeleccionado.nombre : "" }}
      </div>
    </transition>

    <loading
      id="loadingNodos"
      v-show="$apollo.queries.todosNodos.loading || !coordsInicialesSetted"
      texto="Descargando información..."
    />
  </div>
</template>

<script>
import gql from "graphql-tag";
// import NodoObjetivo from "./NodoObjetivo.vue";
// import NodoTrabajo from "./NodoTrabajo.vue";
// import CanvasesAtlasProyectos from "./CanvasesAtlasProyectos.vue";
import VentanitaObjetivo from "./VentanitaObjetivo.vue";
import VentanitaTrabajo from "./VentanitaTrabajo.vue";
import Loading from "../utilidades/Loading.vue";
import Nodo from "./Nodo.vue";
import CanvasEnlacesNodo from "./CanvasEnlacesNodo.vue";
import debounce from "debounce";
import PanelControlNodos from "./PanelControlNodos.vue";
import Listas from "./Listas.vue";

// const QUERY_TODOS_NODOS_BY_RADIUS = gql`
//   query ($centro: CoordsInput!, $radio: Int!) {
//     todosNodosSolidaridad(centro: $centro, radio: $radio) {
//       __typename
//       ... on Trabajo {
//         id
//         nombre
//         descripcion
//         responsables
//         posiblesResponsables
//         responsablesSolicitados
//         administradores
//         keywords
//         nodoParent {
//           idNodo
//           tipo
//         }
//         coords {
//           x
//           y
//         }
//         estadoDesarrollo
//         vinculos {
//           idRef
//           tipo
//           tipoRef
//         }
//         stuck
//         angulo
//         centroMasa {
//           x
//           y
//         }
//         puntaje
//         nivel
//         turnoNivel
//         peso
//       }
//       ... on Objetivo {
//         id
//         nombre
//         descripcion
//         responsables
//         posiblesResponsables
//         responsablesSolicitados
//         administradores
//         keywords
//         nodoParent {
//           idNodo
//           tipo
//         }
//         coords {
//           x
//           y
//         }
//         estadoDesarrollo
//         vinculos {
//           idRef
//           tipo
//           tipoRef
//         }
//         stuck
//         angulo
//         centroMasa {
//           x
//           y
//         }
//         puntaje
//         nivel
//         turnoNivel
//         peso
//       }
//     }
//   }
// `;

const QUERY_TODOS_NODOS = gql`
  query {
    todosNodosSolidaridad {
      __typename
      ... on Trabajo {
        id
        nombre
        descripcion
        responsables
        posiblesResponsables
        responsablesSolicitados
        administradores
        keywords
        nodoParent {
          idNodo
          tipo
        }
        coords {
          x
          y
        }
        estadoDesarrollo
        vinculos {
          idRef
          tipo
          tipoRef
        }
        stuck
        angulo
        centroMasa {
          x
          y
        }
        puntaje
        nivel
        turnoNivel
        peso
      }
      ... on Objetivo {
        id
        nombre
        descripcion
        responsables
        posiblesResponsables
        responsablesSolicitados
        administradores
        keywords
        nodoParent {
          idNodo
          tipo
        }
        coords {
          x
          y
        }
        estadoDesarrollo
        vinculos {
          idRef
          tipo
          tipoRef
        }
        stuck
        angulo
        centroMasa {
          x
          y
        }
        puntaje
        nivel
        turnoNivel
        peso
      }
    }
  }
`;

const QUERY_DATOS_USUARIO_ATLAS_SOLIDARIDAD = gql`
  query {
    yo {
      id
      atlasSolidaridad {
        id
        coordsVista {
          x
          y
        }
        idsNodosPlegados
      }
    }
  }
`;
export default {
  components: {
    // NodoObjetivo,
    // NodoTrabajo,
    // CanvasesAtlasProyectos,
    VentanitaObjetivo,
    VentanitaTrabajo,
    Loading,
    Nodo,
    CanvasEnlacesNodo,
    PanelControlNodos,
    Listas,
  },
  name: "AtlasSolidaridad",
  apollo: {
    todosNodos: {
      query: QUERY_TODOS_NODOS,
      // variables() {
      //   return {
      //     centro: {
      //       x: this.centroDescarga.x,
      //       y: this.centroDescarga.y,
      //     },
      //     radio: this.radioDescarga,
      //   };
      // },
      // update({ todosNodosSolidaridad }) {
      //   return todosNodosSolidaridad;
      // },
      update({ todosNodosSolidaridad }) {
        this.descargasTodosNodos++;
        return todosNodosSolidaridad;
      },
      skip() {
        return !this.radioDescarga || !this.coordsInicialesSetted;
      },
      subscribeToMore: {
        document: gql`
          subscription ($centro: CoordsInput!, $radio: Int!) {
            nodoEditado(centro: $centro, radio: $radio) {
              __typename
              ... on Trabajo {
                id
                nombre
                descripcion
                responsables
                posiblesResponsables
                responsablesSolicitados
                administradores
                keywords
                nodoParent {
                  idNodo
                  tipo
                }
                coords {
                  x
                  y
                }
                estadoDesarrollo
                vinculos {
                  idRef
                  tipo
                  tipoRef
                }
                stuck
                angulo
                centroMasa {
                  x
                  y
                }
                puntaje
                nivel
                turnoNivel
                peso
              }
              ... on Objetivo {
                id
                nombre
                descripcion
                responsables
                posiblesResponsables
                responsablesSolicitados
                administradores
                keywords
                nodoParent {
                  idNodo
                  tipo
                }
                coords {
                  x
                  y
                }
                estadoDesarrollo
                vinculos {
                  idRef
                  tipo
                  tipoRef
                }
                stuck
                angulo
                centroMasa {
                  x
                  y
                }
                puntaje
                nivel
                turnoNivel
                peso
              }
            }
          }
        `,
        variables() {
          return {
            centro: {
              x: 0,
              y: 0,
            },
            radio: 0,
          };
        },
        updateQuery: (previousResult, { subscriptionData: { data } }) => {
          var nuevoPreviousResult = JSON.parse(JSON.stringify(previousResult));
          const indexN = nuevoPreviousResult.todosNodosSolidaridad.findIndex(
            (n) => n.id == data.nodoEditado.id
          );
          if (indexN > -1) {
            nuevoPreviousResult.todosNodosSolidaridad.splice(indexN, 1);
          }
          nuevoPreviousResult.todosNodosSolidaridad.push(data.nodoEditado);
          return nuevoPreviousResult;
        },
      },
    },
    yo: {
      query: QUERY_DATOS_USUARIO_ATLAS_SOLIDARIDAD,
      update({ yo }) {
        this.calcularEsquinaVista(yo.atlasSolidaridad.coordsVista);
        this.coordsInicialesSetted = true;
        return yo;
      },
      skip() {
        return !this.usuarioLogeado || !this.montado;
      },
      fetchPolicy: "network-only",
    },
  },
  data() {
    return {
      montado: false,

      mostrandoMenuContextual: false,
      posMenuContextual: {
        top: 0,
        left: 0,
      },

      esquinaVistaDecimal: {
        x: 0,
        y: 0,
      },
      centroDescarga: {
        x: 0,
        y: 0,
      },

      radioDescarga: null,
      sizeAtlas: {
        x: 0,
        y: 0,
        diagonal: 0,
      },
      panningVista: false,
      vistaPanned: false,
      hovered: false,

      idNodoSeleccionado: null,
      idNodoPaVentanita: null,
      idNodoMenuCx: null,

      zoom: 80,
      minZoom: 30,
      maxZoom: 100,
      showingZoomInfo: false,
      infoPosZoom: null,

      pinching: false,
      lastPinchDistance: 0,

      // proyectos: [],
      // trabajos: [],
      // objetivos: [],
      descargasTodosNodos: 0,
      todosNodos: [],
      enviandoQueryNodos: false,

      callingPosiciones: false,
      cerrarBusqueda: 0,
      cerrarMateriales: 0,
      cerrarListas: 0,

      redibujarEnlacesNodos: 0,

      enviandoCoordsVistaUsuario: false,
      coordsInicialesSetted: false,
      esquinaVistaCalculada: false,

      mostrandoTrabajos: true,
      mostrandoObjetivos: true,

      showingNombreNodoEmergente: false,
    };
  },
  methods: {
    calcularEsquinaVista(centro) {
      if (this.esquinaVistaCalculada) return;
      this.$set(
        this.esquinaVistaDecimal,
        "x",
        Math.round(centro.x - this.sizeAtlas.x / (2 * this.factorZoom))
      );
      this.$set(
        this.esquinaVistaDecimal,
        "y",
        Math.round(centro.y - this.sizeAtlas.y / (2 * this.factorZoom))
      );
      this.esquinaVistaCalculada = true;
    },
    abrirMenuContextual(e) {
      let posAtlas = this.$el.getBoundingClientRect();

      let topClick = Math.round(e.pageY - posAtlas.top);
      let leftClick = Math.round(e.pageX - posAtlas.left);

      this.$set(this.posMenuContextual, "y", topClick);
      this.$set(this.posMenuContextual, "x", leftClick);
      this.mostrandoMenuContextual = true;
    },
    uploadVistaActual: debounce(function () {
      this.enviandoCoordsVistaUsuario = true;
      console.log(`Uploading vista de usuario`);
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($coords: CoordsInput!) {
              setCoordsVistaAtlasSolidaridadUsuario(coords: $coords)
            }
          `,
          variables: {
            coords: {
              x: Math.round(
                this.esquinaVistaDecimal.x +
                  this.sizeAtlas.x / (2 * this.factorZoom)
              ),
              y: Math.round(
                this.esquinaVistaDecimal.y +
                  this.sizeAtlas.y / (2 * this.factorZoom)
              ),
            },
          },
        })
        .then(() => {
          this.enviandoCoordsVistaUsuario = false;
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
          this.enviandoCoordsVistaUsuario = false;
        });
    }, 3000),
    desplazarVista(deltaX, deltaY) {
      this.$set(
        this.esquinaVistaDecimal,
        "x",
        this.esquinaVistaDecimal.x - deltaX
      );
      this.$set(
        this.esquinaVistaDecimal,
        "y",
        this.esquinaVistaDecimal.y - deltaY
      );
      this.uploadVistaActual();
    },
    panVista(e) {
      if (!this.panningVista) {
        return;
      }
      this.desplazarVista(
        e.movementX / this.factorZoom,
        e.movementY / this.factorZoom
      );
      e.preventDefault();
      this.vistaPanned = true;
    },
    clickFondoAtlas() {
      if (!this.vistaPanned) {
        if (!this.idNodoPaVentanita) {
          this.idNodoSeleccionado = null;
        }
        this.idNodoPaVentanita = null;
        this.idNodoMenuCx = null;
        this.cerrarBusqueda++;
        this.cerrarListas++;
      }
      this.mostrandoMenuContextual = false;

      this.panningVista = false;
      this.vistaPanned = false;
    },
    movimientoMobile(e) {
      if (this.pinching) {
        var contenedor = this.$el;
        let posContenedor = contenedor.getBoundingClientRect();

        const posPinch = {
          x:
            (e.touches[0].pageX -
              posContenedor.left +
              (e.touches[1].pageX - posContenedor.left)) /
            2,
          y:
            (e.touches[0].pageY -
              posContenedor.top +
              (e.touches[1].pageY - posContenedor.top)) /
            2,
        }; //Posición en pixeles.

        const coordsPinch = {
          x: Math.round(
            posPinch.x / this.factorZoom + this.esquinaVistaDecimal.x
          ),
          y: Math.round(
            posPinch.y / this.factorZoom + this.esquinaVistaDecimal.y
          ),
        }; //Posicion en unidades absolutas (Las que usa el atlas)

        var dist = Math.hypot(
          e.touches[0].pageX - e.touches[1].pageX,
          e.touches[0].pageY - e.touches[1].pageY
        );
        var pinch = dist - this.lastPinchDistance;
        pinch = pinch * 0.3;
        this.zoomVista(pinch, coordsPinch);
        this.lastPinchDistance = dist;

        return;
      }

      const deltaX = Math.round(
        (e.changedTouches[0].clientX - this.ultimoTouchX) / this.factorZoom
      );
      const deltaY = Math.round(
        (e.changedTouches[0].clientY - this.ultimoTouchY) / this.factorZoom
      );
      this.ultimoTouchX = e.changedTouches[0].clientX;
      this.ultimoTouchY = e.changedTouches[0].clientY;

      this.desplazarVista(deltaX, deltaY);
    },
    iniciaMovimientoTouch(e) {
      if (e.touches.length === 2) {
        var dist = Math.hypot(
          e.touches[0].pageX - e.touches[1].pageX,
          e.touches[0].pageY - e.touches[1].pageY
        );
        this.lastPinchDistance = dist;
        this.pinching = true;
        return;
      }

      this.ultimoTouchX = e.changedTouches[0].clientX;
      this.ultimoTouchY = e.changedTouches[0].clientY;
    },
    finTouch() {
      this.pinching = false;
    },
    zoomVista(deltaZoom, posZoom) {
      const viejoZoom = this.zoom;
      var nuevoZoom = Math.round(this.zoom + deltaZoom);
      if (nuevoZoom < this.minZoom) {
        this.zoom = this.minZoom;
      } else if (nuevoZoom > this.maxZoom) {
        this.zoom = this.maxZoom;
      } else {
        this.zoom = nuevoZoom;
      }

      //Pan vista de acuerdo con la posición del mouse respecto del atlas
      const distanciaEsquina = {
        x: posZoom.x - this.esquinaVistaDecimal.x,
        y: posZoom.y - this.esquinaVistaDecimal.y,
      };
      const proporcionZoom = viejoZoom / this.zoom;

      this.$set(
        this.esquinaVistaDecimal,
        "x",
        posZoom.x - proporcionZoom * distanciaEsquina.x
      );
      this.$set(
        this.esquinaVistaDecimal,
        "y",
        posZoom.y - proporcionZoom * distanciaEsquina.y
      );
    },
    zoomWheel(e) {
      if (!this.hovered || !e.ctrlKey) {
        return;
      }
      e.preventDefault();
      var contenedor = document.getElementById("contenedorNodos");
      let posContenedor = contenedor.getBoundingClientRect();

      const posZoom = {
        x: Math.round((e.clientX - posContenedor.left) / this.factorZoom),
        y: Math.round((e.clientY - posContenedor.top) / this.factorZoom),
      };

      const factorZoom = 0.2;
      this.zoomVista(-Math.round(e.deltaY * factorZoom), posZoom);

      // const posZoom={
      //   x: Math.round((e.clientX-posContenedor.left)/this.factorZoom)+this.esquinaVista.x,
      //   y: Math.round((e.clientY-posContenedor.top)/this.factorZoom)+this.esquinaVista.y
      // }

      // const proporciones={
      //   x: (posZoom.x-this.esquinaVistaDecimal.x)/(posContenedor.width/this.factorZoom),
      //   y: (posZoom.y-this.esquinaVistaDecimal.y)/(posContenedor.height/this.factorZoom),
      // }

      // const factorZoom=0.2;
      // this.zoomVista(-Math.round(e.deltaY*factorZoom), {x:posZoom.x, y: posZoom.y});

      // this.$set(this.esquinaVistaDecimal, "x", posZoom.x-((posContenedor.width/this.factorZoom)*proporciones.x) );
      // this.$set(this.esquinaVistaDecimal, "y", posZoom.y-((posContenedor.height/this.factorZoom)*proporciones.y) );
    },
    eliminarNodoCache(idNodo) {
      const store = this.$apollo.provider.defaultClient;
      const cache = store.readQuery({
        query: QUERY_TODOS_NODOS,
      });
      var nuevoCache = JSON.parse(JSON.stringify(cache));
      const indexN = nuevoCache.todosNodosSolidaridad.findIndex(
        (n) => n.id == idNodo
      );
      if (indexN > -1) {
        nuevoCache.todosNodosSolidaridad.splice(indexN, 1);
        store.writeQuery({
          query: QUERY_TODOS_NODOS,
          data: nuevoCache,
        });
      } else {
        console.log(`El nodo no estaba presente`);
      }
    },
    crearNodoEnMenuContextual(tipo) {
      let posContenedor = document
        .getElementById("contenedorNodos")
        .getBoundingClientRect();

      var posicionNuevoNodo = {
        x: parseInt(
          (parseInt(this.posMenuContextual.x) - posContenedor.left) /
            this.factorZoom
        ),
        y: parseInt(
          (parseInt(this.posMenuContextual.y) - posContenedor.top) /
            this.factorZoom
        ),
      };

      console.log(`Creando nuevo nodo en ${JSON.stringify(posicionNuevoNodo)}`);
      if (
        this.nodoSeleccionado &&
        (this.nodoSeleccionado.responsables.includes(this.usuario.id) ||
          this.usuarioSuperadministrador)
      ) {
        this.crearNodoConectado(
          posicionNuevoNodo,
          tipo,
          this.idNodoSeleccionado
        );
      } else {
        this.crearNodo(posicionNuevoNodo, tipo);
      }
    },
    crearNodo(posicion, tipo) {
      if (!this.usuario || !this.usuario.id) {
        console.log(`Error usuario no logeado`);
        return;
      }
      console.log(`enviando una mutación de crear nodo`);
      this.enviandoQueryNodos = true;

      let infoNodo = {
        coords: {
          x: posicion.x,
          y: posicion.y,
        },
        tipo,
      };
      console.log(`en las coordenadas: ${posicion.x}, ${posicion.y}`);
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($infoNodo: NodoSolidaridadInput!) {
              crearNodoSolidaridad(infoNodo: $infoNodo) {
                __typename
                ... on Trabajo {
                  id
                  nombre
                  descripcion
                  responsables
                  posiblesResponsables
                  responsablesSolicitados
                  administradores
                  keywords
                  nodoParent {
                    idNodo
                    tipo
                  }
                  coords {
                    x
                    y
                  }
                  estadoDesarrollo
                  vinculos {
                    idRef
                    tipo
                    tipoRef
                  }
                  stuck
                  angulo
                  centroMasa {
                    x
                    y
                  }
                  puntaje
                  nivel
                  turnoNivel
                  peso
                }
                ... on Objetivo {
                  id
                  nombre
                  descripcion
                  responsables
                  posiblesResponsables
                  responsablesSolicitados
                  administradores
                  keywords
                  nodoParent {
                    idNodo
                    tipo
                  }
                  coords {
                    x
                    y
                  }
                  estadoDesarrollo
                  vinculos {
                    idRef
                    tipo
                    tipoRef
                  }
                  stuck
                  angulo
                  centroMasa {
                    x
                    y
                  }
                  puntaje
                  nivel
                  turnoNivel
                  peso
                }
              }
            }
          `,
          variables: {
            infoNodo,
          },
        })
        .then(({ data: { crearNodoSolidaridad } }) => {
          console.log(`Creado ${crearNodoSolidaridad.id}`);
          const store = this.$apollo.provider.defaultClient;
          const cache = store.readQuery({
            query: QUERY_TODOS_NODOS,
            variables: {
              centro: {
                x: this.centroDescarga.x,
                y: this.centroDescarga.y,
              },
              radio: this.radioDescarga,
            },
          });
          var nuevoCache = JSON.parse(JSON.stringify(cache));
          var losNodos = nuevoCache.todosNodosSolidaridad;
          const indexN = losNodos.findIndex(
            (n) => n.id === crearNodoSolidaridad.id
          );
          if (indexN > -1) {
            console.log(`El nodo ya estaba en caché`);
          } else {
            losNodos.push(crearNodoSolidaridad);
            store.writeQuery({
              query: QUERY_TODOS_NODOS,
              variables: {
                centro: {
                  x: this.centroDescarga.x,
                  y: this.centroDescarga.y,
                },
                radio: this.radioDescarga,
              },
              data: nuevoCache,
            });
          }
          this.idNodoPaVentanita = crearNodoSolidaridad.id;
          this.enviandoQueryNodos = false;
          this.mostrandoMenuContextual = false;

          //this.$router.push("/nodoConocimiento/"+crearNodoSolidaridad.id);
        })
        .catch((error) => {
          this.enviandoQueryNodos = false;
          console.log(`Error. E: ${error}`);
        });
    },
    crearNodoConectado(posicion, tipo, idNodoRequiriente) {
      if (!this.usuario || !this.usuario.id) {
        console.log(`Error usuario no logeado`);
        return;
      }
      console.log(`enviando una mutación de crear nodo`);

      this.enviandoQueryNodos = true;
      let infoNodo = {
        coords: {
          x: posicion.x,
          y: posicion.y,
        },
        tipo,
      };
      console.log(`en las coordenadas: ${posicion.x}, ${posicion.y}`);
      this.$apollo
        .mutate({
          mutation: gql`
            mutation (
              $infoNodo: NodoSolidaridadInput!
              $idNodoRequiriente: ID!
            ) {
              crearNodoSolidaridadRequerido(
                infoNodo: $infoNodo
                idNodoRequiriente: $idNodoRequiriente
              ) {
                __typename
                ... on Trabajo {
                  id
                  nombre
                  descripcion
                  responsables
                  posiblesResponsables
                  responsablesSolicitados
                  administradores
                  keywords
                  nodoParent {
                    idNodo
                    tipo
                  }
                  coords {
                    x
                    y
                  }
                  estadoDesarrollo
                  vinculos {
                    idRef
                    tipo
                    tipoRef
                  }
                  stuck
                  angulo
                  centroMasa {
                    x
                    y
                  }
                  puntaje
                  nivel
                  turnoNivel
                  peso
                }
                ... on Objetivo {
                  id
                  nombre
                  descripcion
                  responsables
                  posiblesResponsables
                  responsablesSolicitados
                  administradores
                  keywords
                  nodoParent {
                    idNodo
                    tipo
                  }
                  coords {
                    x
                    y
                  }
                  estadoDesarrollo
                  vinculos {
                    idRef
                    tipo
                    tipoRef
                  }
                  stuck
                  angulo
                  centroMasa {
                    x
                    y
                  }
                  puntaje
                  nivel
                  turnoNivel
                  peso
                }
              }
            }
          `,
          variables: {
            infoNodo,
            idNodoRequiriente,
          },
        })
        .then(({ data: { crearNodoSolidaridadRequerido } }) => {
          const nuevoNodo = crearNodoSolidaridadRequerido[0];
          console.log(`Creado ${nuevoNodo.id}`);
          const store = this.$apollo.provider.defaultClient;
          const cache = store.readQuery({
            query: QUERY_TODOS_NODOS,
            variables: {
              centro: {
                x: this.centroDescarga.x,
                y: this.centroDescarga.y,
              },
              radio: this.radioDescarga,
            },
          });
          var nuevoCache = JSON.parse(JSON.stringify(cache));
          var losNodos = nuevoCache.todosNodosSolidaridad;
          const indexN = losNodos.findIndex((n) => n.id === nuevoNodo.id);
          if (indexN > -1) {
            console.log(`El nodo ya estaba en caché`);
          } else {
            losNodos.push(nuevoNodo);
            store.writeQuery({
              query: QUERY_TODOS_NODOS,
              variables: {
                centro: {
                  x: this.centroDescarga.x,
                  y: this.centroDescarga.y,
                },
                radio: this.radioDescarga,
              },
              data: nuevoCache,
            });
          }
          this.idNodoPaVentanita = nuevoNodo.id;
          this.enviandoQueryNodos = false;
          this.mostrandoMenuContextual = false;

          //this.$router.push("/nodoConocimiento/"+crearNodoSolidaridad.id);
        })
        .catch((error) => {
          this.enviandoQueryNodos = false;
          console.log(`Error. E: ${error}`);
        });
    },
    centrarEnNodo(n) {
      var contenedor = this.$el;
      let posContenedor = contenedor.getBoundingClientRect();

      this.$set(
        this.esquinaVistaDecimal,
        "x",
        n.coords.x - posContenedor.width / (2 * this.factorZoom)
      );
      this.$set(
        this.esquinaVistaDecimal,
        "y",
        n.coords.y - posContenedor.height / (2 * this.factorZoom)
      );
      this.idNodoSeleccionado = n.id;
      //this.centroVista=e;
    },
    centrarEnNodoById(idNodo) {
      var contenedor = this.$el;
      let posContenedor = contenedor.getBoundingClientRect();

      const elNodo = this.todosNodos.find((n) => n.id === idNodo);
      this.$set(
        this.esquinaVistaDecimal,
        "x",
        elNodo.coords.x - posContenedor.width / (2 * this.factorZoom)
      );
      this.$set(
        this.esquinaVistaDecimal,
        "y",
        elNodo.coords.y - posContenedor.height / (2 * this.factorZoom)
      );

      this.idNodoSeleccionado = idNodo;

      //this.centroVista=e;
    },
    navegarPaginaNodo(d) {
      console.log(`Navegando a nodo con dirección ${d}`);
      this.idNodoPaVentanita = null;
      this.$router.push(d);
    },
    hideNombreNodoEmergente: debounce(function () {
      this.showingNombreNodoEmergente = false;
    }, 4000),
    hideZoomInfo: debounce(function () {
      this.showingZoomInfo = false;
    }, 1000),
  },
  computed: {
    refreshNodoVentanita() {
      return this.$store.state.refreshNodoVentanitaAtlasSolidaridad;
    },
    offsetMenuContextual() {
      return {
        top: this.posMenuContextual.y + "px",
        left: this.posMenuContextual.x + "px",
      };
    },
    factorZoom() {
      return Number((this.zoom / 100).toFixed(2));
    },
    esquinaVista() {
      return {
        x: Math.round(this.esquinaVistaDecimal.x),
        y: Math.round(this.esquinaVistaDecimal.y),
      };
    },
    centroVista() {
      return {
        x: this.esquinaVista.x + this.sizeAtlas.x / this.factorZoom / 2,
        y: this.esquinaVista.y + this.sizeAtlas.y / this.factorZoom / 2,
      };
    },
    posContenedores() {
      return {
        left: -(this.esquinaVista.x * this.factorZoom) + "px",
        top: -(this.esquinaVista.y * this.factorZoom) + "px",
      };
    },
    posCuadroDescarga() {
      const posx =
        this.centroDescarga.x - this.radioDescarga - this.esquinaVista.x;
      const posy =
        this.centroDescarga.y - this.radioDescarga - this.esquinaVista.y;
      return {
        left: posx * this.factorZoom + "px",
        top: posy * this.factorZoom + "px",
      };
    },
    objetivoSeleccionado() {
      if (!this.idNodoSeleccionado) return null;
      return this.objetivos.find((o) => o.id == this.idNodoSeleccionado);
    },
    trabajoSeleccionado() {
      if (!this.idNodoSeleccionado) return null;
      return this.trabajos.find((t) => t.id == this.idNodoSeleccionado);
    },
    objetivoEnVentanita() {
      if (!this.idNodoPaVentanita) return null;
      return this.objetivos.find((o) => o.id == this.idNodoPaVentanita);
    },
    trabajoEnVentanita() {
      if (!this.idNodoPaVentanita) return null;
      return this.trabajos.find((t) => t.id == this.idNodoPaVentanita);
    },
    nodoSeleccionado() {
      return this.todosNodos.find((n) => n.id === this.idNodoSeleccionado);
    },
    idNodoParentNodoSeleccionado() {
      if (!this.nodoSeleccionado || !this.nodoSeleccionado.nodoParent)
        return null;

      const nodoParent = this.todosNodos.find(
        (n) => n.id === this.nodoSeleccionado.nodoParent.idNodo
      );

      if (!nodoParent) return null;
      return nodoParent.id;
    },
    usuarioAdministradorNodoSeleccionado() {
      if (!this.usuario || !this.usuario.id) return false;
      if (!this.nodoSeleccionado) return false;
      return this.nodoSeleccionado.administradores.includes(this.usuario.id);
    },
    usuarioResponsableNodoSeleccionado() {
      if (!this.usuario || !this.usuario.id) return false;
      if (!this.nodoSeleccionado) return false;

      return this.nodoSeleccionado.responsables.includes(this.usuario.id);
    },
    nodosRequierenSeleccionado() {
      if (!this.idNodoSeleccionado) return [];
      return this.todosNodos.filter((n) =>
        n.vinculos
          .filter((v) => v.tipo == "requiere")
          .map((v) => v.idRef)
          .includes(this.idNodoSeleccionado)
      );
    },
    nodosRequeridosSeleccionado() {
      if (!this.idNodoSeleccionado || !this.nodoSeleccionado) return [];
      const idsRequeridos = this.nodoSeleccionado.vinculos
        .filter((v) => v.tipo == "requiere")
        .map((v) => v.idRef);
      return this.todosNodos.filter((n) => idsRequeridos.includes(n.id));
    },
    nodosChildrenSeleccionado() {
      if (!this.nodoSeleccionado) return [];
      return this.todosNodos
        .filter(
          (n) => n.nodoParent && n.nodoParent.idNodo === this.idNodoSeleccionado
        )
        .map((n) => n.id);
    },
    idsNodosRequierenSeleccionado() {
      return this.nodosRequierenSeleccionado.map((n) => n.id);
    },
    idsNodosRequeridosSeleccionado() {
      return this.nodosRequeridosSeleccionado.map((n) => n.id);
    },
    idsNodosPlegados() {
      if (!this.yo) return [];

      return this.yo.atlasSolidaridad.idsNodosPlegados;
    },
    idsNodosSubplegados() {
      var listaTotal = [];
      var listaActual = this.idsNodosPlegados;
      while (listaActual.length > 0) {
        listaActual = this.todosNodos
          .filter(
            (n) => n.nodoParent && listaActual.includes(n.nodoParent.idNodo)
          )
          .map((n) => n.id);
        listaTotal = listaTotal.concat(listaActual);
      }

      return listaTotal;
    },
    idsNodosVisibles() {
      return this.todosNodos
        .filter((n) => {
          if (n.__typename === "Trabajo" && !this.mostrandoTrabajos)
            return false;
          if (n.__typename === "Objetivo" && !this.mostrandoObjetivos)
            return false;
          if (!n.nodoParent) return true;

          return (
            !this.idsNodosPlegados.includes(n.nodoParent.idNodo) &&
            !this.idsNodosSubplegados.includes(n.nodoParent.idNodo)
          );
        })
        .map((n) => n.id);
    },
    trabajos() {
      return this.todosNodos.filter((n) => n.__typename === "Trabajo");
    },
    objetivos() {
      return this.todosNodos.filter((n) => n.__typename === "Objetivo");
    },
    nodosConRequerimentos() {
      return this.todosNodos.filter(
        (n) => n.vinculos.filter((v) => v.tipo === "requiere").length > 0
      );
    },
  },
  watch: {
    callingPosiciones(nuevo) {
      if (nuevo) {
        // this.$apollo.queries.proyectos.startPolling(5000);
        // this.$apollo.queries.trabajos.startPolling(5000);
        // this.$apollo.queries.objetivos.startPolling(5000);
        this.$apollo.queries.todosNodos.startPolling(5000);
      } else {
        // this.$apollo.queries.proyectos.stopPolling();
        // this.$apollo.queries.trabajos.stopPolling();
        // this.$apollo.queries.objetivos.stopPolling();
        this.$apollo.queries.todosNodos.stopPolling();
      }
    },
    centroVista(actual) {
      const distanciaCentroDescarga = Math.hypot(
        this.centroDescarga.x - actual.x,
        this.centroDescarga.y - actual.y
      );
      // console.log(`Distancia centro descarga: ${distanciaCentroDescarga}`);
      if (
        this.radioDescarga - distanciaCentroDescarga <
        this.sizeAtlas.diagonal / this.factorZoom / 2
      ) {
        //Hora de actualizar nodos
        this.radioDescarga = Math.ceil(
          (Math.max(this.sizeAtlas.x, this.sizeAtlas.y) * 2) / this.factorZoom
        );
        this.$set(this.centroDescarga, "x", Math.round(this.centroVista.x));
        this.$set(this.centroDescarga, "y", Math.round(this.centroVista.y));
      }
    },
    idNodoSeleccionado(nuevo) {
      if (!nuevo) {
        this.idNodoPaVentanita = null;
        this.showingNombreNodoEmergente = false;
      } else {
        if (this.zoom < 65) {
          this.showingNombreNodoEmergente = true;
          this.hideNombreNodoEmergente();
        }
      }
    },
    zoom() {
      this.showingZoomInfo = true;
      this.hideZoomInfo();
    },
    descargasTodosNodos(val) {
      const idNodoNotificado = this.$route.params.nv;
      if (val === 1 && idNodoNotificado) {
        console.log("Centrando en nodo " + idNodoNotificado);
        this.centrarEnNodoById(idNodoNotificado);
        this.idNodoPaVentanita = idNodoNotificado;
      }
    },
    refreshNodoVentanita() {
      const idNodoNotificado = this.$route.params.nv;
      if (idNodoNotificado) {
        console.log("Centrando en nodo " + idNodoNotificado);
        this.centrarEnNodoById(idNodoNotificado);
        this.idNodoPaVentanita = idNodoNotificado;
      }
    },
  },
  mounted() {
    var posAtlas = this.$el.getBoundingClientRect();
    this.$set(this.sizeAtlas, "x", posAtlas.width);
    this.$set(this.sizeAtlas, "y", posAtlas.height);
    this.$set(
      this.sizeAtlas,
      "diagonal",
      Math.hypot(this.sizeAtlas.x, this.sizeAtlas.y)
    );

    this.radioDescarga = Math.ceil(
      (Math.max(this.sizeAtlas.x, this.sizeAtlas.y) * 2) / this.factorZoom
    );
    this.montado = true;
  },
  created() {
    window.addEventListener("wheel", this.zoomWheel, { passive: false });
  },
  removed() {
    window.removeEventListener("wheel", this.zoomWheel);
  },
  beforeRouteLeave(to, from, next) {
    console.log(`Hacia: ${to}`);
    if (this.$refs.listas.abierta) {
      this.$refs.listas.abierta = false;
      return next(false);
    }
    if (this.idNodoPaVentanita) {
      this.idNodoPaVentanita = null;
      return next(false);
    }
    next();
  },
};
</script>

<style scoped>
.atlasProyectos {
  overflow: hidden;
  position: relative;
}
#menuContextual {
  position: absolute;
  background-color: rgb(173, 173, 173);
  z-index: 2;
}
.botonMenuContextual {
  padding: 5px 10px;
  cursor: pointer;
}
.botonMenuContextual:hover {
  background-color: gray;
}
#contenedorNodos {
  position: relative;
  z-index: 1;
}
#contenedorCanvasNodos {
  position: relative;
}

#canvasesAtlasProyectos {
  position: relative;
}
#centroVista {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background-color: orange;
  transform: translate(-50%, -50%);
  position: absolute;
}

#botonCallingPosiciones {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid black;
  position: absolute;
  top: 1%;
  right: 1%;
  cursor: pointer;
  z-index: 100;
}
.ventanitaNodo {
  width: min(400px, 90%);
  position: absolute;
  top: 15px;
  left: 15px;
  z-index: 60;
}
#loadingNodos {
  position: absolute;
  bottom: 50%;
  left: 50%;
  transform: translateX(-50%);
}
#indicadorCentroDescarga {
  width: 50px;
  height: 50px;
  position: absolute;
  background-color: red;
  transform: translate(-50%, -50%);
  border-radius: 50%;
}
#indicadorCentroVista {
  width: 50px;
  height: 50px;
  position: absolute;
  background-color: rgb(0, 60, 255);
  transform: translate(-50%, -50%);
  border-radius: 50%;
}

#infoZoom {
  position: absolute;
  top: 2%;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px;
  display: inline-block;
  font-weight: bold;
  color: rgb(102, 102, 102);
  z-index: 3;
}

#nombreNodoEmergente {
  position: fixed;
  bottom: 5px;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 10px;
  border: 2px solid rgb(56, 128, 131);
  background-color: rgb(185, 215, 216);
  padding: 10px;
  font-size: 20px;
  z-index: 10;
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

.fadeOutLento-leave-to {
  opacity: 0;
}
.fadeOutLento-leave-active {
  transition: opacity 2s;
}
.fadeOutLento-leave {
  opacity: 1;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>