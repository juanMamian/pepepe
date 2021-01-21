<template>
  <div class="iconoPersona" :class="{ yo: soyYo, seleccionado: seleccionado }">
    <img
      id="fotografia"
      :src="this.serverUrl + '/api/usuarios/fotografias/' + estaPersona.id"
      alt=""
    />
    <div id="contenedorAlertas">
      <slot name="alertas"></slot>
    </div>
    <div id="nombres">{{ estaPersona.nombres }}</div>
    <div id="menuCxPersona" v-show="menuContextual">
      <div class="botonMenuCx" @click.stop="copiarId">{{ estaPersona.id }}</div>
      <div
        class="infoMenuCx"
        :key="index"
        v-for="(permiso, index) in estaPersona.permisos"
      >
        {{ permiso }}
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

export default {
  name: "IconoPersona",
  data() {
    return { nuevoPermiso: null, mounted: false };
  },
  props: {
    estaPersona: {
      type: Object,
      default: function () {
        return {
          id: "-1",
        };
      },
    },
    aceptado: Boolean,
    seleccionado: Boolean,
    menuContextual: Boolean,
    opcionesMenuCx: {
      type: Array,
    },
  },
  computed: {
    soyYo() {
      if (this.mounted && this.estaPersona && this.$store.state.usuario) {
        console.log(`id store: ${this.$store.state.usuario.id}`);
        console.log(`id estaPersona: ${this.estaPersona.id}`);
        return this.$store.state.usuario.id == this.estaPersona.id
          ? true
          : false;
      }
      return false;
    },
  },
  methods: {
    addPermisos() {
      console.log(
        `enviando ${this.nuevoPermiso} para el usuario con id ${this.estaPersona.id}`
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
            idUsuario: this.estaPersona.id,
          },
        })
        .then(() => {})
        .catch((error) => {
          console.log("error: " + error);
        });
    },
    copiarId(e) {
      let str = e.target.innerHTML.trim();
      const el = document.createElement("textarea");
      el.value = str;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    },
  },
  mounted() {
    this.mounted = true;
  },
};
</script>

<style scoped>
.iconoPersona {
  cursor: pointer;
  position: relative;
  border-radius: 50%;
  user-select: none;
  width: 70px;
  height: 70px;
}
.iconoPersona:hover{
  background-color: rgb(218, 218, 218);
}

#fotografia {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  position: absolute;
  pointer-events: none;
}
#contenedorAlertas{
  position: absolute;
  top: 0;
  right: 0;
}
.yo {
  border: 1px solid purple;
}

#nombres {
  position: absolute;
  top: 105%;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
}
.seleccionado {
  border: 2px solid black;
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