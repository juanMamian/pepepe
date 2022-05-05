<template>
  <div
    class="iconoPersonaAutonomo"
    :class="{ yo: soyYo, seleccionado: seleccionado }"
  >
    <img
      class="fotografia"
      :src="this.serverUrl + '/api/usuarios/fotografias/' + idPersona"
      v-show="fotografiaEnabled"
      @load="fotografiaEnabled = true"
      alt=""
    />
    <div id="contenedorAlertas">
      <slot name="alertas"></slot>
    </div>
    <div class="nombres" :class="{ nombreSeleccionado: seleccionado }">
      {{ estaPersona.nombres }}
    </div>
    <div id="menuCxPersona" v-show="menuContextual">
      <div class="botonMenuCx" @click.stop="copiarId">{{ idPersona }}</div>
      <div class="botonMenuCx" v-if="usuarioSuperadministrador">
        {{ estaPersona.username }}
      </div>
      <input type="text" v-model="nuevoPermiso" placeholder="Nuevo permiso" />
      <div class="botonMenuCx" @click.stop="addPermisos">Dar permiso</div>
      <div
        class="botonMenuCx"
        :key="index"
        v-for="(opcionCx, index) of opcionesMenuCx"
        @click="$emit(opcionCx.evento)"
      >
        {{ opcionCx.textoVisible }}
      </div>
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";

const QUERY_PERSONA = gql`
  query($idUsuario: ID!) {
    Usuario(idUsuario: $idUsuario) {
      id
      nombres
      apellidos
      username
    }
  }
`;

export default {
  name: "IconoPersonaAutonomo",
  apollo: {
    estaPersona: {
      query: QUERY_PERSONA,
      variables() {
        return {
          idUsuario: this.idPersona,
        };
      },
      update({ Usuario }) {
        return Usuario;
      },
      skip() {
        return !this.idPersona;
      },
    },
  },
  data() {
    return {
      estaPersona: {
        permisos: [],
      },
      nuevoPermiso: null,
      mounted: false,
      fotografiaEnabled: false,
    };
  },
  props: {
    idPersona: String,
    seleccionado: Boolean,
    menuContextual: Boolean,
    opcionesMenuCx: {
      type: Array,
    },
  },
  computed: {
    soyYo() {
      if (this.mounted && this.idPersona && this.$store.state.usuario) {
        return this.$store.state.usuario.id == this.idPersona ? true : false;
      }
      return false;
    },
  },
  methods: {
    addPermisos() {
      console.log(
        `enviando ${this.nuevoPermiso} para el usuario con id ${this.idPersona}`
      );
      this.$apollo
        .mutate({
          mutation: gql`
            mutation($nuevoPermiso: String!, $idUsuario: ID!) {
              addPermisoUsuario(
                nuevoPermiso: $nuevoPermiso
                idUsuario: $idUsuario
              ) {
                id
                permisos
              }
            }
          `,
          variables: {
            nuevoPermiso: this.nuevoPermiso,
            idUsuario: this.idPersona,
          },
        })
        .then(() => {})
        .catch((error) => {
          console.log("error: " + error);
        });
    },
    copiarId(e) {
      let str = e.target.innerText.trim();
      const el = document.createElement("textarea");
      el.value = str;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    },
    fotografiaCargada() {
      console.log(`Fotografía cargada`);
    },
  },
  mounted() {
    this.mounted = true;
  },
  beforeRouteUpdate() {
    console.log(`Before update`);
  },
};
</script>

<style scoped>
.iconoPersonaAutonomo {
  cursor: pointer;
  position: relative;
  border-radius: 50%;
  user-select: none;
  width: 70px;
  height: 70px;
  border: 1px solid transparent;
}
.iconoPersonaAutonomo:hover {
  border-color: purple;
}

.fotografia {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  position: absolute;
  pointer-events: none;
}
.seleccionado {
  border-color: purple;
}
#contenedorAlertas {
  position: absolute;
  top: 0;
  right: 0;
}
.yo {
  border: 1px solid purple;
}

.nombres {
  background-color: rgb(243, 216, 204);
  font-size: 14px;
  position: absolute;
  top: 105%;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  border: 1px solid rgb(105, 24, 24);
  padding: 3px 5px;
  border-radius: 5px;
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.2),
    0 1px 5px 0 rgba(0, 0, 0, 0.12);
}
.nombreSeleccionado {
  background-color: rgb(241, 175, 147);
}

.botonMenuCx {
  cursor: pointer;
  font-size: 14px;
  padding: 3px 7px;
}
.seccionMenuCx {
  font-size: 15px;
  color: rgb(71, 71, 71);
}
.infoMenuCx {
  font-size: 15px;
  color: rgb(107, 107, 107);
}
.botonMenuCx:hover {
  background-color: gray;
}
#menuCxPersona {
  position: absolute;
  top: 110%;
  left: 110%;
  min-width: 140px;

  z-index: 10;
  background-color: rgb(177, 177, 159);
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.2),
    0 1px 5px 0 rgba(0, 0, 0, 0.12);
}
</style>