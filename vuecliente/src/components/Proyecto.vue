<template>
  <div class="proyecto">
    <loading texto="Cargando proyecto..." v-show="loading" />
    <template v-if="!loading">
      <div id="zonaNombre" class="zonaPrimerNivel">
        <div class="controlesZona" v-show="usuarioResponsableProyecto">
          <img
            src="@/assets/iconos/editar.png"
            alt="Editar"
            id="bEditarrNombre"
            class="bEditar"
            title="Editar nombre del proyecto"
            @click="toggleEditandoNombre"
          />
          <img
            src="@/assets/iconos/guardar.png"
            alt="Guardar"
            title="guardar"
            class="bGuardar"
            id="bGuardarNuevoNombre"
            v-show="editandoNombre == true && nuevoNombreIlegal == false"
            @click="guardarNuevoNombre"
          />
        </div>
        <div id="nombreProyecto" v-show="!editandoNombre">
          {{ esteProyecto.nombre }}
        </div>
        <input
          type="text"
          id="inputNuevoNombre"
          :class="{ letrasRojas: nuevoNombreIlegal }"
          v-model="nuevoNombre"
          v-show="editandoNombre"
          @keypress.enter="guardarNuevoNombre"
        />
        <loading v-show="enviandoNuevoNombre" texto="Enviando..." />
        <img
          src="@/assets/iconos/foro.png"
          alt="Enlace al foro"
          id="enlaceForo"
          title="Ir al foro de este proyecto"
          @click="navegarAlForo"
        />
      </div>
      <div id="zonaDescripcion" class="zonaPrimerNivel">
        <div class="barraSuperiorZona">
          <div
            class="nombreZona"
            @click="mostrandoDescripcion = !mostrandoDescripcion"
          >
            <div
              class="trianguloBullet"
              :style="{
                transform: mostrandoDescripcion
                  ? 'rotateZ(90deg)'
                  : 'rotateZ(0deg)',
              }"
            ></div>
            Descripcion
          </div>
        </div>
        <div v-show="mostrandoDescripcion">
          <div class="controlesZona" v-if="usuarioResponsableProyecto">
            <img
              src="@/assets/iconos/editar.png"
              alt="Editar"
              id="bEditarrDescripcion"
              class="bEditar"
              title="Editar descripcion del proyecto"
              @click="toggleEditandoDescripcion"
            />
            <img
              src="@/assets/iconos/guardar.png"
              alt="Guardar"
              title="guardar"
              class="bGuardar"
              id="bGuardarNuevoDescripcion"
              v-show="
                editandoDescripcion == true && nuevoDescripcionIlegal == false
              "
              @click="guardarNuevoDescripcion"
            />
          </div>
          <div id="descripcion" ref="descripcion" v-show="!editandoDescripcion">
            {{ esteProyecto.descripcion }}
          </div>

          <textarea
            id="inputNuevoDescripcion"
            ref="inputNuevoDescripcion"
            :class="{ letrasRojas: nuevoDescripcionIlegal }"
            v-model="nuevoDescripcion"
            v-show="editandoDescripcion"
          />
          <loading v-show="enviandoNuevoDescripcion" texto="Enviando..." />
        </div>
      </div>

      <div id="zonaResponsables" class="zonaPrimerNivel">
        <div class="barraSuperiorZona">
          <div
            class="nombreZona"
            @click="mostrandoResponsables = !mostrandoResponsables"
          >
            <div
              class="trianguloBullet"
              :style="{
                transform: mostrandoResponsables
                  ? 'rotateZ(90deg)'
                  : 'rotateZ(0deg)',
              }"
            ></div>
            {{esteProyecto.responsables.length===1?'Coordinador': 'Coordinadores'}}
          </div>
        </div>

        <div v-show="mostrandoResponsables">
          <div id="controlesResponsables" class="controlesZona">
            <loading v-show="enviandoQueryResponsables" texto="Esperando..." />
            <div
              class="controlesResponsables hoverGris botonesControles"
              :class="{ deshabilitado: enviandoQueryResponsables }"
              v-if="
                usuarioLogeado == true && esteProyecto.responsables.length < 1
              "
              id="asumirResponsable"
              @click="asumirComoResponsable"
            >
              Asumir
            </div>
            <div
              class="controlesResponsables hoverGris botonesControles"
              :class="{ deshabilitado: enviandoQueryResponsables }"
              v-if="
                usuarioLogeado == true &&
                usuarioResponsableProyecto &&
                responsablesSolicitados < 1
              "
              id="solicitarResponsable"
              @click="setResponsablesSolicitados(1)"
            >
              Solicitar responsable
            </div>
            <div
              class="controlesResponsables hoverGris botonesControles"
              :class="{ deshabilitado: enviandoQueryResponsables }"
              v-if="
                usuarioLogeado &&
                !usuarioResponsableProyecto &&
                !usuarioPosibleResponsableProyecto &&
                esteProyecto.responsables.length > 0
              "
              id="botonAddResponsable"
              @click="entrarListaPosiblesResponsables"
            >
              Quiero hacerme responsable
            </div>
            <div
              class="controlesResponsables hoverGris botonesControles"
              :class="{ deshabilitado: enviandoQueryResponsables }"
              v-if="
                usuarioLogeado == true &&
                (usuarioResponsableProyecto == true ||
                  usuarioPosibleResponsableProyecto == true)
              "
              @click="abandonarListaResponsables"
            >
              Abandonar
            </div>
            <div
              class="controlesResponsables hoverGris botonesControles"
              :class="{ deshabilitado: enviandoQueryResponsables }"
              v-if="
                usuarioLogeado == true && usuarioResponsableProyecto == true
              "
              v-show="
                idResponsableSeleccionado != null &&
                responsableSeleccionadoEstaAceptado == false
              "
              @click="aceptarResponsable(idResponsableSeleccionado)"
            >
              Aceptar como responsable
            </div>
          </div>
          <div id="listaResponsables">
            <icono-persona-autonomo
              :idPersona="idPersona"
              :key="idPersona"
              v-for="idPersona of esteProyecto.responsables"
              :seleccionado="idResponsableSeleccionado == idPersona"
              @click.native.stop="
                idResponsableSeleccionado = idPersona;
                responsableSeleccionadoEstaAceptado = true;
              "
            />

            <icono-persona-autonomo
              class="personaPosibleResponsable"
              :idPersona="idPersona"
              :key="idPersona"
              v-for="idPersona of esteProyecto.posiblesResponsables"
              v-show="usuarioResponsableProyecto || usuario.id === idPersona"
              :seleccionado="idResponsableSeleccionado == idPersona"
              @click.native.stop="
                idResponsableSeleccionado = idPersona;
                responsableSeleccionadoEstaAceptado = false;
              "
              @dblclick.native.shift="aceptarResponsable(idPersona)"
            />

            <div
              class="iconoResponsablesSolicitados"
              v-show="responsablesSolicitados > 0"
            >
              <img
                src="@/assets/iconos/user.png"
                alt="Usuario solicitado"
                class="imagenResponsablesSolicitados"
                title="Personas adicionales solicitadas"
              />

              <input
                type="number"
                id="inputResponsablesSolicitados"
                v-model="responsablesSolicitados"
                :readonly="usuarioResponsableProyecto ? false : true"
                :style="[
                  {
                    backgroundColor:
                      esteProyecto.responsablesSolicitados !=
                      responsablesSolicitados
                        ? 'orange'
                        : 'white',
                  },
                ]"
              />
            </div>
          </div>
        </div>
      </div>

      <div id="zonaParticipantes" class="zonaPrimerNivel">
        <div class="barraSuperiorZona">
          <div
            class="nombreZona"
            @click="mostrandoParticipantes = !mostrandoParticipantes"
          >
            <div
              class="trianguloBullet"
              :style="{
                transform: mostrandoParticipantes
                  ? 'rotateZ(90deg)'
                  : 'rotateZ(0deg)',
              }"
            ></div>
            {{esteProyecto.participantes.length===1?'Participante': 'Participantes'}}
          </div>
        </div>

        <div v-show="mostrandoParticipantes">
          <div id="controlesParticipantes" class="controlesZona">
            <loading v-show="enviandoQueryParticipantes" texto="Esperando..." />            
            <div
              class="controlesParticipantes hoverGris botonesControles"
              :class="{ deshabilitado: enviandoQueryParticipantes }"
              v-if="
                usuarioLogeado == true &&
                !usuarioParticipanteProyecto &&
                !usuarioResponsableProyecto               
              "              
              @click="entrarListaParticipantes()"
            >
              Participar
            </div>
            <div
              class="controlesParticipantes hoverGris botonesControles"
              :class="{ deshabilitado: enviandoQueryParticipantes }"
              v-if="
                usuarioLogeado == true &&
                usuarioParticipanteProyecto                
              "              
              @click="abandonarListaParticipantes()"
            >
              Abandonar
            </div>            
          </div>
          <div id="listaParticipantes">
            <icono-persona-autonomo
              :idPersona="idPersona"
              :key="'participante'+idPersona"
              v-for="idPersona of esteProyecto.participantes"
              :seleccionado="idParticipanteSeleccionado == idPersona"
              @click.native.stop="
                idParticipanteSeleccionado = idPersona;
                participanteSeleccionadoEstaAceptado = true;
              "
            />            
          </div>
        </div>
      </div>

      <div id="zonaEventos" class="zonaPrimerNivel">
        <div class="barraSuperiorZona">
          <div
            class="nombreZona"
            @click="mostrandoEventos = !mostrandoEventos"
          >
            <div
              class="trianguloBullet"
              :style="{
                transform: mostrandoEventos
                  ? 'rotateZ(90deg)'
                  : 'rotateZ(0deg)',
              }"
            ></div>
            Eventos
          </div>
        </div>
        <div v-show="mostrandoEventos">
          <div id="controlesEventos" class="controlesZona">
                               
          </div>  

          <calendario :configCalendario="{tipo:'club', id: esteProyecto.id}" />    
        </div>
        

      </div>

<!-- 
      <div id="zonaBienesServicios" class="zonaPrimerNivel">
        <div class="barraSuperiorZona">
          <div
            class="nombreZona"
            @click="mostrandoBienesServicios = !mostrandoBienesServicios"
          >
            <div
              class="trianguloBullet"
              :style="{
                transform: mostrandoBienesServicios
                  ? 'rotateZ(90deg)'
                  : 'rotateZ(0deg)',
              }"
            ></div>
            Bienes y servicios
          </div>
        </div>
        <div v-show="mostrandoBienesServicios">
          <div id="controlesBienesServicios" class="controlesZona">
            <loading
              v-show="enviandoQueryBienesServicios"
              texto="Esperando..."
            />
            <div
              class="controlesResponsables hoverGris botonesControles"              
              v-if="usuarioLogeado && usuarioResponsableProyecto"
              id="botonAdministrarBienesServicios"
              @click="administrandoBienesServicios=!administrandoBienesServicios"
            >
              {{administrandoBienesServicios?'Vista normal':'Vista administrador'}}
            </div>
            <div
              class="controlesResponsables hoverGris botonesControles"
              :class="{ deshabilitado: enviandoQueryBienesServicios }"
              v-if="usuarioLogeado && usuarioResponsableProyecto && administrandoBienesServicios"
              id="botonCrearProductoRepartir"
              @click="crearProductoRepartir"
            >
              Crear producto para repartir
            </div>
            
          </div>

          <div
            id="listaBienesServicios"
            v-show="
              esteProyecto.bienes.length > 0 ||
              esteProyecto.servicios.length > 0
            "
          >
            <bien-repartir-admin
              :idProyecto="esteProyecto.id"
              :esteBien="bien"
              v-for="bien of esteProyecto.bienes"
              :key="bien.id"
              v-show="administrandoBienesServicios"
              @meElimine="eliminarBienDeCache(bien.id)"
            />

            <bien-ofrecido v-for="bien of esteProyecto.bienes" :key="'bienOfrecido'+bien.id"
            :esteBien="bien" :idProyecto="esteProyecto.id"
            v-show="!administrandoBienesServicios"
            @nuevaPeticionCreada="addPeticionBienCache($event, bien.id)"

            />
          </div>
        </div>
      </div> -->

      <div
        id="zonaDiagramaFlujo"
        class="zonaPrimerNivel"
        ref="zonaDiagramaFlujo"
      >
        <div class="barraSuperiorZona">
          <div
            class="nombreZona"
            @click="mostrandoDiagramaFlujo = !mostrandoDiagramaFlujo"
          >
            <div
              class="trianguloBullet"
              :style="{
                transform: mostrandoDiagramaFlujo
                  ? 'rotateZ(90deg)'
                  : 'rotateZ(0deg)',
              }"
            ></div>
            Diagrama de flujo
          </div>
        </div>
        <div id="controlesObjetivos" class="controlesZona"></div>
        <diagrama-flujo
          :idProyecto="esteProyecto.id"
          :objetivos="esteProyecto.objetivos"
          :trabajos="esteProyecto.trabajos"
          :usuarioResponsableProyecto="usuarioResponsableProyecto"
          :activo="idNodoAbierto == null"
          :deshabilitar="realizandoOperacionDiagrama"
          v-if="mostrandoDiagramaFlujo"
          @crearTrabajoEnPosicion="crearNuevoTrabajo"
          @crearObjetivoEnPosicion="crearNuevoObjetivo"
          @nodoAbierto="abrirNodo"
          @click.native="idNodoAbierto = null"
        />
        
      </div>
      <div id="zonaForo" ref="zonaForo" class="zonaPrimerNivel">
        <div class="barraSuperiorZona">
          <div class="nombreZona" @click="mostrandoForo = !mostrandoForo">
            <div
              class="trianguloBullet"
              :style="{
                transform: mostrandoForo ? 'rotateZ(90deg)' : 'rotateZ(0deg)',
              }"
            ></div>
            foro
          </div>
        </div>
        <foro
          :parent="infoAsParent"
          :idForo="esteProyecto.idForo"
          v-if="usuarioResponsableProyecto || usuarioParticipanteProyecto"
          v-show="mostrandoForo"
        />
      </div>
    </template>
  </div>
</template>

<script>
import gql from "graphql-tag";
import {
  fragmentoObjetivoProyecto,
  // fragmentoBienProyecto,
  fragmentoProyecto,
  // fragmentoObjetivoProyecto,
  fragmentoTrabajoProyecto
} from "./utilidades/recursosGql";
import Loading from "./utilidades/Loading.vue";
import Foro from "./Foro.vue";
import IconoPersonaAutonomo from "./usuario/IconoPersonaAutonomo.vue";
import DiagramaFlujo from "./proyecto/DiagramaFlujo.vue";
import debounce from "debounce";
import Calendario from "./utilidades/Calendario.vue"
// import BienRepartirAdmin from "./proyecto/BienRepartirAdmin.vue";
// import BienOfrecido from "./proyecto/BienOfrecido.vue";


const QUERY_PROYECTO = gql`
  query ($idProyecto: ID!) {
    proyecto(idProyecto: $idProyecto) {
      ...fragProyecto
    }
  }
  ${fragmentoProyecto}
`;
const charProhibidosNombreProyecto = /[^ a-zA-ZÀ-ž0-9_():.,-]/;
const charProhibidosDescripcionProyecto = /[^\n\r a-zA-ZÀ-ž0-9_():;.,+¡!¿?@=-]/;

export default {
  components: {    
    Loading,
    Foro,
    IconoPersonaAutonomo,
    DiagramaFlujo,
    Calendario
    // BienRepartirAdmin,
    // BienOfrecido,
  },
  name: "proyecto",
  apollo: {
    esteProyecto: {
      query: QUERY_PROYECTO,
      variables() {
        return {
          idProyecto: this.$route.params.idProyecto,
        };
      },
      update(respuesta) {
        this.loading = false;
        this.responsablesSolicitados =
          respuesta.proyecto.responsablesSolicitados;
        return respuesta.proyecto;
      },
      fetchPolicy: "cache-and-network",
    },
  },
  data() {
    return {
      loading: true,

      esteProyecto: {
        responsables: [],      
        posiblesResponsables: [],
        participantes: [],
        trabajos:[],
        objetivos:[],        
      },
      responsablesSolicitados: 0,
      idResponsableSeleccionado: null,
      idParticipanteSeleccionado:null,
      responsableSeleccionadoEstaAceptado: false,

      creandoTrabajo: false,
      creandoObjetivo: false,

      idTrabajoSeleccionado: null,
      idObjetivoSeleccionado: null,

      nuevoNombre: "Nuevo nombre",
      editandoNombre: false,
      enviandoNuevoNombre: false,

      nuevoDescripcion: "Nueva descripcion",
      editandoDescripcion: false,
      enviandoNuevoDescripcion: false,
      enviandoQueryResponsables: false,
      enviandoQueryBienesServicios: false,
      enviandoQueryParticipantes:false,
      enviandoQueryEventos:false,

      idNodoAbierto: null,

      mostrandoDescripcion: true,
      mostrandoResponsables: true,
      mostrandoParticipantes:true,
      mostrandoEventos:true,
      mostrandoDiagramaFlujo: false,
      mostrandoForo: true,
      mostrandoBienesServicios: false,
      administrandoBienesServicios:false,


    };
  },
  computed: {
    usuarioResponsableProyecto: function () {
      if (!this.esteProyecto.responsables) return false;

      if (
        this.esteProyecto.responsables.includes(this.$store.state.usuario.id)
      ) {
        return true;
      }
      return false;
    },
    usuarioParticipanteProyecto: function () {
      if (!this.esteProyecto.participantes) return false;

      if (
        this.esteProyecto.participantes.includes(this.$store.state.usuario.id)
      ) {
        return true;
      }
      return false;
    },
    usuarioPosibleResponsableProyecto: function () {
      if (!this.esteProyecto.posiblesResponsables) return false;

      if (this.esteProyecto.posiblesResponsables.includes(this.usuario.id)) {
        return true;
      }
      return false;
    },
    permisosEdicion: function () {
      if (
        this.usuarioResponsableProyecto ||
        this.$store.state.usuario.permisos == "superadministrador"
      ) {
        return true;
      }
      return false;
    },
    nuevoNombreIlegal() {
      if (!this.nuevoNombre || this.nuevoNombre.length < 1) {
        return true;
      }
      if (charProhibidosNombreProyecto.test(this.nuevoNombre)) {
        return true;
      }
      return false;
    },
    nuevoDescripcionIlegal() {
      if (!this.nuevoDescripcion || this.nuevoDescripcion.length < 1) {
        return true;
      }
      if (charProhibidosDescripcionProyecto.test(this.nuevoDescripcion)) {
        return true;
      }
      return false;
    },
    infoAsParent() {
      return {
        id: this.esteProyecto.id,
        tipo: "proyecto",
        nombre: this.esteProyecto.nombre,
      };
    },
    realizandoOperacionDiagrama() {
      return this.creandoTrabajo || this.creandoObjetivo;
    },
    
  },
  methods: {
    guardarNuevoNombre() {
      if (this.nuevoNombreIlegal) {
        console.log(`No enviado`);
        return;
      }
      if (this.nuevoNombre == this.esteProyecto.nombre) {
        this.editandoNombre = false;
        return;
      }
      console.log(`guardando nuevo nombre`);
      this.enviandoNuevoNombre = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idProyecto: ID!, $nuevoNombre: String!) {
              editarNombreProyecto(
                idProyecto: $idProyecto
                nuevoNombre: $nuevoNombre
              ) {
                id
                nombre
              }
            }
          `,
          variables: {
            idProyecto: this.esteProyecto.id,
            nuevoNombre: this.nuevoNombre,
          },
        })
        .then(() => {
          this.enviandoNuevoNombre = false;
          this.editandoNombre = false;
        })
        .catch((error) => {
          this.enviandoNuevoNombre = false;
          console.log(`Error. E :${error}`);
        });
    },
    guardarNuevoDescripcion() {
      if (this.nuevoDescripcionIlegal) {
        console.log(`No enviado`);
        return;
      }
      if (this.nuevoDescripcion == this.esteProyecto.descripcion) {
        this.editandoDescripcion = false;
        return;
      }
      console.log(`guardando nuevo descripcion`);
      this.enviandoNuevoDescripcion = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idProyecto: ID!, $nuevoDescripcion: String!) {
              editarDescripcionProyecto(
                idProyecto: $idProyecto
                nuevoDescripcion: $nuevoDescripcion
              ) {
                id
                descripcion
              }
            }
          `,
          variables: {
            idProyecto: this.esteProyecto.id,
            nuevoDescripcion: this.nuevoDescripcion,
          },
        })
        .then(() => {
          this.enviandoNuevoDescripcion = false;
          this.editandoDescripcion = false;
        })
        .catch((error) => {
          this.enviandoNuevoDescripcion = false;
          console.log(`Error. E :${error}`);
        });
    },
    toggleEditandoNombre() {
      this.editandoNombre = !this.editandoNombre;
      this.nuevoNombre = this.esteProyecto.nombre;
    },
    toggleEditandoDescripcion() {
      this.$refs.inputNuevoDescripcion.style.height =
        this.$refs.descripcion.offsetHeight + "px";
      this.editandoDescripcion = !this.editandoDescripcion;
      this.nuevoDescripcion = this.esteProyecto.descripcion;
    },
    abandonarListaResponsables() {
      console.log(`Abandonando la responsabilidad en este proyecto`);
      this.enviandoQueryResponsables = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idProyecto: ID!, $idUsuario: ID!) {
              removeResponsableProyecto(
                idProyecto: $idProyecto
                idUsuario: $idUsuario
              ) {
                id
                responsables
                posiblesResponsables
              }
            }
          `,
          variables: {
            idProyecto: this.esteProyecto.id,
            idUsuario: this.usuario.id,
          },
        })
        .then(() => {
          this.enviandoQueryResponsables = false;
        })
        .catch((error) => {
          this.enviandoQueryResponsables = false;
          console.log("error: " + error);
        });
    },
    aceptarResponsable(idPosibleResponsable) {
      console.log(
        `aceptando como responsable al usuario ${idPosibleResponsable}`
      );
      this.enviandoQueryResponsables = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idProyecto: ID!, $idUsuario: ID!) {
              addResponsableProyecto(
                idProyecto: $idProyecto
                idUsuario: $idUsuario
              ) {
                id
                responsables
                posiblesResponsables
                responsablesSolicitados
              }
            }
          `,
          variables: {
            idProyecto: this.esteProyecto.id,
            idUsuario: idPosibleResponsable,
          },
        })
        .then(() => {
          this.enviandoQueryResponsables = false;
          this.responsableSeleccionadoEstaAceptado = true;
        })
        .catch((error) => {
          this.enviandoQueryResponsables = false;
          console.log("error: " + error);
        });
    },
    entrarListaPosiblesResponsables() {
      console.log(
        `Enviando peticion de entrar a la lista de posibles responsables del proyecto con id ${this.esteProyecto.id}`
      );
      this.enviandoQueryResponsables = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idProyecto: ID!, $idUsuario: ID!) {
              addPosibleResponsableProyecto(
                idProyecto: $idProyecto
                idUsuario: $idUsuario
              ) {
                id
                posiblesResponsables
              }
            }
          `,
          variables: {
            idProyecto: this.esteProyecto.id,
            idUsuario: this.$store.state.usuario.id,
          },
        })
        .then(() => {
          this.enviandoQueryResponsables = false;
        })
        .catch((error) => {
          this.enviandoQueryResponsables = false;
          console.log("error: " + error);
        });
    },
    asumirComoResponsable() {
      console.log(
        `enviando id ${this.$store.state.usuario.id} para la lista de responsables del proyecto con id ${this.esteProyecto.id}`
      );
      this.enviandoQueryResponsables = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idProyecto: ID!, $idUsuario: ID!) {
              addResponsableProyecto(
                idProyecto: $idProyecto
                idUsuario: $idUsuario
              ) {
                id
                responsables
                posiblesResponsables
              }
            }
          `,
          variables: {
            idProyecto: this.esteProyecto.id,
            idUsuario: this.$store.state.usuario.id,
          },
        })
        .then(() => {
          this.enviandoQueryResponsables = false;
        })
        .catch((error) => {
          this.enviandoQueryResponsables = false;
          console.log("error: " + error);
        });
    },   
    entrarListaParticipantes() {
      console.log(
        `Enviando peticion de entrar a la lista de participantes del proyecto con id ${this.esteProyecto.id}`
      );
      this.enviandoQueryParticipantes = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idProyecto: ID!, $idUsuario: ID!) {
              addParticipanteProyecto(
                idProyecto: $idProyecto
                idUsuario: $idUsuario
              ) {
                id
                participantes
              }
            }
          `,
          variables: {
            idProyecto: this.esteProyecto.id,
            idUsuario: this.$store.state.usuario.id,
          },
        })
        .then(() => {
          this.enviandoQueryParticipantes = false;
        })
        .catch((error) => {
          this.enviandoQueryParticipantes = false;
          console.log("error: " + error);
        });
    }, 
    abandonarListaParticipantes() {
      console.log(`Abandonando la participación en este proyecto`);
      this.enviandoQueryParticipantes = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idProyecto: ID!, $idUsuario: ID!) {
              removeParticipanteProyecto(
                idProyecto: $idProyecto
                idUsuario: $idUsuario
              ) {
                id
                participantes                
              }
            }
          `,
          variables: {
            idProyecto: this.esteProyecto.id,
            idUsuario: this.usuario.id,
          },
        })
        .then(() => {
          this.enviandoQueryParticipantes = false;
        })
        .catch((error) => {
          this.enviandoQueryParticipantes = false;
          console.log("error: " + error);
        });
    },
    crearNuevoTrabajo(posicion) {
      console.log(`enviando mutacion de crear nuevo trabajo`);
      this.creandoTrabajo = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idProyecto: ID!, $posicion: CoordsInput) {
              crearTrabajoEnProyecto(
                idProyecto: $idProyecto
                posicion: $posicion
              ){
                ...fragTrabajoProyecto
              }
            }
            ${fragmentoTrabajoProyecto}
          `,
          variables: {
            idProyecto: this.esteProyecto.id,
            posicion,
          },
          update: (store, { data: { crearTrabajoEnProyecto } }) => {
            console.log(`respuesta: ${JSON.stringify(crearTrabajoEnProyecto)}`);
            const nuevoTrabajo = crearTrabajoEnProyecto;
            try {
              const cache = store.readQuery({
                query: QUERY_PROYECTO,
                variables: { idProyecto: this.esteProyecto.id },
              });
              console.log(
                `Trabajos en cache: ${cache.proyecto.trabajos.length}`
              );
              const nuevoCache = JSON.parse(JSON.stringify(cache));
              nuevoCache.proyecto.trabajos.push(nuevoTrabajo);

              store.writeQuery({
                query: QUERY_PROYECTO,
                variables: { idProyecto: this.esteProyecto.id },
                data: nuevoCache,
              });
              console.log(`cache actualizado`);
              console.log(
                `Trabajos en cache: ${nuevoCache.proyecto.trabajos.length}`
              );
            } catch (error) {
              console.log(`Error actualizando cache: ${error}`);
              return;
            }
          },
        })
        .then(() => {
          this.creandoTrabajo = false;
        })
        .catch((error) => {
          this.creandoTrabajo = false;
          console.log(`error: ${error}`);
        });
    },
    crearNuevoObjetivo(posicion) {
      console.log(`enviando mutacion de crear nuevo objetivo`);
      this.creandoObjetivo = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idProyecto: ID!, $posicion: CoordsInput) {
              crearObjetivoEnProyecto(
                idProyecto: $idProyecto
                posicion: $posicion
              ) {
                ...fragObjetivoProyecto
              }
            }
            ${fragmentoObjetivoProyecto}
          `,
          variables: {
            idProyecto: this.esteProyecto.id,
            posicion,
          },
          update: (store, { data: { crearObjetivoEnProyecto } }) => {
            console.log(
              `respuesta: ${JSON.stringify(
                JSON.stringify(crearObjetivoEnProyecto)
              )}`
            );
            const nuevoObjetivo = crearObjetivoEnProyecto;
            try {
              const cache = store.readQuery({
                query: QUERY_PROYECTO,
                variables: { idProyecto: this.esteProyecto.id },
              });

              var nuevoCache = JSON.parse(JSON.stringify(cache));
              nuevoCache.proyecto.objetivos.push(nuevoObjetivo);

              store.writeQuery({
                query: QUERY_PROYECTO,
                variables: { idProyecto: this.esteProyecto.id },
                data: nuevoCache,
              });
              console.log(`cache actualizado`);
            } catch (error) {
              console.log(`Error actualizando cache: ${error}`);
              return;
            }
          },
        })
        .then((respuesta) => {
          console.log(`respuesta. ${respuesta}`);
          this.creandoObjetivo = false;
        })
        .catch((error) => {
          this.creandoObjetivo = false;
          console.log(`error: ${error}`);
        });
    },
    // crearProductoRepartir() {
    //   console.log(`Creando producto para repartir...`);
    //   this.enviandoQueryBienesServicios = true;

    //   this.$apollo
    //     .mutate({
    //       mutation: gql`
    //         mutation ($idProyecto: ID!) {
    //           crearBienRepartirVacioProyecto(idProyecto: $idProyecto) {
    //             ...fragBienProyecto
    //           }
    //         }
    //         ${fragmentoBienProyecto}
    //       `,
    //       variables: {
    //         idProyecto: this.esteProyecto.id,
    //       },
    //     })
    //     .then(({ data: { crearBienRepartirVacioProyecto } }) => {
    //       this.enviandoQueryBienesServicios = false;
    //       const store = this.$apollo.provider.defaultClient;
    //       const cache = store.readQuery({
    //         query: QUERY_PROYECTO,
    //         variables: {
    //           idProyecto: this.esteProyecto.id,
    //         },
    //       });
    //       const iBien = cache.proyecto.bienes.findIndex(
    //         (b) => b.id == crearBienRepartirVacioProyecto.id
    //       );
    //       if (iBien > -1) {
    //         console.log(`El bien ya estaba en caché`);
    //       } else {
    //         var nuevoCache = JSON.parse(JSON.stringify(cache));
    //         nuevoCache.proyecto.bienes.push(crearBienRepartirVacioProyecto);
    //         store.writeQuery({
    //           query: QUERY_PROYECTO,
    //           variables: {
    //             idProyecto: this.esteProyecto.id,
    //           },
    //           data: nuevoCache,
    //         });
    //       }
    //     })
    //     .catch((error) => {
    //       console.log(`Error: ${error}`);
    //       this.enviandoQueryBienesServicios = false;
    //     });
    // },
    eliminarTrabajoDeCache(idTrabajo) {
      const store = this.$apollo.provider.defaultClient;
      const cache = store.readQuery({
        query: QUERY_PROYECTO,
        variables: {
          idProyecto: this.esteProyecto.id,
        },
      });
      var nuevoCache = JSON.parse(JSON.stringify(cache));
      let indexT = nuevoCache.proyecto.trabajos.indexOf(idTrabajo);
      if (indexT > -1) {
        nuevoCache.proyecto.idsTrabajos.splice(indexT, 1);
      } else {
        console.log(`El trabajo no existía en el proyecto`);
      }
      store.writeQuery({
        query: QUERY_PROYECTO,
        variables: {
          idProyecto: this.esteProyecto.id,
        },
        data: nuevoCache,
      });
    },
    eliminarObjetivoDeCache(idObjetivo) {
      const store = this.$apollo.provider.defaultClient;
      const cache = store.readQuery({
        query: QUERY_PROYECTO,
        variables: {
          idProyecto: this.esteProyecto.id,
        },
      });
      var nuevoCache = JSON.parse(JSON.stringify(cache));
      let indexT = nuevoCache.proyecto.objetivos.findIndex(
        (t) => t.id == idObjetivo
      );
      if (indexT > -1) {
        nuevoCache.proyecto.objetivos.splice(indexT, 1);
      } else {
        console.log(`El objetivo no existía en el proyecto`);
      }
      store.writeQuery({
        query: QUERY_PROYECTO,
        variables: {
          idProyecto: this.esteProyecto.id,
        },
        data: nuevoCache,
      });
    },
    // eliminarBienDeCache(idBien) {
    //   const store = this.$apollo.provider.defaultClient;
    //   const cache = store.readQuery({
    //     query: QUERY_PROYECTO,
    //     variables: {
    //       idProyecto: this.esteProyecto.id,
    //     },
    //   });
    //   var nuevoCache = JSON.parse(JSON.stringify(cache));
    //   let indexB = nuevoCache.proyecto.bienes.findIndex((b) => b.id == idBien);
    //   if (indexB > -1) {
    //     nuevoCache.proyecto.bienes.splice(indexB, 1);
    //   } else {
    //     console.log(`El bien no existía en el proyecto`);
    //   }
    //   store.writeQuery({
    //     query: QUERY_PROYECTO,
    //     variables: {
    //       idProyecto: this.esteProyecto.id,
    //     },
    //     data: nuevoCache,
    //   });
    // },
    // addPeticionBienCache(nuevaPeticion, idBien){
    //   console.log(`Introduciendo la peticion ${JSON.stringify(nuevaPeticion)} en el cache para el bien ${idBien}`);
    //   const store = this.$apollo.provider.defaultClient;
    //   const cache = store.readQuery({
    //     query: QUERY_PROYECTO,
    //     variables: {
    //       idProyecto: this.esteProyecto.id,
    //     },
    //   });
    //   var nuevoCache = JSON.parse(JSON.stringify(cache));
    //   var elBien=nuevoCache.proyecto.bienes.find(b=>b.id==idBien)
    //   if(!elBien){
    //     console.log(`Tratando de introducir una nueva peticion en un bien que no estaba en el caché`);
    //     return
    //   }    

    //   const indexP = elBien.listaPeticiones.findIndex((b) => b.idBeneficiario == nuevaPeticion.idBeneficiario);
    //   if (indexP > -1) {        
    //     elBien.listaPeticiones.splice(indexP, 1);
    //   } 
    //   if(nuevaPeticion.cantidadSolicitada>0){
    //     elBien.listaPeticiones.push(nuevaPeticion);
    //   }
    //   store.writeQuery({
    //     query: QUERY_PROYECTO,
    //     variables: {
    //       idProyecto: this.esteProyecto.id,
    //     },
    //     data: nuevoCache,
    //   });
    // },
    navegarAlForo() {
      console.log(`Navegando al foro de este proyecto`);
      this.$refs.zonaForo.scrollIntoView();
    },
    abrirNodo(idNodo) {
      console.log(`Abriendo nodo ${idNodo}`);
      this.idNodoAbierto = idNodo;
    },
    debounceSetResponsablesSolicitados: debounce(function () {
      this.setResponsablesSolicitados(parseInt(this.responsablesSolicitados));
    }, 2000),
    setResponsablesSolicitados(cantidad) {
      if (cantidad < 0) cantidad = 0;

      this.$apollo
        .mutate({
          mutation: gql`
            mutation (
              $idProyecto: ID!
              $nuevoCantidadResponsablesSolicitados: Int!
            ) {
              setResponsablesSolicitadosProyecto(
                idProyecto: $idProyecto
                nuevoCantidadResponsablesSolicitados: $nuevoCantidadResponsablesSolicitados
              ) {
                id
                responsablesSolicitados
              }
            }
          `,
          variables: {
            idProyecto: this.esteProyecto.id,
            nuevoCantidadResponsablesSolicitados: cantidad,
          },
        })
        .then(() => {})
        .catch((error) => {
          console.log(`Error: ${error}`);
        });
    },
  },
  watch: {
    responsablesSolicitados(nuevo) {
      if (nuevo === this.esteProyecto.responsablesSolicitados) return;
      console.log(`Cambio en responsables solicitados`);
      this.debounceSetResponsablesSolicitados();
    },
  },  
};
</script>

<style scoped>
.proyecto {
  margin: 5px auto;
  width: min(93%, 1300px);
  padding: 5px 20px;
  padding-bottom: 300px;
}

#nombreProyecto {
  margin-top: 15px;
  font-size: 23px;
  font-weight: bolder;
  text-align: center;
  margin-bottom: 15px;
}

#inputNuevoNombre {
  font-size: 23px;
  display: block;
  margin: 10px auto;
}
#enlaceForo {
  display: block;
  margin: 10px auto;
  cursor: pointer;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  padding: 5px;
}
#enlaceForo:hover {
  background-color: rgb(197, 197, 197);
}
#descripcion {
  font-size: 19px;
  width: 95%;
  margin: 10px auto;
  padding: 10px;
  min-height: 100px;
  resize: vertical;
  border: none;
  background-color: transparent;
  white-space: pre-wrap;
}

#inputNuevoDescripcion {
  width: 95%;
  font-size: 19px;
  height: 70px;
  display: block;
  margin: 10px auto;
  resize: vertical;
}

.bEditar {
  width: 30px;
  height: 30px;
  border-radius: 50%;

  cursor: pointer;
}
.bEditar:hover {
  background-color: rgb(209, 209, 209);
}
.bGuardar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
}
.bGuardar:hover {
  background-color: rgb(209, 209, 209);
}
#zonaResponsables {
  align-items: center;
}
.zonaPrimerNivel {
  border: 2px solid black;
  position: relative;
  min-height: 10px;
}

#listaTrabajos {
  padding: 10px 25px;
}
.iconoTrabajo {
  margin-bottom: 30px;
}
.opacar {
  opacity: 0.3;
}
#listaObjetivos {
  padding: 10px 25px;
}
.iconoObjetivo {
  margin-bottom: 30px;
}
.controlesZona {
  display: flex;
  font-size: 13px;
  flex-direction: row-reverse;
}
.botonesControles {
  padding: 3px 5px;
  cursor: pointer;
}
.barraSuperiorZona {
  display: flex;
  background-color: teal;
}
.nombreZona {
  font-size: 18px;
  padding: 3px 5px;
  cursor: pointer;
}
#listaResponsables {
  display: flex;
  padding: 10px 20px;
  padding-bottom: 65px;
}
.iconoPersonaAutonomo {
  margin-right: 20px;
  margin-left: 15px;
  vertical-align: middle;
  margin-top: 5px;
  margin-bottom: 55px;
}
.personaPosibleResponsable {
  opacity: 0.5;
}
.iconoResponsablesSolicitados {
  width: 80px;
  height: 80px;
  border-radius: 50%;
}
#inputResponsablesSolicitados {
  height: 20px;
  width: 40px;
  margin: 5px auto;
  display: block;
}
.imagenResponsablesSolicitados {
  width: 100%;
  height: 100%;
}
#zonaDiagramaFlujo {
  position: relative;
  overflow: hidden;
  user-select: none;
  min-height: 0px;
}
.ventanaNodo {
  width: min(450px, 90%);
  height: min(800px, 90%);
  left: 4%;
  top: 5%;
  position: absolute;
  overflow-y: scroll;
  box-sizing: border-box;
}

.trianguloBullet {
  border: 10px solid transparent;
  border-left: 10px solid black;
  display: inline-block;
  margin-right: 10px;
  margin-left: 10px;
  transform-origin: left center;
  transition: transform 0.2s;
}
</style>