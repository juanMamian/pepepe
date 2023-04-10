<template>
  <div class="rutaGrado" @click="idNodoSeleccionado = null">
    <div id="titulo" class="tituloComponente">Ruta de grado</div>

    <div id="laRutaGrado" ref="laRutaGrado">
      <div class="subruta" v-for="ruta of subrutas" :key="ruta.id">
        <div class="lineaRuta"></div>
        <nodo-grado
          v-for="nodo of ruta.nodos"
          :key="nodo.id"
          :esteNodo="nodo"
          :completado="nodosCompletados.includes(nodo.id)"
          :colorSubruta="ruta.color"
          :seleccionado="idNodoSeleccionado === nodo.id"
          :idUsuario="idUsuario"
          @setColorSubruta="setColorSubruta(ruta.id)"
          @click.native.stop="
            idNodoSeleccionado = idNodoSeleccionado === nodo.id ? null : nodo.id
          "
          @seleccioname="idNodoSeleccionado = nodo.id"
        />
      </div>
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import NodoGrado from "./NodoGrado.vue";

export default {
  components: { NodoGrado },
  name: "RutaGrado",
  props: {
    idUsuario: String,
  },
  apollo: {
    subrutas: {
      query: gql`
        query {
          subrutasGradoMaestraVida {
            id
            nombre
            color
            nodos {
              id
              nombre
              descripcion
            }
          }
        }
      `,
      update({ subrutasGradoMaestraVida }) {
        return subrutasGradoMaestraVida;
      },
    },
    nodosCompletados: {
      query: gql`
        query ($idUsuario: ID!) {
          Usuario(idUsuario: $idUsuario) {
            id
            nodosCompletadosRutaGrado
          }
        }
      `,
      update({ Usuario }) {
        return Usuario.nodosCompletadosRutaGrado;
      },
      variables() {
        return {
          idUsuario: this.idUsuario,
        };
      },
    },
  },
  data() {
    return {
      subrutas: [],
      nodosCompletados: [],
      idNodoSeleccionado: null,

      settingColorSubruta: false,
    };
  },
  methods: {
    setColorSubruta(idSubruta) {
      let nuevoColor = prompt("Introduce el código del nuevo color");

      this.settingColorSubruta = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idSubruta: ID!, $nuevoColor: String!) {
              setColorSubrutaGrado(
                idSubruta: $idSubruta
                nuevoColor: $nuevoColor
              ) {
                id
                color
              }
            }
          `,
          variables: {
            idSubruta,
            nuevoColor,
          },
        })
        .then(() => {
          this.settingColorSubruta = false;
        })
        .catch((error) => {
          console.log("Error: " + error);
          this.settingColorSubruta = false;
        });
    },
  },
  watch: {
    subrutas() {
      this.$nextTick(() => {
        let anchoScroll = this.$refs.laRutaGrado.scrollWidth;
        console.log("anchoScroll: " + anchoScroll);
        let anchoVisible = this.$refs.laRutaGrado.offsetWidth;
        console.log("ancho visible: " + anchoVisible);
        this.$refs.laRutaGrado.scrollLeft = (anchoScroll - anchoVisible) / 2;
      });
    },
  },
};
</script>

<style scoped>
#laRutaGrado {
  display: flex;
  gap: 0px;
  padding: 20px 0px;
  max-height: 100vh;
  overflow-y: scroll;
}

.subruta {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 0px 20px;
  align-items: center;
  position: relative;
  flex-shrink: 0;
  min-width: 300px;
}

.subruta .lineaRuta {
  position: absolute;
  top: 0px;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--gris);
  width: 2px;
  height: 100%;
}
</style>
