<template>
  <div class="nodoVistaLista">
    <div
      class="elementoLista"
      v-show="!busqueda || busqueda.length < 2 || buscado || childrenBuscados"
    >
      <div
        class="zonaNombre"
        :class="{ seleccionado }"
        @click="$emit('nodoSeleccionado', esteNodo.id)"
        :style="[colorNombre]"
      >
        <div
          class="trianguloBullet"
          :style="{
            transform:
              mostrandoChildren || childrenBuscados
                ? 'rotateZ(90deg)'
                : 'rotateZ(0deg)',
          }"
          v-if="esteNodo.children && esteNodo.children.length > 0"
          @click.stop="mostrandoChildren = !mostrandoChildren"
        ></div>
        {{ esteNodo.nombre }}
        <div id="botonesRight">
          <img
            src="@/assets/iconos/responsableTrabajo.png"
            alt="Responsables"
            title="Responsables"
            id="botonResponsables"
            class="botonRight"
            @click.stop="mostrandoResponsables = !mostrandoResponsables"
            :class="{
              deshabilitado:
                !esteNodo.responsables || esteNodo.responsables.length < 1,
            }"
          />
          <img
            src="@/assets/iconos/ir.png"
            alt="Centrar"
            class="botonRight"
            id="botonCentrarNodo"
            @click.stop="emitirCentrarNodo"
          />
        </div>
      </div>
      <div
        id="listaResponsables"
        v-show="mostrandoResponsables"
        @click.stop="idResponsableSeleccionado = null"
      >
        <icono-persona-autonomo
          v-for="idResponsable of esteNodo.responsables"
          :key="idResponsable"
          :idPersona="idResponsable"
          :seleccionado="idResponsableSeleccionado == idResponsable"
          :factorEscala="'0.7'"
          @click.native.stop="idResponsableSeleccionado = idResponsable"
        />
      </div>
      <div
        id="sublista"
        v-if="esteNodo.children && esteNodo.children.length > 0"
        v-show="mostrandoChildren || childrenBuscados"
      >
        <div id="lineaLista"></div>
        <nodo-vista-lista
          v-for="nodo of esteNodo.children"
          ref="nodosChildren"
          :key="nodo.id"
          :esteNodo="nodo"
          :busqueda="busqueda"
          :idNodoSeleccionado="idNodoSeleccionado"
          :id="'nodoEnLista' + nodo.id"
          :mostrarColoresCompletado="seleccionado"
          @centrarEnNodo="$emit('centrarEnNodo', $event)"
          @nodoSeleccionado="$emit('nodoSeleccionado', $event)"
        />
        <div id="lineaFinal"></div>
      </div>
    </div>
  </div>
</template>

<script>
import IconoPersonaAutonomo from "../usuario/IconoPersonaAutonomo.vue";

export default {
  name: "NodoVistaLista",
  components: {
    IconoPersonaAutonomo,
  },
  props: {
    esteNodo: Object,
    busqueda: String,
    idNodoSeleccionado: String,
    mostrarColoresCompletado: Boolean,
  },
  data() {
    return {
      mostrandoChildren: false,
      mostrandoResponsables: false,
      idResponsableSeleccionado: null,
    };
  },
  methods: {
    emitirCentrarNodo() {
      this.$emit("centrarEnNodo", this.esteNodo.id);
    },
    desplegarIfTargetChild(idTarget) {
      var desplegar = false;
      (this.$refs.nodosChildren || []).forEach((nodo) => {
        if (
          nodo.desplegarIfTargetChild(idTarget) ||
          nodo.esteNodo.id === idTarget
        ) {
          this.mostrandoChildren = true;
          desplegar = true;
        }
      });

      return desplegar;
    },
  },
  computed: {
    palabrasBuscadas() {
      if (!this.busqueda || this.busqueda.length < 2) return [];
      var busquedaLocal = this.busqueda.trim();
      busquedaLocal = busquedaLocal
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "");

      busquedaLocal = busquedaLocal.replace(/\s\s+/g, " ");
      return busquedaLocal.match(/\b(\w+)\b/g);
    },
    textoRelevanteBusqueda() {
      var texto =
        this.esteNodo.nombre +
        " " +
        this.esteNodo.descripcion +
        " " +
        this.esteNodo.keywords;

      texto = texto.trim();
      texto = texto.replace(/\s\s+/gi, " ");
      texto = texto.normalize("NFD").replace(/\p{Diacritic}/gu, "");

      return texto;
    },
    matchBusqueda() {
      var puntaje = 0;
      this.palabrasBuscadas.forEach((palabra) => {
        let re = new RegExp(palabra, "gi");
        let puntos = (this.textoRelevanteBusqueda.match(re) || []).length;
        puntaje += puntos;
      });
      return puntaje;
    },
    buscado() {
      return this.matchBusqueda > 0;
    },
    colorNombre() {
      var backgroundColor = "";
      if (this.mostrarColoresCompletado) {
        if (this.esteNodo.estadoDesarrollo === "noCompletado") {
          backgroundColor = "#ebeb54";
          if (
            !this.esteNodo.responsables ||
            this.esteNodo.responsables.length < 1
          ) {
            backgroundColor = "#d9d9d9";
          }
        } else if (this.esteNodo.estadoDesarrollo === "completado") {
          backgroundColor = "#4ca94c";
        }
      }
      if (this.buscado) {
        backgroundColor = "tomato";
      }
      return {backgroundColor};
    },
    childrenBuscados() {
      if (!this.busqueda || this.busqueda.trim() < 2) return false;
      if (this.$refs.nodosChildren) {
        return this.$refs.nodosChildren.some(
          (c) => c.buscado || c.childrenBuscados
        );
      } else {
        return false;
      }
    },
    seleccionado() {
      return (
        this.idNodoSeleccionado && this.esteNodo.id === this.idNodoSeleccionado
      );
    },
  },
};
</script>

<style scoped>
.nodoVistaLista {
}

.trianguloBullet {
  border: 8px solid transparent;
  border-left: 8px solid black;
  display: inline-block;
  margin-right: 5px;
  transform-origin: 25% 70%;
  transition: transform 0.2s;
}

.zonaNombre {
  cursor: pointer;
  padding: 3px 6px;
  display: flex;
  align-items: center;
}
.zonaNombre:hover {
  background-color: rgb(137, 197, 199);
}
.seleccionado {
  background-color: rgb(139, 87, 139);
}
.seleccionado:hover {
  background-color: rgb(153, 83, 153);
}
#botonesRight {
  margin-left: auto;
}

.botonRight {
  width: 19px;
  height: 19px;
  cursor: pointer;
  border-radius: 50%;
  padding: 2px;
}
.botonRight:hover {
  background-color: rgb(145, 209, 211);
}
#sublista {
  padding-left: 10px;
  position: relative;
}
#lineaLista {
  width: 1px;
  height: 100%;
  position: absolute;
  top: 0%;
  left: 2px;
  background-color: rgba(70, 70, 70, 0.685);
}
#lineaFinal {
  width: 40%;
  height: 1px;
  background-color: rgba(70, 70, 70, 0.685);
  position: relative;
  left: -8px;
}
#listaResponsables {
  display: flex;
  flex-wrap: wrap;
  padding-bottom: 50px;
  padding-left: 10px;
  background-color: rgba(128, 128, 128, 0.253);
}
.iconoPersonaAutonomo {
  position: relative;
}
</style>