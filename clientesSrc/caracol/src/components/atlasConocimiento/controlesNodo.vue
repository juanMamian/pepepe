<template>
  <div
    class="controlesNodo"
    :style="estiloPos"
    @click="clickFuera"
    :class="{ deshabilitado: eliminandose }"
  >
    <div id="contenedorAnuncios">
      <div id="anuncioCreandoDependencia" v-show="nodoCreandoDependencia">
        <div class="anuncio anuncioSeleccion">
          <img
            v-show="!creandoDependencia"
            src="@/assets/iconos/codeBranch.svg"
            alt="Dependencia"
          />
          <Loading v-show="creandoDependencia" />
          <span> Creando dependencia </span>
        </div>

        <div class="subanuncio"></div>
      </div>
      <div
        class="anuncio"
        :class="{
          anuncioSeleccion: idNodoTarget === elNodo?.id,
          deshabilitado: !nodoTargetRelevante,
        }"
        id="anuncioNodoTarget"
        v-show="idNodoTarget && (!elNodo || elNodo.id == idNodoTarget)"
        @click="$emit('centerEnTarget')"
        @mouseenter="$emit('hoveringAnuncioTarget', true)"
        @mouseleave="$emit('hoveringAnuncioTarget', false)"
        @touchstart="startTouchAnuncioTarget"
        @touchmove="moveTouchAnuncioTarget"
        @touchend="endTouchAnuncioTarget"
      >
        <img src="@/assets/iconos/crosshairsSolid.svg" alt="Mira" />
        <span>Nodo en la mira</span>
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

    <div
      id="zonaControles"
      @click=""
      v-if="elNodo && !$apollo.queries.elNodoDB.loading"
      @mouseenter="hovered = true"
      @mouseleave="hovered = false"
      @touchstart.stop="inicioTouch"
      @touchmove.stop="movimientoTouch"
      @touchend.stop="finTouch"
    >
      <transition-group
        name="pan"
        @after-leave="recalcularHeights"
        tag="div"
        id="transicionFilas"
      >
        <div
          class="filaControles"
          :class="[direccionTransicion]"
          key="fila1"
          v-show="filaMostrada === 2"
        >
          <div class="anuncio" style="opacity: 0.7" v-show="!nodoAccesible">
            <img
              src="@/assets/iconos/lockSolid.svg"
              alt="Bloqueo"
              style="height: 15px"
            />
            ¡Tienes nodos por completar que son necesarios para este!
          </div>
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
                border-top-left-radius: 0px;
                border-bottom-left-radius: 0px;
                align-self: normal;
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

        <div
          class="filaControles"
          :class="[direccionTransicion]"
          key="fila3"
          v-show="filaMostrada === 3"
        >
          <div class="bloqueControl" id="bloqueControlDependencias">
            <div
              class="botonTexto selector botonControl"
              :class="{
                activo: mostrando === 'dependenciasNodo',
                deshabilitado: dependenciasNodo.length === 0,
              }"
              @click="
                mostrando =
                  mostrando === 'dependenciasNodo' ? null : 'dependenciasNodo'
              "
            >
              <img src="@/assets/iconos/codeBranch.svg" alt="Repaso" />
              Dependencias
            </div>
            <div
              class="botonTexto"
              :class="{ deshabilitado: nodoCreandoDependencia }"
              id="botonCrearDependenciaNodo"
              v-if="usuarioSuperadministrador || usuarioExpertoNodo"
              @click.stop="iniciarCrearDependenciaNodo"
            >
              <img src="@/assets/iconos/plusCircle.svg" alt="Nuevo" />
            </div>
          </div>

          <div class="bloqueControl" v-if="usuarioSuperadministrador">
            <Loading v-show="eliminandose" />
            <div
              class="boton botonControl"
              v-show="!eliminandose"
              @click="eliminarNodo"
            >
              <img src="@/assets/iconos/trash.svg" alt="Eliminar" />
            </div>
          </div>

          <div
            class="contenidoMostrado"
            id="zonaGestionDependencias"
            v-show="mostrando === 'dependenciasNodo'"
          >
            <div id="listaDependencias" v-if="elNodo && elNodo.vinculos">
              <div
                class="dependencia"
                v-for="vinculo of dependenciasNodo"
                :key="vinculo.id"
              >
                <NodoConocimientoVistaLista :idNodo="vinculo.idRef" :yo="yo" />
                <div
                  v-if="usuarioExperto"
                  class="botonTexto botonEliminarDependencia"
                  :class="{ deshabilitado: idVinculoEliminando === vinculo.id }"
                  @click.stop="eliminarVinculo(vinculo)"
                >
                  <Loading v-show="idVinculoEliminando === vinculo.id" />
                  <img
                    v-show="idVinculoEliminando != vinculo.id"
                    src="@/assets/iconos/equis.svg"
                    alt="Eliminar"
                  />
                </div>
              </div>
              <div
                class="anuncioZonaVacia"
                v-show="dependenciasNodo.length === 0"
              >
                Este nodo no tiene dependencias
              </div>
            </div>
          </div>
        </div>

        <div
          class="filaControles"
          :class="[direccionTransicion]"
          key="fila1"
          v-show="filaMostrada === 1"
        >
          <div id="zonaDescripcionNodo">
            <div id="descripcionNodo">
              {{ elNodo.descripcion || "" }}
              <div
                class="anuncioZonaVacia"
                v-if="!elNodo?.descripcion?.length > 0"
              >
                Aún no hay descripción
              </div>
            </div>
          </div>
          <div class="bloqueControl">
            <router-link
              v-if="elNodo?.id"
              :to="{
                name: 'visorNodoConocimiento',
                params: { idNodo: elNodo.id },
              }"
            >
              <div class="botonTexto">
                <img src="@/assets/iconos/expandSolid.svg" alt="Expandir" />
                Visitar
              </div>
            </router-link>
          </div>
          <div class="bloqueControl" id="bloqueControlBrowse" v-if="elNodo?.id">
            <router-link :to="'verNodo' + elNodo.id" class="botonTexto">
              <img src="@/assets/iconos/codeBranch.svg" alt="Ramas" />
              Explorar
            </router-link>
          </div>
          <div class="bloqueControl" id="bloqueControlTarget">
            <div
              class="botonTexto selector"
              :class="{ activo: elNodo.id === idNodoTarget }"
              @click="setNodoTarget(elNodo.id)"
            >
              <img src="@/assets/iconos/crosshairsSolid.svg" alt="Mira" />
              En la mira
            </div>
            <div
              class="botonTexto"
              v-show="elNodo.id === idNodoTarget"
              style="align-self: stretch"
              @click="setNodoTarget(null)"
            >
              <img src="@/assets/iconos/equis.svg" alt="Cancelar" />
            </div>
          </div>
        </div>
      </transition-group>
      <div id="zonaSelectorFilas">
        <div
          class="selectorFila boton selector"
          :class="{ activo: filaMostrada === index }"
          v-for="index of cantidadFilas"
          :key="'selectorFila' + index"
          @click.stop="setFilaMostrada(index)"
        ></div>
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
import { fragmentoColecciones, QUERY_DATOS_USUARIO_NODOS, QUERY_NODOS, QUERY_NODO_CONOCIMIENTO_ESTANDAR } from './fragsAtlasConocimiento';
import { fragmentoDatoNodoConocimiento } from './fragsAtlasConocimiento';
import PieProgreso from '../utilidades/PieProgreso.vue';
import NodoConocimientoVistaLista from './NodoConocimientoVistaLista.vue';
import Loading from '../utilidades/Loading.vue';
import throttle from 'lodash/throttle';

export default {
  props: {
    nodoCreandoDependencia: {
      type: Object,
    },
    nodoTargetRelevante: {
      type: Boolean,
      default: true,
    },
    idNodoSeleccionado: {
      type: String,
    },
    emitOpenNodo:{// Para dar la órden de emitir el evento de open nodo en vez de hacer la operación default que es navegar a la ruta del visor de nodos.
      type: Boolean,
      default: false,
    }
  },
  apollo: {
    yo: {
      query: QUERY_DATOS_USUARIO_NODOS,
      fetchPolicy: "cache-first"
    },
    elNodoDB: {
      query: QUERY_NODO_CONOCIMIENTO_ESTANDAR,
      variables() {
        return {
          idNodo: this.idNodoSeleccionado,
        }
      },
      skip() {
        return !this.idNodoSeleccionado;
      },
      update({ nodo }) {
        return nodo
      },
      fetchPolicy: "cache-first"

    },
  },
  components: {
    Loading,
    PieProgreso,
    NodoConocimientoVistaLista,
  },
  name: "ControlesNodo",
  data() {
    return {
      nodoTarget:null,
      hovered:false,
      direccionTransicion: 'normal',
      elNodoDB: {
        vinculos: [],
        expertos: [],
      },

      yo: {
        atlas: {
          datosNodos: [],
          colecciones: [],
        }
      },
      eliminandose: false,
      mostrandoFlechasConexiones: false,
      desplegado: false,

      cantidadFilas: 3,
      filaMostrada: 1,
      mostrando: "",
      touchStartX: null,

      montado: false,
      heightNombre: 0,
      heigthAll: 0,
      settingDateEstudiado: false,

      diasRepaso: 0,
      guardandoDiasRepaso: false,
      settingEstadoAprendido: false,


      idVinculoEliminando: null,
      creandoDependencia: false,

      startTouchTargetX: null,
    };
  },
  computed: {
    elNodo() {
      if (!this.idNodoSeleccionado) {
        return null
      }
      return this.elNodoDB;
    },
    idNodoTarget() {
      return this.yo.atlas.idNodoTarget
    },
    dependenciasNodo() {
      if (!this.elNodo) {
        return [];
      }
      return this.elNodo.vinculos.filter(v => v.tipo == 'continuacion' && v.rol === 'target');

    },
    usuarioExpertoNodo() {
      if (!this.elNodo || !this.yo) {
        return false;
      }

      return this.elNodo.expertos?.includes(this.usuario.id);
    },
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
    datoUsuarioEsteNodo() {
      if (!this.elNodo || !this.yo?.atlas?.datosNodos) {
        return null;
      }

      return this.yo.atlas.datosNodos.find(dato => dato.idNodo === this.elNodo.id);
    },
    nodoAccesible() {
      let idsNodosVerdesUsuario = this.yo.atlas.datosNodos.filter(dn => {
        if (dn.aprendido) {
          return true;
        }
        //estudiados
        if (!dn.estudiado || !dn.diasRepaso) {
          return false;
        }
        let timeLimite = (new Date(dn.estudiado)).getTime() + (dn.diasRepaso * 86400000);
        if (timeLimite < Date.now()) {
          return false;
        }

        // Sí está estudiado y no ha pasasdo el tiempo límite
        return true
      }).map(dn => dn.idNodo);
      return !this.elNodo.vinculos.some(v => v.tipo === 'continuacion' && v.rol === 'target' && !idsNodosVerdesUsuario.includes(v.idRef));
    },
    nodoEstudiado() {
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
    nodoFresco() {
      if (!this.elNodo) {
        return false;
      }
      if (!this.datoUsuarioEsteNodo?.estudiado || !this.datoUsuarioEsteNodo?.diasRepaso) {
        return false;
      }

      if (this.nodoAprendido) {
        return true;
      }

      let tiempoLimite = (new Date(this.datoUsuarioEsteNodo.estudiado)).getTime() + (this.datoUsuarioEsteNodo.diasRepaso * 86400000);


      return Date.now() < tiempoLimite;
    },
    nodoRepasar() {
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
    emitirOpenNodo(e){
      console.log("Emitiendo el open nodo");
      this.$emit('openNodoCaptured', this.elNodo.id);
      e.preventDefault();

    },
    setFilaMostrada(index) {
      if (this.filaMostrada < index || this.filaMostrada === 1) {
        this.direccionTransicion = 'left';
      }
      else {
        this.direccionTransicion = 'right'
      }
      this.filaMostrada = index;

    },
    setNodoTarget(nuevoIdNodoTarget = this.idNodo) {
      const QUERY_NODO_TARGET = gql`
          query{
           yo{
            id
             atlas{
             id
               idNodoTarget
             }
            }
         }
        `;
      nuevoIdNodoTarget = nuevoIdNodoTarget === this.idNodoTarget ? null : nuevoIdNodoTarget;
      const store = this.$apollo.provider.defaultClient;
      const cache = store.readQuery({
        query: QUERY_NODO_TARGET,
      });
      if (!cache.yo?.atlas) {
        return;
      }
      if (nuevoIdNodoTarget === cache.yo.atlas.idNodoTarget) {
        return;
      }
      let nuevoCache = JSON.parse(JSON.stringify(cache));
      nuevoCache.yo.atlas.idNodoTarget = nuevoIdNodoTarget;

      store.writeQuery({
        query: QUERY_NODO_TARGET,
        data: nuevoCache
      });

      this.$apollo.mutate({
        mutation: gql`
          mutation($idNodo: ID){
            setNodoAtlasTarget(idNodo:$idNodo)
          }
        `,
        variables: {
          idNodo: nuevoIdNodoTarget
        }

      }).catch((error) => {
        console.log(`Error sincronizando nodo target: ${error}`);
      })
    },
    startTouchAnuncioTarget(e) {
      this.startTouchTargetX = e.touches[0].clientX;

    },
    moveTouchAnuncioTarget(e) {

      let minMov = 40;
      if (this.startTouchTargetX) {
        let mov = e.touches[0].clientX - this.startTouchTargetX;
        if (Math.abs(mov) > minMov) {
          let delta = -mov / Math.abs(mov);
          this.$emit('stepNivelesUnderTarget', delta);
          this.startTouchTargetX = null;
        }
      }
    },
    endTouchAnuncioTarget() {
      this.startTouchTargetX = null;
    },
    movimientoTouch(e) {
      let minMov = 60;
      if (this.touchStartX) {
        let mov = e.touches[0].clientX - this.touchStartX;
        console.log(`mov de ${mov}`);
        if (Math.abs(mov) > minMov) {
          let delta = -mov / Math.abs(mov);
          this.stepFilaMostrada(delta);
          this.touchStartX = null;
        }
      }
    },
    stepFilaMostrada(step){
          this.direccionTransicion = step > 0 ? 'left' : 'right'
          this.filaMostrada += step;
          if (this.filaMostrada > this.cantidadFilas) {
            this.filaMostrada = 1;
          }
          if (this.filaMostrada < 1) {
            this.filaMostrada = this.cantidadFilas;
          }

    },
    finTouch() {
      this.touchStartX = null;
    },
    inicioTouch(e) {
      console.log("registro de touchstart");
      this.touchStartX = e.touches[0].clientX;
      console.log(`Queda en ${this.touchStartX}`);
    },
    eliminarNodo() {
      if (!this.usuarioSuperadministrador) {
        console.log(`No autorizado`);
        return;
      }
      if (!confirm("¿Seguro de que quieres eliminar este nodo?")) return;
      let idNodo = this.elNodo.id;
      this.eliminandose = true;
      console.log(`enviando mutacion de eliminar nodo`);
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idNodo: ID!) {
              eliminarNodo(idNodo: $idNodo)
            }
          `,
          variables: {
            idNodo,
          },
        })
        .then(({ data: { eliminarNodo } }) => {
          this.eliminandose = false;
          if (!eliminarNodo) {
            console.log(`Nodo no fue eliminado`);
            return;
          }
          const store = this.$apollo.provider.defaultClient;
          const cache = store.readQuery({
            query: QUERY_NODOS,
          });
          var nuevoCache = JSON.parse(JSON.stringify(cache));
          const indexN = nuevoCache.todosNodos.findIndex(
            (n) => n.id == idNodo
          );

          if (indexN === -1) {
            console.log(`el nodo no estaba presente`);
            return;
          }
          nuevoCache.todosNodos.splice(indexN, 1);
          store.writeQuery({
            query: QUERY_NODOS,
            data: nuevoCache,
          });
          this.$emit("nodoEliminado", idNodo);

        })
        .catch((error) => {
          this.eliminandose = false;
          console.log(`Error eliminando nodo. : ${error}`);
        })
    },
    crearDependenciaNodo(nodoSource) {
      if (!nodoSource || !this.elNodo) {
        return;
      }
      let nodoTarget = this.elNodo;

      console.log(`Mutando que ${nodoSource.nombre} es dependencia de ${nodoTarget.nombre}`);

      this.creandoDependencia = true;
      this.$apollo.mutate({
        mutation: gql`
            mutation($tipo: String!, $idSource: ID!, $idTarget: ID!){
              crearVinculo(tipo: $tipo, idSource: $idSource, idTarget: $idTarget){
                modificados{
                  id
                  vinculos{
                    id
                    idRef
                    tipo
                    rol
                  }
                }
              }
            }
            `,
        variables: {
          tipo: "continuacion",
          idSource: nodoSource.id,
          idTarget: nodoTarget.id
        }
      }).then(() => {
        this.creandoDependencia = false;
        this.$emit("cancelarCreandoDependencia");

      }).catch((error) => {
        console.log('Error: ' + error);
        this.raiseAccion("Error creando dependencia", "error");
        this.creandoDependencia = false;
      })
    },
    eliminarVinculo(vinculo) {
      if (!this.usuarioExperto && !this.usuarioSuperadministrador) {
        return;
      }

      let idSource = vinculo.idRef;

      this.idVinculoEliminando = vinculo.id;
      this.$apollo.mutate({
        mutation: gql`
              mutation($idSource: ID!, $idTarget: ID!){
                eliminarVinculoFromTo(idSource: $idSource, idTarget: $idTarget){
                  modificados{
                    id
                    vinculos{
                      id
                      idRef
                      tipo
                      rol
                    }
                  }
                }
              }
              `,
        variables: {
          idSource,
          idTarget: this.elNodo.id,
        }
      }).then(() => {
        this.idVinculoEliminando = null;

      }).catch((error) => {
        console.log('Error: ' + error);
        this.idVinculoEliminando = null;
      })
    },
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
        this.$emit("cambioEstadoEstudiadoNodo");

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

      if (this.datosUsuarioEsteNodo && this.diasRepaso === this.datoUsuarioEsteNodo.diasRepaso) {
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
      }).then(({ data: { setNodoAtlasAprendidoUsuario } }) => {
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
        this.$emit("cambioEstadoEstudiadoNodo");

      }).catch((error) => {
        console.log('Error: ' + error);
        this.settingEstadoAprendido = false;
      })
    },
    recalcularHeights() {
      this.$nextTick(() => {
        this.heightNombre = this.$refs.nombre.clientHeight;
        this.heigthAll = this.$el.clientHeight;
      });
    },
    iniciarCrearDependenciaNodo() {
      if (!this.elNodo) {
        return;
      }
      this.$emit('iniciarCrearDependenciaNodo');
    },
    zoomWheel: throttle(function(e) {
      if (!this.hovered) {
        return;
      }
      e.preventDefault();
      let direccionScroll = e.deltaY;
      let delta = direccionScroll / Math.abs(direccionScroll);
      this.stepFilaMostrada(delta);
      return true;
    }, 500)
  },
  watch: {
    elNodo(nodo) {
      this.mostrandoFlechasConexiones = false;
      if (nodo) {
        this.recalcularHeights();
      }
      else {
        this.desplegado = false;
        this.mostrando = '';
        this.heightNombre = 0;
        this.heigthAll = 0;
        this.$emit("cancelarCreandoDependencia");
      }
    },
    datoUsuarioEsteNodo(datos) {
      if (datos) {
        this.diasRepaso = datos.diasRepaso || 0;
      }
    },
    mostrando(mostrando) {
      this.recalcularHeights();
    },
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
  top: 100vh;
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
  overflow-x: hidden;
}

#transicionFilas.normal .filaControles {
  animation-direction: normal;
}

#transicionFilas.reverse .filaControles {
  animation-direction: reverse;
}

.filaControles {
  display: flex;
  flex-wrap: wrap;
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

#zonaDescripcionNodo {
  width: 100%;
}

#zonaDescripcionNodo #descripcionNodo {
  padding: 10px 10px;
  margin: 10px 6%;
  margin-top: 20px;
  margin-bottom: 0px;
  font-style: normal;
  font-size: 0.9em;
  text-align: center;
  border-radius: 10px;
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgb(255 255 255 / 35%);
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

.contenidoMostrado {
  width: 100%;
}

/* #region controles de admin */
#bloqueControlDependencias {
  display: flex;
  justify-content: center;
  align-items: normal;
}

#botonCrearDependenciaNodo {
  align-self: stretch;
  border-radius: 5px;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  background-color: var(--paletaMain);
  height: unset;
}

#botonCrearDependenciaNodo img {
  height: 25px;
}

#listaDependencias {
  padding: 10px 0px;
  padding-bottom: 20px;
  display: flex;
  flex-direction: column;
  max-height: 40vh;
  overflow-y: scroll;
  gap: 10px;
}

.dependencia {
  display: flex;

  align-items: center;
  width: 100%;
}

.dependencia .nodoConocimientoVistaLista {
  flex-grow: 1;
  align-self: normal;
}

#contenedorAnuncios {
  position: absolute;
  bottom: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%);
  gap: 20px;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  opacity: 0.9;
}

#anuncioCreandoDependencia {
  opacity: 0.9;
}

#anuncioNodoTarget {
  cursor: pointer;
  justify-content: center;
  align-items: center;
}

/* #endregion */

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
  z-index: 1;
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
