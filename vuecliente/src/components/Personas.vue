<template>
  <div class="personas">
    <router-view> </router-view>

    <div class="zonaConfiguracion">
      <div class="contenedorBloquesConfiguracion">
        <div class="bloqueConfiguracion">
          <div class="campoConfiguracion" id="campoUsuariosMostrados">
            <span style="width: 100%"> Mostrar:</span>
            <div class="opcion">
              <label for="mostrarTodos">Todos</label>
              <input
                type="radio"
                name="radioMostrarTodos"
                ref="mostrarTodos"
                value="todos"
                v-model="tipoMostrarUsuarios"
                id="radioMostrarTodos"
              />
            </div>
            <div class="opcion">
              <label for="mostrarEstudiantes">Estudiantes</label>
              <input
                type="radio"
                name="radioMostrarEstudiantes"
                ref="mostrarEstudiantes"
                value="estudiantes"
                v-model="tipoMostrarUsuarios"
                id="radioMostrarEstudiantes"
              />
            </div>

            <div class="opcion">
              <label for="mostrarProfesores">Profesorxs</label>
              <input
                type="radio"
                name="radioMostrarProfesores"
                ref="mostrarProfesores"
                value="profesores"
                v-model="tipoMostrarUsuarios"
                id="radioMostrarProfesores"
              />
            </div>

            <div class="opcion">
              <label for="mostrarGraduados">Graduados</label>
              <input
                type="radio"
                name="radioMostrarGraduados"
                ref="mostrarGraduados"
                value="graduados"
                v-model="tipoMostrarUsuarios"
                id="radioMostrarGraduados"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div id="zonaBuscar">
      <div class="barraSuperior">
        <input
          type="text"
          ref="inputBuscar"
          v-model="textoBuscar"
          @input="calcularBuscados"
          v-show="mostrandoInputBuscar"
        />
        <div
          class="boton"
          @click="iniciarBuscar"
          v-show="!mostrandoInputBuscar"
        >
          <img src="@/assets/iconos/search.svg" alt="Lupa" />
        </div>

        <div
          class="boton"
          title="Cancelar"
          @click="cancelarBusqueda"
          v-show="mostrandoInputBuscar"
        >
          <img src="@/assets/iconos/equis.svg" alt="Equis" />
        </div>
      </div>
    </div>

    <div id="listaPersonas" @click="idPersonaMenuCx = null">
      <loading
        v-show="$apollo.queries.personas.loading"
        texto="Cargando lista de personas..."
      />
      <persona-vista-lista
        :seleccionado="idPersonaSeleccionada === persona.id"
        @click.native="idPersonaSeleccionada = persona.id"
        :estaPersona="persona"
        :nodosSolidaridadPublicitados="nodosSolidaridadPublicitados"
        v-for="persona of personasVisibles"
        :key="persona.id"
      />
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import Loading from "./utilidades/Loading.vue";
import PersonaVistaLista from "./usuario/personaVistaLista.vue";
import debounce from "debounce";
// import { similarity } from "./utilidades/funciones";
var stringSimilarity = require("string-similarity");

const charProhibidosPermiso = /[^ a-zA-Z-]/;

export const QUERY_PERSONAS = gql`
  query {
    todosUsuarios {
      id
      nombres
      apellidos
      permisos
      username
    }
  }
`;

export default {
  name: "Personas",
  components: {
    Loading,
    PersonaVistaLista,
  },
  apollo: {
    personas: {
      query: QUERY_PERSONAS,
      update: function ({ todosUsuarios }) {
        return todosUsuarios;
      },
      fetchPolicy: "cache-first",
    },
    nodosSolidaridadPublicitados: {
      query: gql`
        query {
          nodosSolidaridadPublicitados {
            id
            nombre
            responsables
          }
        }
      `,
    },
  },
  data() {
    return {
      personas: [],
      nodosSolidaridadPublicitados: [],
      idPersonaMenuCx: null,
      idPersonaSeleccionada: null,
      tipoMostrarUsuarios: "todos",

      permisoInput: "",
      textoBuscar: null,
      textoBusquedaUsado: null,
      mostrandoInputBuscar: false,
      buscados: [],

      debouncingBusqueda: false,
    };
  },
  methods: {
    copiarId(e) {
      let str = e.target.innerText.trim();
      const el = document.createElement("textarea");
      el.value = str;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    },
    eliminarPersonaDeDatabase(idPersona) {
      if (confirm("¿Seguro de eliminar a este individuo?")) {
        console.log(
          `Se eliminara una persona con id ${idPersona} de la base de datos`
        );
      }
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idUsuario: ID!) {
              eliminarUsuario(idUsuario: $idUsuario)
            }
          `,
          variables: {
            idUsuario: idPersona,
          },
          update: (store, { data: { eliminarUsuario } }) => {
            console.log(`Data: ${eliminarUsuario}`);
            if (eliminarUsuario) {
              try {
                let cache = store.readQuery({
                  query: QUERY_PERSONAS,
                  variables: { idUsuario: idPersona },
                });
                console.log(`cache: ${cache}`);

                let indexE = cache.todosUsuarios.findIndex(
                  (p) => p.id == idPersona
                );
                if (indexE > -1) {
                  cache.todosUsuarios.splice(indexE, 1);
                }
                console.log(`cache: ${cache}`);
                store.writeQuery({
                  query: QUERY_PERSONAS,
                  variables: { idUsuario: idPersona },
                  data: cache,
                });
              } catch (error) {
                console.log(`Error actualizando cache. E:${error}`);
              }
            }
          },
        })
        .then((res) => {
          console.log(`Res: ${JSON.stringify(res)}`);
          if (res.data) {
            console.log(`Usuario eliminado exitosamente`);
          }
        })
        .catch((error) => {
          console.log(`Error eliminando usuario: E: ${error}`);
        });
    },
    asignarPermisoTodos() {
      if (this.permisoIlegal) {
        console.log(`No enviado`);
        return;
      }

      if (!confirm("¿Asignar este permiso a todas las personas?")) return;

      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($nuevoPermiso: String!) {
              asignarPermisoTodosUsuarios(nuevoPermiso: $nuevoPermiso)
            }
          `,
          variables: {
            nuevoPermiso: this.permisoInput,
          },
        })
        .then(() => {
          alert(
            "Permiso " + this.permisoInput + " asignado para todos los usuarios"
          );
        });
    },
    iniciarBuscar() {
      this.mostrandoInputBuscar = true;
      this.$nextTick(() => {
        this.$refs.inputBuscar.focus();
      });
    },
    cancelarBusqueda() {
      this.buscados = [];
      this.textoBuscar = null;
      this.mostrandoInputBuscar = false;
      this.textoBusquedaUsado = null;
    },
    calcularBuscados: debounce(function () {
      console.log(`Setting textoBusquedaUsado`);
      this.textoBusquedaUsado = this.textoBuscar;
      // console.log(`Calculando buscados`);
      // if (!this.textoBuscar) return;
      // var lista = [];
      // var texto = this.textoBuscar.trim();
      // var campoPersonas =
      //   this.mostrarPersonas === "profes"
      //     ? this.personas.filter((p) =>
      //         p.permisos.includes("maestraVida-profesor")
      //       )
      //     : this.personas;

      // campoPersonas.forEach((persona) => {
      //   // console.log(`Buscando ${texto} en ${nombreLargo}`);
      //   var puntajeSimilaridad=similarity(texto, nombreLargo);
      //   var obj={};
      //   obj[persona.id]=puntajeSimilaridad;
      //   lista.push({obj});
      //   console.log(`BINGO`);
      // });

      // this.buscados=lista;
    }, 800),
  },
  computed: {
    opcionesEspecialesPersona: function () {
      let opciones = [];
      if (this.usuarioSuperadministrador) {
        opciones = opciones.concat([
          {
            textoVisible: "Eliminar de la base de datos",
            evento: "eliminandoseDeDatabase",
          },
          {
            textoVisible: "resetear contraseña (123456)",
            evento: "reseteandoPass",
          },
        ]);
      }
      return opciones;
    },
    permisoIlegal() {
      if (this.permisoInput.length < 1) {
        return true;
      }
      if (charProhibidosPermiso.test(this.permisoInput)) {
        return true;
      }
      return false;
    },
    personasVisibles() {
      var visibles = JSON.parse(JSON.stringify(this.personas));
      if (this.tipoMostrarUsuarios === "profesores") {
        visibles = visibles.filter((p) =>
          p.permisos.includes("maestraVida-profesor")
        );
      } else if (this.tipoMostrarUsuarios === "estudiantes") {
        visibles = visibles.filter((p) =>
          p.permisos.includes("maestraVida-estudiante")
        );
      } else if (this.tipoMostrarUsuarios === "graduados") {
        visibles = visibles.filter((p) =>
          p.permisos.includes("maestraVida-graduado")
        );
      }

      if (this.textoBusquedaUsado) {
        visibles.sort((a, b) => {
          let res =
            stringSimilarity.compareTwoStrings(
              b.nombres + b.apellidos,
              this.textoBusquedaUsado
            ) -
            stringSimilarity.compareTwoStrings(
              a.nombres + a.apellidos,
              this.textoBusquedaUsado
            );
          return res;
        });
      }

      return visibles;
    },
  },
  watch: {},
};
</script>

<style scoped>
#listaPersonas {
  display: flex;
  padding-bottom: 50px;
  flex-flow: row wrap;
}
#campoUsuariosMostrados{
  display: flex;
  flex-wrap: wrap;
}
#campoUsuariosMostrados .opcion {
  display: flex;
  align-items: center;
  gap: 10px;
}
#zonaBuscar {
  padding: 10px 5px;
}
#zonaBuscar .barraSuperior {
  display: flex;
  align-items: center;
}
#zonaBuscar .barraSuperior input {
  font-size: 20px;
  border: 2px solid gray;
  border-radius: 5px;
  padding: 5px;
  margin-right: 10px;
}

.personaVistaLista {
}
.personaVistaLista:hover {
  background-color: rgba(128, 128, 128, 0.178);
}

.loading {
  margin: 20px auto;
}
.botonPermisos {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  padding: 3px;
  cursor: pointer;
}

.botonPermisos:hover {
  background-color: rgba(128, 128, 128, 0.726);
}
</style>