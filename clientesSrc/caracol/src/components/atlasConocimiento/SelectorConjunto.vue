<template>
  <div class="selectorConjunto" :class="{ seleccionado, deshabilitado:eliminandose }">
    <div class="menuContextual" id="menuContextual" v-show="menuCx" @click.stop="">
      <div class="botonMenuCx" @click.stop="eliminarse">Eliminar</div>
    </div>
    <div id="zonaIcono">
      <img
        src="@/assets/iconos/userNodes.png"
        alt="Coleccion"
        style="height: 30px"
        v-show="!eliminandose"
      />
      <loading v-show="eliminandose" />
    </div>

    <div id="zonaInformacion">
      <div id="nombre">
        {{ estaColeccion.nombre }}
      </div>
    </div>
  </div>
</template>

<script>
import { gql } from "@apollo/client/core"
import { QUERY_DATOS_USUARIO_NODOS } from './fragsAtlasConocimiento.js';
import Loading from '../utilidades/Loading.vue';
export default {
  components: { Loading },
  name: "SelectorConjunto",
  props: {
    seleccionado: Boolean,
    estaColeccion: Object,
    menuCx:Boolean,
  },
  data() {
    return {
      eliminandose: false,
    };
  },
  methods: {
    eliminarse() {
      if (
        !confirm(
          "Confirmar eliminación de colección? (Esta acción no se puede deshacer)"
        )
      ) {
        return;
      }

      this.eliminandose=true;

      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idColeccion: ID!) {
              eliminarColeccionNodosAtlasConocimientoUsuario(
                idColeccion: $idColeccion
              ) 
            }
          `,
          variables: {
            idColeccion: this.estaColeccion.id,
          },
        })
        .then(() => {
          this.eliminandose = false;

          const store=this.$apollo.provider.defaultClient;
          const cache=store.readQuery({
            query: QUERY_DATOS_USUARIO_NODOS,
          });

          var nuevoCache=JSON.parse(JSON.stringify(cache));

          var colecciones=nuevoCache.yo.atlas.colecciones;

          const indexC=colecciones.findIndex(col=>col.id===this.estaColeccion.id);

          if(indexC>-1){
            console.log(`Retirando colección de caché`);
            colecciones.splice(indexC, 1);

            store.writeQuery({
              query: QUERY_DATOS_USUARIO_NODOS,
              data: nuevoCache
            })
          }
          else{
            console.log(`La colección a borrar no estaba en caché`);
          }
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
          this.eliminandose = false;
        });
    },
  },
};
</script>

<style scoped>
.selectorConjunto {
  display: flex;
  position: relative;
  gap: 10px;
  align-items: center;
  width: min(200px, 90vw);
  min-height: 100px;
  padding: 10px 20px;
  border-radius: 15px;
  background-color: var(--atlasConocimientoAvailable);
  box-sizing: border-box;
}
.selectorConjunto.seleccionado {
  border: 2px solid var(--atlasConocimientoSeleccion);
}
#menuContextual{
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-5%, -5%);
}

#zonaInformacion {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-grow: 1;
}
</style>