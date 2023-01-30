<template>
  <div class="rutaGrado" @click="idNodoSeleccionado = null">
    <div id="titulo" class="tituloComponente">Ruta de grado</div>

    <div id="laRutaGrado">
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
    };
  },
};
</script>

<style scoped>
#laRutaGrado {
  display: flex;
  justify-content: center;
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