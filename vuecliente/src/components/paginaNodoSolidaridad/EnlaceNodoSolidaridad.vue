<template>
  <div class="enlaceNodoSolidaridad" :class="{deshabilitado: enviandoQueryGlobal}">
    <div id="lineaPrincipal">
      <img src="@/assets/iconos/abrirLink.png" alt="Abrir" title="Abrir enlace" id="botonAbrirEnlace">
      <img src="@/assets/iconos/descripcion.png" alt="Descripcion" :title="mostrarDescripcion?'Ocultar descripción':'MostrarDescripción'" id="botonMostrarDescripcion">

      <div id="nombre">
        {{ esteEnlace.nombre }}
      </div>

      <img src="@/assets/iconos/editar.png" alt="Editar" title="Editar enlace" id="botonEditar" @click="editando=!editando">
      <img src="@/assets/iconos/delete.png" alt="Eliminar" title="Eliminar enlace" id="botonEliminar" @click="eliminarse">
      
    </div>

    <div id="descripcion" v-show="mostrarDescripcion">
      {{esteEnlace.descripcion}}
    </div>
  </div>
</template>

<script>
import gql from 'graphql-tag';
export default {
  name: "EnlaceNodoSolidaridad",
  props: {
    esteEnlace: Object,
    idNodo: String,
    tipoNodo:String,
  },
  data() {
    return {
      editando:false,
      mostrarDescripcion:false,
      enviandoQueryGlobal:false,

    };
  },

  methods:{
    eliminarse(){
      if(!confirm("¿Eliminar enlace? (Esta operación no puede deshacerese"))return;

      this.enviandoQueryGlobal=true;
      this.$apollo.mutate({
        mutation: gql`
          mutation($idNodo:ID!, $idEnlace:ID!, $tipoNodo: String!){
            eliminarEnlaceNodoSolidaridad(idNodo: $idNodo, idEnlace: $idEnlace, tipoNodo: $tipoNodo)
          }
        `,
        variables:{
          idNodo: this.idNodo,
          idEnlace: this.esteEnlace.id,
          tipoNodo: this.tipoNodo
        }
      }).then(({data:{eliminarEnlaceNodoSolidaridad}})=>{
        if(eliminarEnlaceNodoSolidaridad){
          this.$emit("meElimine");
        }
        this.enviandoQueryGlobal=false;
        
      }).catch((error)=>{
        console.log(`Error: ${error}`);
        this.enviandoQueryGlobal=false;
      })
    }
  }
};
</script>

<style scoped>
.enlaceNodoSolidaridad {
  
}
#lineaPrincipal{
  display: flex;
}
#botonEditar{
  width: 25px;
  height: 25px;
  border-radius: 50%;
  cursor: pointer;
  margin-left: auto;
}
#botonEditar:hover{
  background-color: rgb(238, 108, 68);
}
#botonAbrirEnlace{
  width: 25px;
  height: 25px;
  border-radius: 50%;
  cursor: pointer;
}
#botonMostrarDescripcion{
  width: 25px;
  height: 25px;
  border-radius: 50%;
  cursor: pointer;
}
#botonEliminar{
  width: 25px;
  height: 25px;
  border-radius: 50%;
  cursor: pointer;
}
#botonEliminar:hover{
  background-color: rgb(233, 61, 61);
}
</style>