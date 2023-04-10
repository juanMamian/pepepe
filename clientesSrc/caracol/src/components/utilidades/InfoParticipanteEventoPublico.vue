<template>
  <div class="infoParticipanteEventoPublico">
    <div id="barraSuperior">
      <div class="boton iconoUser">
        <img src="@/assets/iconos/user.svg" alt="Usuario" />
      </div>

      <div id="nombrePersona">
        {{ estaParticipacion.nombresPersona }}
      </div>

      <div class="contenedorControles" style="margin-left: auto">
        <div
          class="boton"
          @click="
            mostrando = mostrando === 'descripcion' ? null : 'descripcion'
          "
          :class="{ activo: mostrando === 'descripcion' }"
        >
          <img src="@/assets/iconos/info.svg" alt="Info" />
        </div>
      </div>
    </div>

    <div id="barraTiempos">
      <div id="barraPresencia" :style="[offsetBarraPresencia]"></div>
    </div>

    <div id="bloqueInformacion" v-show="mostrando === 'descripcion'">
      <div id="nombreEventoPersonal">
        {{ this.estaParticipacion.nombre }}
      </div>
      <div id="horariosEventoPersonal">
        {{ horaInicioLegible }}-{{ horaFinalLegible }}
      </div>
      <div id="descripcion" v-if="estaParticipacion.descripcion">
        {{ estaParticipacion.descripcion }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "InfoParticipanteEventoPublico",
  props: {
    estaParticipacion: Object,
    eventoPublico: Object,
    duracionEventoPublico: Number,
  },
  data() {
    return {
      mostrando: null,
    };
  },
  computed: {
    offsetBarraPresencia() {
      const diffToStart =
        this.dateInicio - new Date(this.eventoPublico.horarioInicio);
      const diffToStartMinutos = diffToStart / 60000;
      const porcentajeLeft =
        (diffToStartMinutos * 100) / this.duracionEventoPublico;
      const porcentajeWidth =
        (this.duracionMinutos * 100) / this.duracionEventoPublico;

      return {
        left: porcentajeLeft + "%",
        width: porcentajeWidth + "%",
      };
    },
    duracionMinutos() {
      return (this.dateFinal - this.dateInicio) / 60000;
    },
    horaInicioLegible() {
      var hora = this.dateInicio.getHours();
      var minutos = this.dateInicio.getMinutes();
      if (("" + hora).length < 2) {
        hora = "0" + hora;
      }
      if (("" + minutos).length < 2) {
        minutos = "0" + minutos;
      }
      return hora + ":" + minutos;
    },
    horaFinalLegible() {
      var hora = this.dateFinal.getHours();
      var minutos = this.dateFinal.getMinutes();
      if (("" + hora).length < 2) {
        hora = "0" + hora;
      }
      if (("" + minutos).length < 2) {
        minutos = "0" + minutos;
      }
      return hora + ":" + minutos;
    },
    dateInicio() {
      return new Date(this.estaParticipacion.horarioInicio);
    },
    dateFinal() {
      return new Date(this.estaParticipacion.horarioFinal);
    },
  },
};
</script>

<style scoped>
.infoParticipanteEventoPublico {
}
#barraSuperior {
  display: flex;
  align-items: center;
}
.iconoUser {
  margin: 0px 8px;
}
#nombrePersona{
    font-size: 12px;
}
#barraTiempos {
  width: 100%;
  height: 12px;
  background-color: #c4c4c4;
  position: relative;
}
#barraPresencia {
  position: relative;
  height: 100%;
  background-color: var(--paletaVerde);
}
#nombreEventoPersonal{
    font-size: 10px;
    opacity: 0.8;
    margin-left: 1vw;
}
#horariosEventoPersonal{
    font-size: 10px;
    margin-left: 1vw;

}
#descripcion{
    margin: 5px min(10px, 1vw);
    border: 1px solid white;
    border-radius: 10px;
    font-size: 12px;
    font-family: Salsa, cursive;
    padding: 10px;
}
.boton {
  border-style: solid;
  border-width: 1px;
  border-radius: 50%;
}
.boton:not(.activo) {
  border-color: transparent;
}
.boton.activo {
  border-color: white;
}
</style>