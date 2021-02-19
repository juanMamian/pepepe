<template>
  <div class="iconoTrabajo">
    <img src="@/assets/iconos/ir.png" class="botonIr" @click="navegarAlTrabajo" title="Abrir la página de este trabajo"/>
    <div id="zonaNombre" :class="{ bordeAbajo: seleccionado }">
      <div class="barraSuperiorZona">
        <div
          class="controlesZona"
          v-show="usuarioResponsableProyecto"
        >
          <img
            src="@/assets/iconos/editar.png"
            alt="Editar"
            id="bEditarrNombre"
            class="bEditar"
            title="Editar nombre del trabajo"
            v-show="usuarioResponsableProyecto"
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
      <div id="nombre" v-show="!editandoNombre">
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
      <loading v-show="enviandoNuevoNombre" texto="Enviando..." />
      <img src="@/assets/iconos/iconoTrabajo.png" alt="" id="imagenIcono" />
    </div>
    <div id="zonaDescripcion" class="zonaPrimerNivel">
      <div class="barraSuperiorZona">
        <span class="nombreZona">Descripcion</span>
        <div
          class="controlesZona"
          v-show="usuarioResponsableProyecto"
        >
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

    <div id="zonaResponsables" class="zonaPrimerNivel">
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

    <div
      id="zonaNodosConocimiento"
      class="zonaPrimerNivel"
      v-show="false"
    >
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
import IconoPersonaAutonomo from './IconoPersonaAutonomo.vue';

const charProhibidosNombreTrabajo = /[^ a-zA-ZÀ-ž0-9_():.,-]/;
const charProhibidosDescripcionTrabajo = /[^\n\r a-zA-ZÀ-ž0-9_():;.,+¡!¿?@=-]/;

const QUERY_TRABAJO = gql`
  query($idTrabajo: ID!) {
    trabajo(idTrabajo: $idTrabajo) {
      id
      nombre
      descripcion      
      responsables
    }
  }
`;

export default {
  name: "IconoTrabajo",
  components: {
    BuscadorNodosConocimiento,
    Loading,
    IconoPersonaAutonomo
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
    };
  },
  props: {
    idProyecto: String,
    seleccionado: Boolean,
    usuarioResponsableProyecto: Boolean,
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
    infoAsParent(){
      return {
        id: this.esteTrabajo.id,
        tipo: "trabajo",
        nombre: this.esteTrabajo.nombre,
      }
    }
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
            idProyecto: this.idProyecto,
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
            idProyecto: this.idProyecto,
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
    asumirComoResponsable() {
      console.log(
        `enviando id ${this.usuario.id} para la lista de responsables del trabajo con id ${this.esteTrabajo.id} en el proyecto con id ${this.idEsteProyecto}`
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
            idProyecto: this.idProyecto,
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
    navegarAlTrabajo(){
      this.$router.push("/trabajo/"+this.idTrabajo);
    }
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
  padding-bottom: 20px;
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
  font-weight: bolder;
  text-align: center;
  margin-bottom: 15px;
}

.inputNuevoNombre {
  font-size: 23px;
  display: block;
  margin: 10px auto;
  width: 80%;
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
.controlesZona {
  margin-left: auto;
  display: flex;
  font-size: 13px;
  flex-direction: row-reverse;
}
.botonesControles{
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
.botonIr{
  position:absolute;
  top: 0%;
  left: 0%;
  cursor: pointer; 
  z-index: 10; 
  border-radius: 50%;
  width: 30px;
  height: 30px;
  padding: 5px;
}

.botonIr:hover{
  background-color: bisque;

}
</style>