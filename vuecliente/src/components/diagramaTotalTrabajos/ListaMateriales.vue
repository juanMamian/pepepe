<template>
  <div id="listaMateriales">
    <info-material v-for="material of todosMateriales" :key="material.id" :esteMaterial="material" @centrarEnNodo="$emit('centrarEnNodo', $event)"/>      
  </div>
</template>

<script>
import gql from 'graphql-tag'
import InfoMaterial from './InfoMaterial.vue'

const QUERY_MATERIALES=gql`
    query{
        todosMateriales{
            id
            nombre
            descripcion
            cantidadNecesaria
            cantidadDisponible
            idTrabajoParent
        }
    }
`



export default {
  components: { InfoMaterial },
    name: "ListaMateriales",
    apollo:{
        todosMateriales:{
            query:QUERY_MATERIALES,            
        },
        
    },
    props:{
        cerrarVentana:Number,
    },
    data(){
        return {
            todosMateriales:[],            
        }
    },

   
}
</script>

<style scoped>
#listaMateriales{                
    max-height: 85%;  
    padding: 10px 0px;
    border-radius: 10px; 
    background-color: rgba(95, 158, 160, 0.788);
    border: 2px solid rgb(22, 88, 90); 
}


</style>