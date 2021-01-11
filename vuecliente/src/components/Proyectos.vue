<template>
  <div id="proyectos">
    <center><h3>Proyectos</h3></center>
    <div id="controles">
      <div v-if="username" id="crearProyecto" class="controles hoverGris" @click="crearNuevoProyecto">
        Crear nuevo proyecto
      </div>
    </div>
    <div id="listaProyectos">
      <icono-proyecto
        v-for="proyecto of proyectos"
        :key="proyecto.id"
        :esteProyecto="proyecto"
        @cambioDeNombre="cambiarNombreProyecto"
      />
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import IconoProyecto from "./proyectos/IconoProyecto.vue";

export default {
  components: { IconoProyecto },
  name: "Proyectos",
  apollo: {
    proyectos: {
      query: gql`
        query {
          proyectos {
            id
            nombre
            responsables {
              id
              username
            }
          }
        }
      `,
      update:function({proyectos}){
        return proyectos.sort((a, b)=>{
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
      proyectos: [],
    };
  },
  methods:{
    cambiarNombreProyecto({idProyecto, nuevoNombre}){
      console.log(`cambiando nombre de un proyecto a ${nuevoNombre}`);
        this.$apollo
        .mutate({
          mutation: gql`
            mutation($idProyecto: ID!, $nuevoNombre: String!) {
              editarNombreProyecto(idProyecto: $idProyecto, nuevoNombre: $nuevoNombre){
                  id
                  nombre
              }                               
            }
          `,
          variables: {
            idProyecto,
            nuevoNombre,
          },
        })
        .then((data) => {
          console.log(`fin de la mutacion. Data: ${JSON.stringify(data)} `);
        })
        .catch((error) => {
          console.log(`error: ${error}`);
        });
    },
    crearNuevoProyecto(){
      this.$apollo.mutate({
        mutation: gql`
          mutation{
            crearProyecto{
              id
              nombre
              responsables{
                username
              }
            }
          }
        `,
      }).then(()=>{

      }).catch(()=>{

      });
    }
  },
  computed:{
    username:function(){
      return this.$store.state.usuario.username;
    }
  }

};
</script>

<style scoped>
#listaProyectos {
  display: flex;
  padding-left: 30px;
  padding-right: 30px;
}

#controles {
  display: flex;
}
.controles {
  padding: 5px;
  cursor: pointer;
}
</style>