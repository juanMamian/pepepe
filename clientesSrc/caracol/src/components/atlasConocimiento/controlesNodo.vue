<template>
    <div class="controlesNodo" :style="estiloPos" :class="{ desplegado }" @click="clickFuera">
        <div id="centerSignaler" v-show="elNodo">

        </div>
        <div id="zonaControlVerConexiones" @click.stop="mostrandoFlechasConexiones = true"
            v-show="elNodo">
            <div id="signaler" :style="[posSignaler]"></div>

            <div id="bloqueFlechasConexiones" v-show="mostrandoFlechasConexiones">

                <div class="boton botonConexiones" @click.stop="nivelesConexion--" :class="{deshabilitado:!nivelesConexionDeeper}">
                    <img src="@/assets/iconos/chevron.svg" alt="Arrow">
                </div>

                <div id="indicadorNiveles">{{ Math.abs(nivelesConexion) }}</div>
                <div class="boton botonConexiones" @click.stop="nivelesConexion++" style="transform: rotate(180deg);" :class="{deshabilitado:!nivelesConexionHigher}">
                    <img src="@/assets/iconos/chevron.svg" alt="Arrow">
                </div>
            </div>
        </div>

        <div id="nombre" ref="nombre" @click="toggleDespliege">
            {{ elNodo?.nombre || '' }}
        </div>

        <div id="zonaControles" @click="">

            <div class="bloqueControl" style="width: 100%; margin-bottom: 20px;" @click="" v-if="elNodo">
                <router-link :to="{ name: 'visorNodoConocimiento', params: { idNodo: elNodo.id } }">
                    <div class="boton botonControl">
                        <img src="@/assets/iconos/expandSolid.svg" alt="Repaso">
                    </div>
                </router-link>
            </div>

            <div class="bloqueControl">
                <div class="boton botonControl" @click="marcarEstudiado">
                    <loading v-show="settingDateEstudiado" />
                    <img src="@/assets/iconos/bookSolid.svg" v-show="!settingDateEstudiado" alt="Repaso">
                </div>
            </div>

            <div class="bloqueControl">
                <div class="boton botonControl" @click="mostrando = mostrando === 'tiempoRepaso' ? '' : 'tiempoRepaso'">
                    <img src="@/assets/iconos/stopwatchSolid.svg" alt="Repaso">
                </div>
            </div>
            <div class="bloqueControl">
                <div class="boton botonControl" @click="marcarEnLaMira">
                    <img src="@/assets/iconos/crosshairsSolid.svg" @click="$emit('setMeTarget')" alt="Repaso">
                </div>
            </div>
            <div class="bloqueControl">
                <div class="boton botonControl" @click="mostrando = mostrando === 'enlaces' ? null : 'enlaces'">
                    <img src="@/assets/iconos/codeBranch.svg" alt="Repaso">
                </div>
            </div>
        </div>

        <div id="zonaMostrada" v-show="mostrando">



        </div>

        <teleport to='body'>
            <div class="bloqueConfiguracion bloqueSplash" id="configuracionTiempoRepaso"
                v-show="mostrando === 'tiempoRepaso'">
                <div class="boton" id="botonCerrar" @click="mostrando = ''">
                    <img src="@/assets/iconos/equis.svg" alt="Cerrar">
                </div>
                <h3 class="tituloSplash">
                    <img src="@/assets/iconos/stopwatchSolid.svg" alt="Crono">
                    Periodo de repaso
                </h3>

                <input type="number" ref="inputDiasRepaso" id="inputDiasRepaso" min="0" max="180" v-model="diasRepaso" />

                <div class="descripcionSplash">
                    Selecciona la cantidad de días entre repasos para el nodo {{ elNodo?.nombre || '' }}.
                </div>

                <div class="botonTexto" @click="setPeriodoRepaso" :class="{ deshabilitado: guardandoPeriodoRepaso }">
                    Aceptar
                </div>

                <loading v-show="guardandoPeriodoRepaso" />
            </div>
        </teleport>
    </div>
</template>
<script lang="js">
import { gql } from '@apollo/client/core';
import { QUERY_DATOS_USUARIO_NODOS } from './AtlasConocimiento.vue';
import { fragmentoDatoNodoConocimiento } from './fragsAtlasConocimiento';
import Loading from '../utilidades/Loading.vue';

export default {
    props: {
        elNodo: {
            type: Object,
        },
        nivelesConexionDeeper: {
            type: Boolean,
            default: false,
        },
        nivelesConexionHigher: {
            type: Boolean,
            default: false,
        },
    },
    components: {
        Loading,
    },
    name: "ControlesNodo",
    data() {
        return {
            mostrandoFlechasConexiones: false,
            desplegado: false,
            mostrando: "",
            montado: false,
            heightNombre: 0,
            heigthAll: 0,
            settingDateEstudiado: false,

            diasRepaso: 0,
            guardandoPeriodoRepaso: false,

            nivelesConexion: 0,
        };
    },
    computed: {
        estiloPos() {
            let translation = 0;
            if (this.elNodo) {
                translation = this.heightNombre;
            }
            if (this.desplegado) {
                translation = this.heigthAll;
            }
            let estilo = {
                transform: `translate(-50%, -${translation}px)`,
            };
            return estilo;
        },
        posSignaler() {


            let step = 0;
            if (this.nivelesConexion != 0) {
                step = 30;
            }

            if (this.nivelesConexion < 0) {
                step = -step;
            }

            return {
                transform: `translateX(calc(-50% + ${step}px))`,
            }
        }
    },
    methods: {
        toggleDespliege(){
            if(!this.mostrandoFlechasConexiones){
                this.desplegado = !this.desplegado;
            }
        },  
        clickFuera() {
            console.log("click fuera");
            this.mostrandoFlechasConexiones = false;
        },
        marcarEstudiado() {
            this.settingDateEstudiado = true;
            this.$apollo.mutate({
                mutation: gql`
                    mutation( $idUsuario: ID!, $idNodo: ID!, $fecha: Date!){
                        setDateNodoConocimientoEstudiadoUsuario(idUsuario: $idUsuario, idNodo: $idNodo, fecha: $fecha){
                            ...fragDatoNodoConocimiento
                        }
                    }
                    ${fragmentoDatoNodoConocimiento}
                    `,
                variables: {
                    idUsuario: this.usuario.id,
                    idNodo: this.elNodo.id,
                    fecha: new Date(),
                }
            }).then(({ data: { setDateNodoConocimientoEstudiadoUsuario } }) => {
                this.settingDateEstudiado = false;
                console.log(`Completado. Recibido; ${JSON.stringify(setDateNodoConocimientoEstudiadoUsuario)}`);

                //Add to cache if not already there
                let store = this.$apollo.provider.defaultClient;
                let cache = store.readQuery({
                    query: QUERY_DATOS_USUARIO_NODOS,
                    variables: {
                        idUsuario: this.usuario.id,
                    }
                });

                let indexDN = cache.yo.atlas.datosNodos.indexOf(dn => dn.idNodo === this.elNodo.id);

                if (indexDN === -1) { // No habia datos sobre este nodo.
                    let nuevoCache = JSON.parse(JSON.stringify(cache));
                    nuevoCache.yo.atlas.datosNodos.push(setDateNodoConocimientoEstudiadoUsuario);

                    store.writeQuery({
                        query: QUERY_DATOS_USUARIO_NODOS,
                        variables: {
                            idUsuario: this.usuario.id,
                        },
                        data: nuevoCache
                    });
                }

            }).catch((error) => {
                console.log("Error: " + error);
                this.settingDateEstudiado = false;
            });
        },
        setPeriodoRepaso() {
            if (!this.elNodo) {
                return;
            }
            this.diasRepaso = this.$refs.inputDiasRepaso.value;

            let nuevoPeriodoRepaso = parseInt(this.diasRepaso * 86400000);

            //1 day minimum
            if (nuevoPeriodoRepaso < 86400000) {
                return
            }

            this.guardandoPeriodoRepaso = true;
            this.$apollo.mutate({
                mutation: gql`
                    mutation($idNodo: ID!, $nuevoPeriodoRepaso: Float!){
                        setPeriodoRepasoNodoConocimientoUsuario(idNodo: $idNodo, nuevoPeriodoRepaso: $nuevoPeriodoRepaso){
                             ...fragDatoNodoConocimiento
                        }
                    }
                    ${fragmentoDatoNodoConocimiento}
                    `,
                variables: {
                    idNodo: this.elNodo.id,
                    nuevoPeriodoRepaso,
                }
            }).then(() => {
                this.guardandoPeriodoRepaso = false;
                this.mostrando = '';

            }).catch((error) => {
                console.log('Error: ' + error);
                this.guardandoPeriodoRepaso = false;
            })
        }
    },
    watch: {
        elNodo(nodo) {
            this.mostrandoFlechasConexiones = false;
            if (!nodo) {
                this.nivelesConexion = 0;
            }
            if (nodo) {
                this.$nextTick(() => {
                    this.heightNombre = this.$refs.nombre.clientHeight;
                    this.heigthAll = this.$el.clientHeight;
                });
            }
            else {
                this.mostrando = '';
                this.heightNombre = 0;
                this.heigthAll = 0;
            }
        },
        nivelesConexion: {
            handler(niveles) {
                this.$emit('nivelesConexion', niveles)
            },
            immediate: true
        }
    },
    mounted() {
        this.montado = true;
        this.desplegado = false;
    },
}
</script>
<style lang="css" scoped>
.controlesNodo {
    position: fixed;
    border-radius: 10px;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    background-color: var(--atlasConocimientoSeleccion);
    display: flex;
    flex-direction: column;
    gap: 10px;
    transition: transform 0.2s, bottom 0.2s;
    transition-timing-function: ease-in-out;
    width: min(400px, 90%);
}

#botonCerrar {
    position: absolute;
    top: 0;
    right: 0;
    transform: translate(50%, -50%);
    background-color: inherit;
    border: inherit;

    width: 35px;
    height: 35px;
}

#botonCerrar img {
    opacity: 0.8;
}

#nombre {
    color: #ffffff;
    padding: 15px;
    font-size: 20px;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
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


#inputDiasRepaso {
    padding: 5px 5px;
    font-size: 22px;
    text-align: center;
    width: 130px;
    border: none;
}

#inputDiasRepaso:focus-visible {
    outline: none;
}



/* #region controlConexiones */

#centerSignaler{
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 10px solid transparent;
    border-bottom: 10px solid var(--atlasConocimientoSeleccion);
    width: 1px;
    height: 1px;
    cursor: pointer;
    pointer-events: none;
    z-index: 1;
}
#zonaControlVerConexiones {
    display: flex;
    position: absolute;
    top: 0px;
    left: 50%;
    transform: translateX(-50%);
    align-items: center;
    justify-content: center;
    gap: 30px;
    z-index: 0;
}

#signaler {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 10px solid transparent;
    border-bottom: 10px solid gray;
    width: 1px;
    height: 1px;
    cursor: pointer;

}

#bloqueFlechasConexiones {
    position: absolute;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);

    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;

}

#indicadorNiveles {
    padding: 5px 5px;
    background-color: var(--atlasConocimientoBaseNodo);
    font-size: 0.9em;
    min-width: 50px;
    text-align: center;
    border: 1px solid var(--paletaMain);
}


.botonConexiones {
    height: 40px;
    width: 40px;
}

/* #endregion */
</style>