<template>
  <div class="claseNodo">
      <div id="filaPrincipal" :class="{interesado: usuarioInteresado}">
        <div id="nombre">
            {{estaClase.nombre}}
        </div>
        <div id="controles">
            <img src="@/assets/iconos/schedule.png" alt="Programar" :title="programandoClase?'Cancelar': 'Programar clase'" v-show="usuarioExpertoClase" id="botonProgramar" @click.stop="programandoClase=!programandoClase">
            <img @click.stop="toggleInteresarse" :title="usuarioInteresado?'Ya no me interesa':'Me interesa'" :class="{deshabilitado: enviandoQueryInteres, interesado: usuarioInteresado}" src="@/assets/iconos/raiseHand.png" class="control" id="botonInteresarse" v-show="!usuarioExpertoClase" style="width:30px"/>
            <div id="botonEliminar" @click="eliminarse" class="botonEquis" v-show="usuarioExpertoClase"><div class="linea1"></div><div class="linea2"></div></div>
        </div>
      </div>
      <calendario v-show="programandoClase" :configCalendario="{tipo: 'claseNodoConocimiento', id: estaClase.id , idNodo: idNodo, laClase: estaClase}"/>
  </div>
</template>

<script>
import gql from 'graphql-tag'
import Calendario from '../utilidades/Calendario.vue'
export default {
  components: { Calendario },
    name: "ClaseNodo",
    props:{
        estaClase:Object,
        idNodo:String,
        usuarioExperto:Boolean
    },
    data(){
        return {
            enviandoQueryInteres:false,
            programandoClase:false,
        }
    },
    methods:{
        eliminarse(){
            if(!confirm("¿Confirmar la eliminación de esta clase? (Esta acción no puede deshacerse)"))return

            this.$apollo.mutate({
                mutation: gql`
                    mutation($idNodo: ID!, $idClase: ID!){
                        eliminarClaseNodoConocimiento(idNodo: $idNodo, idClase: $idClase)
                    }
                `,
                variables:{
                    idNodo: this.idNodo,
                    idClase: this.estaClase.id,
                }
            }).then(({data:{eliminarClaseNodoConocimiento}})=>{
                if(eliminarClaseNodoConocimiento){
                    this.$emit("meElimine");
                }
            }).catch((error)=>{
                console.log(`Error: ${error}`);
            })
        },
        toggleInteresarse(){
            if(this.usuarioInteresado){
                this.desinteresarse();
            }
            else{
                this.interesarse();
            }
        },
        interesarse(){
            if(!this.usuario || !this.usuario.id)return
            console.log(`Interesandose`);
            this.enviandoQueryInteres=true;
            this.$apollo.mutate({
                mutation: gql`
                    mutation($idNodo: ID!, $idClase: ID!, $idUsuario:ID!){
                        addUsuarioInteresadosClaseNodoConocimiento(idNodo: $idNodo, idClase: $idClase, idUsuario: $idUsuario){
                            id
                            interesados
                        }
                    }
                `,
                variables:{
                    idNodo:this.idNodo,
                    idClase:this.estaClase.id,
                    idUsuario:this.usuario.id,
                }
            }).then(()=>{
                this.enviandoQueryInteres=false;
            }).catch((error)=>{
                console.log(`Error: ${error}`);
                this.enviandoQueryInteres=false;
            })
        },
        desinteresarse(){
            if(!this.usuario || !this.usuario.id)return

            this.enviandoQueryInteres=true;
            this.$apollo.mutate({
                mutation: gql`
                    mutation($idNodo: ID!, $idClase: ID!, $idUsuario:ID!){
                        eliminarUsuarioInteresadosClaseNodoConocimiento(idNodo: $idNodo, idClase: $idClase, idUsuario: $idUsuario){
                            id
                            interesados
                     }
                    }
                `,
                variables:{
                    idNodo:this.idNodo,
                    idClase:this.estaClase.id,
                    idUsuario:this.usuario.id,
                }
            }).then(()=>{
                this.enviandoQueryInteres=false;
            }).catch((error)=>{
                console.log(`Error: ${error}`);
                this.enviandoQueryInteres=false;
            })
        },        
    },
    computed:{
        usuarioInteresado(){
            if(!this.usuario || !this.usuario.id)return false

            return this.estaClase.interesados.includes(this.usuario.id)
        },
        usuarioExpertoClase(){
            if(!this.usuario || !this.usuario.id)return false

            return this.estaClase.idExperto===this.usuario.id;
        },
        
    }
}
</script>

<style scoped>
    .claseNodo{
        
    }
    #filaPrincipal{
        display: flex;
        background-color:rgba(255, 99, 71, 0.363);
    }
    #filaPrincipal.interesado{
        background-color: tomato;
    }
    #controles{
        margin-left: auto;
        margin-right: 15px;
        display: flex;
    }
    #botonInteresarse{
        cursor: pointer;
        border-radius: 50%;
    }
    #botonInteresarse.interesado{
        background-color: cadetblue;
    }
    #botonInteresarse:not(.interesado):hover{
        background-color: cadetblue;
        cursor: pointer;
    }
    
    #botonEliminar{
        position: relative;
        cursor: pointer;
        align-self: center;

    }
    #botonProgramar{
        width: 30px;
        border-radius: 50%;
        cursor: pointer;
        margin-right: 10px;
    }
    #botonProgramar:hover{
        background-color:cadetblue;
        
    }
</style>