<template>
    <div class="promptSubscripcion">
        <img src="@/assets/iconos/exclamationCircle.svg" alt="Alert" id="imagenAlerta">
        <div id="anuncio">
            Tu subscripción no está activa
        </div>

    </div>
</template>

<script>
    export default {
        data(){
            return {
            }
        },
    }
</script>

<style scoped>
.promptSubscripcion{
    display: flex;
    flex-direction: column;
    gap: 30px;
    justify-content: center;
    align-items: center;
}
            #imagenAlerta{
                height: 50px;
            }
</style>
