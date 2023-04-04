<template>
  <div class="gestorColecciones">
    <div id="zonaTitulo" :style="[estiloZonaTitulo]">
      <div
        v-show="
          coleccionSeleccionadaNullificable &&
          !$apollo.queries.coleccionSeleccionada.loading
        "
        class="boton"
        :class="{activo:mostrandoArbol}"
        id="botonMostrarArbol"
        @click="mostrandoArbol = !mostrandoArbol"
      >
        <img
          src="@/assets/iconos/atlas/userNodes.png"
          alt="Colección"
          id="iconoColeccionSeleccionada"
        />
      </div>
      <div
        id="nombreColeccion"
        :class="{ desplegandoLista }"
        @click.stop="desplegandoLista = !desplegandoLista"
      >
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
          v-show="!desplegandoLista"
          @click="mostrandoOpcionesColeccion = !mostrandoOpcionesColeccion"
        >
          <img
            src="@/assets/iconos/ellipsisVertical.svg"
            alt="Opciones"
            style=""
          />
        </div>
      </div>
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
        <div
          ref="contenedorArbol"
          id="contenedorArbol"
          :style="[estiloContenedorArbol]"
        >
          <nodo-conocimiento-vista-arbol
            v-for="idNodo of idsNodosPresentes"
            :key="idNodo"
            :idNodo="idNodo"
            :idNodoSeleccionado="idNodoSeleccionado"
            :cadenaTarget="cadenaTarget"
            :yo="yo"
            :refreshLineaHorizontal="refreshLineaHorizontal"
            @clickEnNodo="clickNodo"
            @updateCadenaTarget="updateCadenaTarget"
          />
        </div>
      </div>
    </transition>
  </div>
</template>
<script>
import { gql } from "@apollo/client/core";
import PieProgreso from "@/components/utilidades/PieProgreso.vue";
import Loading from "@/components/utilidades/Loading.vue";
import NodoConocimientoVistaArbol from "@/components/atlasConocimiento/NodoConocimientoVistaArbol.vue";
import debounce from "debounce";

export default {
  name: "GestorColecciones",
  components: {
    PieProgreso,
    Loading,
    NodoConocimientoVistaArbol,
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

      mostrandoArbol: false,
      idNodoSeleccionado: null,
      cadenaTarget: [],

      refreshPosiciones: 0,
    };
  },
  computed: {
    estiloZonaTitulo(){
      let color="transparent";
      let width="fit-content";
      if(this.mostrandoArbol){
        color="var(--colorFondoGestionColecciones)";
        width="100%";
      }
      return {
        backgroundColor: color,
        width,
      }
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
    estiloContenedorArbol() {
      let overflowX = "unset";
      return {
        overflowX,
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
    idsNodosPresentes() {
      if (!this.coleccionSeleccionadaNullificable) {
        return [];
      }
      //Cuando hay nodo target él es el único presente. Él mismo mostrará sus dependencias.
      if (this.cadenaTarget.length > 0) {
        return [this.cadenaTarget[0]];
      }

      return this.coleccionSeleccionadaNullificable.idsNodos;
    },
  },
  methods: {
    refreshLineas: debounce(function () {
      console.log("activando refresh de línea horizontal");
      this.refreshLineaHorizontal++;
    }, 1000),
    updateCadenaTarget(nuevaCadena) {
      this.cadenaTarget = nuevaCadena;
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
    cadenaTarget() {
      console.log("incrementando el refresh de linea horizontal");
      this.refreshLineaHorizontal++;
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
        this.idNodoSeleccionado = null;
        this.cadenaTarget = [];
      }
    },

    idColeccionSeleccionada(idColeccion) {
      this.desplegandoLista = false;
      localStorage.setItem(
        "atlasConocimientoIdLastColeccionTarget",
        idColeccion
      );
    },
    mostrandoArbol(val) {
      this.$emit("mostrandoArbol", val);
    },
    "$refs.contenedorArbol": function () {
      this.anchoContenedorArbol = this.$refs.anchoContenedorArbol.offsetWidth;
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.montado = true;
      this.refreshPosiciones++;
    });
  },
};
</script>
<style scoped lang="css">
.gestorColecciones {
  width: 100%;
  --colorFondoGestionColecciones:rgb(233, 233, 233);
}
#botonMostrarArbol {
  background-color: var(--mainColor);
  border-radius: 50%;
  margin-right: 15px;
}
#botonMostrarArbol.activo{
  background-color: var(--atlasConocimientoSeleccion);
}
#iconoColeccionSeleccionada {
  width: 25px;
  height: 25px;
  border-radius: 50%;
  align-self: center;
}
#zonaTitulo{
  margin: 0px auto;
  display: flex;
  padding: 10px 20px;
 gap: 10px;
 align-items: center; 
 justify-content: center;
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
#contenedorArbol {
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
