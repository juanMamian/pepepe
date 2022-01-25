<template>
  <div class="ventanitaNodo" :class="{ seleccionado }" @mouseup.left.stop="">
    <div class="barraSuperior" @click.stop="">
      <a :href="clienteUrl + '/#/homeNodoSolidaridad/' + esteNodo.id">
        <img
          src="@/assets/iconos/home.svg"
          class="boton botonBarraSuperior"
          id="botonIrHome"
          title="Abrir la página de este nodo"
        />
      </a>
      <svg
        aria-hidden="true"
        focusable="false"
        data-prefix="far"
        data-icon="check-circle"
        class="svg-inline--fa fa-check-circle fa-w-16 boton botonBarraSuperior"
        role="img"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
        :title="
          esteNodo.estadoDesarrollo === 'completado'
            ? 'Desmarcar como completado'
            : 'Marcar como completado'
        "
        id="botonMarcarCompletado"
        :class="{
          deshabilitado: togglingEstado || !usuarioAdministrador,
        }"
        v-show="!togglingEstado"
        @click.stop="toggleEstadoNodo()"
      >
        <path
          :fill="esteNodo.estadoDesarrollo === 'completado' ? 'white' : ''"
          d="M256 8C119.033 8 8 119.033 8 256s111.033 248 248 248 248-111.033 248-248S392.967 8 256 8zm0 48c110.532 0 200 89.451 200 200 0 110.532-89.451 200-200 200-110.532 0-200-89.451-200-200 0-110.532 89.451-200 200-200m140.204 130.267l-22.536-22.718c-4.667-4.705-12.265-4.736-16.97-.068L215.346 303.697l-59.792-60.277c-4.667-4.705-12.265-4.736-16.97-.069l-22.719 22.536c-4.705 4.667-4.736 12.265-.068 16.971l90.781 91.516c4.667 4.705 12.265 4.736 16.97.068l172.589-171.204c4.704-4.668 4.734-12.266.067-16.971z"
        ></path>
      </svg>
      <img
        src="@/assets/iconos/equis.svg"
        alt="cerrar"
        title="Cerrar ventana de nodo"
        id="botonCerrar"
        @click.stop="$emit('cerrarme')"
      />
    </div>
    <div id="zonaNombre">
      <input
        @keypress.enter.prevent="guardarNuevoNombre"
        ref="inputNuevoNombre"
        v-model="nuevoNombre"
        style="width: 250px"
        @click.stop=""
        @blur="editandoNombre = false"
        @keydown="keydownInputNuevoNombre"
        v-show="editandoNombre"
        type="text"
        class="inputNuevoNombre inputNombreCosa"
        :class="{ deshabilitado: enviandoNuevoNombre }"
      />
      <div id="nombre" v-show="!editandoNombre" @click="toggleEditandoNombre">
        <svg
          aria-hidden="true"
          focusable="false"
          data-prefix="fas"
          data-icon="cog"
          class="svg-inline--fa fa-cog fa-w-16 iconoNodo"
          v-if="esteNodo.tipoNodo === 'trabajo'"
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
        >
          <path
            :fill="colorIcono"
            d="M487.4 315.7l-42.6-24.6c4.3-23.2 4.3-47 0-70.2l42.6-24.6c4.9-2.8 7.1-8.6 5.5-14-11.1-35.6-30-67.8-54.7-94.6-3.8-4.1-10-5.1-14.8-2.3L380.8 110c-17.9-15.4-38.5-27.3-60.8-35.1V25.8c0-5.6-3.9-10.5-9.4-11.7-36.7-8.2-74.3-7.8-109.2 0-5.5 1.2-9.4 6.1-9.4 11.7V75c-22.2 7.9-42.8 19.8-60.8 35.1L88.7 85.5c-4.9-2.8-11-1.9-14.8 2.3-24.7 26.7-43.6 58.9-54.7 94.6-1.7 5.4.6 11.2 5.5 14L67.3 221c-4.3 23.2-4.3 47 0 70.2l-42.6 24.6c-4.9 2.8-7.1 8.6-5.5 14 11.1 35.6 30 67.8 54.7 94.6 3.8 4.1 10 5.1 14.8 2.3l42.6-24.6c17.9 15.4 38.5 27.3 60.8 35.1v49.2c0 5.6 3.9 10.5 9.4 11.7 36.7 8.2 74.3 7.8 109.2 0 5.5-1.2 9.4-6.1 9.4-11.7v-49.2c22.2-7.9 42.8-19.8 60.8-35.1l42.6 24.6c4.9 2.8 11 1.9 14.8-2.3 24.7-26.7 43.6-58.9 54.7-94.6 1.5-5.5-.7-11.3-5.6-14.1zM256 336c-44.1 0-80-35.9-80-80s35.9-80 80-80 80 35.9 80 80-35.9 80-80 80z"
          ></path>
        </svg>
        <svg
          aria-hidden="true"
          focusable="false"
          data-prefix="fas"
          data-icon="star"
          class="svg-inline--fa fa-star fa-w-18 iconoNodo"
          v-if="esteNodo.tipoNodo === 'objetivo'"
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 576 512"
        >
          <path
            :fill="colorIcono"
            d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z"
          ></path>
        </svg>
        {{ esteNodo.nombre }}
      </div>
    </div>

    <div
      class="contenedorBotones"
      id="contenedorBotonesSelectoresContenidoNodo"
      :style="{ visibility: mostrando != null ? 'visible' : '' }"
    >
      <div
        class="boton botonSelectorContenidoNodo botonBarraSuperior"
        :class="{
          deshabilitado:
            (!esteNodo.descripcion ||
              esteNodo.descripcion.length < 1 ||
              esteNodo.descripcion === 'Sin descripcion' ||
              esteNodo.descripcion === 'Sin descripción') &&
            !usuarioAdministrador,
        }"
        :style="{
          borderColor: mostrando === 'descripcion' ? 'white' : 'black',
        }"
        @click="mostrando = 'descripcion'"
        :title="mostrando === 'descripcion' ? '' : 'Mostrar descripción'"
      >
        <img src="@/assets/iconos/info.svg" alt="Descripción" />
      </div>
      <div
        class="boton botonSelectorContenidoNodo botonBarraSuperior"
        :style="{
          borderColor: mostrando === 'responsables' ? 'white' : 'black',
        }"
        @click="mostrando = 'responsables'"
        :title="
          mostrando === 'responsables' ? '' : 'Mostrar responsables del nodo'
        "
      >
        <img src="@/assets/iconos/user.svg" alt="Responsables" />
      </div>
      <div
        class="boton botonSelectorContenidoNodo botonBarraSuperior"
        v-if="usuarioAdministrador"
        @click="mostrando = 'keywords'"
        :style="{
          borderColor: mostrando === 'keywords' ? 'white' : 'black',
        }"
        :class="{
          deshabilitado:
            (!esteNodo.keywords || esteNodo.keywords.length < 1)            
        }"
        :title="mostrando === 'keywords' ? '' : 'Mostrar palabras clave'"
      >
        <img src="@/assets/iconos/tag.svg" alt="Keywords" />
      </div>
      <div
        class="boton botonSelectorContenidoNodo botonBarraSuperior"
        @click="mostrando = 'enlaces'"
        :style="{
          borderColor: mostrando === 'enlaces' ? 'white' : 'black',
        }"
        :class="{
          deshabilitado:
            !esteNodo.enlaces || esteNodo.enlaces.length < 1            
        }"
        :title="mostrando === 'enlaces' ? '' : 'Mostrar Enlaces'"
      >
        <img src="@/assets/iconos/link.svg" alt="Enlace" />
      </div>
      
    </div>
    <div id="contenidos">
      <div
        id="zonaDescripcion"
        class="zonaPrimerNivel"
        v-show="mostrando === 'descripcion'"
      >
        <div
          id="descripcion"
          class="contenidoTexto"
          ref="descripcion"
          v-show="!editandoDescripcion"
          @click="toggleEditandoDescripcion"
        >
          {{ esteNodo.descripcion }}
        </div>

        <textarea
          id="inputNuevoDescripcion"
          ref="inputNuevoDescripcion"
          class="inputCampoInformacion inputTextoNodo"
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

      <div
        id="zonaKeywords"
        class="zonaPrimerNivel"
        v-show="mostrando === 'keywords'"
      >
        <div
          id="keywords"
          class="contenidoTexto"
          ref="keywords"
          v-show="!editandoKeywords"
          @click="toggleEditandoKeywords"
        >
          {{ esteNodo.keywords }}
        </div>

        <textarea
          id="inputNuevoKeywords"
          ref="inputNuevoKeywords"
          :class="{ letrasRojas: nuevoKeywordsIlegal }"
          class="inputCampoInformacion inputTextoNodo"
          v-model="nuevoKeywords"
          v-show="editandoKeywords"
          @keydown.esc.stop="editandoKeywords = false"
          @keydown.enter.prevent.stop="guardarNuevoKeywords"
        />
        <div class="contenedorBotonesCampo" v-show="editandoKeywords">
          <img
            src="@/assets/iconos/save.svg"
            class="botonGuardarCampo"
            alt="Guardar"
            title="Guardar palabras clave"
            id="botonGuardarKeywords"
            @click="guardarNuevoKeywords"
          />
          <img
            src="@/assets/iconos/equis.svg"
            class="botonGuardarCampo"
            alt="Cancelar"
            title="Cancelar edición"
            id="botonCancelarEdicionKeywords"
            @click="editandoKeywords = false"
          />
        </div>
        <loading v-show="enviandoNuevoKeywords" texto="Enviando..." />
      </div>

      <div
        id="zonaEnlaces"
        class="zonaPrimerNivel"
        v-show="mostrando === 'enlaces'"
      >
        <recurso-externo-nodo
          v-for="recursoExterno of esteNodo.recursosExternos"
          :key="recursoExterno.id"
          :usuarioResponsableAmplio="usuarioResponsableAmplio"
          :esteRecurso="recursoExterno"
          :idNodo="esteNodo.id"
        />
      </div>

      <div
        id="zonaResponsables"
        class="zonaPrimerNivel"
        v-show="mostrando === 'responsables'"
      >
        <div class="contenedorBotonesZona" id="contenedorBotonesResponsables">
          <img
            src="@/assets/iconos/mas.svg"
            alt="Entrar"
            :title="
              esteNodo.responsables.length < 1
                ? 'Asumir'
                : 'Solicitar participación'
            "
            id="botonEntrarResponsables"
            class="botonControlZona botonControlResponsables"
            :class="{ deshabilitado: enviandoQueryResponsables }"
            v-show="!usuarioResponsable && !usuarioPosibleResponsable"
            @click.stop="entrarResponsables"
          />
          <img
            src="@/assets/iconos/minus.svg"
            alt="Salir"
            title="Abandonar"
            id="botonAbandonarResponsables"
            class="botonControlZona botonControlResponsables"
            :class="{ deshabilitado: enviandoQueryResponsables }"
            v-show="
              (usuarioResponsable || usuarioPosibleResponsable) &&
              (!idResponsableSeleccionado ||
                idResponsableSeleccionado === usuario.id)
            "
            @click.stop="abandonarListaResponsables"
          />
          <img
            src="@/assets/iconos/handshake.svg"
            alt="Aceptar"
            title="Aceptar como responsable"
            id="botonAbandonarResponsables"
            class="botonControlZona botonControlResponsables"
            :class="{ deshabilitado: enviandoQueryResponsables }"
            v-show="
              usuarioResponsable &&
              idResponsableSeleccionado &&
              !esteNodo.responsables.includes(idResponsableSeleccionado)
            "
            @click="aceptarResponsable(idResponsableSeleccionado)"
          />
          <loading texto="" v-show="enviandoQueryResponsables" />
        </div>
        <div
          id="listaResponsables"
          @click.stop="idResponsableSeleccionado = null"
        >
          <icono-persona-autonomo
            v-for="idResponsable of esteNodo.responsables.concat(
              esteNodo.posiblesResponsables
            )"
            :style="{
              opacity: esteNodo.posiblesResponsables.includes(idResponsable)
                ? 0.5
                : 1,
            }"
            :key="idResponsable"
            :idPersona="idResponsable"
            :seleccionado="idResponsableSeleccionado == idResponsable"
            :factorEscala="'0.7'"
            @click.native.stop="idResponsableSeleccionado = idResponsable"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Loading from "../utilidades/Loading.vue";
import IconoPersonaAutonomo from "../usuario/IconoPersonaAutonomo.vue";
import {
  MixinEdicionNodoSolidaridad,
  MixinEdicionVinculosNodoSolidaridad,
  MixinGeneralNodoSolidaridad,
  MixinPermisosUsuarioNodoSolidaridad,
  MixinVisualesNodosSolidaridad,
} from "./ConfiguracionNodoSolidaridad";
import RecursoExternoNodo from "./homeNodo/RecursoExternoNodo.vue";

export default {
  name: "VentanitaNodo",
  components: { Loading, IconoPersonaAutonomo, RecursoExternoNodo },
  mixins: [
    MixinEdicionNodoSolidaridad,
    MixinEdicionVinculosNodoSolidaridad,
    MixinPermisosUsuarioNodoSolidaridad,
    MixinGeneralNodoSolidaridad,
    MixinVisualesNodosSolidaridad,
  ],
  data() {
    return {
      deshabilitado: false,
      mostrandoResponsables: false,
      mostrando: "descripcion",
      noSeleccionable: true,
    };
  },
  props: {
    idNodo: String,
    esteNodo: Object,
    seleccionado: Boolean,
  },  
  mounted() {
    this.responsablesSolicitados = this.esteNodo.responsablesSolicitados;
  },
};
</script>

<style scoped>
.ventanitaNodo {
  border: 1px solid #585858;
  border-radius: 5px;
  min-height: 10px;
  position: relative;
  padding: 5px 0px;
  padding-bottom: 10px;
  background-color: var(--atlasFondoNodo);
  max-height: 90%;
  overflow-y: scroll;
  overflow-x: visible;
  box-shadow: 3px 3px grey, 3px 3px 3px 3px grey;
}
.barraSuperior {
  display: flex;
}

.seleccionado {
  box-shadow: 2px 2px 2px 2px rgb(54, 54, 54);
  padding-bottom: 25px;
}
#iconoCompletado {
  width: 25px;
  height: 25px;
  margin-left: 10px;
  border-radius: 50%;
  cursor: pointer;
  opacity: 0.7;
}
#iconoCompletado:hover {
  opacity: 1;
}
.iconoNodo {
  height: 15px;
  margin-right: 0.2%;
}
#nombre {
  margin: 15px 0px;
  font-size: 18px;
  padding: 5px 10%;

  text-align: center;
  color: rgb(49, 49, 49);
  font-weight: bold;
}
.inputNuevoNombre {
  margin: 10px auto;
  display: block;
  background-color: rgba(255, 255, 255, 0.274);
  border: 1px solid black;
  padding: 5px;
  text-align: center;
}
#contenedorBotonesSelectoresContenidoNodo {
  display: flex;
  text-align: center;
  justify-content: center;
  margin-top: 30px;
  margin-bottom: 10px;
}

.botonBarraSuperior {
  width: 22px;
  height: 22px;    
  margin-left: 10px;  
}

.botonSelectorContenidoNodo{
  width: 32px;
  height: 32px;    
}

.zonaPrimerNivel {
  border: 1px solid white;
  border-radius: 20px;
  background-color: rgba(255, 255, 255, 0.342);
  padding: 20px;
  margin: 0px 10px;
}
.contenedorBotonesCampo {
  margin: 5px auto;
  display: flex;
  justify-content: center;
}
.botonControlZona {
  width: 20px;
  height: 20px;
  cursor: pointer;
  margin: 0px 5px;
}
.botonGuardarCampo {
  width: 15px;
  cursor: pointer;
  margin: 0px 5px;
  opacity: 0.8;
}
.inputCampoInformacion {
  width: 100%;
}
#listaResponsables {
  margin-top: 10px;
}
.iconoPersonaAutonomo {
  margin-right: 20px;
  margin-left: 15px;
  vertical-align: middle;
  margin-top: 5px;
  margin-bottom: 55px;
}
.personaPosibleResponsable {
  opacity: 0.5;
}

.trianguloBullet {
  border: 10px solid transparent;
  border-left: 10px solid black;
  display: inline-block;

  transform-origin: 25% 70%;
  transition: transform 0.2s;
}
#botonCerrar {
  margin-right: 1%;
  margin-left: auto;
  opacity: 0.6;
  width: 20px;
  height: 20px;
  cursor: pointer;
}
</style>