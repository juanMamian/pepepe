<template>
  <div class="nodoConocimientoVistaArbol nodoConocimientoConBola" :class="[{seleccionado, accesible }, datosUsuarioEsteNodo]"> 
    <div class="boton" id="botonRastrear" v-show="seleccionado || targeted">
      <img
        src="@/assets/iconos/crosshairsSolid.svg"
        alt="Rastrear"
        :style="[
          {
            filter: targeted ? 'var(--filtroAtlasSeleccion)' : 'none',
          },
        ]"
        @click.stop="$emit('toggleMeTargetted')"
      />
    </div>

    <div class="bolita">
      <img
        v-if="elNodo.tipoNodo === 'concepto'"
        src="@/assets/iconos/atlas/lightbulbEmpty.svg"
        alt="Skill"
      />
      <img v-else src="@/assets/iconos/atlas/fireSolid.svg" alt="Skill" />
    </div>

    <div class="cajaTexto">
      {{ elNodo.nombre }}

      <div class="boton" v-show="seleccionado" id="botonAbrir">
        <img
          src="@/assets/iconos/expandSolid.svg"
          alt="Abrir"
          @click.stop="
            $router.push({
              name: 'visorNodoConocimiento',
              params: { idNodo: elNodo.id },
            })
          "
        />
      </div>
    </div>
  </div>
</template>
<script lang="js">
import {gql} from "@apollo/client/core"

const QUERY_NODO = gql`
    query($idNodo:ID!){
        nodo(idNodo:$idNodo){
            id
            nombre
            vinculos{
                id
                tipo
                rol
                idRef
                nodoContraparte{
                    id
                }
            }
        }
    }

`


export default {

    name: "NodoConocimientoVistaArbol",
    props:{
        idNodo:{
            type:String,
            required:true,
        },
        seleccionado:{
            type:Boolean,
            default:false,
        },
        targeted:{
            type:Boolean,
            default:false,
        },
        yo:{
            type: Object,
            required: true
        },
    },
    apollo:{
        elNodo:{
            query: QUERY_NODO,
            variables(){
                return {
                    idNodo:this.idNodo
                }
            },
            update({nodo}){
                return nodo
            },
            skip(){
                return !this.idNodo
            },
            fetchPolicy:"cacheFirst",

        }

    },
    data(){
        return {
            elNodo:{
                vinculos:[]
            }
        }
    },
    computed:{
        idsNodosVerdes(){
            if(!this.yo?.atlas?.datosNodos){
                return [];
            }
            return this.yo.atlas.datosNodos.filter(dn=>dn.estadoAprendizaje==='ESTUDIADO' || dn.estadoAprendizaje==='APRENDIDO').map(dn=>dn.idNodo);
        },
        accesible(){
            return !this.elNodo.vinculos.some(v=>v.tipo==='continuacion' && v.rol==='target' && !this.idsNodosVerdes.includes(v.idRef));
        },
        datosUsuarioEsteNodo(){
            if(!this.yo.atlas.datosNodos){
                return null
            }
            return this.yo.atlas.datosNodos.find(dn=>dn.idNodo===this.idNodo);
        },
    }
}
</script>
<style scoped lang="css">
@import url("@/assets/estilos/nodoConocimientoBola.css");

.nodoConocimientoVistaArbol{
    position: relative;
}
</style>
