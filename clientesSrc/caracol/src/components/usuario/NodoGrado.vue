<template>
  <div
    class="nodoGrado"
    :class="seleccionado"
    @contextmenu.prevent="abrirMenuCx"
    @dblclick.stop="abrirDescripcion"
  >
    <div id="laBolita" :class="{ seleccionado }" :style="[colorBolita]"></div>

    <div id="cartel">
      {{ esteNodo.nombre }}
      <div
        class="boton"
        id="botonOpciones"
        v-if="usuarioSuperadministrador || usuarioProfe"
        v-show="seleccionado"
        @click.stop="abrirMenuCx"
      >
        <img
          src="@/assets/iconos/ellipsisVertical.svg"
          alt="Opciones"
          style=""
        />
      </div>
    </div>

    <div class="menuContextual" @click.stop="" v-show="menuCx">
      <div class="botonMenuCx" @click="abrirDescripcion">Ver descripción</div>
      <div
        v-if="usuarioSuperadministrador"
        class="botonMenuCx"
        @click="$emit('setColorSubruta')"
      >
        Set color subruta
      </div>
      <div
        class="botonMenuCx"
        v-if="usuarioSuperadministrador || usuarioProfe"
        :class="{ deshabilitado: togglingEstadoCompletado }"
        @click="toggleCompletado"
      >
        <loading v-show="togglingEstadoCompletado" />
        {{
          completado ? "Desmarcar como completado" : "Marcar como completado"
        }}
      </div>
    </div>

    <div id="descripcion" v-show="mostrandoDescripcion">
      {{ esteNodo.descripcion }}
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import Loading from "../utilidades/Loading.vue";
export default {
  components: { Loading },
  name: "NodoGrado",
  props: {
    esteNodo: Object,
    completado: Boolean,
    colorSubruta: String,
    seleccionado: Boolean,
    idUsuario: String,
  },
  data() {
    return {
      menuCx: false,
      mostrandoDescripcion: false,

      togglingEstadoCompletado: false,
    };
  },
  computed: {
    colorBolita() {
      var backgroundColor = this.colorSubruta;

      if (this.completado) {
        backgroundColor = "var(--atlasVerde)";
      }

      return {
        backgroundColor,
      };
    },
  },
  methods: {
    abrirDescripcion() {
      this.$emit("seleccioname");
      this.mostrandoDescripcion = true;
      this.menuCx = false;
    },
    abrirMenuCx() {
      this.$emit("seleccioname");
      this.menuCx = true;
    },
    toggleCompletado() {
      if (!this.usuarioSuperadministrador && !this.usuarioProfe) {
        console.log("No autorizado");
        return;
      }

      const nuevoEstado = !this.completado;

      this.togglingEstadoCompletado = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idUsuario: ID!, $idNodo: ID!, $nuevoEstado: Boolean!) {
              setNodoGradoCompletadoUsuario(
                idUsuario: $idUsuario
                idNodo: $idNodo
                nuevoEstado: $nuevoEstado
              ) {
                id
                nodosCompletadosRutaGrado
              }
            }
          `,
          variables: {
            idUsuario: this.idUsuario,
            idNodo: this.esteNodo.id,
            nuevoEstado,
          },
        })
        .then(() => {
          this.togglingEstadoCompletado = false;
        })
        .catch((error) => {
          console.log("Error: " + error);
          this.togglingEstadoCompletado = false;
        });
    },
  },
  watch: {
    seleccionado(seleccionado) {
      if (!seleccionado) {
        this.menuCx = false;
        this.mostrandoDescripcion = false;
      }
    },
  },
};
</script>

<style scoped>
.nodoGrado {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  position: relative;
}

.nodoGrado.seleccionado {
  z-index: 1;
}

#laBolita {
  border-radius: 50%;
  border: 1px solid var(--gris);
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  background-color: var(--gris);
}

#laBolita:not(.seleccionado) {
  border-color: var(--gris);
}

#laBolita.seleccionado {
  border-color: black;
}

#cartel {
  font-size: 15px;
  text-align: center;
  border-radius: 10px;
  background-color: whitesmoke;
  padding: 10px 10px;
  color: rgb(59, 59, 59);
  position: relative;
  max-width: 160px;
}

#botonOpciones {
  position: absolute;
  top: 50%;
  left: calc(100% + 5px);
  transform: translateY(-50%);
}

.menuContextual {
  position: absolute;
  top: 50%;
  left: 50%;
}

#descripcion {
  position: absolute;
  top: calc(100% - 10px);
  z-index: 1;
  padding: 10px 10px;
  background-color: whitesmoke;
}
</style>