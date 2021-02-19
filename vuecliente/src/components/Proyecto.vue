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
        <div class="nombreZona">Descripcion</div>
        <div class="controlesZona" v-show="usuarioResponsableProyecto">
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

        <!-- <textarea
        id="descripcion"
        readonly
        :value="esteProyecto.descripcion"
        v-show="!editandoDescripcion"
      /> -->
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
      <div id="zonaResponsables" class="zonaPrimerNivel">
        <div class="nombreZona">Responsables</div>
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
            v-if="usuarioLogeado == true && usuarioResponsableProyecto == true"
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
            :seleccionado="idResponsableSeleccionado == idPersona"
            @click.native.stop="
              idResponsableSeleccionado = idPersona;
              responsableSeleccionadoEstaAceptado = false;
            "
            @dblclick.native.shift="aceptarResponsable(idPersona)"
          />
        </div>
      </div>

      <div id="zonaDiagramaFlujo" class="zonaPrimerNivel" ref="zonaDiagramaFlujo">
        <div class="nombreZona">Diagrama de flujo</div>
        <div id="controlesObjetivos" class="controlesZona">          
        </div>
        <diagrama-flujo
          :idProyecto="esteProyecto.id"
          :objetivos="esteProyecto.objetivos"
          :idsTrabajos="esteProyecto.idsTrabajos"
          :usuarioResponsableProyecto="usuarioResponsableProyecto"
          :activo="idNodoAbierto==null"
          @crearTrabajoEnPosicion="crearNuevoTrabajo"
          @crearObjetivoEnPosicion="crearNuevoObjetivo"
          @nodoAbierto="abrirNodo"
          @click.native="idNodoAbierto=null"
        />
        <iconoObjetivo
          class="ventanaNodo"
          v-for="objetivo of esteProyecto.objetivos"
          :key="objetivo.id"
          :idProyecto="esteProyecto.id"
          :esteObjetivo="objetivo"
          v-show="idNodoAbierto == objetivo.id"
          :usuarioResponsableProyecto="usuarioResponsableProyecto"
          @meElimine="eliminarObjetivoDeCache(objetivo.id)"
        />

        <iconoTrabajo
          class="ventanaNodo"
          v-for="idTrabajo of esteProyecto.idsTrabajos"
          v-show="idNodoAbierto == idTrabajo"
          :key="idTrabajo"
          :idTrabajo="idTrabajo"
          :idProyecto="esteProyecto.id"
          :usuarioResponsableProyecto="usuarioResponsableProyecto"
          @meElimine="eliminarTrabajoDeCache(idTrabajo)"
        />
      </div>

      <!-- <div id="zonaObjetivos" class="zonaPrimerNivel">
        <div class="nombreZona">Objetivos</div>
        <div id="controlesObjetivos" class="controlesZona">
          <div
            class="controlesObjetivos botonesControles hoverGris"
            v-if="usuarioResponsableProyecto"
            @click="crearNuevoObjetivo"
          >
            Crear objetivo
          </div>
        </div>
        <div id="listaObjetivos" @click.self="idObjetivoSeleccionado = null">
          <iconoObjetivo
            v-for="objetivo of esteProyecto.objetivos"
            :key="objetivo.id"
            :idProyecto="esteProyecto.id"
            :esteObjetivo="objetivo"
            :seleccionado="idObjetivoSeleccionado == objetivo.id"
            :usuarioResponsableProyecto="usuarioResponsableProyecto"
            @click.native="idObjetivoSeleccionado = objetivo.id"
            @meElimine="eliminarObjetivoDeCache(objetivo.id)"
          />
        </div>
      </div>

      <div id="zonaTrabajos" class="zonaPrimerNivel">
        <div class="nombreZona">Trabajos:</div>
        <div id="controlesTrabajos" class="controlesZona">
          <div
            class="controlesTrabajos hoverGris botonesControles"
            @click="crearNuevoTrabajo"
            v-if="usuarioResponsableProyecto"
            v-show="!creandoTrabajo"
          >
            Crear trabajo
          </div>
          <loading texto="Enviando..." v-show="creandoTrabajo" />
        </div>
        <div id="listaTrabajos" @click.self="idTrabajoSeleccionado = null">
          <iconoTrabajo
            v-for="idTrabajo of esteProyecto.idsTrabajos"
            :key="idTrabajo"
            :idTrabajo="idTrabajo"
            :idProyecto="esteProyecto.id"
            :seleccionado="idTrabajoSeleccionado == idTrabajo"
            :usuarioResponsableProyecto="usuarioResponsableProyecto"
            @click.native="idTrabajoSeleccionado = idTrabajo"
            @meElimine="eliminarTrabajoDeCache(idTrabajo)"
          />
        </div>
      </div> -->

      <div id="zonaForo" ref="zonaForo" class="zonaPrimerNivel">
        <div class="nombreZona">foro</div>
        <foro :parent="infoAsParent" :idForo="esteProyecto.idForo" />
      </div>
    </template>
  </div>
</template>

<script>
import gql from "graphql-tag";
import IconoTrabajo from "./proyecto/IconoTrabajo.vue";
import IconoObjetivo from "./proyecto/IconoObjetivo.vue";
import { fragmentoProyecto } from "./utilidades/recursosGql";
import Loading from "./utilidades/Loading.vue";
import Foro from "./Foro.vue";
import IconoPersonaAutonomo from "./proyecto/IconoPersonaAutonomo.vue";
import DiagramaFlujo from "./proyecto/DiagramaFlujo.vue";

const QUERY_PROYECTO = gql`
  query($idProyecto: ID!) {
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
    IconoTrabajo,
    IconoObjetivo,
    Loading,
    Foro,
    IconoPersonaAutonomo,
    DiagramaFlujo,
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
        return respuesta.proyecto;
      },
      fetchPolicy:"cache-and-network"
    },
  },
  data() {
    return {
      loading: true,

      esteProyecto: {
        responsables: [],
        posiblesResponsables: [],
      },
      idResponsableSeleccionado: null,
      responsableSeleccionadoEstaAceptado: false,
      enviandoQueryResponsables: false,

      creandoTrabajo: false,

      idTrabajoSeleccionado: null,
      idObjetivoSeleccionado: null,

      nuevoNombre: "Nuevo nombre",
      editandoNombre: false,
      enviandoNuevoNombre: false,

      nuevoDescripcion: "Nueva descripcion",
      editandoDescripcion: false,
      enviandoNuevoDescripcion: false,

      idNodoAbierto: null,
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
      if (this.nuevoNombre.length < 1) {
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
            mutation($idProyecto: ID!, $nuevoNombre: String!) {
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
            mutation($idProyecto: ID!, $nuevoDescripcion: String!) {
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
            mutation($idProyecto: ID!, $idUsuario: ID!) {
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
            mutation($idProyecto: ID!, $idUsuario: ID!) {
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
            mutation($idProyecto: ID!, $idUsuario: ID!) {
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
            mutation($idProyecto: ID!, $idUsuario: ID!) {
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
    crearNuevoTrabajo(posicion) {
      console.log(`enviando mutacion de crear nuevo trabajo`);
      this.creandoTrabajo = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation($idProyecto: ID!, $posicion: CoordsInput) {
              crearTrabajoEnProyecto(
                idProyecto: $idProyecto
                posicion: $posicion
              )
            }
          `,
          variables: {
            idProyecto: this.esteProyecto.id,
            posicion,
          },
          update: (store, { data: { crearTrabajoEnProyecto } }) => {
            console.log(`respuesta: ${JSON.stringify(crearTrabajoEnProyecto)}`);
            const idNuevoTrabajo = crearTrabajoEnProyecto;
            try {
              let cache = store.readQuery({
                query: QUERY_PROYECTO,
                variables: { idProyecto: this.esteProyecto.id },
              });
              console.log(
                `Trabajos en cache: ${cache.proyecto.idsTrabajos.length}`
              );
              const nuevoCache = JSON.parse(JSON.stringify(cache));
              nuevoCache.proyecto.idsTrabajos.push(idNuevoTrabajo);

              store.writeQuery({
                query: QUERY_PROYECTO,
                variables: { idProyecto: this.esteProyecto.id },
                data: nuevoCache,
              });
              console.log(`cache actualizado`);
              console.log(
                `Trabajos en cache: ${nuevoCache.proyecto.idsTrabajos.length}`
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
      this.$apollo
        .mutate({
          mutation: gql`
            mutation($idProyecto: ID!, $posicion: CoordsInput) {
              crearObjetivoEnProyecto(
                idProyecto: $idProyecto
                posicion: $posicion
              ) {
                id
                nombre
                descripcion
                vinculos{
                  idRef
                  tipoRef
                  tipo
                }
                diagramaProyecto {
                  posicion {
                    x
                    y
                  }
                }
              }
            }
          `,
          variables: {
            idProyecto: this.esteProyecto.id,
            posicion,
          },
          update: (store, { data: { crearObjetivoEnProyecto } }) => {
            console.log(
              `respuesta: ${JSON.stringify(JSON.stringify(crearObjetivoEnProyecto))}`
            );
            const nuevoObjetivo = crearObjetivoEnProyecto;
            try {
              let cache = store.readQuery({
                query: QUERY_PROYECTO,
                variables: { idProyecto: this.esteProyecto.id },
              });

              let nuevoCache = JSON.parse(JSON.stringify(cache));
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
        })
        .catch((error) => {
          console.log(`error: ${error}`);
        });
    },
    eliminarTrabajoDeCache(idTrabajo) {
      let store = this.$apollo.provider.defaultClient;
      let cache = store.readQuery({
        query: QUERY_PROYECTO,
        variables: {
          idProyecto: this.esteProyecto.id,
        },
      });
      let nuevoCache = JSON.parse(JSON.stringify(cache));
      let indexT = nuevoCache.proyecto.idsTrabajos.indexOf(idTrabajo);
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
      let store = this.$apollo.provider.defaultClient;
      let cache = store.readQuery({
        query: QUERY_PROYECTO,
        variables: {
          idProyecto: this.esteProyecto.id,
        },
      });
      let nuevoCache = JSON.parse(JSON.stringify(cache));
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
    navegarAlForo() {
      console.log(`Navegando al foro de este proyecto`);
      this.$refs.zonaForo.scrollIntoView();
    },
    abrirNodo(idNodo) {
      console.log(`Abriendo nodo ${idNodo}`);
      this.idNodoAbierto = idNodo;
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
  min-height: 40px;
  align-items: center;
}
.zonaPrimerNivel {
  border: 2px solid black;
  position: relative;
  min-height: 50px;
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
.nombreZona {
  font-size: 18px;
  background-color: teal;
  padding: 3px 5px;
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
#zonaDiagramaFlujo {
  position: relative;
  min-height: 700px;
  overflow: scroll;
  max-height: 1100px;
  user-select: none;
}
.ventanaNodo {
  width: 92%;
  left: 4%;
  top: 10%;
  max-height: 80%;
  position: absolute;
}
</style>