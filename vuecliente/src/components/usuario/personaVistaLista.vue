<template>
  <div class="personaVistaLista" :class="{ seleccionado }">
    <div id="barraSuperior">
      <div class="iconoPersona">
        <img
          src="@/assets/iconos/teacher.svg"
          alt="Profesor"
          v-if="estaPersona.permisos.includes('maestraVida-profesor')"
        />
        <img
          src="@/assets/iconos/user.svg"
          alt="Usuario"
          v-if="!estaPersona.permisos.includes('maestraVida-profesor')"
        />
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
          v-show="
            usuario &&
            (usuarioProfe ||
              usuario.id === estaPersona.id ||
              usuarioSuperadministrador)
          "
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
          :class="{activo:mostrando==='administracion'}"
          @click="
            mostrando = mostrando === 'administracion' ? null : 'administracion'
          "
        >
          <img src="@/assets/iconos/cog.svg" alt="Cog" />
        </div>
        <div class="boton" @click="alienar" title="alienar" v-show="usuarioProfe || usuarioAdministrador">
          <img src="@/assets/iconos/alienar.svg" alt="Virus">
        </div>
         <div
          class="boton selector"
          v-if="usuarioLogeado"
          :title="
            mostrando === 'objetivos'
              ? 'Ocultar objetivos'
              : 'Mostrar objetivos'
          "
          @click="
            mostrando = mostrando === 'objetivos' ? null : 'objetivos'
          "
          :class="{activo:mostrando==='objetivos'}"
        >
          <img src="@/assets/iconos/starSolid.svg" alt="Cog" />
        </div>
      </div>
    </div>

    <div id="zonaContenidosMostrando">
      <div id="zonaAdministracion" v-show="mostrando === 'administracion'">
        <div id="barraInfoAdicional" v-show="seleccionado">
          <div id="username" v-if="usuarioSuperadministrador">
            {{ estaPersona.username }}
          </div>
        </div>
        <div id="contenedorAcciones" class="contenedorControles">
          <div
            class="boton"
            title="Restaurar password (123456)"
            v-show="!reseteandoPassword"
            @click="resetearPassword"
          >
            <img src="@/assets/iconos/key.svg" alt="Llave" />
          </div>
          <loading texto="" v-show="reseteandoPassword" />
        </div>
      </div>
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
      <div id="zonaObjetivos" class="zonaPrimerNivel" v-if="mostrando==='objetivos'">
        <ventana-lista
          ref="ventanaLista"
          :idNodoRoot="estaPersona.id"
          tipoNodoRoot="usuario"
        />
      </div>
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import Calendario from "../utilidades/Calendario.vue";
import Loading from "../utilidades/Loading.vue";
import VentanaLista from '../atlasSolidaridad/ventanaLista/ventanaLista.vue';
export default {
  components: { Calendario, Loading, VentanaLista },
  props: {
    estaPersona: Object,
    seleccionado: Boolean,
  },
  name: "PersonaVistaLista",
  data() {
    return {
      mostrando: null,
      reseteandoPassword: false,
      alienando:false,
    };
  },
  methods: {
    resetearPassword() {
      if (
        !confirm(
          "¿Confirmar resetear el password de " + this.estaPersona.nombres + "?"
        )
      ) {
        return;
      }
      console.log(`Reseteando password usuario`);
      this.reseteandoPassword = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idUsuario: ID!) {
              resetearPasswordUsuario(idUsuario: $idUsuario)
            }
          `,
          variables: {
            idUsuario: this.estaPersona.id,
          },
        })
        .then(() => {
          this.reseteandoPassword = false;
          alert("Contraseña reseteada");
        })
        .catch(() => {
          this.reseteandoPassword = false;
        });
    },
    alienar(){
      if(!this.usuarioProfe && !this.usuarioSuperadministrador){
        return;
      }

      this.alienando=true;
      this.$apollo.query({
        query:gql`
          query($idAlienado:ID!){
            alienarUsuario(idAlienado: $idAlienado)          
          }
        `,
        variables:{
          idAlienado:this.estaPersona.id
        }
      }).then(({data:{alienarUsuario}})=>{
        console.log(`Alienando`);
        this.alienando=true;
        this.$store.commit("logearse", alienarUsuario);     
        this.$router.push("/miPerfil");
      }).catch((error)=>{
        console.log(`Error: ${error}`);
        this.alienando=false;
      })
    }
  },
  watch: {
    seleccionado(seleccionado) {
      if (!seleccionado) {
        this.mostrando = null;
      }
    },
  },
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
#barraInfoAdicional{
  display: flex;
}
#contenedorControlesPersona {
  margin-left: auto;
}
</style>