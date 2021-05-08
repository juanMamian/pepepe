<template>
  <div id="panelObjetivos">
    <icono-nodo-conocimiento
      v-for="nodoObjetivo of nodosObjetivo"
      :key="nodoObjetivo.id"
      :esteNodo="nodoObjetivo"
      :esTarget="idNodoTarget==nodoObjetivo.id"
      @contextmenu.native.prevent="setNodoTarget(nodoObjetivo.id)"
      @click.native="$emit('nodoSeleccionado', nodoObjetivo.id)"      
    />
  </div>
</template>

<script>
import gql from 'graphql-tag';
import IconoNodoConocimiento from "./IconoNodoConocimiento.vue";
export default {
  components: { IconoNodoConocimiento },
  name: "PanelObjetivos",
  data() {
    return {
        idNodoMenuCx:null,
    };
  },
  props: {
    nodosObjetivo: Array,
    idNodoTarget:String,
  },
  methods:{
      setNodoTarget(idNodo){
          if(this.idNodoTarget==idNodo){
              this.$emit("nulificarNodoTarget");
              return;
          }

          this.$apollo.mutate({
              mutation: gql`
                mutation($idNodo:ID!){
                    setNodoAtlasTarget(idNodo:$idNodo)
                }
              `,
              variables:{
                  idNodo
              }
          }).then(({data:{setNodoAtlasTarget}})=>{
              if(setNodoAtlasTarget){
                  this.$emit("targetSeleccionado", idNodo);
              }
          })
      }
  }
};
</script>

<style scoped>
#panelObjetivos {
  border-radius: 25px;
  box-shadow: 2px 2px 2px 2px rgb(190, 190, 190);
  background-color: rgba(128, 128, 128, 0.425);
  padding: 10px;
  max-width: 80%;
}
.iconoNodoConocimiento{
    display: inline-block;
    margin: 0px 20px;
}
</style>