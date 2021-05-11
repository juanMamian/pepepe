<template>
  <div class="iconoTrabajo">
    <img
      src="@/assets/iconos/iconoTrabajo.png"
      alt=""
      id="imagenIcono"
      :class="{
        iconoCompletado: esteTrabajo.estadoDesarrollo === 'completado',
        deshabilitado: togglingEstado,
      }"
      @click="usuarioResponsableProyecto ? toggleEstadoTrabajo() : null"
    />
    <div id="zonaNombre" :class="{ bordeAbajo: seleccionado }">
      <div id="nombre">
        <div id="elPropioNombre" v-show="!editandoNombre">
          {{ esteTrabajo.nombre }}
        </div>
        <input
          type="text"
          class="inputNuevoNombre"
          :class="{ letrasRojas: nuevoNombreIlegal }"
          v-model="nuevoNombre"
          v-show="editandoNombre"
          @keypress.enter="guardarNuevoNombre"
        />
        <div class="controlesLateralesZona" v-if="usuarioResponsableProyecto">
          <img
            src="@/assets/iconos/editar.png"
            alt="Editar"
            id="bEditarrNombre"
            class="bEditar"
            title="Editar nombre del trabajo"
            @click.stop="toggleEditandoNombre"
          />
          <img
            src="@/assets/iconos/guardar.png"
            alt="Guardar"
            title="guardar"
            class="bGuardar"
            id="bGuardarNuevoNombre"
            v-show="editandoNombre == true && nuevoNombreIlegal == false"
            @click.stop="guardarNuevoNombre"
          />
        </div>
      </div>

      <loading v-show="enviandoNuevoNombre" texto="Enviando..." />
    </div>
    <div id="zonaDescripcion" class="zonaPrimerNivel">
      <div class="barraSuperiorZona">
        <span class="nombreZona">Descripcion</span>
        <div class="controlesZona" v-show="usuarioResponsableProyecto">
          <img
            src="@/assets/iconos/editar.png"
            alt="Editar"
            id="bEditarDescripcion"
            class="bEditar"
            title="Editar descripcion del trabajo"
            v-show="usuarioResponsableProyecto"
            @click.stop="toggleEditandoDescripcion"
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
            @click.stop="guardarNuevoDescripcion"
          />
        </div>
      </div>

      <div id="descripcion" ref="descripcion" v-show="!editandoDescripcion">
        {{ esteTrabajo.descripcion }}
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

    <div id="zonaResponsables" class="zonaPrimerNivel" v-if="false">
      <div class="nombreZona">Responsables</div>
      <div id="controlesResponsables" class="controlesZona">
        <div
          class="controlesResponsables hoverGris botonesControles"
          v-if="usuarioLogeado == true && usuarioResponsableTrabajo == false"
          id="botonParticipar"
          @click="asumirComoResponsable"
        >
          Participar
        </div>

        <div
          class="controlesResponsables hoverGris botonesControles"
          v-if="usuarioResponsableTrabajo == true"
          @click="abandonarListaResponsables"
        >
          Abandonar
        </div>
      </div>
      <div id="listaResponsables">
        <icono-persona-autonomo
          :idPersona="idPersona"
          :aceptado="true"
          :key="idPersona"
          v-for="idPersona of esteTrabajo.responsables"
        />
      </div>
    </div>

    <div id="zonaNodosConocimiento" class="zonaPrimerNivel" v-show="false">
      <div class="nombreZona">Nodos de conocimiento involucrados</div>
      <div id="controlesNodosConocimiento" class="controlesZona">
        <div
          class="controlesNodosConocimiento hoverGris botonesControles"
          v-if="usuarioResponsableProyecto == true"
        >
          Añadir
        </div>
        <div
          class="controlesNodosConocimiento hoverGris botonesControles"
          v-if="
            usuarioResponsableProyecto == true &&
            idNodoSeleccionado != null &&
            esteTrabajo.nodosConocimiento.some(
              (n) => n.id == idNodoSeleccionado
            )
          "
        >
          Remover
        </div>
      </div>
      <div id="listaNodosConocimiento" @click.self="idNodoSeleccionado = null">
        <icono-nodo-conocimiento
          :esteNodo="nodo"
          :key="nodo.id"
          v-for="nodo of esteTrabajo.nodosConocimiento"
          @click.native="idNodoSeleccionado = nodo.id"
        />
        <buscador-nodos-conocimiento />
      </div>
    </div>

    <div
      id="zonaKeywords"
      class="zonaPrimerNivel"
      v-show="usuarioResponsableProyecto"
    >
      <div class="barraSuperiorZona">
        <span class="nombreZona">Palabras clave</span>
        <div class="controlesZona">
          <img
            src="@/assets/iconos/editar.png"
            alt="Editar"
            id="bEditarKeywords"
            class="bEditar"
            title="Editar palabras clave del trabajo"
            @click.stop="toggleEditandoKeywords"
          />
          <img
            src="@/assets/iconos/guardar.png"
            alt="Guardar"
            title="guardar"
            class="bGuardar"
            id="bGuardarNuevoKeywords"
            v-show="editandoKeywords == true && nuevoKeywordsIlegal == false"
            @click.stop="guardarNuevoKeywords"
          />
        </div>
      </div>

      <div id="keywords" ref="keywords" v-show="!editandoKeywords">
        {{ esteTrabajo.keywords }}
      </div>

      <textarea
        id="inputNuevoKeywords"
        ref="inputNuevoKeywords"
        :class="{ letrasRojas: nuevoKeywordsIlegal }"
        v-model="nuevoKeywords"
        v-show="editandoKeywords"
        @keypress.enter.prevent="guardarNuevoKeywords"
      />
      <loading v-show="enviandoNuevoKeywords" texto="Enviando..." />
    </div>

     <img
        src="@/assets/iconos/abrirLink.png"
        class="botonIr"
        @click="navegarAlTrabajo"
        title="Abrir la página de este trabajo"
      />

    <div id="controlesTrabajo">     
      <div
        class="controlesTrabajo hoverGris bEliminar"
        @click="eliminarse"
        v-if="usuarioResponsableProyecto == true"
      >
        Eliminar
      </div>
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import BuscadorNodosConocimiento from "../atlasConocimiento/BuscadorNodosConocimiento.vue";
import Loading from "../utilidades/Loading.vue";
import IconoPersonaAutonomo from "./IconoPersonaAutonomo.vue";

const charProhibidosNombreTrabajo = /[^ a-zA-ZÀ-ž0-9_():.,-]/;
const charProhibidosDescripcionTrabajo = /[^\n\r a-zA-ZÀ-ž0-9_():;.,+¡!¿?@=-]/;
const charProhibidosKeywordsTrabajo = /[^ a-zA-Zñ,]/;

const QUERY_TRABAJO = gql`
  query($idTrabajo: ID!) {
    trabajo(idTrabajo: $idTrabajo) {
      id
      nombre
      descripcion
      responsables
      keywords
      idProyectoParent
      estadoDesarrollo
    }
  }
`;

export default {
  name: "IconoTrabajo",
  components: {
    BuscadorNodosConocimiento,
    Loading,
    IconoPersonaAutonomo,
  },
  apollo: {
    esteTrabajo: {
      query: QUERY_TRABAJO,
      variables() {
        return {
          idTrabajo: this.idTrabajo,
        };
      },
      update({ trabajo }) {
        if (!trabajo.keywords) trabajo.keywords = "";
        return trabajo;
      },
      skip() {
        return !this.idTrabajo;
      },
    },
  },
  data() {
    return {
      esteTrabajo: {
        responsables: [],
      },

      idNodoSeleccionado: null,
      deshabilitado: false,

      nuevoNombre: "Nuevo nombre",
      editandoNombre: false,
      enviandoNuevoNombre: false,

      nuevoDescripcion: "Nueva descripcion",
      editandoDescripcion: false,
      enviandoNuevoDescripcion: false,

      nuevoKeywords: "palabras clave",
      editandoKeywords: false,
      enviandoNuevoKeywords: false,

      togglingEstado: false,
    };
  },
  props: {
    idProyecto: String,
    seleccionado: Boolean,
    usuarioResponsableProyecto: {
      type: Boolean,
      defaul: false,
    },
    idTrabajo: String,
  },
  computed: {
    usuarioResponsableTrabajo: function () {
      return this.esteTrabajo.responsables.includes(this.usuario.id);
    },
    nuevoNombreIlegal() {
      if (this.nuevoNombre.length < 1) {
        return true;
      }
      if (charProhibidosNombreTrabajo.test(this.nuevoNombre)) {
        return true;
      }
      return false;
    },
    nuevoDescripcionIlegal() {
      if (this.nuevoDescripcion.length < 1) {
        return true;
      }
      if (charProhibidosDescripcionTrabajo.test(this.nuevoDescripcion)) {
        return true;
      }
      return false;
    },
    nuevoKeywordsIlegal() {
      if (this.nuevoKeywords.length < 1) {
        return true;
      }
      if (charProhibidosKeywordsTrabajo.test(this.nuevoKeywords)) {
        return true;
      }
      return false;
    },
    infoAsParent() {
      return {
        id: this.esteTrabajo.id,
        tipo: "trabajo",
        nombre: this.esteTrabajo.nombre,
      };
    },
  },
  methods: {
    guardarNuevoNombre() {
      if (this.nuevoNombreIlegal) {
        console.log(`No enviado`);
        return;
      }
      if (this.nuevoNombre == this.esteTrabajo.nombre) {
        this.editandoNombre = false;
        return;
      }
      console.log(`guardando nuevo nombre`);
      this.enviandoNuevoNombre = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation($idProyecto: ID!, $idTrabajo: ID!, $nuevoNombre: String!) {
              editarNombreTrabajoProyecto(
                idProyecto: $idProyecto
                idTrabajo: $idTrabajo
                nuevoNombre: $nuevoNombre
              ) {
                id
                nombre
              }
            }
          `,
          variables: {
            idTrabajo: this.esteTrabajo.id,
            idProyecto: this.esteTrabajo.idProyectoParent,
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
      if (this.nuevoDescripcion == this.esteTrabajo.descripcion) {
        this.editandoDescripcion = false;
        return;
      }
      console.log(`guardando nuevo descripcion`);
      this.enviandoNuevoDescripcion = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation(
              $idProyecto: ID!
              $idTrabajo: ID!
              $nuevoDescripcion: String!
            ) {
              editarDescripcionTrabajoProyecto(
                idProyecto: $idProyecto
                idTrabajo: $idTrabajo
                nuevoDescripcion: $nuevoDescripcion
              ) {
                id
                descripcion
              }
            }
          `,
          variables: {
            idProyecto: this.esteTrabajo.idProyectoParent,
            idTrabajo: this.esteTrabajo.id,
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
    guardarNuevoKeywords() {
      if (this.nuevoKeywordsIlegal) {
        console.log(`No enviado`);
        return;
      }
      if (this.nuevoKeywords == this.esteTrabajo.keywords) {
        this.editandoKeywords = false;
        return;
      }
      console.log(`guardando nuevo keywords`);
      this.enviandoNuevoKeywords = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation(
              $idProyecto: ID!
              $idTrabajo: ID!
              $nuevoKeywords: String!
            ) {
              editarKeywordsTrabajoProyecto(
                idProyecto: $idProyecto
                idTrabajo: $idTrabajo
                nuevoKeywords: $nuevoKeywords
              ) {
                id
                keywords
              }
            }
          `,
          variables: {
            idProyecto: this.esteTrabajo.idProyectoParent,
            idTrabajo: this.esteTrabajo.id,
            nuevoKeywords: this.nuevoKeywords,
          },
        })
        .then(() => {
          this.enviandoNuevoKeywords = false;
          this.editandoKeywords = false;
        })
        .catch((error) => {
          this.enviandoNuevoKeywords = false;
          console.log(`Error. E :${error}`);
        });
    },
    toggleEditandoNombre() {
      this.editandoNombre = !this.editandoNombre;
      this.nuevoNombre = this.esteTrabajo.nombre;
    },
    toggleEditandoDescripcion() {
      this.$refs.inputNuevoDescripcion.style.height =
        this.$refs.descripcion.offsetHeight + "px";
      this.editandoDescripcion = !this.editandoDescripcion;
      this.nuevoDescripcion = this.esteTrabajo.descripcion;
    },
    toggleEditandoKeywords() {
      this.$refs.inputNuevoKeywords.style.height =
        this.$refs.keywords.offsetHeight + "px";
      this.editandoKeywords = !this.editandoKeywords;
      this.nuevoKeywords = this.esteTrabajo.keywords;
    },
    asumirComoResponsable() {
      console.log(
        `enviando id ${this.usuario.id} para la lista de responsables del trabajo con id ${this.esteTrabajo.id} en el proyecto con id ${this.esteTrabajo.idProyectoParent}`
      );
      this.$apollo
        .mutate({
          mutation: gql`
            mutation($idTrabajo: ID!, $idUsuario: ID!) {
              addResponsableTrabajo(
                idTrabajo: $idTrabajo
                idUsuario: $idUsuario
              ) {
                id
                responsables
              }
            }
          `,
          variables: {
            idTrabajo: this.esteTrabajo.id,
            idUsuario: this.$store.state.usuario.id,
          },
        })
        .then(() => {})
        .catch((error) => {
          console.log("error: " + error);
        });
    },
    abandonarListaResponsables() {
      console.log(`Abandonando este trabajo`);
      this.$apollo
        .mutate({
          mutation: gql`
            mutation($idTrabajo: ID!, $idUsuario: ID!) {
              removeResponsableTrabajo(
                idTrabajo: $idTrabajo
                idUsuario: $idUsuario
              ) {
                id
                responsables
              }
            }
          `,
          variables: {
            idTrabajo: this.esteTrabajo.id,
            idUsuario: this.$store.state.usuario.id,
          },
        })
        .then(() => {})
        .catch((error) => {
          console.log("error: " + error);
        });
    },
    eliminarse() {
      console.log(`Trabajo eliminandose`);
      if (!confirm("¿Seguro de eliminar este trabajo?")) {
        return;
      }
      this.deshabilitado = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation($idProyecto: ID!, $idTrabajo: ID!) {
              eliminarTrabajoDeProyecto(
                idProyecto: $idProyecto
                idTrabajo: $idTrabajo
              )
            }
          `,
          variables: {
            idProyecto: this.esteTrabajo.idProyectoParent,
            idTrabajo: this.esteTrabajo.id,
          },
        })
        .then(({ data: { eliminarTrabajoDeProyecto } }) => {
          this.deshabilitado = false;
          console.log(`Resultado: ${eliminarTrabajoDeProyecto}`);
          this.$emit("meElimine");
        })
        .catch((error) => {
          this.deshabilitado = false;
          console.log(`Error. E: ${error}`);
        });
    },
    navegarAlTrabajo() {
      this.$router.push("/trabajo/" + this.idTrabajo);
    },
    toggleEstadoTrabajo() {
      var nuevoEstado = "noCompletado";
      if (this.esteTrabajo.estadoDesarrollo === "noCompletado") {
        nuevoEstado = "completado";
      }

      this.togglingEstado = true;

      this.$apollo
        .mutate({
          mutation: gql`
            mutation($idProyecto: ID!, $idTrabajo: ID!, $nuevoEstado: String!) {
              setEstadoTrabajoProyecto(
                idProyecto: $idProyecto
                idTrabajo: $idTrabajo
                nuevoEstado: $nuevoEstado
              ) {
                id
                estadoDesarrollo
              }
            }
          `,
          variables: {
            idProyecto: this.esteTrabajo.idProyectoParent,
            idTrabajo: this.esteTrabajo.id,
            nuevoEstado,
          },
        })
        .then(() => {
          this.togglingEstado = false;
          console.log(`toggled`);
        })
        .catch((error) => {
          this.togglingEstado = false;
          console.log(`Error: E:${error}`);
        });
    },
  },
};
</script>

<style scoped>
.iconoTrabajo {
  border: 2px solid #0b8794;
  border-radius: 5px;
  min-height: 50px;
  position: relative;
  padding: 5px 10px;
  padding-bottom: 40px;
  background-color: rgb(230, 247, 247);
}

.iconoTrabajo:not(.seleccionado) {
  cursor: pointer;
}

.seleccionado {
  padding-bottom: 40px;
  box-shadow: 2px 2px 2px 2px rgb(54, 54, 54);
}

#controlesTrabajo {
  position: absolute;
  bottom: 0px;
  right: 0px;
  display: flex;
  flex-direction: row-reverse;
}
.controlesTrabajo {
  padding: 3px 5px;
  cursor: pointer;
}
#descripcion {
  min-width: 100px;
  min-height: 50px;
  border: 2px solid pink;
  padding: 3px 30px;
  white-space: pre-wrap;
}
#imagenIcono {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  padding: 3px;
}

#imagenIcono:hover {
  background-color: cadetblue;
}
.iconoCompletado {
  background-color: rgb(44, 136, 44);
}

.zonaPrimerNivel {
  position: relative;
  min-height: 50px;
  border-bottom: 2px solid black;
}
.barraSuperiorZona {
  display: flex;
}
.nombreZona {
  font-size: 18px;
  padding: 5px 20px;
}
#zonaNombre {
  position: relative;
  min-height: 50px;
}
#nombre {
  margin-top: 15px;
  font-size: 19px;
  padding: 5px 20px;
  display: grid;
  grid-template-columns: 1fr 5fr 1fr;
  margin-bottom: 15px;
}

#elPropioNombre {
  font-size: 19px;
  padding: 5px;
  font-weight: bolder;
  text-align: center;
  grid-column: 2/3;
}

.inputNuevoNombre {
  font-size: 23px;
  display: block;
  margin: 10px auto;
  grid-column: 2/3;
  width: 100%;
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
}

#inputNuevoDescripcion {
  width: 95%;
  font-size: 19px;
  height: 70px;
  display: block;
  margin: 10px auto;
  resize: vertical;
}
#zonaKeywords {
  min-height: 100px;
}
#keywords {
  font-size: 19px;
  width: 95%;
  margin: 10px auto;
  padding: 10px;
  min-height: 80px;
  resize: vertical;
  border: none;
  background-color: transparent;
}

#inputNuevoKeywords {
  width: 95%;
  font-size: 19px;
  height: 70px;
  display: block;
  margin: 10px auto;
  resize: vertical;
  resize: none;
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
.controlesLateralesZona {
  grid-column: 3/4;
  display: flex;
  flex-direction: row-reverse;
}
.controlesZona {
  margin-left: auto;
  display: flex;
  font-size: 13px;
  flex-direction: row-reverse;
}
.botonesControles {
  border-radius: 3px;
  cursor: pointer;
  padding: 3px 5px;
}
.bEliminar:hover {
  background-color: red;
}
#listaResponsables {
  display: flex;
  padding: 10px 20px;
  padding-bottom: 65px;
}
.iconoPersonaAutonomo {
  margin-right: 25px;
  margin-left: 5px;
  vertical-align: middle;
  margin-top: 5px;
  margin-bottom: 5px;
}
.botonIr {
  
  cursor: pointer;
  z-index: 10;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  padding: 5px;
  margin: 6px auto;
  display: block;
  background-color: chocolate;
}

.botonIr:hover {
  background-color: rgb(223, 141, 82);
}
</style>