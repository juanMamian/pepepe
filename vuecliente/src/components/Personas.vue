<template>
  <div class="personas">
    <router-view>
    </router-view>

    <div id="controlesPersonas" class="contenedorControles">
      <div
        class="boton"
        @click="
          mostrarPersonas = mostrarPersonas === 'todos' ? 'profes' : 'todos'
        "
      >
        <img
          src="@/assets/iconos/users.svg"
          alt="Todos"
          v-show="mostrarPersonas === 'todos'"
        />
        <img
          src="@/assets/iconos/teacher.svg"
          alt="Profes"
          v-show="mostrarPersonas === 'profes'"
        />
      </div>
    </div>
    <div id="listaPersonas" @click="idPersonaMenuCx = null">
      <loading v-show="loadingPersonas" texto="Cargando lista de personas..." />
      <persona-vista-lista
        :seleccionado="idPersonaSeleccionada === persona.id"
        @click.native="idPersonaSeleccionada = persona.id"
        :estaPersona="persona"
        v-for="persona of personasVisibles"
        :key="persona.id"
      />
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import Loading from "./utilidades/Loading.vue";
import axios from "axios";
import PersonaVistaLista from "./usuario/personaVistaLista.vue";

const charProhibidosPermiso = /[^ a-zA-Z-]/;

const QUERY_PERSONAS = gql`
  query {
    todosUsuarios {
      id
      nombres
      apellidos
      permisos
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
        this.loadingPersonas = false;
        return todosUsuarios;
      },
    },
  },
  data() {
    return {
      personas: [],
      idPersonaMenuCx: null,
      idPersonaSeleccionada: null,
      loadingPersonas: true,
      mostrarPersonas: "todos",

      permisoInput: "",
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
    resetearPassUsuario(idUsuario) {
      console.log(`Evento de resetear pass de ${idUsuario}`);
      let datos = {
        idUsuario,
      };
      axios({
        method: "post",
        url: this.serverUrl + "/api/usuarios/resetearPassUsuario",
        data: datos,
        headers: {
          Authorization: "Bearer " + this.$store.state.token,
        },
      })
        .then(({ data }) => {
          console.log(`Respuesta: ${data}`);
        })
        .catch((error) => {
          console.log(`Error reseteando password. E:${error}`);
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
      if (this.mostrarPersonas === "profes") {
        return this.personas.filter((p) =>
          p.permisos.includes("maestraVida-profesor")
        );
      }
      return this.personas;
    },
  },
};
</script>

<style scoped>
#listaPersonas {
  display: flex;
  padding-bottom: 50px;
  flex-flow: row wrap;
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