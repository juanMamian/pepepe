<template>
  <div
    class="eventoPublicoCalendario"
    :style="[estiloPos]"
    :class="{ deshabilitado: eliminandose }"
  >
    <div
      id="barra"
      v-show="modo === 'barra'"
      :style="estiloSize"
      :class="{ seleccionado }"
    ></div>
    <div
      id="bloque"
      v-show="modo === 'bloque'"
      :style="estiloSize"
      :class="{ extranjero, seleccionado }"
    >
      <div id="zonaNombre">
        <div
          id="elNombre"
          :class="{
            administrador,
          }"
        >
          {{ esteEvento.nombre }}
        </div>
      </div>
      <div id="contenedorControlesEvento" :class="{ seleccionado }">
        <div
          class="boton botonControlEvento"
          title="Eliminar este evento"
          v-if="administrador || usuarioSuperadministrador"
          @click.stop="eliminarse"
        >
          <img src="@/assets/iconos/trash.svg" alt="Eliminar" />
        </div>
        <div
          class="boton botonControlEvento"
          title="Expandir este evento"
          @click.stop="
            $router.push($route.path + '/ventanaEventoPublico/' + esteEvento.id)
          "
        >
          <img src="@/assets/iconos/expand.svg" alt="Expandir" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import { MixinBasicoEventos } from "../MixinsEventos";

export default {
  name: "EventoPublicoCalendario",
  components: {},
  props: {
    esteEvento: Object,
    horaPx: Number,
    extranjero: Boolean,
    seleccionado: Boolean,
    modoEventosPublicosExtranjeros: String,
    infoOffset: Object,
    diaCalendarioOver: Object,
  },
  mixins: [MixinBasicoEventos],
  data() {
    return {
      mostrando: null,
      eliminandose: false,
      recogido: false,
    };
  },
  methods: {
    eliminarse() {
      if (
        !confirm(
          "¿Confirmar la eliminación de este evento? (Esta acción no puede deshacerse)"
        )
      )
        return;

      if (!this.administrador && !this.usuarioSuperadministrador) {
        return;
      }
      this.eliminandose = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idEvento: ID!, $tipoEvento: String!) {
              eliminarEvento(idEvento: $idEvento, tipoEvento: $tipoEvento)
            }
          `,
          variables: {
            idEvento: this.esteEvento.id,
            tipoEvento: "eventoPublico",
          },
        })
        .then(() => {
          this.$emit("meElimine");
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
        });
    },
  },
  computed: {
    millisFinalLocal() {
      const fecha = new Date(this.esteEvento.horarioFinal);
      const millis = fecha.getTime();
      const offset = fecha.getTimezoneOffset() * 60000;
      return millis - offset;
    },
    millisInicioLocal() {
      const fecha = new Date(this.esteEvento.horarioInicio);
      const millis = fecha.getTime();
      const offset = fecha.getTimezoneOffset() * 60000;
      return millis - offset;
    },
    duracionMinutos() {
      return (this.millisFinalLocal - this.millisInicioLocal) / 60000;
    },

    estiloSize() {
      const anchoPx = (this.duracionMinutos / 60) * this.horaPx;
      return {
        width: anchoPx + "px",
      };
    },
    estiloPos() {
      const millisDia = this.millisInicioLocal % 86400000;

      return {
        left: (millisDia / 3600000) * this.horaPx + "px",
        top: this.infoOffset.top + "px",
      };
    },

    administrador() {
      if (!this.usuarioLogeado) return false;

      return this.usuario.id === this.esteEvento.idAdministrador;
    },

    modo() {
      if (
        this.extranjero &&
        this.modoEventosPublicosExtranjeros === "barra" &&
        !this.seleccionado
      ) {
        return "barra";
      }
      return "bloque";
    },
  },
  watch: {
    dateInicio(dateInicio) {
      console.log(`Cambio de date inicio. Ahora inicio en ${dateInicio}`);
      if (
        dateInicio < this.diaCalendarioOver.date ||
        dateInicio.getTime() > this.diaCalendarioOver.date.getTime() + 86400000
      ) {
        console.log(`${this.esteEvento.nombre} dice: Me cambiaron de día`);
        this.$emit("meCambiaronDia", this.esteEvento);
      }
    },
  },
};
</script>

<style scoped>
.eventoPublicoCalendario {
  position: absolute;
}
#barra {
  height: 15px;
  background-color: var(--paletaMain);
  opacity: 0.5;
}
#bloque {
  height: 100px;
  box-sizing: border-box;
  border-width: 2px;
  border-style: solid;
  border-color: transparent;
  border-radius: 5px;
  background-color: var(--paletaMain);
}
#bloque.extranjero {
  opacity: 0.6;
}
#bloque.seleccionado {
  height: 100px;
  border-color: var(--paletaSelect);
}
#contenedorControlesEvento {
  display: flex;
  position: absolute;
  bottom: 10px;
  left: 50%;
  align-items: center;
  flex-direction: row-reverse;
  transform: translateX(-50%);
  box-sizing: border-box;
  padding: 0px 5%;
}
#contenedorControlesEvento:not(.seleccionado) {
  display: none;
}
#contenedorControlesEvento.seleccionado {
  display: flex;
}

#contenedorControlesEvento .boton {
  height: 15px;
  margin: 0px 5%;
}
#elNombre {
  text-align: center;
  font-size: 10px;
  padding: 5px 3px;
}
.inputNuevoNombre {
  width: 100%;
  box-sizing: border-box;
  font-size: 11px;
}
</style>