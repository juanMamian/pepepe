<template>
    <div class="controlesNodo" :class="{ desplegado }" v-if="elNodo">
        <div id="nombre" @click.stop="desplegado = !desplegado">
            {{ elNodo.nombre }}
        </div>

        <div id="zonaControles" @click.stop="">

            <div class="bloqueControl" style="width: 100%; margin-bottom: 20px;">
                <div class="boton botonControl">
                    <img src="@/assets/iconos/expandSolid.svg" alt="Repaso">
                </div>
            </div>
            

            <div class="bloqueControl">
                <div class="boton botonControl" @click="mostrando=mostrando==='tiempoRepaso'?'':'tiempoRepaso'">
                    <img src="@/assets/iconos/stopwatchSolid.svg" alt="Repaso">
                </div>
            </div>
            <div class="bloqueControl">
                <div class="boton botonControl">
                    <img src="@/assets/iconos/bookSolid.svg" alt="Repaso">
                </div>
            </div>
            <div class="bloqueControl">
                <div class="boton botonControl">
                    <img src="@/assets/iconos/crosshairsSolid.svg" @click="$emit('setMeTarget')" alt="Repaso">
                </div>
            </div>
            <div class="bloqueControl">
                <div class="boton botonControl">
                    <img src="@/assets/iconos/codeBranch.svg" alt="Repaso">
                </div>
            </div>
        </div>

        <div id="zonaMostrada" v-show="mostrando">
            asd
        </div>
    </div>
</template>
<script>
export default {
    props: {
        elNodo: {
            type: Object,
        }
    },
    name: "ControlesNodo",
    data() {
        return {
            desplegado: false,
            mostrando:"",
        }
    }
}
</script>
<style lang="css" scoped>
.controlesNodo {
    position: fixed;
    bottom: 0px;
    border-radius: 10px;
    left: 50%;
    transform: translate(-50%, calc(100% - 40px));
    background-color: var(--atlasConocimientoSeleccion);
    display: flex;
    flex-direction: column;
    gap: 10px;
    transition: transform 0.2s, bottom 0.2s;
    transition-timing-function: ease-in-out;
    width: min(400px, 90%);
}

.controlesNodo.desplegado {
    transform: translate(-50%, 0px);
}

#nombre {
    color: #ffffff;
    height: 40px;
    padding: 10px;
    font-size: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 5px 10px;
    cursor: pointer;
}

#zonaControles {
    background-color: var(--atlasConocimientoBaseNodo);
    min-height: 100px;

    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 20px;

    padding: 20px 20px;

}
.bloqueControl {
    display: flex;
    justify-content: center;
    gap: 10px;
    align-items: center;
}
.botonControl {
    width: 40px;
    height: 40px;
}
</style>