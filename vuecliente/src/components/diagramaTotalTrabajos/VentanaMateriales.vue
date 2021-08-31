<template>
  <div id="ventanaMateriales" :style="[offsetVentana]" v-if="usuarioEncargadoMateriales">
      <img src="@/assets/iconos/material.png" title="Todos los materiales" alt="materiales" id="iconoMateriales" width="50" @click.stop="ventanaActiva=!ventanaActiva">
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

const QUERY_NODO_ENCARGADO_MATERIALES=gql`
    query($idTrabajo:ID!){
        trabajo(idTrabajo:$idTrabajo){
            id
            responsables
        }
    },    
`

export default {
  components: { InfoMaterial },
    name: "VentanaMateriales",
    apollo:{
        todosMateriales:{
            query:QUERY_MATERIALES,            
        },
        responsablesNodoMateriales:{
            query:QUERY_NODO_ENCARGADO_MATERIALES,
            variables:{
                idTrabajo:"6126761024a4610004557f65"
            },
            update(data){
                return data.trabajo.responsables;
            }
        }
    },
    props:{
        cerrarVentana:Number,
    },
    data(){
        return {
            todosMateriales:[],
            ventanaActiva:false,
            responsablesNodoMateriales:[],
        }
    },
    computed:{
        offsetVentana(){
            if(this.ventanaActiva){
                return {
                    left: "1%"
                }
            }
            return {
                right: "100%"
            }
        },
        usuarioEncargadoMateriales(){
            return this.responsablesNodoMateriales.includes(this.usuario.id)
        }
    },
    watch:{
        cerrarVentana(){
            this.ventanaActiva=false;
        }
    }
}
</script>

<style scoped>
#ventanaMateriales{
    position:absolute;
    top: 10%;    
    z-index: 50;
    width: min(90%, 400px);
    max-height: 70%;
    
}
#iconoMateriales{
    position: absolute;
    top: 5px;
    left: 100%;
    cursor: pointer;
    user-select: none;    
    background-color: rgba(210, 105, 30, 0.397);
    border-radius: 50%;
}
#iconoMateriales:hover{
    background-color: rgb(210, 105, 30);
}


</style>