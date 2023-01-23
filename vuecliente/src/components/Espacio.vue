<template>
  <div class="espacio" :class="{ mostrando, deshabilitado:eliminandose }">
    <div class="barraSuperior">
      <div id="zona1">
        <!-- <div
          class="trianguloBullet"
          @click="abierto = !abierto"
          :style="[
            {
              transform: abierto ? 'rotate(90deg)' : '',
            },
          ]"
        ></div> -->

        <div id="zonaNombre">
          <input
            @keypress.enter.prevent="guardarNuevoNombre"
            ref="inputNuevoNombre"
            v-model="nuevoNombre"
            style="width: 250px"
            @click.stop=""
            @blur="guardarNuevoNombre"
            @keydown="keydownInputNuevoNombre"
            v-show="editandoNombre"
            type="text"
            class="inputNuevoNombre inputNombreCosa"
            :class="{ deshabilitado: enviandoNuevoNombre }"
          />
          <loading texto="" v-show="enviandoNuevoNombre" />
          <div
            id="elNombre"
            :class="{
              deshabilitado: enviandoNuevoNombre,
              administrador,
            }"
            v-show="!editandoNombre"
            @click="toggleEditandoNombre"
          >
            {{ esteEspacio.nombre }}
          </div>
        </div>
      </div>
      <div id="zonaBotones">
        <div
          class="boton botonMostrar selector"
          @click="
            mostrando = mostrando === 'descripcion' ? null : 'descripcion'
          "
          :class="{activo:mostrando==='descripcion'}"
        >
          <img src="@/assets/iconos/info.svg" alt="Informacion" />
        </div>
        <div
          class="boton botonMostrar selector"
          @click="
            mostrando = mostrando === 'administrador' ? null : 'administrador'
          "
          :class="{activo:mostrando==='administrador'}"
        >
          <img src="@/assets/iconos/userCog.svg" alt="Administrador" />
        </div>
        <div
          class="boton botonMostrar selector"
          @click="mostrando = mostrando === 'calendario' ? null : 'calendario'"
          :class="{activo:mostrando==='calendario'}"
        >
          <img src="@/assets/iconos/calendar.svg" alt="Calendario" />
        </div>
        <div
          class="boton botonMostrar selector"
          @click="
            mostrando = mostrando === 'listaEventos' ? null : 'listaEventos'
          "
          :class="{activo:mostrando==='listaEventos'}"
        >
          <img src="@/assets/iconos/clipboardList.svg" alt="Lista de eventos" />
        </div>

        <div
          class="boton"
          id="botonEliminarse"
          @click="eliminarse"
          v-show="administrador || usuarioSuperadministrador"
        >
          <img src="@/assets/iconos/trash.svg" alt="Eliminar" />
        </div>
        
      </div>
    </div>

    <!-- Zona descripcion -->
    <div
      id="zonaDescripcion"
      class="zonaPrimerNivel"
      v-show="mostrando === 'descripcion'"
    >
    <div id="zonaParaChiquis" @click="toggleEstadoParaChiquis" :class="{deshabilitado: settingEstadoParaChiquis}">
      <img src='@/assets/iconos/babySolid.svg' alt='Chiqui' style='height: 15px' /> {{esteEspacio.paraChiquis?'Espacio dirigido a niñxs pequeñxs':'Espacio abierto para todos'}}
    </div>
      <div
        id="descripcion"
        class="contenidoTexto"
        ref="descripcion"
        v-show="!editandoDescripcion"
        @click="toggleEditandoDescripcion"
      >
        {{ esteEspacio.descripcion }}
      </div>

      <textarea
        id="inputNuevoDescripcion"
        ref="inputNuevoDescripcion"
        class="inputTextoNodo"
        :class="{ letrasRojas: nuevoDescripcionIlegal }"
        v-model="nuevoDescripcion"
        v-show="editandoDescripcion"
      />
      <div class="contenedorBotonesCampo" v-show="editandoDescripcion">
        <img
          src="@/assets/iconos/save.svg"
          class="botonGuardarCampo"
          alt="Guardar"
          title="Guardar descripción"
          id="botonGuardarDescripcion"
          @click="guardarNuevoDescripcion"
        />
        <img
          src="@/assets/iconos/equis.svg"
          class="botonGuardarCampo"
          alt="Cancelar"
          title="Cancelar edición"
          id="botonCancelarEdicionDescripcion"
          @click="editandoDescripcion = false"
        />
      </div>
      <loading v-show="enviandoNuevoDescripcion" texto="Enviando..." />
    </div>

    <!-- Zona administrador -->
    <div
      id="zonaAdministrador"
      class="zonaPrimerNivel"
      v-show="mostrando === 'administrador'"
    >
      <icono-persona-autonomo :idPersona="esteEspacio.idAdministrador" />
    </div>

    <!-- Zona calendario -->
    <div
      id="zonaCalendario"
      class="zonaPrimerNivel"
      v-if="mostrando === 'calendario'"
    >
      <div id="contenedorControlesCalendario">
        <div
          class="boton botonControlCalendario"
          v-if="administrador"
          v-show="mostrando === 'calendario' && !introduciendoEventoPublicoCalendario"
          :title="'Programar una sesión de ' + esteEspacio.nombre"
          @click="iniciarCreacionEvento"
        >
          <img src="@/assets/iconos/calendarPlus.svg" alt="Calendario" />
        </div>
        <div
          class="boton botonControlCalendario"
          v-show="mostrando === 'calendario' && introduciendoEventoPublicoCalendario"
          title="Cancelar creación de evento"
          @click="introduciendoEventoPublicoCalendario = false"
        >
          <img src="@/assets/iconos/times.svg" alt="Cancelar" />
        </div>
      </div>
      <calendario
        :idUsuarioTarget="usuario.id"
        ref="calendario"
        :idParent="esteEspacio.id"
        enfasis="eventosPublicos"
        tipoParent="espacio"
        @iniciaCreacionEvento="introduciendoEventoPublicoCalendario = false"
      />
    </div>

    <div
      id="zonaListaEventos"
      class="zonaPrimerNivel"
      v-if="mostrando === 'listaEventos'"
    >
      <div id="controlesListaEventos" class="contenedorControles">
        <div
          class="boton"
          title="Crear nuevo evento de este espacio"
          @click="iniciarCuadroCrearEventoPublico"
          v-show="!mostrandoCuadroCrearEventoPublico && (administrador || usuarioSuperadministrador)"
        >
          <img src="@/assets/iconos/plusCircle.svg" alt="Crear evento" />
        </div>
        <div
          class="boton"
          title="Cancelar"
          @click="mostrandoCuadroCrearEventoPublico = false"
          v-show="mostrandoCuadroCrearEventoPublico"
        >
          <img src="@/assets/iconos/times.svg" alt="Cancelar" />
        </div>
        <loading v-show="creandoEventoPublico" texto="" />
      </div>
      <div
        v-show="mostrandoCuadroCrearEventoPublico"
        id="cuadroCrearEventoPublico"
        :class="{deshabilitado: enviandoNuevoEventoPublico}"
      >
        <div class="bloqueCampoNuevoEventoPublico">
          <div class="nombreCampo">Nombre</div>
          <input
            class="inputCampo"
            type="text"
            name=""
            id="inputNombreNuevoEventoPublico"
            ref="inputNombreNuevoEventoPublico"
            v-model="nombreNuevoEventoPublico"
          />
        </div>

        <div class="bloqueCampoNuevoEventoPublico">
          <div class="nombreCampo">Inicio</div>
          <input
            type="date"
            v-model="dateInicioNuevoEventoPublico"
            class="inputCampo"
          />
          <input
            type="time"
            v-model="horarioInicioNuevoEventoPublico"
            class="inputCampo"
          />
        </div>

        <div class="bloqueCampoNuevoEventoPublico">
          <div class="nombreCampo">Duración</div>
          <input
            type="number"
            ref="inputDuracionNuevoEventoPublico"
            v-model="duracionNuevoEventoPublico"
            class="inputCampo"
          />
          Minutos
        </div>

        <div class="boton" id="botonCrearEventoPublico" :class="{deshabilitado: !duracionNuevoEventoPublico || duracionNuevoEventoPublico<5}" style="margin: 10px auto" title="Crear evento" v-show="!creandoEventoPublico" @click="crearEventoPublico">
          <img src="@/assets/iconos/calendarPlus.svg" alt="CrearEvento">
        </div>
        <loading texto="" v-show="enviandoNuevoEventoPublico" style="margin: 10px auto" />
      </div>
      <lista-eventos-espacio
        :idEspacio="this.esteEspacio.id"
        ref="listaEventosEspacio"                
      />
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import { charProhibidosNombreCosa, charProhibidosTexto } from "./configs";
import Loading from "./utilidades/Loading.vue";
import IconoPersonaAutonomo from "./usuario/IconoPersonaAutonomo.vue";
import Calendario from "./utilidades/Calendario.vue";
import ListaEventosEspacio from "./ListaEventosEspacio.vue";
import { fragmentoEventoPublico } from "./utilidades/fragsCalendario";

export default {
  components: {
    Loading,
    IconoPersonaAutonomo,
    Calendario,
    ListaEventosEspacio,
  },
  name: "Espacio",
  props: {
    esteEspacio: Object,
  },
  data() {
    return {
      abierto: false,
      mostrando: null,

      nuevoNombre: "Nuevo nombre",
      editandoNombre: false,
      enviandoNuevoNombre: false,

      nuevoDescripcion: "Nueva descripcion",
      editandoDescripcion: false,
      enviandoNuevoDescripcion: false,

      mostrandoCuadroCrearEventoPublico: false,
      nombreNuevoEventoPublico: 'Espacio de '+this.esteEspacio.nombre,
      dateInicioNuevoEventoPublico: null,
      dateFinalNuevoEventoPublico: null,
      horarioInicioNuevoEventoPublico:null,
      horarioFinalNuevoEventoPublico:null,
      duracionNuevoEventoPublico:60,
      creandoEventoPublico: false,
      enviandoNuevoEventoPublico:false,

      introduciendoEventoPublicoCalendario:false,

      settingEstadoParaChiquis:false,

      eliminandose: false,
    };
  },
  methods: {
    toggleEstadoParaChiquis(){
      if(!this.usuarioSuperadministrador && !this.administrador){
        console.log("No autorizado");
        return;
      }

      this.settingEstadoParaChiquis=true;
      this.$apollo.mutate({
        mutation: gql`
          mutation($idEspacio: ID!, $nuevoEstado:Boolean!){
            setEspacioParaChiquis(idEspacio: $idEspacio, nuevoEstado: $nuevoEstado){
               id
               paraChiquis 
            }
          }
          `,
          variables:{
            idEspacio: this.esteEspacio.id,
            nuevoEstado:!this.esteEspacio.paraChiquis,  
          }
        }).then(()=>{
          this.settingEstadoParaChiquis=false;            
        }).catch((error)=>{
          console.log('Error: '+ error);
          this.settingEstadoParaChiquis=false;
        })
    },
    guardarNuevoNombre() {
      this.nuevoNombre = this.$refs.inputNuevoNombre.value;

      if (this.nuevoNombreIlegal) {
        console.log(`No enviado`);
        return;
      }
      if (this.nuevoNombre == this.esteEspacio.nombre) {
        this.editandoNombre = false;
        return;
      }
      console.log(`guardando nuevo nombre`);
      this.enviandoNuevoNombre = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idEspacio: ID!, $nuevoNombre: String!) {
              editarNombreEspacio(
                idEspacio: $idEspacio
                nuevoNombre: $nuevoNombre
              ) {
                id
                nombre
              }
            }
          `,
          variables: {
            idEspacio: this.esteEspacio.id,
            nuevoNombre: this.nuevoNombre,
          },
        })
        .then(() => {
          this.enviandoNuevoNombre = false;
          this.editandoNombre = false;
        })
        .catch((error) => {
          this.enviandoNuevoNombre = false;
          console.log(`Error. E :${error}`);
        });
    },
    guardarNuevoDescripcion() {
      if (this.nuevoDescripcionIlegal) {
        console.log(`No enviado`);
        return;
      }
      if (this.nuevoDescripcion == this.esteEspacio.descripcion) {
        this.editandoDescripcion = false;
        return;
      }
      console.log(`guardando nuevo descripcion`);
      this.enviandoNuevoDescripcion = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idEspacio: ID!, $nuevoDescripcion: String!) {
              editarDescripcionEspacio(
                idEspacio: $idEspacio
                nuevoDescripcion: $nuevoDescripcion
              ) {
                id
                descripcion
              }
            }
          `,
          variables: {
            idEspacio: this.esteEspacio.id,
            nuevoDescripcion: this.nuevoDescripcion,
          },
        })
        .then(() => {
          this.enviandoNuevoDescripcion = false;
          this.editandoDescripcion = false;
        })
        .catch((error) => {
          this.enviandoNuevoDescripcion = false;
          console.log(`Error. E :${error}`);
        });
    },
    toggleEditandoDescripcion() {
      if (!this.administrador) {
        return;
      }
      this.$refs.inputNuevoDescripcion.style.height =
        this.$refs.descripcion.offsetHeight + "px";
      this.editandoDescripcion = !this.editandoDescripcion;
      this.nuevoDescripcion = this.esteEspacio.descripcion;

      if (this.editandoDescripcion) {
        this.$nextTick(() => {
          this.$refs.inputNuevoDescripcion.focus();
        });
      }
    },
    toggleEditandoNombre(e) {
      if (this.administrador) {
        e.stopPropagation();

        this.editandoNombre = true;
        this.nuevoNombre = this.esteEspacio.nombre;
        this.$nextTick(() => {
          this.$refs.inputNuevoNombre.focus();
        });
      }
    },
    keydownInputNuevoNombre(e) {
      if (e.key === "Escape") {
        this.editandoNombre=false;
      }
    },
    iniciarCreacionEvento() {
      this.introduciendoEventoPublicoCalendario = true;
    },
    eliminarse() {
      if (
        !confirm(
          "¿Confirmar la eliminación de este espacio? (Esta acción no puede deshacerse)"
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
            mutation ($idEspacio: ID!) {
              eliminarEspacio(idEspacio: $idEspacio)
            }
          `,
          variables: {
            idEspacio: this.esteEspacio.id,
          },
        })
        .then(() => {
          this.$emit("meElimine");
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
        });
    },       
    iniciarCuadroCrearEventoPublico() {
      this.nombreNuevoEventoPublico="Espacio de "+this.esteEspacio.nombre;
      var dateActual = new Date();
      dateActual.setHours(8);
      dateActual.setMinutes(0);
      dateActual.setSeconds(0);
      dateActual.setMilliseconds(0);

      dateActual = new Date(dateActual.getTime() + 86400000);
      // const offset = dateActual.getTimezoneOffset()    

      const dateActualString = dateActual.toISOString().split('T')[0];
      const dateActualPlusHour = new Date(dateActual.getTime() + 3600000);
      const dateActualPlusHourString = dateActualPlusHour.toISOString().split('T')[0];      
      

      this.dateInicioNuevoEventoPublico=dateActualString;
      this.dateFinalNuevoEventoPublico=dateActualPlusHourString;

      this.horarioInicioNuevoEventoPublico='08:00';
      this.horarioFinalNuevoEventoPublico='09:00';
      this.mostrandoCuadroCrearEventoPublico = true;
    },
    crearEventoPublico() {
      if (!this.administrador && !this.usuarioSuperadministrador) {
        return;
      }      
      console.log(`Date saved: ${this.dateInicioNuevoEventoPublico}`);
      this.duracionNuevoEventoPublico=this.$refs.inputDuracionNuevoEventoPublico.value;
      var dateInicio=new Date(this.dateInicioNuevoEventoPublico);      
      console.log(`Date parsed: ${dateInicio}`);

      const diaMesInicio=dateInicio.getUTCDate();
      console.log(`Creando evento público el ${diaMesInicio}`);
      const horasInicio=parseInt(this.horarioInicioNuevoEventoPublico.substring(0, 2));
      const minutosInicio=parseInt(this.horarioInicioNuevoEventoPublico.substring(3));

      dateInicio.setDate(diaMesInicio);
      dateInicio.setHours(horasInicio);
      dateInicio.setMinutes(minutosInicio);

      var dateFinal=new Date(dateInicio.getTime()+this.duracionNuevoEventoPublico*60000);
            
      console.log(`Creando evento público el ${diaMesInicio}`);

      this.enviandoNuevoEventoPublico = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($infoNuevoEvento: InputCrearEventoPublico) {
              crearEventoPublico(infoNuevoEvento: $infoNuevoEvento) {
                ...fragEventoPublico
              }
            }
            ${fragmentoEventoPublico}
          `,
          variables: {
            infoNuevoEvento: {
              nombre: this.$refs.inputNombreNuevoEventoPublico.value,
              horarioInicio: dateInicio,
              horarioFinal: dateFinal,
              tipoParent: "espacio",
              idParent: this.esteEspacio.id,
            },
          },
        })
        .then(({ data: { crearEventoPublico } }) => {
          this.enviandoNuevoEventoPublico = false;
          this.$refs.listaEventosEspacio.addEventoCache(crearEventoPublico);
          this.mostrandoCuadroCrearEventoPublico=false;
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
          this.enviandoNuevoEventoPublico = false;
        });
    },
    
  },
  computed: {
    administrador() {
      if (!this.usuarioLogeado) return false;

      return this.usuario.id === this.esteEspacio.idAdministrador;
    },
    nuevoNombreIlegal() {
      if (this.nuevoNombre.length < 1) {
        return true;
      }
      if (charProhibidosNombreCosa.test(this.nuevoNombre)) {
        return true;
      }
      return false;
    },
    nuevoDescripcionIlegal() {
      if (!this.nuevoDescripcion || this.nuevoDescripcion.length < 1) {
        return true;
      }
      if (charProhibidosTexto.test(this.nuevoDescripcion)) {
        return true;
      }
      return false;
    },
  },
  watch: {
    mostrando(mostrando) {
      if (mostrando != "descripcion") this.editandoDescripcion = false;

      if (mostrando === "descripcion") {
        if (
          !this.esteEspacio.descripcion ||
          this.esteEspacio.descripcion.length < 1
        ) {
          if (!this.editandoDescripcion) {
            this.toggleEditandoDescripcion();
          }
        }
      } 
    },
    introduciendoEventoPublicoCalendario(introduciendo) {
      if (introduciendo) {
        this.$refs.calendario.eventoSiendoCreado = {
          idParent: this.esteEspacio.id,
          tipoParent: "espacio",
          tipoEvento: "eventoPublico",
          idAdministrador: this.usuario.id,
        };
      } else {
        this.$refs.calendario.eventoSiendoCreado = null;
      }
    },
    
  },
};
</script>

<style scoped>
.espacio {
  padding: 10px 2%;
  box-sizing: border-box;
}
.espacio.mostrando {
  background-color: var(--grisHover);
  border-radius: 15px;
}
.barraSuperior {
  display: flex;
}
#zona1 {
  display: flex;
  flex-shrink: 1;
}
.trianguloBullet {
  margin-right: 10px;
}
#elNombre.administrador {
  color: var(--paletaSelect);
}
#zonaBotones {
  margin-left: auto;
  margin-right:min(10px, 1vw);
  display: flex;
  align-items: center;
}
.botonMostrar {

  margin: 0px 5px;
}
#botonEliminarse {
}
.botonControlCalendario {
  height: 17px;
}
.zonaPrimerNivel {
  margin-top: 15px;
  min-height: 50px;
  padding: 10px 2%;
  border-radius: 10px;
}
#zonaParaChiquis{
  display: flex;
  padding: 5px 10px;
  gap: 10px;
  align-items: center;
}
#zonaAdministrador {
  display: flex;
}
#contenedorControlesCalendario {
  display: flex;
  align-items: center;
  flex-direction: row-reverse;
  width: 100%;
}
#zonaCalendario {
  padding: 0px 0px;
  width: 100%;
}
.calendario {
  margin-top: 10px;
  width:100%;
}
#cuadroCrearEventoPublico{
  background-color: rgba(128, 128, 128, 0.123); 
  padding: 20px 5px;

}
.bloqueCampoNuevoEventoPublico{
  display: flex;
  align-items: center;
  margin: 10px 0px;
  flex-wrap: wrap;
}
.bloqueCampoNuevoEventoPublico input{
  margin:0px 5px;
  font-size:11px;
  max-width: 120px;
}
.listaEventosEspacio{
  max-height: 70vh;
  
}
</style>