<template>
  <div class="nodoConocimientoVistaLista">
    <div id="barraPrincipal">
      <div id="iconoNodo" v-if="elNodo">
        <img
          v-if="elNodo.tipoNodo === 'habilidad'"
          src="@/assets/iconos/atlas/fireSolid.svg"
          alt="Skill"
        />
        <img v-else src="@/assets/iconos/atlas/lightbulbEmpty.svg" alt="Idea" />
      </div>
      <div id="nombreNodo">
        {{ elNodo?.nombre }}
      </div>
    </div>
  </div>
</template>
<script>
import {gql} from "@apollo/client/core";

export default {
  name: "NodoConocimientoVistaLista",
  props: {
    idNodo: {
      type: String,
      required: true,
    },
    yo: {
      type: Object,
      required: true,
    },
  },
  apollo: {
    elNodoDB: {
      query: gql`
        query ($idNodo: ID!) {
          nodo(idNodo: $idNodo) {
            id
            nombre
            tipoNodo
            vinculos {
              id
              idRef
              rol
              tipo
            }
          }
        }
      `,
      variables() {
        return {
          idNodo: this.idNodo,
        };
      },
      update({nodo}) {
        return nodo;
      },
      skip(){
        return !this.idNodo;
      },
      fetchPolicy: "cache-first",
    },
  },
  data() {
    return {
      elNodoDB: {
        vinculos: [],
      },
    };
  },
  computed: {
    elNodo(){
      if(!this.idNodo){
        return null
      }
      return this.elNodoDB;
    },
    datoUsuarioEsteNodo() {
      return this.yo?.datosUsuario?.find(
        (datoUsuario) => datoUsuario.idNodo === this.idNodo
      );
    },
    aprendido() {
      return this.datoUsuarioEsteNodo?.aprendido;
    },
    estudiado() {
      if (!this.datoUsuarioEsteNodo) {
        return null;
      }

      return this.datoUsuarioEsteNodo?.estudiado;
    },
    fresco() {
      if (!this.estudiado) {
        return false;
      }

      if (!this.datoUsuarioEsteNodo?.diasRepaso) {
        return false;
      }

      let fechaLimite =
        this.estudiado +
        this.datoUsuarioEsteNodo.diasRepaso * 24 * 60 * 60 * 1000;

      return fechaLimite > Date.now();
    },
  },
};
</script>
<style lang="css" scoped>
#barraPrincipal {
  display: flex;
  padding: 0.5rem;
  gap: 10px;
  justify-content: left;
  align-items: center;
}

#iconoNodo img {
  height: 20px;
}
</style>
