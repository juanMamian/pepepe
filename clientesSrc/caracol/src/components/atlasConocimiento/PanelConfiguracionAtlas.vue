<template>
  <div
    id="panelConfiguracionAtlas"
    @mouseup.left.stop=""
    @mousedown.left.stop=""
    :style="[offset]"
  >
    <img
      src="@/assets/iconos/settings.png"
      alt="Configuración"
      title="Configuración"
      id="grabber"
      @click.stop="abierto = !abierto"
    />

    <div id="configuracionesGenerales">
      <div class="configuracionGeneral">
        <div class="labelConfiguracion">Modo</div>
        <img
          src="@/assets/iconos/estudiante.png"
          class="iconoModo"
          alt="Estudiante"
          title="Cambiar a modo estudiante"
          :class="{ activo: yo.atlas.configuracion.modo === 'estudiante', deshabilitado:enviandoQueryModo }"
          @click="setModo('estudiante')"
        />
        <img
          src="@/assets/iconos/clase.png"
          class="iconoModo"
          alt="Experto"
          title="Cambiar a modo experto"
          :class="{ activo: yo.atlas.configuracion.modo === 'experto', deshabilitado:enviandoQueryModo }"
          @click="setModo('experto')"
        />
      </div>
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
export default {
  name: "PanelConfiguracionAtlas",
  props: {
    yo: Object,
  },
  data() {
    return {
      abierto: false,
      enviandoQueryModo: false,
    };
  },
  computed: {
    offset() {
      if (this.abierto) {
        return {
          right: "0px",
        };
      }
      return {
        left: "100%",
      };
    },
  },
  methods: {
    setModo(modo) {
      if (!this.usuario || !this.usuario.id) return;
      this.enviandoQueryModo = true;

      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idUsuario: ID!, $nuevoModo: String!) {
              setModoUsuarioAtlas(idUsuario: $idUsuario, nuevoModo: $nuevoModo){
                  id
                  atlas{
                      configuracion{
                          modo
                      }                    
                  }
              }
            }
          `,
          variables: {
            idUsuario: this.usuario.id,
            nuevoModo: modo,
          },
        })
        .then(() => {
          this.enviandoQueryModo = false;
          
        })
        .catch((error) => {
          this.enviandoQueryModo = false;
          console.log(`Error: ${error}`);
        });
    },
  },
};
</script>

<style scoped>
#panelConfiguracionAtlas {
  position: absolute;
  top: 90px;
  box-shadow: 2px 2px 2px 2px rgb(190, 190, 190);
  min-width: 100px;
  min-height: 100px;
  max-height: 80%;
  background-color: whitesmoke;
  width: min(80%, 350px);
}
#grabber {
  width: 30px;
  height: 30px;
  cursor: pointer;
  position: absolute;
  top: 0px;
  right: 100%;
}
.iconoModo {
  border-radius: 50%;
  width: 30px;
  cursor: pointer;
  opacity: 0.6;
}

.iconoModo.activo {
  opacity: 1;
  pointer-events: none;
  background-color: cadetblue;
}

.labelConfiguracion {
  margin-right: 15px;
}

.configuracionGeneral {
  padding: 5px 10px;
  display: flex;
  align-items: center;
}
</style>