<template>
  <div class="iconoPersonaAutonomo" v-if="estaPersona?.id" :class="{ yo: soyYo }" :style="[offsetIcono]">
    <img
      class="fotografia"
      :src="this.serverUrl + '/api/usuarios/fotografias/' + idPersona"
      :style="[offsetFoto]"
      v-show="fotografiaEnabled"
      @load="fotografiaEnabled = true"
      alt="Usuario"
    />
    <div id="contenedorAlertas">
      <slot name="alertas"></slot>
    </div>
    <div
      class="nombres"
      :class="{ nombreSeleccionado: seleccionado }"
      :style="[{ fontSize: basicFontSizeNombre * factor + 'px' }]"
    >
      {{ estaPersona.nombres }} <br>
      <b>{{estaPersona.titulo}}</b>
    </div>
    <div id="menuCxPersona" v-show="menuContextual">
      <div class="botonMenuCx" @click.stop="copiarId">{{ idPersona }}</div>
      <div class="botonMenuCx" v-if="usuarioSuperadministrador">
        {{ estaPersona.username }}
      </div>
      <input type="text" v-if="usuarioSuperadministrador" v-model="nuevoPermiso" placeholder="Nuevo permiso" />
      <div class="botonMenuCx" v-if="usuarioSuperadministrador" @click.stop="addPermisos">Dar permiso</div>
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
import { fragmentoMinimoPersona } from "../utilidades/recursosGql";

const QUERY_PERSONA = gql`
  query ($idUsuario: ID!) {
    Usuario(idUsuario: $idUsuario) {
      ...fragMinimoPersona
    }
  }
  ${fragmentoMinimoPersona}
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

      basicWidthFoto: 70,
      basicFontSizeNombre: 15,
    };
  },
  props: {
    idPersona: String,
    seleccionado: Boolean,
    menuContextual: Boolean,
    factorEscala: {
      type: String,
      default: "1",
    },
    opcionesMenuCx: {
      type: Array,
    },
  },
  computed: {
    soyYo() {
      if (this.mounted && this.idPersona && this.usuario) {
        return this.usuario.id == this.idPersona ? true : false;
      }
      return false;
    },
    offsetFoto() {
      return {
        width: this.basicWidthFoto * this.factor + "px",
        height: this.basicWidthFoto * this.factor + "px",
      };
    },
    offsetIcono() {
      return {
        width: this.basicWidthFoto * this.factor + "px",
      };
    },
    factor() {
      return Number(this.factorEscala);
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
            mutation ($nuevoPermiso: String!, $idUsuario: ID!) {
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
  margin-bottom: 50px;
  user-select: none;
}

.fotografia {
  border-radius: 50%;
  pointer-events: none;
}

#contenedorAlertas {
  position: absolute;
  top: 0;
  right: 0;
}

.nombres {
  background-color: rgb(243, 216, 204);
  position: absolute;
  top: 105%;
  left: 50%;
  width: 170%;
  transform: translateX(-50%);
  text-align: center;
  border: 1px solid rgb(105, 24, 24);
  padding: 3px 5px;
  border-radius: 5px;
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.2),
    0 1px 5px 0 rgba(0, 0, 0, 0.12);
}
.nombreSeleccionado {
  background-color: rgb(241, 116, 63);
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
  top: -50%;
  left: 110%;
  min-width: 140px;

  z-index: 10;
  background-color: rgb(177, 177, 159);
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.2),
    0 1px 5px 0 rgba(0, 0, 0, 0.12);
}
</style>