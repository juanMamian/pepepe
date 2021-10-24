<template>
  <div class="centroProyecto" :style="[estiloPosicion]">
      <div id="bola" :style="[sizeBola]">

      </div>
      <div id="nombre" :style="sizeNombre">{{esteProyecto.nombre}}</div>
  </div>
</template>

<script>
export default {
    name:"CentroProyecto",
    props:{
        factorZoom:Number,
        esteProyecto:Object,
        callingPosiciones:Boolean,
    },
    data(){
        return{
            baseSize:{
                x:50,
                y:50
            }
        }
    },
    computed:{
        sizeBola(){
            return {
                    width: (this.baseSize.x*this.factorZoom)+"px",
                    height:(this.baseSize.y*this.factorZoom)+"px"
                }
        },
        sizeNombre(){
            return {
                maxWidth: (120*this.factorZoom)+"px",
                fontSize:Math.round(14*this.factorZoom)+"px"
            }
        },
        estiloPosicion(){
            return {
                left: (this.esteProyecto.centroMasa.x-(this.baseSize.x/2))*this.factorZoom+"px",
                top: (this.esteProyecto.centroMasa.y-(this.baseSize.y/2))*this.factorZoom+"px",
            }
        }
    }
}
</script>

<style scoped>
.centroProyecto{
    position: absolute;
    z-index: 50;
}

#bola{
    border-radius: 50%;
    cursor: pointer;
}
.centroProyecto:not(.centroProyectoSeleccionado)>#bola{
    background-color: orange;
}
.centroProyectoSeleccionado>#bola{
    background-color: rgb(255, 115, 0);
}
.centroProyecto:not(.centroProyectoSeleccionado)>#bola:hover{
    background-color: rgb(230, 177, 125);
}
#nombre{
    position: absolute;
    top: 101%;
    left: 50%;
    border-radius: 10px;
    padding: 10px;
    transform: translateX(-50%);    
    background-color: rgba(218, 112, 214, 0.301);
}
</style>