<template>
  <div class="gestorColecciones">
    <div
      id="zonaTitulo"
      :style="[estiloZonaTitulo]"
      v-show="!conectandoNodosColeccion"
    >
      <div
        id="nombreColeccion"
        :class="{ desplegandoLista }"
        @click.stop="desplegandoLista = !desplegandoLista"
      >
        <div
          v-show="
            coleccionSeleccionadaNullificable &&
            !$apollo.queries.coleccionSeleccionada.loading
          "
          class="boton"
          :class="{ activo: mostrandoArbol }"
          id="botonMostrarArbol"
          @click.stop="mostrandoArbol = !mostrandoArbol"
        >
          <img
            src="@/assets/iconos/atlas/userNodes.png"
            alt="Colección"
            id="iconoColeccionSeleccionada"
          />
        </div>
        <loading v-show="this.$apollo.queries.coleccionSeleccionada.loading" />
        <span style="z-index: 1">
          {{ coleccionSeleccionadaNullificable?.nombre || "Atlas" }}
        </span>

        <div id="listaSelectoresColeccion" v-show="desplegandoLista">
          <div
            class="selectorColeccion"
            @click.stop="setIdColeccionSeleccionada(null)"
            v-show="idColeccionSeleccionada"
          >
            <img
              src="@/assets/iconos/userNodes.png"
              alt="Coleccion"
              style="height: 15px"
            />
            Atlas
          </div>
          <div
            class="selectorColeccion"
            @click.stop="setIdColeccionSeleccionada(coleccion.id)"
            v-for="coleccion of coleccionesEnriquecidas.filter(
              (col) => idColeccionSeleccionada != col.id
            )"
            :key="coleccion.id"
          >
            <img
              src="@/assets/iconos/userNodes.png"
              alt="Coleccion"
              style="height: 15px"
            />
            {{ coleccion.nombre }}
          </div>
          <div class="botonTexto" @click.stop="" id="botonCrearColeccion">
            <img src="@/assets/iconos/plusCircle.svg" alt="Nuevo" />
            <span>Crear colección</span>
          </div>
        </div>

        <div
          class="boton"
          id="botonMostrarOpcionesColeccion"
          v-if="coleccionSeleccionadaNullificable"
          v-show="!desplegandoLista"
          @click.stop="mostrandoOpcionesColeccion = !mostrandoOpcionesColeccion"
        >
          <img
            src="@/assets/iconos/ellipsisVertical.svg"
            alt="Opciones"
            style=""
          />
        </div>
      </div>
    </div>
    <div
      id="contenedorOpciones"
      v-show="mostrandoOpcionesColeccion"
      v-if="coleccionSeleccionadaNullificable"
    >
      <div
        class="botonOpcion botonTexto selector"
        id="botonConectarNodosColeccion"
        v-show="!conectandoNodosColeccion"
        @click.stop="conectandoNodosColeccion = true"
      >
        <img src="@/assets/iconos/plugSolid.svg" alt="Conectar" />
      </div>
    </div>
    <div
      class="anuncio anuncioSeleccion"
      id="anuncioConectandoNodos"
      v-show="conectandoNodosColeccion"
    >
      <img src="@/assets/iconos/plugSolid.svg" alt="Nodos" />
      Editando nodos de la coleccion
      <div
        class="boton"
        id="botonCancelarConectarNodosColeccion"
        v-show="!idNodoSeleccionado"
        @click.stop="conectandoNodosColeccion = false"
      >
        <img src="@/assets/iconos/equis.svg" alt="Cancelar" />
      </div>
    </div>

    <div
      v-if="
        conectandoNodosColeccion &&
        coleccionSeleccionadaNullificable &&
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
        v-show="!nodoSeleccionadoBelongs && !togglingNodoColeccion"
      />
      <img
        src="@/assets/iconos/equis.svg"
        alt="Desconectar"
        v-show="nodoSeleccionadoBelongs && !togglingNodoColeccion"
      />
      <span>{{ nodoSeleccionadoBelongs ? "Desconectar" : "Conectar" }}</span>
    </div>
    <transition name="travelBottom" appear>
      <div
        ref="diagramaPersonal"
        id="diagramaPersonal"
        v-if="coleccionSeleccionadaNullificable"
        v-show="mostrandoArbol"
      >
        <div id="iconoProgresoUsuario" :style="[estiloIconoProgresoUsuario]">
          <pie-progreso
            :progreso="coleccionSeleccionada.progreso"
            :size="120"
            :factorArco="0.1"
            colorFondo="transparent"
          >
            <div id="contenedorFotoUsuario">
              <img
                ref="imagenUsuario"
                :src="serverUrl + '/api/usuarios/fotografias/' + usuario.id"
                alt="Fotografía"
              />
            </div>
          </pie-progreso>
          <div id="indicadorProgreso" v-if="coleccionSeleccionadaNullificable">
            {{ coleccionSeleccionada.progreso }}%
          </div>
        </div>
        <diagrama-arbol
          v-if="coleccionSeleccionadaNullificable"
          ref="diagramaArbol"
          :visible="mostrandoArbol"
          :idsRoot="coleccionSeleccionadaNullificable.idsNodos"
        ></diagrama-arbol>
      </div>
    </transition>
  </div>
</template>
<script>
import { gql } from "@apollo/client/core";
import PieProgreso from "@/components/utilidades/PieProgreso.vue";
import Loading from "@/components/utilidades/Loading.vue";
import NodoConocimientoVistaArbol from "@/components/atlasConocimiento/NodoConocimientoVistaArbol.vue";
import DiagramaArbol from "./diagramaArbol.vue";
import debounce from "debounce";

export default {
  name: "GestorColecciones",
  components: {
    PieProgreso,
    Loading,
    NodoConocimientoVistaArbol,
    DiagramaArbol,
  },
  props: {
    yo: {
      type: Object,
      required: true,
    },
    todosNodos: {
      type: Array,
      default: [],
    },
    idNodoSeleccionado: {
      type: String,
      default: "",
    },
  },
  apollo: {
    coleccionSeleccionada: {
      query: gql`
        query ($idColeccion: ID!, $idUsuario: ID!) {
          coleccionNodosConocimiento(
            idColeccion: $idColeccion
            idUsuario: $idUsuario
          ) {
            id
            nombre
            progreso
            idsNodos
            idsRed
          }
        }
      `,
      variables() {
        return {
          idColeccion: this.idColeccionSeleccionada,
          idUsuario: this.usuario.id,
        };
      },
      update({ coleccionNodosConocimiento }) {
        return coleccionNodosConocimiento;
      },
      skip() {
        return !this.idColeccionSeleccionada;
      },
      fetchPolicy: "cache-and-network",
    },
  },
  data() {
    return {
      montado: false,
      anchoContenedorArbol: null,
      refreshLineaHorizontal: 0,

      coleccionSeleccionada: {
        idsNodos: [],
        idsRed: [],
      },
      desplegandoLista: false,
      idColeccionSeleccionada: null,
      mostrandoOpcionesColeccion: false,
      conectandoNodosColeccion: false,
      togglingNodoColeccion: false,

      mostrandoArbol: false,
    };
  },
  computed: {
    nodoSeleccionadoBelongs() {
      if (!this.idNodoSeleccionado || !this.coleccionSeleccionadaNullificable) {
        return false;
      }
      return this.coleccionSeleccionadaNullificable.idsNodos.includes(
        this.idNodoSeleccionado
      );
    },
    estiloZonaTitulo() {
      let width = "fit-content";
      if (this.mostrandoArbol) {
        width = "100%";
      }
      return {
        width,
      };
    },
    estiloIconoProgresoUsuario() {
      let left = "50%";
      let anchoAjustado = this.anchoContenedorArbol;
      if (anchoAjustado) {
        left = anchoAjustado / 2 + "px";
      }
      return {
        left: left,
      };
    },
    coleccionesEnriquecidas() {
      if (!this.yo.atlas?.colecciones) return [];

      return this.yo.atlas.colecciones.map((col) => {
        //Get first nodes and go level by level finding dependencies.
        let idsNodosActuales = col.idsNodos;

        let idsCompletos = [...idsNodosActuales];
        let guarda = 0;

        while (idsNodosActuales.length > 0 && guarda < 100) {
          guarda++;
          let nodosActuales = this.todosNodos.filter((nodo) =>
            idsNodosActuales.includes(nodo.id)
          );
          let idsSiguientes = nodosActuales
            .map((nodo) =>
              nodo.vinculos
                .filter((v) => v.tipo === "continuacion" && v.rol == "target")
                .map((vinculo) => vinculo.idRef)
            )
            .flat();
          idsCompletos.push(...idsSiguientes);
          idsNodosActuales = idsSiguientes;
        }

        return {
          ...col,
          idsRedNodos: idsCompletos,
        };
      });
    },
    coleccionSeleccionadaNullificable() {
      if (!this.idColeccionSeleccionada) {
        return null;
      }

      return this.coleccionSeleccionada;
    },
  },
  methods: {
    toggleNodoColeccion() {
      if (!this.idNodoSeleccionado || !this.coleccionSeleccionadaNullificable) {
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
            idColeccion: this.coleccionSeleccionadaNullificable.id,
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
    clickNodo(idNodo) {
      this.idNodoSeleccionado =
        this.idNodoSeleccionado === idNodo ? null : idNodo;
    },
    setIdColeccionSeleccionada(nuevoId) {
      this.idColeccionSeleccionada = nuevoId;
    },
  },
  watch: {
    idNodoSeleccionado(val) {
      this.$emit("idNodoSeleccionado", val);
    },
    estiloIconoProgresoUsuario() {
      if (this.$refs?.imagenUsuario && this.$refs.diagramaPersonal) {
        this.$nextTick(() => {
          let screenWidth = screen.width;
          this.$refs.diagramaPersonal.scrollLeft =
            this.$refs.diagramaPersonal.scrollWidth / 2 - screenWidth / 2;
        });
      }
    },
    coleccionSeleccionadaNullificable(col) {
      this.$emit("coleccionSeleccionada", col);
      if (!col) {
        this.mostrandoArbol = false;
        this.mostrandoOpcionesColeccion = false;
      }
    },

    idColeccionSeleccionada(idColeccion) {
      this.desplegandoLista = false;
      this.conectandoNodosColeccion = false;
      localStorage.setItem(
        "atlasConocimientoIdLastColeccionTarget",
        idColeccion
      );
    },
    conectandoNodosColeccion(val) {
      this.mostrandoArbol = false;
      if (!val) {
        this.mostrandoOpcionesColeccion = false;
      }
      this.$emit("conectandoNodosColeccion", val);
    },

    mostrandoArbol(val) {
      this.$emit("mostrandoArbol", val);
      this.$refs.diagramaArbol.idNodoSeleccionado = null;
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.montado = true;
    });
  },
};
</script>
<style scoped lang="css">
.gestorColecciones {
  width: 100%;
  --colorFondoGestionColecciones: rgb(233, 233, 233);
}
#botonMostrarArbol {
  position: absolute;
  top: 50%;
  right: calc(100% + 10px);
  transform: translateY(-50%);
  background-color: var(--mainColor);
  border-radius: 50%;
}
#botonMostrarArbol.activo {
  background-color: var(--atlasConocimientoSeleccion);
}
#iconoColeccionSeleccionada {
  width: 25px;
  height: 25px;
  border-radius: 50%;
  align-self: center;
}
#zonaTitulo {
  margin: 0px auto;
  display: flex;
  padding: 10px 20px;
  gap: 10px;
  align-items: center;
  justify-content: center;
  background-color: inherit;
}

#contenedorOpciones {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin: 10px auto;
  margin-top: 0px;
  width: fit-content;
}
#contenedorOpciones .botonOpcion {
}
#botonConectarNodosColeccion {
  background-color: transparent;
  box-shadow: none;
}
#anuncioConectandoNodos {
  position: relative;
}
#botonCancelarConectarNodosColeccion {
  background-color: var(--mainColor);
  position: absolute;
  top: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%);
}
#botonToggleNodoColeccion {
  width: fit-content;
  margin: 10px auto;
}
#nombreColeccion {
  position: relative;
  z-index: 10;
  padding: 10px 30px;
  background-color: var(--atlasConocimientoSeleccion);
  border-radius: 45px;
  cursor: pointer;
  display: flex;
  gap: 5px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
}

#nombreColeccion.desplegandoLista {
  border-bottom-left-radius: 0px;
  border-bottom-right-radius: 0px;
}

#listaSelectoresColeccion {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  width: min(200px, 90vw);
}

#botonMostrarOpcionesColeccion {
  position: absolute;
  top: 50%;
  left: calc(100% + 5px);
  transform: translateY(-50%);
  width: 22px;
  height: 22px;
}

#contenedorControlesColeccion {
  position: absolute;
  top: calc(100% + 5px);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 15px;
  justify-content: center;
}

.controlColeccion {
  background-color: rgba(58, 58, 58, 0.445);
  box-shadow: 2px 2px 2px gray;
}

.selectorColeccion {
  padding: 15px 15px;
  font-size: 16px;
  cursor: pointer;
  background-color: var(--mainColor);
  display: flex;
  gap: 10px;
  align-items: center;
}
#contenedorControlesColeccion {
  position: absolute;
  top: calc(100% + 5px);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 15px;
  justify-content: center;
}

.controlColeccion {
  background-color: rgba(58, 58, 58, 0.445);
  box-shadow: 2px 2px 2px gray;
}

.selectorColeccion {
  padding: 15px 15px;
  font-size: 16px;
  cursor: pointer;
  background-color: var(--mainColor);
  display: flex;
  gap: 10px;
  align-items: center;
}

/* #region diagrama arbol */
#diagramaPersonal {
  padding: 20px 5px;
  background-color: var(--colorFondoGestionColecciones);
  overflow-x: scroll;
}
#iconoProgresoUsuario {
  width: fit-content;
  position: relative;
  transform: translateX(-50%);
}
#contenedorSelectoresModoDiagrama {
  display: flex;
  gap: 20px;
  align-items: center;
  justify-content: center;
  padding: 10px 10px;
  margin: 0px auto;
}
.selectorModoDiagrama {
  height: 20px;
  width: 20px;
  opacity: 0.5;
}
.selectorModoDiagrama.activo {
  opacity: 1;
}
#contenedorFotoUsuario {
  border-radius: 50%;
  height: 100px;
  width: 100px;
  overflow: hidden;
}
#contenedorFotoUsuario img {
  height: 100%;
}
#indicadorProgreso {
  font-size: 0.7em;
  text-align: center;
  margin: 10px auto;
  margin-top: 0px;
}
#listaNodosColeccion {
  margin: 70px auto;
  display: flex;
  flex-wrap: wrap;
  gap: 40px;
  row-gap: 60px;
  align-items: flex-start;
  padding-bottom: 50px;
}
#contenedorArbol > .nodoConocimientoVistaArbol {
  margin: 0px auto;
  flex-shrink: 0;
}

/* #endregion */
</style>
