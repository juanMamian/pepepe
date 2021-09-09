<template>
  <div class="personas">
    <div id="controlesPersonas">
      <div class="controlPersonas">
        <div id="zonaPermisos" v-if="usuarioSuperadministrador">
          <input type="text" id="inputPermiso" v-model="permisoInput"/>
          <img src="@/assets/iconos/ir.png" alt="AsignarTodos" title="Asignar permiso a todos" width="20px" class="botonPermisos" id="botonAsignarPermisoTodos" @click="asignarPermisoTodos">
          <img src="@/assets/iconos/cancelar.png" alt="RetirarTodos" title="Retirar permiso a todos" width="20px" class="botonPermisos" id="botonRetirarPermisoTodos">

        </div>
      </div>
    </div>
    <div id="listaPersonas" @click="idPersonaMenuCx = null">
      <loading v-show="loadingPersonas" texto="Cargando lista de personas..." />
      <icono-persona
        v-for="persona of personas"
        :key="persona.id"
        :estaPersona="persona"
        :seleccionado="idPersonaSeleccionada == persona.id"
        :opcionesMenuCx="opcionesEspecialesPersona"
        :menuContextual="idPersonaMenuCx == persona.id"
        @click.native.right.stop.prevent="idPersonaMenuCx = persona.id"
        @click.left.native="idPersonaSeleccionada = persona.id"
        @eliminandoseDeDatabase="eliminarPersonaDeDatabase(persona.id)"
        @reseteandoPass="resetearPassUsuario(persona.id)"
      >
      </icono-persona>
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import { fragmentoResponsables } from "./utilidades/recursosGql";
import IconoPersona from "./proyecto/IconoPersona";
import Loading from "./utilidades/Loading.vue";
import axios from "axios";

const charProhibidosPermiso = /[^ a-zA-Z-]/;

const QUERY_PERSONAS = gql`
  query {
    todosUsuarios {
      ...fragResponsables
    }
  }
  ${fragmentoResponsables}
`;

export default {
  name: "Personas",
  components: {
    IconoPersona,
    Loading,
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

      permisoInput:""
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
            mutation($idUsuario: ID!) {
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
      let datos={
        idUsuario
      }
      axios({
        method: "post",
        url: this.serverUrl + "/api/usuarios/resetearPassUsuario",
        data: datos,
        headers: {          
          Authorization: "Bearer " + this.$store.state.token,
        },
      }).then(({data})=>{
        console.log(`Respuesta: ${data}`);
      }).catch((error)=>{
        console.log(`Error reseteando password. E:${error}`);
      })
    },
    asignarPermisoTodos(){
      if (this.permisoIlegal) {
        console.log(`No enviado`);
        return;
      }

      if(!confirm("¿Asignar este permiso a todas las personas?"))return

      this.$apollo.mutate({
        mutation: gql`
          mutation($nuevoPermiso: String!){
            asignarPermisoTodosUsuarios(nuevoPermiso: $nuevoPermiso)
          }
        `,
        variables:{
          nuevoPermiso:this.permisoInput
        }
      }).then(()=>{
        alert("Permiso "+ this.permisoInput+" asignado para todos los usuarios");
      })
    }
  },
  computed: {
    opcionesEspecialesPersona: function () {
      let opciones = [];
      if (this.usuarioSuperadministrador) {
        opciones=opciones.concat([
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
  },
};
</script>

<style scoped>
#listaPersonas {
  display: flex;
  padding: 20px 20px;
  padding-bottom: 50px;
  border: 2px solid purple;
  flex-flow: row wrap;
}
.iconoPersona {
  margin-left: 25px;
  margin-right: 25px;
  margin-bottom: 60px;
}
.loading {
  margin: 20px auto;
}
.botonPermisos{
  width: 20px;
  height: 20px;
  border-radius: 50%;
  padding: 3px;
  cursor: pointer;
}

.botonPermisos:hover{
  background-color:rgba(128, 128, 128, 0.726);
}
</style>