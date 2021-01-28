<template>
  <div class="notificacion" @click="visitar">
      <div id="info">{{fechaFormateada}}</div>
      <img :src="this.serverUrl + '/api/usuarios/fotografias/' + estaNotificacion.causante.id" alt="" id="caritaCausante">
      <div id="texto" v-html="mensaje"></div>
  </div>
</template>

<script>
import gql from 'graphql-tag'
import { QUERY_YO } from '../../App.vue'
export default {
    name:"Notificacion",
    props:{
        estaNotificacion:{
            type:Object,
            default:function() {
                return {}
            }
        }
    },
    methods:{
        visitar(){
            var enlace="/"
            if(this.estaNotificacion.elementoTarget.tipo=="actividadEstudiantil"){
                enlace+="actividad/"+this.estaNotificacion.elementoTarget.id;
            }
            this.eliminarse();
            this.$router.push(enlace);
        },
        eliminarse(){            
            let idNotificacion=this.estaNotificacion.id;
            console.log(`Eliminandose: ${idNotificacion}`);
            this.$apollo.mutate({
                mutation: gql`
                    mutation($idNotificacion:ID!){
                        eliminarNotificacion(idNotificacion:$idNotificacion)
                    }
                `,
                variables:{
                    idNotificacion
                },
                update: (store, {data:{eliminarNotificacion}})=>{
                    if(eliminarNotificacion){
                        let cache=store.readQuery({query:QUERY_YO, variables:{idNotificacion}});
                        let indexN = cache.yo.notificaciones.findIndex(n=>n.id==idNotificacion);
                        if(indexN>-1){
                            cache.yo.notificaciones.splice(indexN, 1);
                        }
                        store.writeQuery({query:QUERY_YO,variables:{idNotificacion}, data:cache});
                    }
                }
            })
        }
    },
    computed:{
        mensaje:function(){
            var mensaje ="";
            if(this.estaNotificacion.elementoTarget.tipo=="actividadEstudiantil"){
                mensaje+="Tienes una nueva respuesta en la actividad <span style='color: white' class='textoTarget'>"+this.estaNotificacion.elementoTarget.nombre+"</span>";
            }
            return mensaje;
        },
        fechaFormateada:function(){
            let laFecha=new Date(this.estaNotificacion.fecha).toString();
            let indexParentesis=laFecha.indexOf("(");
            let fechaCorta=laFecha.substr(0, indexParentesis);
            let indexGMT=fechaCorta.indexOf("GMT");
            if(indexGMT>-1){
                fechaCorta=fechaCorta.substr(0, indexGMT);
            }
            return fechaCorta;
        }
    }
}
</script>

<style scoped>
.notificacion{
    width:300px;
    height: 130px;
    border: 1px solid rgb(238, 227, 219);
    background-color:rgb(243, 138, 58);
    display: grid;
    grid-template-columns: 100px 1fr;
    grid-template-rows:15px 1fr;
    grid-template-areas:
    "info info" 
    "imagen texto"
    ;
    align-items: center;
    justify-items: center;
    cursor: pointer;
}
.notificacion:hover{
    background-color:rgb(231, 168, 119);
}
#info{
    grid-area: info;    
    font-size: 11px;
    color: white;
}
#caritaCausante{
    grid-area: imagen;
    width:70px;
    height:70px;
    border-radius: 50%;
}
#texto{
    grid-area: texto;
}
.textoTarget{
    color: white;
}
</style>