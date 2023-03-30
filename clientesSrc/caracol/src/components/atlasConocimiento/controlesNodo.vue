<template>
  <div
    class="controlesNodo"
    :style="estiloPos"
    :class="{ desplegado }"
    @click="clickFuera"
  >
    <div id="centerSignaler" v-show="elNodo"></div>
    <div
      id="zonaControlVerConexiones"
      @click.stop="mostrandoFlechasConexiones = true"
      v-show="elNodo"
    >
      <div id="signaler" :style="[posSignaler]"></div>

      <div id="bloqueFlechasConexiones" v-show="mostrandoFlechasConexiones">
        <div
          class="boton botonConexiones"
          @click.stop="nivelesConexion--"
          :class="{ deshabilitado: !nivelesConexionDeeper }"
        >
          <img src="@/assets/iconos/chevron.svg" alt="Arrow" />
        </div>

        <div id="indicadorNiveles">{{ Math.abs(nivelesConexion) }}</div>
        <div
          class="boton botonConexiones"
          @click.stop="nivelesConexion++"
          style="transform: rotate(180deg)"
          :class="{ deshabilitado: !nivelesConexionHigher }"
        >
          <img src="@/assets/iconos/chevron.svg" alt="Arrow" />
        </div>
      </div>
    </div>

    <div id="nombre" ref="nombre" @click="toggleDespliege">
      <img
        v-if="elNodo && elNodo.tipoNodo === 'concepto'"
        src="@/assets/iconos/atlas/lightbulbEmpty.svg"
        alt="Skill"
      />
      <img v-else src="@/assets/iconos/atlas/fireSolid.svg" alt="Skill" />
      {{ elNodo?.nombre || "" }}
    </div>

    <div id="zonaControles" @click="">
      <div class="filaControles" v-show="filaMostrada === 1">
        <div class="bloqueControl" style="">
          <div
            class="botonTexto selector botonControl"
            :class="{
              deshabilitado: nodoAprendido,
              checked: nodoFresco,
            }"
            @click="marcarEstudiado"
            @dblclick="marcarAprendido"
            style="
              align-self: normal;
              border-top-right-radius: 0px;
              border-bottom-right-radius: 0px;
              flex-grow: 1;
              flex-shrink: 1;
            "
          >
            <loading v-show="settingDateEstudiado" />

            <img
              src="@/assets/iconos/bookSolid.svg"
              v-show="!settingDateEstudiado"
              alt="Repaso"
            />

            Estudiado
          </div>
          <div
            class="botonTexto botonControl"
            style="
              align-self: normal;
              border-top-left-radius: 0px;
              border-bottom-left-radius: 0px;
            "
            v-show="
              datoUsuarioEsteNodo &&
              datoUsuarioEsteNodo.estudiado &&
              datoUsuarioEsteNodo.diasRepaso &&
              !nodoAprendido
            "
            @click.stop="
              mostrando = mostrando === 'tiempoRepaso' ? '' : 'tiempoRepaso'
            "
          >
            <pie-progreso
              :mostrarNumero="false"
              :color-progreso="'#3f7d20'"
              :color-fondo="'transparent'"
              :progreso="porcentajeRepaso"
              :size="40"
            >
              <img src="@/assets/iconos/stopwatchSolid.svg" alt="Repaso" />
            </pie-progreso>

            {{ datoUsuarioEsteNodo ? datoUsuarioEsteNodo.diasRepaso : "" }}
          </div>
          <div
            class="botonTexto selector botonControl"
            id="botonMarcarAprendido"
            :class="{ checked: nodoAprendido }"
            style="width: 100%"
            @click="marcarAprendido"
          >
            <loading v-show="settingEstadoAprendido" />
            <img
              src="@/assets/iconos/circlecheckSolid.svg"
              v-show="!settingEstadoAprendido"
              alt="Check"
            />

            {{ "Aprendido" }}
          </div>
        </div>
      </div>

      <div class="filaControles" v-show="filaMostrada === 2">
        <div
          class="bloqueControl"
          v-if="usuarioExperto || usuarioSuperadministrador"
        >
          <div
            class="boton botonControl"
            @click="mostrando = mostrando === 'enlaces' ? null : 'enlaces'"
          >
            <img src="@/assets/iconos/codeBranch.svg" alt="Repaso" />
          </div>
        </div>

        <div class="bloqueControl" v-if="usuarioSuperadministrador">
          <div class="boton botonControl" @click="eliminarNodo">
            <img src="@/assets/iconos/trash.svg" alt="Eliminar" />
          </div>
        </div>
      </div>

      <div id="zonaSelectorFilas">
        <div
          class="selectorFila boton selector"
          :class="{ activo: filaMostrada === index }"
          v-for="index of 2"
          :key="'selectorFila' + index"
          @click.stop="filaMostrada = index"
        >
        </div>
      </div>
    </div>

    <div id="zonaMostrada" v-show="mostrando"></div>

    <teleport to="body">
      <div
        class="bloqueConfiguracion bloqueSplash"
        id="configuracionTiempoRepaso"
        v-show="mostrando === 'tiempoRepaso'"
      >
        <div class="boton" id="botonCerrar" @click="mostrando = ''">
          <img src="@/assets/iconos/equis.svg" alt="Cerrar" />
        </div>
        <h3 class="tituloSplash">
          <img src="@/assets/iconos/stopwatchSolid.svg" alt="Crono" />
          Periodo de repaso
        </h3>

        <input
          type="number"
          ref="inputDiasRepaso"
          id="inputDiasRepaso"
          min="0"
          max="180"
          v-model="diasRepaso"
        />

        <div class="descripcionSplash">
          Selecciona la cantidad de días entre repasos para el nodo
          {{ elNodo?.nombre || "" }}.
        </div>

        <div
          class="botonTexto"
          @click="setDiasRepaso"
          :class="{ deshabilitado: guardandoDiasRepaso }"
        >
          Aceptar
        </div>

        <loading v-show="guardandoDiasRepaso" />
      </div>
    </teleport>
  </div>
</template>
<script lang="js">
import { gql } from '@apollo/client/core';
import { QUERY_DATOS_USUARIO_NODOS } from './fragsAtlasConocimiento';
import { fragmentoDatoNodoConocimiento } from './fragsAtlasConocimiento';
import Loading from '../utilidades/Loading.vue';
import PieProgreso from '../utilidades/PieProgreso.vue';

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
        yo: {
            type: Object,
            required: true,
        },
    },
    components: {
        Loading,
        PieProgreso,
    },
    name: "ControlesNodo",
    data() {
        return {
            mostrandoFlechasConexiones: false,
            desplegado: false,

            filaMostrada: 1,
            mostrando: "",

            montado: false,
            heightNombre: 0,
            heigthAll: 0,
            settingDateEstudiado: false,

            diasRepaso: 0,
            guardandoDiasRepaso: false,
            settingEstadoAprendido: false,

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
        },
        datoUsuarioEsteNodo() {
            if (!this.elNodo || !this.yo?.atlas?.datosNodos) {
                return null;
            }

            return this.yo.atlas.datosNodos.find(dato => dato.idNodo === this.elNodo.id);
        },
        nodoEstudiado(){
            if (!this.elNodo) {
                return false;
            }
            if (!this.datoUsuarioEsteNodo) {
                return false;
            }
            return this.datoUsuarioEsteNodo.estudiado;
        },
        nodoAprendido() {
            if (!this.elNodo) {
                return false;
            }
            if (!this.datoUsuarioEsteNodo) {
                return false;
            }
            return this.datoUsuarioEsteNodo.aprendido;
        },
        nodoFresco(){
            if (!this.elNodo) {
                return false;
            }
            if (!this.datoUsuarioEsteNodo?.estudiado || !this.datoUsuarioEsteNodo?.diasRepaso) {
                return false;
            }

            if(this.nodoAprendido){
                return true;
            }

            let tiempoLimite= (new Date(this.datoUsuarioEsteNodo.estudiado)).getTime() + (this.datoUsuarioEsteNodo.diasRepaso * 86400000);


            return Date.now()<tiempoLimite;
        },
        nodoRepasar(){
            return this.nodoEstudiado && !this.nodoFresco && !this.nodoAprendido;
        },

        porcentajeRepaso() {
            if (!this.datoUsuarioEsteNodo?.estudiado) {
                return null;
            }
            if (!this.datoUsuarioEsteNodo.diasRepaso) {
                return null;
            }

            if (this.nodoAprendido) {
                return null;
            }
            let tiempoTranscurrido = Date.now() - (new Date(this.datoUsuarioEsteNodo.estudiado)).getTime();

            //To day
            let porcentajeTranscurrido = tiempoTranscurrido / ((this.datoUsuarioEsteNodo.diasRepaso * 86400000) / 100);
            if (porcentajeTranscurrido > 100) {
                porcentajeTranscurrido = 100;
            }
            if (porcentajeTranscurrido < 0) {

                porcentajeTranscurrido = 0;
            }

            return 100 - porcentajeTranscurrido;
        },
        usuarioExperto() {
            if (!this.usuario?.id) {
                return false;
            }
            if (!this.elNodo?.expertos) {
                return false;
            }

            return this.elNodo.expertos.includes(this.usuario.id);
        }
    },
    methods: {
        toggleDespliege() {
            if (!this.mostrandoFlechasConexiones) {
                this.desplegado = !this.desplegado;
            }
        },
        clickFuera() {
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
        setDiasRepaso() {
            if (!this.elNodo) {
                return;
            }
            this.diasRepaso = Number(this.$refs.inputDiasRepaso.value);

            if(this.datosUsuarioEsteNodo && this.diasRepaso===this.datoUsuarioEsteNodo.diasRepaso){
                return;
            }

            //1 day minimum
            if (this.diasRepaso < 1) {
                return
            }

            if (!this.diasRepaso > 3000) {
                return
            }

            this.guardandoDiasRepaso = true;
            this.$apollo.mutate({
                mutation: gql`
                    mutation($idNodo: ID!, $nuevoDiasRepaso: Int!){
                        setDiasRepasoNodoConocimientoUsuario(idNodo: $idNodo, nuevoDiasRepaso: $nuevoDiasRepaso){
                             ...fragDatoNodoConocimiento
                        }
                    }
                    ${fragmentoDatoNodoConocimiento}
                    `,
                variables: {
                    idNodo: this.elNodo.id,
                    nuevoDiasRepaso: this.diasRepaso,
                }
            }).then(() => {
                this.guardandoDiasRepaso = false;
                this.mostrando = '';

            }).catch((error) => {
                console.log('Error: ' + error);
                this.guardandoDiasRepaso = false;
            })
        },
        marcarAprendido() {
            if (!this.elNodo) {
                return;
            }

            let nuevoEstadoAprendido = true;
            if (this.datoUsuarioEsteNodo) {
                nuevoEstadoAprendido = !this.datoUsuarioEsteNodo.aprendido;
            }

            this.settingEstadoAprendido = true;
            this.$apollo.mutate({
                mutation: gql`
                    mutation($idNodo: ID!, $nuevoEstadoAprendido: Boolean!){
                        setNodoAtlasAprendidoUsuario(idNodo: $idNodo, nuevoEstadoAprendido: $nuevoEstadoAprendido){
                            ...fragDatoNodoConocimiento
                        }
                    }
                    ${fragmentoDatoNodoConocimiento}
                    `,
                variables: {
                    idNodo: this.elNodo.id,
                    nuevoEstadoAprendido,
                }
            }).then(({data:{setNodoAtlasAprendidoUsuario}}) => {
                this.settingEstadoAprendido = false;

                //Add datos nodos nuevos al cache
                let store = this.$apollo.provider.defaultClient;
                let cache = store.readQuery({
                    query: QUERY_DATOS_USUARIO_NODOS,
                    variables: {
                        idUsuario: this.usuario.id,
                    }
                });

                let nuevosDatosNodos = setNodoAtlasAprendidoUsuario.filter(dn => cache.yo?.atlas?.datosNodos?.findIndex(dn2 => dn2.idNodo === dn.idNodo) === -1);

                console.log("Nuevos datos nodos: ", nuevosDatosNodos.length);

                let nuevoCache = JSON.parse(JSON.stringify(cache));

                nuevoCache.yo.atlas.datosNodos = nuevoCache.yo.atlas.datosNodos.concat(nuevosDatosNodos);

                store.writeQuery({
                    query: QUERY_DATOS_USUARIO_NODOS,
                    variables: {
                        idUsuario: this.usuario.id,
                    },
                    data: nuevoCache
                });

            }).catch((error) => {
                console.log('Error: ' + error);
                this.settingEstadoAprendido = false;
            })
        },
        recalcularHeights(){
          this.$nextTick(() => {
            this.heightNombre = this.$refs.nombre.clientHeight;
            this.heigthAll = this.$el.clientHeight;
          });
        }

    },
    watch: {
        elNodo(nodo) {
            this.mostrandoFlechasConexiones = false;
            if (!nodo) {
                this.nivelesConexion = 0;
            }
            if (nodo) {
                this.recalcularHeights();
            }
            else {
                this.mostrando = '';
                this.heightNombre = 0;
                this.heigthAll = 0;
            }
        },
        datoUsuarioEsteNodo(datos){
            if(datos){
                this.diasRepaso = datos.diasRepaso || 0;
            }
        },
        nivelesConexion: {
            handler(niveles) {
                this.$emit('nivelesConexion', niveles)
            },
            immediate: true
        },
        filaMostrada(){
            this.recalcularHeights();
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
  width: min(600px, 90%);
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
  gap: 10px;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}
#nombre img {
  height: 25px;
  /* filter to white */
  filter: invert(1) sepia(0) saturate(0) hue-rotate(0deg);
}

#zonaControles {
  background-color: var(--atlasConocimientoBaseNodo);
  min-height: 170px;

  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  gap: 20px;
  padding: 20px 20px;
}

.filaControles {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 40px;
  width: 100%;
}

.bloqueControl {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}

.botonControl {
  font-size: 0.8em;
  font-weight: normal;
}

#botonMarcarAprendido.activo {
  background-color: transparent;
  border: 2px solid var(--atlasConocimientoCheck);
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

/* #region zona seleccion fila */
#zonaSelectorFilas {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

.selectorFila {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: var(--atlasConocimientoBaseNodo);
  cursor: pointer;
  transform-origin: center;
  border: 1px solid white;
}
.selectorFila.activo {
  transform: scale(1.2);
  background-color: var(--paletaMain);
}
/* #endregion */

/* #region controlConexiones */

#centerSignaler {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 13px solid transparent;
  border-bottom: 13px solid var(--atlasConocimientoSeleccion);
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
  border: 13px solid transparent;
  border-bottom: 13px solid gray;
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
