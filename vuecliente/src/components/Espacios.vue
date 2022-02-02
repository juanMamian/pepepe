<template>
  <div class="espacios">
    <router-view id="visorVentanaEventoPublico" @meRepetiPeriodicamente="manejarCreacionEventos" @eventoCambioFecha="manejarCreacionEventos([$event])">
      
    </router-view>
    <div id="barraControles">
      <div
        class="boton botonControl"
        v-show="usuarioProfe"
        title="Crear nuevo espacio"
        @click="crearNuevoEspacio"
      >
        <img src="@/assets/iconos/plusCircle.svg" alt="Nuevo" />
      </div>
    </div>
    <div id="listaEspacios">
      <espacio
        v-for="espacio of todosEspacios"
        ref="espacios"
        :key="espacio.id"
        :esteEspacio="espacio"
        @meElimine="eliminarEspacioCache(espacio.id)"
      />
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import Espacio from "./Espacio.vue";
const fragmentoEspacio = gql`
  fragment fragEspacio on Espacio {
    id
    nombre
    descripcion
    idAdministrador
  }
`;
const QUERY_ESPACIOS = gql`
  query {
    todosEspacios {
      ...fragEspacio
    }
  }
  ${fragmentoEspacio}
`;



export default {
  components: { Espacio },
  apollo: {
    todosEspacios: {
      query: QUERY_ESPACIOS,
    },
  },
  name: "Espacios",
  data() {
    return {
      todosEspacios: [],

      creandoEspacio: false,
    };
  },
  methods: {
    crearNuevoEspacio() {
      if (!this.usuarioProfe && !this.usuarioSuperadministrador) return;

      this.creandoEspacio = true;

      this.$apollo.mutate({
        mutation: gql`
          mutation ($info: InputCrearEspacio) {
            crearEspacio(info: $info) {
              ...fragEspacio
            }
          }
          ${fragmentoEspacio}
        `,
        variables:{
            info:{
                idAdministrador: this.usuario.id
            }
        }
      }).then(({data:{crearEspacio}})=>{
          const store=this.$apollo.provider.defaultClient;
          const cache=store.readQuery({
              query: QUERY_ESPACIOS
          });
          const nuevoCache=JSON.parse(JSON.stringify(cache));

          const indexE=nuevoCache.todosEspacios.findIndex(e=>e.id===crearEspacio.id);
          if(indexE===-1){
              nuevoCache.todosEspacios.push(crearEspacio);
              store.writeQuery({
                  query: QUERY_ESPACIOS,
                  data: nuevoCache
              })
          }
          else{
              console.log(`El espacio ya estaba en caché`);
          }
      }).catch((error)=>{
          console.log(`Error: ${error}`);
      })
    },
    eliminarEspacioCache(idEspacio) {
      const store = this.$apollo.provider.defaultClient;
      const cache = store.readQuery({
        query: QUERY_ESPACIOS,        
      });
      var nuevoCache = JSON.parse(JSON.stringify(cache));
      const indexE = nuevoCache.todosEspacios.findIndex(
        (e) => e.id === idEspacio
      );
      if (indexE > -1) {
        nuevoCache.todosEspacios.splice(indexE, 1);
        store.writeQuery({
          query: QUERY_ESPACIOS,          
          data: nuevoCache,
        });
      }
    },
    manejarCreacionEventos(eventos){
      console.log(`Manejando la repeticion de los eventos de un espacio con id ${eventos[0].idParent}`);
      this.$refs.espacios.forEach(e=>e.checkIfMyNewEventos(eventos));
    },
    handleCambioFechaEvento(){
      console.log(`Handling`);

    }
  },
  computed: {
    usuarioProfe() {
      if (!this.usuarioLogeado) return false;

      return this.usuario.permisos.includes("maestraVida-profesor");
    },
  },
};
</script>

<style scoped>
#barraControles {
  display: flex;
  flex-direction: row-reverse;
    padding: 10px 20px;
}

.botonControl {
  width: 20px;
  height: 20px;
}
#listaEspacios{
    margin: 20px auto;
    width: min(600px, 95vw);
    margin-bottom: 40vh;
}
.espacio{
  margin:10px 0px;
}
.espacio:hover{
    background-color: var(--grisHover);
}
</style>