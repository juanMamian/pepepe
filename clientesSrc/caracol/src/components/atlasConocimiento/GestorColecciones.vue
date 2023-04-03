<template lang="">
  <div class="gestorColecciones">
    <div
      id="nombreColeccion"
      :class="{ desplegandoLista }"
      @click.stop="desplegandoLista = !desplegandoLista"
    >
      <pie-progreso
        v-if="coleccionSeleccionadaNullificable?.progreso"
        v-show="!this.$apollo.queries.coleccionSeleccionada.loading"
        :progreso="coleccionSeleccionada.progreso"
        :color-fondo="'transparent'"
        style="margin-right: 10px"
      >
        <img
          src="@/assets/iconos/atlas/userNodes.png"
          alt="Colección"
          id="iconoColeccionSeleccionada"
        />
      </pie-progreso>
      <loading v-show="this.$apollo.queries.coleccionSeleccionada.loading" />
      <span style="z-index: 1">
        {{ coleccionSeleccionadaNullificable?.nombre || "Atlas" }}
      </span>
    </div>

    <div
      class="boton"
      id="botonMostrarOpcionesColeccion"
      v-show="!desplegandoLista"
      @click="mostrandoOpcionesColeccion = !mostrandoOpcionesColeccion"
    >
      <img src="@/assets/iconos/ellipsisVertical.svg" alt="Opciones" style="" />
    </div>

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
  </div>
</template>
<script>
import { gql } from "@apollo/client/core";
import PieProgreso from "@/components/utilidades/PieProgreso.vue";
import Loading from "@/components/utilidades/Loading.vue";

export default {
  name: "GestorColecciones",
  components: {
    PieProgreso,
    Loading,
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
      coleccionSeleccionada: {
        idsNodos: [],
        idsRed: [],
      },
      desplegandoLista: false,
      idColeccionSeleccionada: null,
      mostrandoOpcionesColeccion: false,
    };
  },
  computed: {
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
    coleccionSeleccionadaNullificable(){
      if(!this.idColeccionSeleccionada){
        return null;
      }

      return this.coleccionSeleccionada;
    }
  },
  methods: {
    setIdColeccionSeleccionada(nuevoId) {
      this.idColeccionSeleccionada = nuevoId;
    },
  },
  watch: {
    coleccionSeleccionadaNullificable(col) {
      console.log("Emitiendo colección");
      this.$emit(
        "coleccionSeleccionada", col
      );
    },

    idColeccionSeleccionada(idColeccion) {
      this.desplegandoLista = false;
      localStorage.setItem(
        "atlasConocimientoIdLastColeccionTarget",
        idColeccion
      );
    },
  },
};
</script>
<style scoped lang="css">
#iconoColeccionSeleccionada {
  width: 25px;
  height: 25px;
  background-color: rgb(230, 230, 230);
  border-radius: 50%;
  align-self: center;
  opacity: 1;
}

#iconoColeccionSeleccionada:hover {
  opacity: 0;
}

#nombreColeccion {
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
</style>
