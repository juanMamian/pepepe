<template>
    <div class="bloqueSubscripcion">
        <div class="barraSuperior">
            <div id="valorPagado">
                {{ esteBloque.valorPagado }}
            </div>
            {{ toReadableDate(esteBloque.dateInicio) }} - {{ toReadableDate(dateFinal) }}
            <div class="boton" style="margin-left: auto; height: 20px" @click.stop="eliminarse">
                <img src="@/assets/iconos/equis.svg" alt="X">
            </div>
        </div>
    </div>
</template>
<script>

const millisDia = 86400000;

export default {

    name: "BloqueSubscripcion",
    props: {
        esteBloque: Object,
        seleccionado: Boolean,
    },
    data() {
        return {
        }
    },
    computed: {
        dateFinal() {
            return new Date(new Date(this.esteBloque.dateInicio).getTime() + this.esteBloque.duracion * millisDia * 30);
        }
    },
    methods:{
        eliminarse(){
            if(!confirm("¿Confirmar la eliminación del bloque de subscripción? (Esta acción no puede deshacerse)")){
                return
            }
            
        },
        
    },


}
</script>

<style scoped>
.bloqueSubscripcion {
    display: flex;
    padding: 10px 10px;
    margin: 0px 0px;
    box-shadow: 2px 2px 2px 2px gray;
}

.barraSuperior {
    width: 100%;
    display: flex;
    gap: 10px;
}
</style>
