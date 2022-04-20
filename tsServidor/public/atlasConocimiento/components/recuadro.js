const recuadroComponent={
    
    props:{
        tipo:String,        
    },
    computed:{
        datoPrevio(){
            return this.tipo==='datoPrevio'
        },
        datoNuevo(){
            return this.tipo==='datoNuevo'
        },
        descubrimiento(){
            return this.tipo==='descubrimiento'
        },
        instruccionPointer(){
            return this.tipo==='instruccionPointer'
        },
        instruccionTeclado(){
            return this.tipo==='instruccionTeclado'
        },
        srcIcono(){
            if(this.descubrimiento){
                return "http://192.168.3.101:3000/public/resources/nodosConocimiento/iconos/circle-exclamation-solid.svg";
            }
            else if(this.instruccionPointer){
                return "http://192.168.3.101:3000/public/resources/nodosConocimiento/iconos/handPointer.svg";
            }
            else if(this.instruccionTeclado){
                return "http://192.168.3.101:3000/public/resources/nodosConocimiento/iconos/iconoInstruccionTeclado.svg";
            }
            return "http://192.168.3.101:3000/public/resources/nodosConocimiento/iconos/bombillo.png";

        }
    },
    template:'<div class="recuadro" :class="{datoPrevio, datoNuevo, descubrimiento, instruccionPointer, instruccionTeclado}"> <img class="iconoRecuadro" :src="srcIcono" /> <div class="textoRecuadro"> <slot></slot> </div> </div>',    
}