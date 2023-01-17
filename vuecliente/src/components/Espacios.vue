<template>
  <div class="espacios">
    <router-view id="visorVentanaEventoPublico" @meRepetiPeriodicamente="manejarCreacionEventos" @eventoCambioFecha="manejarCreacionEventos([$event])">
      
    </router-view>
    <div id="barraControles">
      
      <div
        class="boton botonControl"
        title="Crear nuevo espacio"
        v-show="usuarioProfe && !creandoEspacio"
        @click="crearNuevoEspacio"
      >
        <img src="@/assets/iconos/plusCircle.svg" alt="Nuevo" />
      </div>
      <loading texto="" v-show="creandoEspacio" />

      <div class="boton" @click="verTodos=!verTodos" style="margin-right:15px">
        <img src="@/assets/iconos/users.svg" alt="Todos" v-show="verTodos">
        <img src="@/assets/iconos/user.svg" alt="Usuario" v-show="!verTodos">
      </div>
    </div>

    <div class="tituloSeccion" @click="mostrandoEspacios=!mostrandoEspacios">Espacios</div>
    <div id="listaEspacios" v-show="mostrandoEspacios">
      <espacio
        v-for="espacio of espaciosVisibles"
        ref="espacios"
        :key="espacio.id"
        :esteEspacio="espacio"
        @meElimine="eliminarEspacioCache(espacio.id)"
      />
    </div>

    <organizador-horario-semanal />
  </div>
</template>

<script>
import gql from "graphql-tag";
import Espacio from "./Espacio.vue";
import Loading from './utilidades/Loading.vue';
import OrganizadorHorarioSemanal from './calendario/OrganizadorHorarioSemanal.vue';
import {fragmentoEspacio} from "./frags"


const QUERY_ESPACIOS = gql`
  query {
    todosEspacios {
      ...fragEspacio
    }
  }
  ${fragmentoEspacio}
`;



export default {
  components: { Espacio, Loading, OrganizadorHorarioSemanal },
  apollo: {
    todosEspacios: {
      query: QUERY_ESPACIOS,
    },
  },
  name: "Espacios",
  data() {
    return {
      todosEspacios: [],

      verTodos:false,
      creandoEspacio: false,

      mostrandoEspacios:true,
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
          this.creandoEspacio = false;

      }).catch((error)=>{
          console.log(`Error: ${error}`);
          this.creandoEspacio = false;

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
    espaciosVisibles(){
      if(this.verTodos)return this.espaciosUsuario.concat(this.espaciosNoUsuario);
      return this.espaciosUsuario
    },    
    espaciosUsuario(){
      if(!this.usuarioLogeado)return [];
      return this.todosEspacios.filter(e=>e.idAdministrador===this.usuario.id);
    },
    espaciosNoUsuario(){
      if(!this.usuarioLogeado)return this.todosEspacios;
      return this.todosEspacios.filter(e=>e.idAdministrador!=this.usuario.id)
    }
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
    margin-bottom: 100px;
}
.espacio{
  margin:10px 0px;
}
.espacio:hover{
    background-color: var(--grisHover);
}
</style>