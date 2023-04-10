<template>
  <div id="proyectos">
    <center><h3>Grupos</h3></center>
    <div id="controles" v-show="!loading">
      <div
        v-if="usuarioLogeado"
        id="crearProyecto"
        class="controles hoverGris"
        @click="crearNuevoProyecto"
      >
        Crear nuevo grupo
      </div>
      <div
        v-if="
          usuarioSuperadministrador &&
          proyectos.some((p) => p.id == idProyectoSeleccionado)
        "
        id="bEliminarProyecto"
        class="controles hoverGris"
        @click="eliminarProyecto(idProyectoSeleccionado)"
      >
        Eliminar grupo
      </div>
    </div>
    <div id="listaProyectos" @click.self="idProyectoSeleccionado=null">
      <loading texto="Cargando lista de grupos..." v-show="loading"/>
      <icono-proyecto
        v-for="proyecto of proyectosOrdenadosSegunUsuario"
        :key="proyecto.id"
        :esteProyecto="proyecto"
        :seleccionado="idProyectoSeleccionado == proyecto.id"
        @click.native="idProyectoSeleccionado = proyecto.id"
      />
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import IconoProyecto from "./proyectos/IconoProyecto.vue";
import Loading from './utilidades/Loading.vue';

const QUERY_PROYECTOS=gql`
query {
    proyectos {
      id
      nombre
      responsables
    }
  }
`;

export default {
  components: { IconoProyecto, Loading },
  name: "Proyectos",
  apollo: {
    proyectos: {
      query: QUERY_PROYECTOS,
      fetchPolicy: "cache-and-network",
      update:function({proyectos}){
        return proyectos.sort((a, b)=>{
          let res=0;
          if(a.responsables.some(r=>r.id==this.usuario.id)){
            res--;
          }
          if(b.responsables.some(r=>r.id==this.usuario.id)){
            res++;
          }
          this.loading=false;
          return res;
        })
      }
    },
  },
  data() {
    return {
      proyectos: [],
      idProyectoSeleccionado:null,
      loading:true,
    };
  },
  methods:{
    crearNuevoProyecto(){
      console.log(`Creando nuevo proyecto`);
      this.$apollo.mutate({
        mutation: gql`
          mutation{
            crearProyecto{
              id
              nombre
              responsables              
            }
          }
        `,
      }).then(({data:{crearProyecto}})=>{
        this.$router.push('/proyecto/'+crearProyecto.id);
      }).catch((error)=>{
        console.log(`Error: ${error.errors}`);
      });
    },
    eliminarProyecto(idProyecto){
      if(!confirm("¿Confirmar la eliminación del grupo? (Esta acción no se puede deshacer)"))return
      console.log(`Eliminando proyecto ${idProyecto}`);
      this.$apollo.mutate({
        mutation:gql`
          mutation($idProyecto:ID!){
            eliminarProyecto(idProyecto: $idProyecto)
          }
        `,
        variables:{
          idProyecto
        },
        update: (store, {data:{eliminarProyecto}})=>{
          console.log(`Actualizando cache`);
          if(eliminarProyecto){
            let cache=store.readQuery({query: QUERY_PROYECTOS});
            let nuevoCache=JSON.parse(JSON.stringify(cache));
            let indexP=nuevoCache.proyectos.findIndex(p=>p.id==idProyecto);
            if(indexP>-1){
              nuevoCache.proyectos.splice(indexP, 1);
              store.writeQuery({query: QUERY_PROYECTOS, data: nuevoCache});
              console.log(`Caché actualizado`);
            }
            else{
              console.log(`No existía ese proyecto en el cache`);
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
      return this.usuario.username;
    },
    proyectosOrdenadosSegunUsuario(){
      if(!this.usuario || !this.usuario.id)return this.proyectos;

      return [...this.proyectos].sort((a, b)=>{
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
#listaProyectos {
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