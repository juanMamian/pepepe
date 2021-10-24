<template>
  <div id="grupos">
    <center><h3>Grupos</h3></center>
    <div id="controles" v-show="!loading">
      <div
        v-if="usuarioLogeado"
        id="crearGrupo"
        class="controles hoverGris"
        @click="crearNuevoGrupo"
      >
        Crear nuevo grupo
      </div>
      <div
        v-if="
          usuarioSuperadministrador &&
          grupos.some((p) => p.id == idGrupoSeleccionado)
        "
        id="bEliminarGrupo"
        class="controles hoverGris"
        @click="eliminarGrupo(idGrupoSeleccionado)"
      >
        Eliminar grupo
      </div>
    </div>
    <div id="listaGrupos" @click.self="idGrupoSeleccionado=null">
      <loading texto="Cargando lista de grupos..." v-show="loading"/>
      <icono-grupo
        v-for="grupo of gruposOrdenadosSegunUsuario"
        :key="grupo.id"
        :esteGrupo="grupo"
        :seleccionado="idGrupoSeleccionado == grupo.id"
        @click.native="idGrupoSeleccionado = grupo.id"
      />
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import IconoGrupo from "./IconoGrupo.vue";
import Loading from '../utilidades/Loading.vue';

const QUERY_GRUPOS=gql`
query {
    grupos {
      id
      nombre
      responsables
    }
  }
`;

export default {
  components: { IconoGrupo, Loading },
  name: "Grupos",
  apollo: {
    grupos: {
      query: QUERY_GRUPOS,
      fetchPolicy: "cache-and-network",
      update:function({grupos}){
        var nuevoGrupos=JSON.parse(JSON.stringify(grupos));
        this.loading=false;

        return nuevoGrupos.sort((a, b)=>{
          let res=0;
          if(a.responsables.some(r=>r.id==this.$store.state.usuario.id)){
            res--;
          }
          if(b.responsables.some(r=>r.id==this.$store.state.usuario.id)){
            res++;
          }
          return res;
        })
      }
    },
  },
  data() {
    return {
      grupos: [],
      idGrupoSeleccionado:null,
      loading:true,
    };
  },
  methods:{
    crearNuevoGrupo(){
      console.log(`Creando nuevo grupo`);
      this.$apollo.mutate({
        mutation: gql`
          mutation{
            crearGrupo{
              id
              nombre
              responsables              
            }
          }
        `,
      }).then(({data:{crearGrupo}})=>{
        this.$router.push('/grupo/'+crearGrupo.id);
      }).catch((error)=>{
        console.log(`Error: ${error.errors}`);
      });
    },
    eliminarGrupo(idGrupo){
      if(!confirm("¿Confirmar la eliminación del grupo? (Esta acción no se puede deshacer)"))return
      console.log(`Eliminando grupo ${idGrupo}`);
      this.$apollo.mutate({
        mutation:gql`
          mutation($idGrupo:ID!){
            eliminarGrupo(idGrupo: $idGrupo)
          }
        `,
        variables:{
          idGrupo
        },
        update: (store, {data:{eliminarGrupo}})=>{
          console.log(`Actualizando cache`);
          if(eliminarGrupo){
            let cache=store.readQuery({query: QUERY_GRUPOS});
            let nuevoCache=JSON.parse(JSON.stringify(cache));
            let indexP=nuevoCache.grupos.findIndex(p=>p.id==idGrupo);
            if(indexP>-1){
              nuevoCache.grupos.splice(indexP, 1);
              store.writeQuery({query: QUERY_GRUPOS, data: nuevoCache});
              console.log(`Caché actualizado`);
            }
            else{
              console.log(`No existía ese grupo en el cache`);
            }
            
          }
        }
      }).then(()=>{

      }).catch((error)=>{
        console.log(`Error. E:${error}`);
      })
    }
  },
  computed:{
    username:function(){
      return this.$store.state.usuario.username;
    },
    gruposOrdenadosSegunUsuario(){
      if(!this.usuario || !this.usuario.id)return this.grupos;

      return [...this.grupos].sort((a, b)=>{
        var resp=0;
        if(a.responsables.includes(this.usuario.id))resp--;
        if(b.responsables.includes(this.usuario.id))resp++;
        return resp;
      })
    }
  }

};
</script>

<style scoped>
.loading{
  margin: 20px auto;
}
#listaGrupos {
  display: flex;
  padding-left: 30px;
  padding-right: 30px;
  max-width: 100%;
  flex-flow: row wrap;
}

#controles {
  display: flex;
}
.controles {
  padding: 5px;
  cursor: pointer;
}
</style>