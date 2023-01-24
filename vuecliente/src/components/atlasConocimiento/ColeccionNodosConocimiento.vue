<template>
  <div class="coleccionNodosConocimiento">
    <div id="zonaBarraProgreso" v-show="!$apollo.queries.progresoColeccion.loading">
      <div id="barraProgreso">
        <div id="barraProgresoVerde" :style="[{width: progresoColeccion+'%'}]"></div>
      </div>
    
    <div id="numeroProgreso">
        {{progresoColeccion}}%
    </div>
    </div>

    <loading v-show="$apollo.queries.progresoColeccion.loading" />

    <div class="listaNodos">
      <icono-nodo-conocimiento
        v-for="nodo of nodosConocimiento"
        :key="nodo.id"
        :esteNodo="nodo"
        :seleccionado="idNodoSeleccionado === nodo.id"
        @click.self.stop="
          idNodoSeleccionado = idNodoSeleccionado === nodo.id ? null : nodo.id
        "
      />
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import IconoNodoConocimiento from "./IconoNodoConocimiento.vue";
import Loading from '../utilidades/Loading.vue';

const QUERY_NODOS_COLECCION = gql`
  query ($idsNodos: [ID!]!) {
    nodosConocimientoByIds(idsNodos: $idsNodos) {
      id
      nombre
      descripcion
    }
  }
`;

export default {
  name: "ColeccionNodosConocimiento",
  components: { IconoNodoConocimiento, Loading },
  apollo: {
    nodosConocimiento: {
      query: QUERY_NODOS_COLECCION,
      variables() {
        return {
          idsNodos: this.estaColeccion.idsNodos,
        };
      },
      skip() {
        return !this.estaColeccion?.idsNodos.length > 0;
      },
      update({ nodosConocimientoByIds }) {
        return nodosConocimientoByIds;
      },
    },
    progresoColeccion: {
      query: gql`
        query ($idColeccion: ID!, $idUsuario: ID!) {
          coleccionNodosConocimiento(
            idColeccion: $idColeccion
            idUsuario: $idUsuario
          ) {
            id
            progreso
          }
        }
      `,
      variables() {
        return {
          idColeccion: this.estaColeccion.id,
          idUsuario: this.yo.id,
        };
      },
      skip() {
        return !this.yo?.id || !this.estaColeccion?.id;
      },
      update({ coleccionNodosConocimiento }) {
        return coleccionNodosConocimiento.progreso;
      },
    },
  },
  props: {
    estaColeccion: Object,
    yo: Object,
  },
  data() {
    return {
      idNodoSeleccionado: null,
      nodosConocimiento: [],
      progresoColeccion: null,
    };
  },
};
</script>

<style scoped>
.listaNodos {
  display: flex;
  padding: 20px 20px;
  padding-bottom: 90px;
  gap: 60px;
  flex-wrap: wrap;
}

#barraProgreso {
  background-color: gray;
  height: 12px;
  width: 100%;
}
#barraProgresoVerde {
  background-color: green;
  height: 100%;
}

#numeroProgreso{
    width: 100%;
    text-align: center;
}
</style>