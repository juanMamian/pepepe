<template>
  <div class="buscadorPersonas">
      <div id="barraSuperior">
          <input type="text" name="" id="inputBuscar" ref="inputBuscar" @keypress.enter="buscar" v-model="textoBuscar" v-show="mostrandoInput">
          <img src="@/assets/iconos/search.svg" style="height: 15px" alt="Lupa" @click="mostrandoInput=true" v-show="!mostrandoInput">
          <img src="@/assets/iconos/equis.svg" style="height: 15px" alt="Equis" @click="cerrarBusqueda" v-show="mostrandoInput">
        <loading texto="" v-show="buscando" />

      </div>
      <div id="zonaResultados" v-show="resultados.length>0">
          <div class="personaResultado" v-for="resultado of resultados" :key="resultado.id" @click="$emit('clickEnResultado', resultado.id)">
              <div class="nombreResultado">
                  {{resultado.nombres+' '}}
              </div>
              <div class="apellidoResultado">
                  {{resultado.apellidos}}
              </div>
          </div>
          <div class="contenedorControles">
              <slot>
              </slot>
          </div>
      </div>
  </div>
</template>

<script>
import { gql } from "@apollo/client/core"
import Loading from '../utilidades/Loading.vue';
export default {
  components: { Loading },
    name: "BuscadorPersonas",
    data(){
        return {
            buscando:false,
            mostrandoInput:false,
            textoBuscar:null,
            resultados:[],
        }
    },
    methods:{
        cerrarBusqueda(){
            this.textoBuscar=null;
            this.mostrandoInput=false;
            this.buscando=false;
            this.resultados=[];
        },
        clickEnLupa(){
            if(this.mostrandoInput){
                this.buscar();
                return;
            }
            this.mostrandoInput=true;
        },
        buscar(){
            var textoBuscar=this.$refs.inputBuscar.value;
            textoBuscar=textoBuscar.trim();
            this.buscando=true;
            this.$apollo.query({
                query: gql`
                    query($textoBuscar:String!){
                        buscarPersonas(textoBuscar:$textoBuscar){
                            id
                            nombres
                            apellidos
                            permisos
                        }
                    }
                `,
                variables:{
                    textoBuscar,
                }
            }).then(({data:{buscarPersonas}})=>{
                this.buscando=false;
                this.resultados=buscarPersonas
            }).catch((error)=>{
                this.buscando=false;
                console.log(`Error: ${error}`);
            })
        }
    }
}
</script>

<style scoped>
#barraSuperior{
    display: flex;
    align-items: center;
}
#inputBuscar{
    width: 160px;
    margin-right: 10px;
}
.personaResultado{
    display: flex;
    padding: 15px;
    cursor: pointer;
    align-items: center;
    font-size: 12px;
}

</style>