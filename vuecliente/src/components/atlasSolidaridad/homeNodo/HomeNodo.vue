<template>
  <div class="homeNodo" :key="$route.params.id">
    <div id="barraSuperior">
      <a
        :href="clienteUrl + '/#/homeNodoSolidaridad/' + esteNodo.nodoParent"
        v-if="esteNodo.nodoParent"
      >
        <img
          src="@/assets/iconos/doubleUp.svg"
          alt="Up"
          title="Navegar al nodo parent"
          id="botonIrNodoParent"
          class="boton"
        />
      </a>
      <div id="zonaTituloNodo">
        <svg
          aria-hidden="true"
          focusable="false"
          data-prefix="fas"
          data-icon="cog"
          class="svg-inline--fa fa-cog fa-w-16 iconoNodo"
          v-if="esteNodo.tipoNodo === 'trabajo'"
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
        >
          <path
            :fill="colorIcono"
            d="M487.4 315.7l-42.6-24.6c4.3-23.2 4.3-47 0-70.2l42.6-24.6c4.9-2.8 7.1-8.6 5.5-14-11.1-35.6-30-67.8-54.7-94.6-3.8-4.1-10-5.1-14.8-2.3L380.8 110c-17.9-15.4-38.5-27.3-60.8-35.1V25.8c0-5.6-3.9-10.5-9.4-11.7-36.7-8.2-74.3-7.8-109.2 0-5.5 1.2-9.4 6.1-9.4 11.7V75c-22.2 7.9-42.8 19.8-60.8 35.1L88.7 85.5c-4.9-2.8-11-1.9-14.8 2.3-24.7 26.7-43.6 58.9-54.7 94.6-1.7 5.4.6 11.2 5.5 14L67.3 221c-4.3 23.2-4.3 47 0 70.2l-42.6 24.6c-4.9 2.8-7.1 8.6-5.5 14 11.1 35.6 30 67.8 54.7 94.6 3.8 4.1 10 5.1 14.8 2.3l42.6-24.6c17.9 15.4 38.5 27.3 60.8 35.1v49.2c0 5.6 3.9 10.5 9.4 11.7 36.7 8.2 74.3 7.8 109.2 0 5.5-1.2 9.4-6.1 9.4-11.7v-49.2c22.2-7.9 42.8-19.8 60.8-35.1l42.6 24.6c4.9 2.8 11 1.9 14.8-2.3 24.7-26.7 43.6-58.9 54.7-94.6 1.5-5.5-.7-11.3-5.6-14.1zM256 336c-44.1 0-80-35.9-80-80s35.9-80 80-80 80 35.9 80 80-35.9 80-80 80z"
          ></path>
        </svg>
        <svg
          aria-hidden="true"
          focusable="false"
          data-prefix="fas"
          data-icon="star"
          class="svg-inline--fa fa-star fa-w-18 iconoNodo"
          v-if="esteNodo.tipoNodo === 'objetivo'"
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 576 512"
        >
          <path
            :fill="colorIcono"
            d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z"
          ></path>
        </svg>
        <div id="titulo" v-show="!editandoNombre" @click="toggleEditandoNombre">
          {{ esteNodo.nombre }}
        </div>
        <input
          @keypress.enter.prevent="guardarNuevoNombre"
          ref="inputNuevoNombre"
          v-model="nuevoNombre"
          style="width: 250px"
          @blur="editandoNombre = false"
          @keydown="keydownInputNuevoNombre"
          v-show="editandoNombre"
          type="text"
          class="inputNombreCosa"
          id="inputNuevoNombre"
        />
      </div>
      <div id="zonaControlesNodo">
        <div
          id="zonaPorcentajeCompletado"
          class="bloqueControlNodo"
          :title="
            usuarioResponsable
              ? 'Definir progreso del nodo'
              : 'Progreso del nodo'
          "
        >
          <div id="porcentajeCompletado"></div>
          <img
            src="@/assets/iconos/relojArena.svg"
            alt="Progreso"
            class="boton botonControlNodo"
          />
        </div>
        <div
          id="zonaTiempoEstimado"
          class="bloqueControlNodo"
          :title="
            usuarioResponsable
              ? 'Definir tiempo estimado para completar este nodo'
              : 'Tiempo estimado para completar este nodo'
          "
        >
          <div id="tiempoEstimado"></div>
          <img
            src="@/assets/iconos/calendar.svg"
            alt="Calendario"
            class="boton botonControlNodo"
          />
        </div>
        <div id="bloqueMarcarNodoCompletado" class="bloqueControlNodo">
          <img
            src="@/assets/iconos/check.svg"
            alt="Check"
            :title="
              esteNodo.estadoDesarrollo === 'completado'
                ? 'Desmarcar este nodo como completado'
                : 'Marcar este nodo como completado'
            "
            class="boton botonControlNodo"
            id="botonMarcarNodoCompletado"
            @click="toggleEstadoNodo"
            v-show="!togglingEstado"
            :style="{
              filter:
                esteNodo.estadoDesarrollo === 'completado'
                  ? 'var(--atlasFilterVerde)'
                  : '',
            }"
          />
        </div>

        <loading texto="" v-show="togglingEstado" />
      </div>
    </div>
    <div id="contenidoNodo">
      <div id="primeraRow">
        <div class="bloqueContenido" id="bloqueInformacion">
          <div class="barraSuperiorGeneral">
            <div
              class="boton botonBarraSuperiorGeneral botonSelectorContenidoNodo"
              :class="{
                deshabilitado:
                  (!esteNodo.descripcion ||
                    esteNodo.descripcion.length < 1 ||
                    esteNodo.descripcion === 'Sin descripcion' ||
                    esteNodo.descripcion === 'Sin descripción') &&
                  !usuarioAdministrador,
              }"
              :style="{
                borderColor: mostrando === 'descripcion' ? 'white' : 'black',
              }"
              @click="mostrando = 'descripcion'"
              :title="mostrando === 'descripcion' ? '' : 'Mostrar descripción'"
            >
              <img src="@/assets/iconos/info.svg" alt="Descripción" />
            </div>
            <div
              class="boton botonBarraSuperiorGeneral botonSelectorContenidoNodo"
              :style="{
                borderColor: mostrando === 'responsables' ? 'white' : 'black',
              }"
              @click="mostrando = 'responsables'"
              :title="
                mostrando === 'responsables'
                  ? ''
                  : 'Mostrar responsables del nodo'
              "
            >
              <img src="@/assets/iconos/user.svg" alt="Responsables" />
            </div>
            <div
              class="boton botonBarraSuperiorGeneral botonSelectorContenidoNodo"
              @click="mostrando = 'keywords'"
              :style="{
                borderColor: mostrando === 'keywords' ? 'white' : 'black',
              }"
              :class="{
                deshabilitado:
                  (!esteNodo.keywords || esteNodo.keywords.length < 1) &&
                  !usuarioAdministrador,
              }"
              :title="mostrando === 'keywords' ? '' : 'Mostrar palabras clave'"
            >
              <img src="@/assets/iconos/tag.svg" alt="Keywords" />
            </div>
          </div>
          <div
            id="zonaDescripcion"
            class="zonaInformacion"
            v-show="mostrando === 'descripcion'"
          >
            <div
              id="descripcion"
              class="contenidoTexto"
              ref="descripcion"
              v-show="!editandoDescripcion"
              @click="toggleEditandoDescripcion"
            >
              {{ esteNodo.descripcion }}
            </div>

            <textarea
              id="inputNuevoDescripcion"
              class="inputTextoNodo"
              ref="inputNuevoDescripcion"
              :class="{ letrasRojas: nuevoDescripcionIlegal }"
              v-model="nuevoDescripcion"
              v-show="editandoDescripcion"
            />
            <div class="contenedorBotonesCampo" v-show="editandoDescripcion">
              <img
                src="@/assets/iconos/save.svg"
                class="boton botonGuardarCampo"
                alt="Guardar"
                title="Guardar descripción"
                id="botonGuardarDescripcion"
                @click="guardarNuevoDescripcion"
              />
              <img
                src="@/assets/iconos/equis.svg"
                class="boton botonGuardarCampo"
                alt="Cancelar"
                title="Cancelar edición"
                id="botonCancelarEdicionDescripcion"
                @click="editandoDescripcion = false"
              />
            </div>
            <loading v-show="enviandoNuevoDescripcion" texto="Enviando..." />
          </div>

          <div
            id="zonaKeywords"
            class="zonaInformacion"
            v-show="mostrando === 'keywords'"
          >
            <div
              id="keywords"
              class="contenidoTexto"
              ref="keywords"
              v-show="!editandoKeywords"
              @click="toggleEditandoKeywords"
            >
              {{ esteNodo.keywords }}
            </div>

            <textarea
              id="inputNuevoKeywords"
              ref="inputNuevoKeywords"
              class="inputTextoNodo"
              :class="{ letrasRojas: nuevoKeywordsIlegal }"
              v-model="nuevoKeywords"
              v-show="editandoKeywords"
              @keydown.esc.stop="editandoKeywords = false"
              @keydown.enter.prevent.stop="guardarNuevoKeywords"
            />
            <div class="contenedorBotonesCampo" v-show="editandoKeywords">
              <img
                src="@/assets/iconos/save.svg"
                class="boton botonGuardarCampo"
                alt="Guardar"
                title="Guardar palabras clave"
                id="botonGuardarKeywords"
                @click="guardarNuevoKeywords"
              />
              <img
                src="@/assets/iconos/equis.svg"
                class="boton botonGuardarCampo"
                alt="Cancelar"
                title="Cancelar edición"
                id="botonCancelarEdicionKeywords"
                @click="editandoKeywords = false"
              />
            </div>
            <loading v-show="enviandoNuevoKeywords" texto="Enviando..." />
          </div>

          <div
            id="zonaResponsables"
            class="zonaInformacion"
            v-show="mostrando === 'responsables'"
          >
            <div id="zonaAddResponsableManual" style="flex-direction: row; display: flex">
              <input
                type="text"
                name=""
                id="inputIdResponsableManual"
                ref="inputIdResponsableManual"
              />
              <div class="boton" @click="addResponsableManually">
                <img src="@/assets/iconos/plusCircle.svg" alt="Plus" />
              </div>
            </div>
            <div
              class="contenedorBotonesZona"
              id="contenedorBotonesResponsables"
            >
              <img
                src="@/assets/iconos/mas.svg"
                alt="Entrar"
                :title="
                  esteNodo.responsables.length < 1
                    ? 'Asumir'
                    : 'Solicitar participación'
                "
                id="botonEntrarResponsables"
                class="boton botonControlZona botonControlResponsables"
                :class="{ deshabilitado: enviandoQueryResponsables }"
                v-show="!usuarioResponsable && !usuarioPosibleResponsable && !idResponsableSeleccionado"
                @click.stop="entrarResponsables"
              />
              <img
                src="@/assets/iconos/minus.svg"
                alt="Salir"
                title="Abandonar"
                id="botonAbandonarResponsables"
                class="boton botonControlZona botonControlResponsables"
                :class="{ deshabilitado: enviandoQueryResponsables }"
                v-show="
                  (usuarioResponsable || usuarioPosibleResponsable) &&
                  (!idResponsableSeleccionado ||
                    idResponsableSeleccionado === usuario.id)
                "
                @click.stop="abandonarListaResponsables"
              />
              <img
                src="@/assets/iconos/minus.svg"
                alt="Sacar"
                title="Retirar usuario"
                id="botonRetirarUsuarioFromResponsables"
                class="boton botonControlZona botonControlResponsables"
                :class="{ deshabilitado: enviandoQueryResponsables }"
                v-show="idResponsableSeleccionado
                "
                @click.stop="retirarUsuarioFromListaResponsables(idResponsableSeleccionado)"
              />
              <img
                src="@/assets/iconos/handshake.svg"
                alt="Aceptar"
                title="Aceptar como responsable"
                id="botonAceptarResponsables"
                class="boton botonControlZona botonControlResponsables"
                :class="{ deshabilitado: enviandoQueryResponsables }"
                v-show="
                  usuarioResponsable &&
                  idResponsableSeleccionado &&
                  !esteNodo.responsables.includes(idResponsableSeleccionado)
                "
                @click="aceptarResponsable(idResponsableSeleccionado)"
              />

              <loading texto="" v-show="enviandoQueryResponsables" />
            </div>
            <div
              id="listaResponsables"
              @click.stop="idResponsableSeleccionado = null"
            >
              <icono-persona-autonomo
                v-for="idResponsable of esteNodo.responsables.concat(
                  esteNodo.posiblesResponsables
                )"
                :style="{
                  opacity: esteNodo.posiblesResponsables.includes(idResponsable)
                    ? 0.5
                    : 1,
                }"
                :key="idResponsable"
                :idPersona="idResponsable"
                :seleccionado="idResponsableSeleccionado == idResponsable"
                :factorEscala="'0.7'"
                @click.native.stop="idResponsableSeleccionado = idResponsable"
              />
            </div>
          </div>
        </div>

        <div
          class="bloqueContenido"
          id="bloqueSubNodos"
          @mouseleave="mostrandoOpcionesCrearSubNodo = false"
        >
          <div class="barraSuperiorGeneral">
            <div class="tituloBloque">Nodos</div>
            <div class="controlesBloque" id="controlesRecursosExternos">
              <div
                class="boton botonBarraSuperiorGeneral"
                @click="mostrandoOpcionesCrearSubNodo = true"
                v-show="
                  !mostrandoOpcionesCrearSubNodo && usuarioResponsableAmplio
                "
              >
                <img
                  src="@/assets/iconos/plusCircle.svg"
                  alt="Nuevo"
                  title="Crear nuevo nodo"
                  :class="{ deshabilitado: creandoSubNodo }"
                />
                <loading texto="" v-show="creandoSubNodo" />
              </div>
              <div
                id="contenedorOpcionesCrear"
                v-show="mostrandoOpcionesCrearSubNodo"
                :class="{ deshabilitado: creandoSubNodo }"
              >
                <img
                  src="@/assets/iconos/starSolid.svg"
                  alt="Objetivo"
                  title="Crear nuevo objetivo"
                  class="boton botonBarraSuperiorGeneral opcionCrear"
                  v-show="esteNodo.tipoNodo === 'objetivo'"
                  @click="
                    crearNuevoNodoUnder({ tipoNodo: 'objetivo' }, esteNodo.id)
                  "
                />
                <img
                  src="@/assets/iconos/cog.svg"
                  alt="Trabajo"
                  title="Crear nuevo trabajo"
                  class="boton botonBarraSuperiorGeneral opcionCrear"
                  @click="
                    crearNuevoNodoUnder({ tipoNodo: 'trabajo' }, esteNodo.id)
                  "
                />
                <loading texto="" v-show="creandoSubNodo" />
              </div>
            </div>
          </div>
          <ventana-lista
            ref="ventanaLista"
            :idNodoRoot="$route.params.id"
            tipoNodoRoot="nodoSolidaridad"
          />
        </div>

        <div class="bloqueContenido" id="bloqueRecursosExternos">
          <div class="barraSuperiorGeneral">
            <div class="tituloBloque">Recursos externos</div>
            <div class="controlesBloque" id="controlesRecursosExternos">
              <div
                class="boton botonBarraSuperiorGeneral"
                :class="{ deshabilitado: creandoRecursoExterno }"
                v-show="!creandoRecursoExterno"
              >
                <img
                  src="@/assets/iconos/plusCircle.svg"
                  alt="Nuevo"
                  title="Crear nuevo recurso externo"
                  v-show="usuarioResponsableAmplio"
                  @click="crearNuevoRecursoExterno"
                />
              </div>
              <loading texto="" v-show="creandoRecursoExterno" />
            </div>
          </div>

          <div id="listaRecursosExternos">
            <recurso-externo-nodo
              v-for="recurso of esteNodo.recursosExternos"
              :key="recurso.id"
              :esteRecurso="recurso"
              :seleccionado="idRecursoExternoSeleccionado === recurso.id"
              :usuarioResponsableAmplio="usuarioResponsableAmplio"
              :idNodo="esteNodo.id"
              @click="idRecursoExternoSeleccionado = recurso.id"
              @meElimine="eliminarRecursoExternoCache(recurso.id)"
            />
          </div>
        </div>
      </div>

      <div class="bloqueContenido" id="bloqueDatos">
        <div id="barraLateralDatos">
          <div class="barraSuperiorGeneral">
            <div class="tituloBloque">Datos</div>
            <div class="controlesBloque" id="controlesRecursosExternos">
              <div class="botonBarraSuperiorGeneral">
                <img
                  src="@/assets/iconos/plusCircle.svg"
                  alt="Nuevo"
                  title="Crear nuevo dato"
                  v-show="false"
                />
              </div>
            </div>
          </div>
          <div
            id="listaDatos"
            @click="
              idDatoSeleccionado = null;
              datoSeleccionado = null;
            "
          >
            <div
              class="selectorDato"
              :class="{ seleccionado: idDatoSeleccionado === 'administracion' }"
              @click.stop="idDatoSeleccionado = 'administracion'"
            >
              <div class="nombreDato">Administración</div>
            </div>
            <div
              class="selectorDato"
              v-for="dato of esteNodo.datos"
              :key="dato.id"
              :class="{ seleccionado: idDatoSeleccionado === dato.id }"
              @click.stop="
                idDatoSeleccionado = dato.id;
                datoSeleccionado = dato;
              "
            >
              <div class="nombreDato">{{ dato.nombre }}</div>
              <div class="controlesDato">
                <img
                  src="@/assets/iconos/trash.svg"
                  alt="Eliminar"
                  title="Eliminar dato"
                  class="botonControlElementoLista"
                />
              </div>
            </div>
          </div>
        </div>

        <div id="zonaDetallesDato">
          <div class="barraSuperiorGeneral">
            <img
              src="@/assets/iconos/chart.svg"
              alt="Grafica"
              title="Ver gráfica"
              class="botonBarraSuperiorGeneral"
              @click="datoVer = 'grafica'"
              :class="{ deshabilitado: datoVer === 'grafica' }"
            />
            <img
              src="@/assets/iconos/thList.svg"
              alt="Tabla"
              title="Ver tabla"
              class="botonBarraSuperiorGeneral"
              @click="datoVer = 'tabla'"
              :class="{ deshabilitado: datoVer === 'tabla' }"
            />
          </div>
          <div id="graficaDatoSeleccionado"></div>
          <div
            id="tablaDatoSeleccionado"
            v-show="datoVer === 'tabla'"
            v-if="idDatoSeleccionado && idDatoSeleccionado != 'administracion'"
          >
            <div id="controlesTablaDatos" class="controlesBloque">
              <div class="botonBarraSuperiorGeneral">
                <img
                  src="@/assets/iconos/plusCircle.svg"
                  alt="Nuevo"
                  :title="'Crear nuevo item'"
                  @click.stop="crearNuevoItemDato"
                />
              </div>
            </div>
            <tabla-dato
              :esteDato="datoSeleccionado"
              :key="'tablaDe' + datoSeleccionado.id"
            />
          </div>
          <tabla-administracion
            :eventos="esteNodo.eventos"
            :movimientos="esteNodo.movimientosDinero"
            :idNodo="esteNodo.id"
            :usuarioResponsableAmplioNodo="usuarioResponsableAmplio"
            :subNodos="subNodos"
            v-show="
              datoVer === 'tabla' && idDatoSeleccionado === 'administracion'
            "
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ventanaLista from "../ventanaLista/ventanaLista.vue";
import Loading from "../../utilidades/Loading.vue";
import IconoPersonaAutonomo from "../../usuario/IconoPersonaAutonomo.vue";
import RecursoExternoNodo from "./RecursoExternoNodo.vue";
import { fragmentoNodoSolidaridad, fragmentoRecursoExterno } from "../frags";
import gql from "graphql-tag";
import debounce from "debounce";
import {
  MixinEdicionNodoSolidaridad,
  MixinEdicionVinculosNodoSolidaridad,
  MixinPermisosUsuarioNodoSolidaridad,
  MixinVisualesNodosSolidaridad,
} from "../ConfiguracionNodoSolidaridad";
import TablaDato from "./TablaDato.vue";
import TablaAdministracion from "./tablaAdministracion/TablaAdministracion.vue";

const configuracionDatos = {
  gastos: {
    campos: [
      "Fecha",
      "Artículo",
      "Unidad",
      "Gasto unitario",
      "Cantidad",
      "Gasto total",
      "Información",
    ],
  },
};

export const QUERY_ESTE_NODO = gql`
  query ($idNodo: ID!) {
    nodoSolidaridad(idNodo: $idNodo) {
      ...fragNodoSolidaridad
    }
  }
  ${fragmentoNodoSolidaridad}
`;
const QUERY_NODOS_UNDER = gql`
  query ($idParent: ID!) {
    nodosSolidaridadUnderNodo(idParent: $idParent) {
      ...fragNodoSolidaridad
    }
  }
  ${fragmentoNodoSolidaridad}
`;

export default {
  name: "HomeNodo",
  components: {
    ventanaLista,
    Loading,
    IconoPersonaAutonomo,
    RecursoExternoNodo,
    TablaDato,
    TablaAdministracion,
  },
  apollo: {
    esteNodo: {
      query: QUERY_ESTE_NODO,
      variables() {
        return {
          idNodo: this.$route.params.id,
        };
      },
      update({ nodoSolidaridad }) {
        return nodoSolidaridad;
      },
    },
    subNodos: {
      query: QUERY_NODOS_UNDER,
      variables() {
        return {
          idParent: this.$route.params.id,
        };
      },
      update({ nodosSolidaridadUnderNodo }) {
        this.addIdsToNodosEverRendered(
          nodosSolidaridadUnderNodo.map((ns) => ns.id)
        );
        return nodosSolidaridadUnderNodo;
      },
    },
    // $subscribe: {
    //   nodoFamilyEditado: {
    //     query: gql`
    //       subscription ($idNodoParent: ID!) {
    //         nodoSolidaridadFamilyEditado(idNodoParent: $idNodoParent) {
    //           ...fragNodoSolidaridad
    //         }
    //       }
    //       ${fragmentoNodoSolidaridad}
    //     `,
    //     variables() {
    //       return {
    //         idNodoParent: this.$route.params.id,
    //       };
    //     },
    //     result({ data: { nodoSolidaridadFamilyEditado } }) {
    //       console.log(
    //         `Update de nodo family ${nodoSolidaridadFamilyEditado.id}`
    //       );
    //       if (nodoSolidaridadFamilyEditado.id != this.$route.params.id) {
    //         this.enterNodoToCacheSubnodos(nodoSolidaridadFamilyEditado);
    //       }
    //     },
    //   },
    //   nodoFamilyEliminado: {
    //     query: gql`
    //       subscription ($idNodoParent: ID!) {
    //         nodoSolidaridadFamilyEliminado(idNodoParent: $idNodoParent)
    //       }
    //     `,
    //     variables() {
    //       return {
    //         idNodoParent: this.$route.params.id,
    //       };
    //     },
    //     result({ data: { nodoSolidaridadFamilyEliminado } }) {
    //       console.log(`Update de nodo family`);
    //       this.eliminarNodoCache(nodoSolidaridadFamilyEliminado);
    //     },
    //   },
    //   nodosFamilyEliminados: {
    //     query: gql`
    //       subscription ($idNodoParent: ID!) {
    //         nodosSolidaridadFamilyEliminados(idNodoParent: $idNodoParent)
    //       }
    //     `,
    //     variables() {
    //       return {
    //         idNodoParent: this.$route.params.id,
    //       };
    //     },
    //     result({ data: { nodosSolidaridadFamilyEliminados } }) {
    //       console.log(`Retirando nodos eliminados`);
    //       nodosSolidaridadFamilyEliminados.forEach((ns) => {
    //         this.eliminarNodoCache(ns);
    //       });
    //     },
    //   },
    // },
  },
  mixins: [
    MixinEdicionNodoSolidaridad,
    MixinPermisosUsuarioNodoSolidaridad,
    MixinEdicionVinculosNodoSolidaridad,
    MixinVisualesNodosSolidaridad,
  ],
  data() {
    return {
      noSeleccionable: true,
      configuracionDatos,
      esteNodo: {
        responsables: [],
        posiblesResponsables: [],
        responsablesAmplio: [],
        administradores: [],
        recursosExternos: [],
        vinculos: [],
        movimientosDinero: [],
        eventos: [],
      },
      subNodos: [],
      mostrandoOpcionesCrearSubNodo: false,
      mostrando: "responsables",

      idDatoSeleccionado: "administracion",
      datoSeleccionado: null,
      datoVer: "tabla",

      enviandoQueryResponsables: false,

      creandoSubNodo: false,

      idRecursoExternoSeleccionado: null,
      creandoRecursoExterno: false,

      idsNodosEverRendered: [],
      idsNodosEverPassedToFetchMore: [],
    };
  },
  methods: {
    crearNuevoRecursoExterno() {
      this.creandoRecursoExterno = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idNodo: ID!) {
              crearRecursoExternoNodoSolidaridad(idNodo: $idNodo) {
                ...fragRecursoExterno
              }
            }
            ${fragmentoRecursoExterno}
          `,
          variables: {
            idNodo: this.esteNodo.id,
          },
        })
        .then(({ data: { crearRecursoExternoNodoSolidaridad } }) => {
          const store = this.$apollo.provider.defaultClient;
          const cache = store.readQuery({
            query: QUERY_ESTE_NODO,
            variables: {
              idNodo: this.esteNodo.id,
            },
          });

          var nuevoCache = JSON.parse(JSON.stringify(cache));
          var recursosExternos = nuevoCache.nodoSolidaridad.recursosExternos;

          const indexN = recursosExternos.findIndex(
            (re) => re.id === crearRecursoExternoNodoSolidaridad.id
          );
          if (indexN === -1) {
            recursosExternos.push(crearRecursoExternoNodoSolidaridad);
            store.writeQuery({
              query: QUERY_ESTE_NODO,
              variables: {
                idNodo: this.esteNodo.id,
              },
              data: nuevoCache,
            });
          }
          this.creandoRecursoExterno = false;
        })
        .catch((error) => {
          this.creandoRecursoExterno = false;
          console.log(`Error: ${error}`);
        });
    },
    eliminarRecursoExternoCache(idRecursoEliminado) {
      const store = this.$apollo.provider.defaultClient;
      const cache = store.readQuery({
        query: QUERY_ESTE_NODO,
        variables: {
          idNodo: this.esteNodo.id,
        },
      });

      var nuevoCache = JSON.parse(JSON.stringify(cache));
      var recursosExternos = nuevoCache.nodoSolidaridad.recursosExternos;

      const indexN = recursosExternos.findIndex(
        (re) => re.id === idRecursoEliminado
      );
      if (indexN > -1) {
        console.log(`Eliminando de caché`);
        recursosExternos.splice(indexN, 1);
        store.writeQuery({
          query: QUERY_ESTE_NODO,
          variables: {
            idNodo: this.esteNodo.id,
          },
          data: nuevoCache,
        });
      } else {
        console.log(`El recurso externo no estaba en caché`);
      }
    },
    enterNodoToCacheSubnodos(nodo) {
      const idNodo = nodo.id;
      const store = this.$apollo.provider.defaultClient;
      const cache = store.readQuery({
        query: QUERY_NODOS_UNDER,
        variables: {
          idParent: this.esteNodo.id,
        },
      });
      var nuevoCache = JSON.parse(JSON.stringify(cache));
      const indexN = nuevoCache.nodosSolidaridadUnderNodo.findIndex(
        (n) => n.id == idNodo
      );
      if (indexN == -1) {
        console.log(`Pushing nodo to cache`);
        nuevoCache.nodosSolidaridadUnderNodo.push(nodo);
        store.writeQuery({
          query: QUERY_NODOS_UNDER,
          variables: {
            idParent: this.esteNodo.id,
          },
          data: nuevoCache,
        });
      } else {
        console.log(`El nodo ya estaba presente`);
      }
    },
    eliminarNodoCache(idNodo) {
      const store = this.$apollo.provider.defaultClient;
      const cache = store.readQuery({
        query: QUERY_NODOS_UNDER,
        variables: {
          idParent: this.esteNodo.id,
        },
      });
      var nuevoCache = JSON.parse(JSON.stringify(cache));
      const indexN = nuevoCache.nodosSolidaridadUnderNodo.findIndex(
        (n) => n.id == idNodo
      );
      if (indexN > -1) {
        nuevoCache.nodosSolidaridadUnderNodo.splice(indexN, 1);
        store.writeQuery({
          query: QUERY_NODOS_UNDER,
          variables: {
            idParent: this.esteNodo.id,
          },
          data: nuevoCache,
        });
      } else {
        console.log(`El nodo no estaba presente`);
      }
    },
    addIdsToNodosEverRendered(ids) {
      const idsNuevos = ids.filter(
        (id) => !this.idsNodosEverRendered.includes(id)
      );

      this.idsNodosEverRendered = this.idsNodosEverRendered.concat(idsNuevos);
    },
    crearNuevoItemDato() {
      if (!this.idDatoSeleccionado || !this.datoSeleccionado) {
        console.log(`Error con dato seleccionado`);
        return;
      }
    },
    enterMovimientoDineroToCache(nuevoMovimientoDinero) {
      const store = this.$apollo.provider.defaultClient;
      const cache = store.readQuery({
        query: QUERY_ESTE_NODO,
        variables: {
          idNodo: this.$route.params.id,
        },
      });
      var nuevoCache = JSON.parse(JSON.stringify(cache));
      const indexN = nuevoCache.nodoSolidaridad.movimientosDinero.indexOf(
        (g) => g.id == nuevoMovimientoDinero.id
      );
      if (indexN === -1) {
        nuevoCache.nodoSolidaridad.movimientosDinero.push(
          nuevoMovimientoDinero
        );
        store.writeQuery({
          query: QUERY_ESTE_NODO,
          variables: {
            idNodo: this.$route.params.id,
          },
          data: nuevoCache,
        });
      } else {
        console.log(`El movimientoDinero ya estaba presente`);
      }
    },
    afterCrearNodoUnder(nuevoNodo) {
      this.$refs.ventanaLista.addNodoToNodosSolidaridad(nuevoNodo);
    },
    fetchChildrenNodosRendered: debounce(function () {
      console.log(`Fetching nodos children ahead of despliegue`);
      const nodosNeedingFetch = this.subNodos.filter((n) =>
        this.idsNodosNeedingFetchMore.includes(n.id)
      );
      const idsChildren = nodosNeedingFetch.reduce((acc, nn) => {
        return acc.concat(nn.vinculos.map((v) => v.idRef));
      }, []);

      this.$apollo
        .query({
          query: gql`
            query ($idsNodos: [ID!]) {
              nodosSolidaridadByIds(idsNodos: $idsNodos) {
                ...fragNodoSolidaridad
              }
            }
            ${fragmentoNodoSolidaridad}
          `,
          variables: {
            idsNodos: idsChildren,
          },
        })
        .then(({ data: { nodosSolidaridadByIds } }) => {
          this.idsNodosEverPassedToFetchMore = arrayUnique(
            this.idsNodosEverPassedToFetchMore.concat(
              this.idsNodosNeedingFetchMore
            )
          );
          const store = this.$apollo.provider.defaultClient;
          const cache = store.readQuery({
            query: QUERY_NODOS_UNDER,
            variables: {
              idParent: this.$route.params.id,
            },
          });
          var nuevoCache = JSON.parse(JSON.stringify(cache));
          const actualesIds = nuevoCache.nodosSolidaridadUnderNodo.map(
            (ns) => ns.id
          );
          nuevoCache.nodosSolidaridadUnderNodo.push(
            ...nodosSolidaridadByIds.filter(
              (ns) => !actualesIds.includes(ns.id)
            )
          );
          store.writeQuery({
            query: QUERY_NODOS_UNDER,
            variables: {
              idParent: this.$route.params.id,
            },
            data: nuevoCache,
          });
        });
    }, 2000),
  },
  computed: {
    idsNodosNeedingFetchMore() {
      return this.idsNodosEverRendered.filter(
        (i) => !this.idsNodosEverPassedToFetchMore.includes(i)
      );
    },
    indiceNodosUnder() {
      if (!this.subNodos || this.subNodos.length < 1) return {};
      var objetoFinal = {};
      this.subNodos.forEach((nodo) => {
        let idsVinculos = nodo.vinculos
          .filter((v) => v.tipo === "requiere")
          .map((v) => v.idRef);
        let requeridos = this.subNodos
          .filter((n) => idsVinculos.includes(n.id))
          .sort(
            (a, b) => idsVinculos.indexOf(a.id) - idsVinculos.indexOf(b.id)
          );
        let children = requeridos.filter((n) => n.nodoParent === nodo.id);
        objetoFinal[nodo.id] = {
          nodosChildren: children,
          nodosRequeridos: requeridos,
        };
      });
      return objetoFinal;
    },
  },
  watch: {
    mostrando(mostrando) {
      if (mostrando != "descripcion") this.editandoDescripcion = false;
      if (mostrando != "keywords") this.editandoKeywords = false;
    },
    idsNodosNeedingFetchMore(nuevo) {
      if (nuevo.length > 0) {
        this.fetchChildrenNodosRendered();
      }
    },
  },
  mounted() {
    this.montado = true;
    this.$el.scrollIntoView(true);
  },
};

function arrayUnique(array) {
  var a = array.concat();
  for (var i = 0; i < a.length; ++i) {
    for (var j = i + 1; j < a.length; ++j) {
      if (a[i] === a[j]) a.splice(j--, 1);
    }
  }

  return a;
}
</script>
<style>
@import "./estiloDatos.css";
</style>

<style>
@import "../estilosNodoSolidaridad.css";
</style>
<style scoped>
.homeNodo {
  padding: 1% 5vw;
  background-color: #a9d1d1;
  box-sizing: border-box;
  z-index: 1;
}
#barraSuperior {
  display: flex;
  margin-bottom: 20px;
  padding: 20px 0px;
}
#botonIrNodoParent {
  width: 20px;
  height: 20px;
  margin-right: 15px;
}

#zonaTituloNodo {
  display: flex;
  font-size: 24px;
  font-weight: 500;
}
.iconoNodo {
  height: 25px;
  margin-right: 10px;
}
#zonaControlesNodo {
  display: flex;
  margin-left: auto;
}
.bloqueControlNodo {
  margin: 0px 10px;
  font-size: 18px;
}

.botonControlNodo {
  height: 20px;
}
.barraSuperiorGeneral {
  height: 30px;
  padding: 20px 20px;
  display: flex;
}

.botonBarraSuperiorGeneral:not(.botonSelectorContenidoNodo) {
  height: 15px;
  visibility: hidden;
}

.bloqueContenido:hover .botonBarraSuperiorGeneral {
  visibility: visible;
}
.botonBarraSuperiorGeneral > img {
  height: 100%;
}

.tituloBloque {
  font-weight: bold;
  font-size: 14px;
}
.controlesBloque {
  margin-left: auto;
  display: flex;
}
.contenedorBotonesZona {
  display: flex;
  padding: 5px;
}
.zonaInformacion {
  border: 1px solid white;
  border-radius: 20px;
  background-color: rgba(255, 255, 255, 0.342);
  padding: 20px;
  margin: 0px 10px;
}

.botonSelectorContenidoNodo {
  margin: 0px 10px;
}
#inputNuevoDescripcion {
  display: block;
  resize: vertical;
  width: 100%;
  border-radius: 5px;
  background-color: transparent;
}
.contenedorBotonesCampo {
  margin: 5px auto;
  display: flex;
  justify-content: center;
}
.botonGuardarCampo {
  width: 15px;
  margin: 0px 5px;
}
#listaResponsables {
  margin-top: 10px;
  max-height: 33vh;
}
.botonControlZona {
  width: 20px;
  height: 20px;
}

#primeraRow {
  display: flex;
  margin-bottom: 20px;
}

.bloqueContenido {
  box-shadow: 2px 2px 4px 1px rgba(38, 38, 38, 0.38);
  min-width: 100px;
  min-height: 100px;
}
#primeraRow > .bloqueContenido {
  display: grid;
  grid-template-rows: 70px 1fr;
}

#bloqueInformacion {
  box-shadow: none;
  width: 24%;
}
#bloqueInformacion .botonBarraSuperiorGeneral {
  visibility: visible;
}
.iconoPersonaAutonomo {
  position: relative;
  margin: 0px 15px;
  margin-bottom: 60px;
}
#bloqueSubNodos {
  width: 54%;
  margin-left: auto;
  max-height: 550px;
}
.opcionCrear {
  margin: 0px 5px;
}
#bloqueRecursosExternos {
  width: 19%;
  margin-left: 1%;
}
.recursoExternoNodo {
  padding: 1%;
}

@media only screen and (max-width: 950px) {
  .homeNodo {
  }
  #primeraRow {
    flex-direction: column;
    max-height: none;
  }
  #primeraRow > .bloqueContenido {
    width: 100%;
    margin: 0px;
    margin-bottom: 50px;

    max-height: none;
  }

  .bloqueContenido {
    margin-bottom: 50px;
  }
  .botonControlZona {
    width: 22px;
    height: 22px;
  }
}

@media (hover: none) and (pointer: coarse) {
  .botonBarraSuperiorGeneral {
    visibility: visible;
  }
}
</style>