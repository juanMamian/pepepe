<template>
  <div class="personaVistaLista" :class="{seleccionado}">
    <div id="barraSuperior">
      <div class="iconoPersona">

        <img src="@/assets/iconos/teacher.svg" alt="Profesor" v-if="estaPersona.permisos.includes('maestraVida-profesor')"/>
        <img src="@/assets/iconos/user.svg" alt="Usuario" v-if="!estaPersona.permisos.includes('maestraVida-profesor')" />
      </div>
      <div id="zonaNombres">
        <div id="nombres">{{ estaPersona.nombres }}</div>
      </div>
      <div id="zonaApellidos">
        <div id="apellidos">{{ estaPersona.apellidos }}</div>
      </div>

      <div
        id="contenedorControlesPersona"
        class="contenedorControles"
        v-show="seleccionado"
      >
        <div
          class="boton selector"
          :title="
            mostrando === 'calendario'
              ? 'Ocultar calendario'
              : 'Mostrar calendario'
          "
          :class="{ activo: mostrando === 'calendario' }"
          v-show="usuario && (usuarioProfe || usuario.id===estaPersona.id || usuarioSuperadministrador)"
          @click="mostrando = mostrando === 'calendario' ? null : 'calendario'"
        >
          <img src="@/assets/iconos/calendar.svg" alt="calendario" />
        </div>

        <div
          class="boton selector"
          v-if="usuarioSuperadministrador"
          :title="
            mostrando === 'administracion'
              ? 'Ocultar administracion'
              : 'Mostrar administracion'
          "
          @click="
            mostrando = mostrando === 'administracion' ? null : 'administracion'
          "
        >
          <img src="@/assets/iconos/cog.svg" alt="Cog" />
        </div>
      </div>
    </div>
    <div id="zonaContenidosMostrando">
      <div
        id="zonaCalendario"
        class="zonaPrimerNivel"
        v-if="mostrando === 'calendario'"
      >
        <calendario
          :idUsuarioTarget="estaPersona.id"
          ref="calendario"
          enfasis="eventosPersonales"
        />
      </div>
    </div>
  </div>
</template>

<script>
import Calendario from "../utilidades/Calendario.vue";
export default {
  components: { Calendario },
  props: {
    estaPersona: Object,
    seleccionado: Boolean,
  },
  name: "PersonaVistaLista",
  data() {
    return {
      mostrando: null,
    };
  },
  watch:{
      seleccionado(seleccionado){
          if(!seleccionado){
              this.mostrando=null;
          }
      }
  }
};
</script>

<style scoped>
.personaVistaLista {
  width: 100%;
  font-family: Salsa, cursive;
  color: gray;
}
.personaVistaLista.seleccionado {
    background-color: rgba(128, 128, 128, 0.342);
}
#barraSuperior {
  display: flex;
  font-size: 15px;
  padding: 25px 15px;
  flex-wrap: wrap;
  width: 100%;
}
.iconoPersona {
  height: 20px;
  width: 20px;
}
.iconoPersona img {
  height: 100%;
}
#zonaNombres {
  margin: 0px 15px;
}

#contenedorControlesPersona {
  margin-left: auto;
}
</style>