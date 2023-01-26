<template>
  <div
    class="nodoConocimiento"
    :style="[estiloPosicion, estiloSize, estiloZeta, estiloBolita]"
    :class="{ escondido, deNodoSeleccionado: seleccionado, fantasmeado }"
    @click.ctrl.capture="stopProp"
    @mouseup.left="guardarPosicion"
    @mousemove="arrastrarNodo"
    @mouseleave="arrastrandoNodo = false"
    @dblclick="abrirPaginaNodo"
  >
    <div
      class="boton"
      id="botonAbrirMenuCx"
      @click.stop="$emit('abroMenuContextual')"
      v-show="seleccionado && !menuCx"
    >
      <img src="@/assets/iconos/ellipsisVertical.svg" alt="Opciones" />
    </div>
    <div id="zonaArrastre" v-show="arrastrandoNodo"></div>

    <div
      v-if="usuarioSuperadministrador"
      v-show="configuracionAtlas.posicionando"
      id="fuerzaCentroMasa"
      class="fuerzaMovimiento"
      :style="[estiloFuerzaCentroMasa]"
    >
      <div class="flechitaFuerza"></div>
    </div>
    <div
      v-if="usuarioSuperadministrador"
      v-show="configuracionAtlas.posicionando"
      id="fuerzaColision"
      class="fuerzaMovimiento"
      :style="[estiloFuerzaColision]"
    >
      <div class="flechitaFuerza"></div>
    </div>

    <div
      id="iconoNodo"
      :class="{
        deNodoSeleccionado: seleccionado,
        previoDeSeleccionado,
      }"
    >
      <img
        v-if="esteNodo.tipoNodo === 'concepto'"
        src="@/assets/iconos/atlas/lightbulbEmpty.svg"
      />
      <img v-else src="@/assets/iconos/atlas/fireSolid.svg" />
    </div>
    <img
      src="@/assets/iconos/success.png"
      alt="Aprendido"
      title="Este tema ya ha sido aprendido"
      v-show="nodoAprendido && modoAtlas === 'estudiante'"
      :style="[
        {
          width: parseInt(20 * factorZoom) + 'px',
          left: parseInt(-10 * factorZoom) + 'px',
          top: parseInt(-10 * factorZoom) + 'px',
        },
      ]"
      class="imagenAprendido"
    />
    <img
      src="@/assets/iconos/target.png"
      alt="Objetivo"
      v-show="esTarget"
      class="imagenTarget"
    />

    <div
      id="menuContextual"
      v-show="menuCx"
      @mousedown.stop=""
      @dblclick.stop=""
      @click.stop=""
      @mouseup.stop=""
    >
      <div class="seccionMenuCx" @click="abrirPaginaNodo">
        {{ esteNodo.nombre }}
      </div>
      <div
        id="opcionesTipoNodo"
        :class="{ deshabilitado: settingTipoNodo }"
        v-if="usuarioExpertoNodo"
      >
        <div
          class="boton selector"
          :class="{ activo: esteNodo.tipoNodo === 'concepto' }"
          @click.stop="setTipoNodo('concepto')"
        >
          <img src="@/assets/iconos/atlas/lightbulbEmpty.svg" alt="Concepto" />
        </div>

        <div
          class="boton selector"
          :class="{ activo: esteNodo.tipoNodo === 'skill' }"
          @click.stop="setTipoNodo('skill')"
        >
          <img src="@/assets/iconos/atlas/fireSolid.svg" alt="Habilidad" />
        </div>
      </div>
      <loading v-show="settingTipoNodo" style="margin: 5px auto" />
      <div
        class="botonMenuCx"
        v-if="
          usuarioSuperadministrador == true || usuarioAdministradorAtlas == true
        "
        @click.stop="eliminarEsteNodo"
      >
        Eliminar
      </div>
      <div
        class="botonMenuCx"
        :class="{ deshabilitado: esTarget }"
        @click.stop="$emit('mePongoEnMira')"
      >
        <img
          class="iconoMenuCx"
          src="@/assets/iconos/target.png"
          alt="mira"
          v-show="!enviandoQueryTarget"
        />
        <loading v-show="enviandoQueryTarget" />
        Poner en la mira
      </div>
      <div
        class="botonMenuCx"
        v-if="usuarioSuperadministrador"
        @click.stop="copiarId"
      >
        {{ esteNodo.id }}
      </div>
      <div
        class="botonMenuCx selectorSubseccionMenuCx"
        v-show="
          yo.atlas && yo.atlas.colecciones && yo.atlas.colecciones.length > 0
        "
      >
        <img
          src="@/assets/iconos/userNodes.png"
          alt="nodos"
          class="iconoMenuCx"
        />
        Colecciones
        <div class="subseccionMenuCx">
          <div
            class="botonMenuCx"
            v-for="coleccion of yo.atlas.colecciones"
            :key="coleccion.id"
            @click.stop="toggleNodoEnColeccion(coleccion.id)"
          >
            <img
              src="@/assets/iconos/check.svg"
              alt="Check"
              style="height: 12px; margin-right: 10px; border-radius: 50%"
              v-show="togglingNodoEnColeccion != coleccion.id"
              :style="[
                {
                  backgroundColor: coleccion.idsNodos.includes(esteNodo.id)
                    ? 'var(--atlasVerde)'
                    : '',
                },
              ]"
            />
            <loading v-show="togglingNodoEnColeccion === coleccion.id" />
            {{ coleccion.nombre }}
          </div>
        </div>
      </div>
      <!-- <div
        class="botonMenuCx"
        v-if="usuarioLogeado && !esNodoObjetivo"
        @click.stop="setNodoObjetivo(true)"
      >
        Añadir a objetivos
      </div>
      <div
        class="botonMenuCx"
        v-if="usuarioLogeado && esNodoObjetivo"
        @click.stop="setNodoObjetivo(false)"
      >
        Retirar de objetivos
      </div> -->
      <div
        class="botonMenuCx"
        v-if="usuarioLogeado"
        @click.stop="toggleAprendido"
      >
        <img
          src="@/assets/iconos/check.svg"
          alt="check"
          class="iconoMenuCx"
          style="border-radius: 50%"
          v-show="!togglingAprendido"
          :style="[
            {
              backgroundColor: nodoAprendido
                ? 'var(--atlasConocimientoCheck)'
                : '',
            },
          ]"
        />
        <loading v-show="togglingAprendido" texto="" />
        {{ nodoAprendido ? "Desm" : "M" }}arcar como aprendido
      </div>
      <div
        class="botonMenuCx"
        v-if="usuarioLogeado"
        @click.stop="marcarEstudiado"
        v-show="aprendible"
        :class="{ deshabilitado: enviandoFechaEstudiado }"
        
      >
        <img
          src="@/assets/iconos/readme.svg"
          alt="Read"
          class="iconoMenuCx"
          v-show="!enviandoFechaEstudiado"
        />
        <loading v-show="enviandoFechaEstudiado" texto="" />
        <span>
           {{"Estudiado " +enrichedToReadableDate(datosUsuarioEsteNodo.estudiado)}}
        </span>
      </div>
      <div
        class="botonMenuCx"
        v-if="usuarioLogeado"
        v-show="nodoEstudiado && !nodoAprendido && !editandoDiasRepaso"
        :class="{ deshabilitado: creandoIteracionRepaso }"
        @click.stop="editandoDiasRepaso = !editandoDiasRepaso"
      >
        <img src="@/assets/iconos/clock.svg" alt="Reloj" class="iconoMenuCx" />
        <span v-show="diasRepaso > 1">{{
          "Repaso cada " + diasRepaso + " dia"
        }}</span>
        <span v-show="diasRepaso > 1">s</span>
        <span></span>
        <loading texto="" v-show="creandoIteracionRepaso" />
      </div>
      <div class="seccionMenuCx" v-show="editandoDiasRepaso">
        <loading v-show="settingPeriodoRepaso" />
        <label for="inputDiasRepaso">Dias de repaso: </label
        ><input
          style="width: min(70px, 80vw)"
          type="number"
          name="inputDiasRepaso"
          :class="{ deshabilitado: settingPeriodoRepaso }"
          ref="inputDiasRepaso"
          min="1"
          id="inputDiasRepaso"
          @focus="$event.target.select()"
          @blur="editandoDiasRepaso=false;"
          @keypress.enter="setPeriodoRepaso"
        />
      </div>
      <template
        v-if="
          nodoSeleccionado &&
          nodoSeleccionado.id != esteNodo.id &&
          (usuarioSuperadministrador == true ||
            usuarioAdministradorAtlas == true)
        "
      >
        <div class="seccionMenuCx">{{ nodoSeleccionado.nombre }}</div>
        <div
          class="botonMenuCx"
          @click.stop="crearVinculo('continuacion', nodoSeleccionado, esteNodo)"
        >
          Continua aquí
        </div>
        <div
          class="botonMenuCx"
          @click.stop="crearVinculo('continuacion', esteNodo, nodoSeleccionado)"
        >
          Continua desde aquí
        </div>
        <div
          class="botonMenuCx"
          v-show="esteNodo.vinculos.some((v) => v.idRef == nodoSeleccionado.id)"
          @click.stop="eliminarVinculo(esteNodo, nodoSeleccionado)"
        >
          Desconectar
        </div>
      </template>
    </div>
    <div
      @click="clickCartelNombre"
      id="nombre"
      :style="[estiloCartelNombre]"
      ref="nombre"
    >
      {{ callingPosiciones ? esteNodo.puntaje : esteNodo.nombre }}
    </div>

    <div
      class="cuadritoDescripcionNodo"
      v-if="esteNodo && esteNodo.descripcion"
      v-show="seleccionado && !callingPosiciones && mostrarDescripcion"
    >
      <div class="descripcionNodo">{{ esteNodo.descripcion }}</div>
      <img
        @click.stop="abrirPaginaNodo"
        src="@/assets/iconos/ir.png"
        alt="Ir"
        title="Abrir este nodo"
        class="botonAbrirNodo"
      />
      <div
        class="botonEquis"
        @click.stop="mostrarDescripcion = false"
        @mousedown.stop=""
        @mouseup.stop=""
        id="botonCerrarDescripcion"
      >
        <div class="linea1"></div>
        <div class="linea2"></div>
      </div>
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import Loading from "../utilidades/Loading.vue";
import { fragmentoDatoNodoConocimiento } from "./fragsAtlasConocimiento";
import { QUERY_DATOS_USUARIO_NODOS } from "./AtlasConocimiento.vue";
export default {
  components: { Loading },
  name: "NodoConocimiento",
  props: {
    esteNodo: {
      type: Object,
      required: true,
    },
    datosUsuarioEsteNodo: {
      type: Object,
    },
    enviandoQueryTarget: Boolean,
    esNodoObjetivo: Boolean,
    esTarget: Boolean,
    yo: Object,
    modoAtlas: String,
    escondido: Boolean,
    centroVista: Object,
    idNodoMenuCx: String,
    idsNodosAprendidos: Array,
    idsNodosEstudiados: Array,
    idsNodosFrescos: Array,
    idsNodosPresentesCabeza: Array,
    nodoSeleccionado: Object,
    seleccionado: Boolean,
    fantasmeado: Boolean,
    previoDeSeleccionado: Boolean,
    usuarioAdministradorAtlas: {
      type: Boolean,
      default: false,
    },
    esquinasDiagrama: Object,
    callingPosiciones: Boolean,
    factorZoom: Number,
    configuracionAtlas: Object,
  },
  data() {
    return {
      arrastrandoNodo: false,
      nombreEditable: false,
      nombreEditandose: false,

      baseSize: {
        x: 50,
        y: 50,
      },

      posicion: {
        x: 0,
        y: 0,
      },
      togglingNodoEnColeccion: null,

      estiloNombreBase: {
        minWidth: 20,
        fontSize: 12,
        minHeight: 10,
        padding: 5,
        borderRadius: 4,
      },
      mostrarDescripcion: false,
      creandoIteracionRepaso: false,

      enviandoFechaEstudiado: false,
      togglingAprendido: false,

      settingTipoNodo: false,

      editandoDiasRepaso: false,
      settingPeriodoRepaso: false,
    };
  },
  computed: {
    menuCx() {
      return this.idNodoMenuCx == this.esteNodo.id ? true : false;
    },
    size() {
      let fSize = Object.assign({}, this.baseSize);
      if (this.seleccionado) {
        let baseX = this.baseSize.x;
        let baseY = this.baseSize.y;
        fSize.x = Math.round(baseX * 1.1);
        fSize.y = Math.round(baseY * 1.1);
      }
      return { ...fSize };
    },
    estiloPosicion() {
      //Posicion ajustada a las esquinas del diagrama:
      const posXAjustada = this.posicion.x - this.esquinasDiagrama.x1;
      const posYAjustada = this.posicion.y - this.esquinasDiagrama.y1;

      //Posicion absoluta
      const posY = Math.round(
        (posYAjustada - this.size.y / 2) * this.factorZoom
      );
      const posX = Math.round(
        (posXAjustada - this.size.x / 2) * this.factorZoom
      );

      //Ajustar respecto del centro de la vista
      // posY -= this.centroVista.y;
      // posX -= this.centroVista.x;
      return {
        top: posY + "px",
        left: posX + "px",
      };
    },
    estiloZeta() {
      let valorZ = 0;
      if (this.arrastrandoNodo || this.seleccionado) {
        valorZ = 10;
      }
      if (this.menuCx) {
        valorZ = 11;
      }
      return {
        zIndex: valorZ,
      };
    },
    estiloSize() {
      return {
        width: this.size.x * this.factorZoom + "px",
        height: this.size.y * this.factorZoom + "px",
      };
    },
    permisosUsuario: function () {
      return this.$store.state.usuario.permisos;
    },
    aprendible() {
      if (!this.esteNodo.vinculos.some((v) => v.rol == "target")) {
        return true;
      }
      var idsNecesarios = this.esteNodo.vinculos
        .filter((v) => v.rol == "target")
        .map((v) => v.idRef);
      return idsNecesarios.every((id) =>
        this.idsNodosPresentesCabeza.includes(id)
      );
    },
    nodoAprendido() {
      return this.idsNodosAprendidos.includes(this.esteNodo.id);
    },
    nodoEstudiado() {
      return this.idsNodosEstudiados.includes(this.esteNodo.id);
    },
    nodoRepasar() {
      return (
        !this.idNodoAprendido &&
        this.nodoEstudiado &&
        !this.idsNodosFrescos.includes(this.esteNodo.id)
      );
    },
    nodoPresenteCabeza() {
      return this.idsNodosPresentesCabeza.includes(this.esteNodo.id);
    },
    estiloCartelNombre() {
      var bColor = "var(--atlasConocimientoOff)";
      var color = "black";
      if (this.modoAtlas === "estudiante") {
        if (this.nodoPresenteCabeza) {
          bColor = "var(--atlasConocimientoCheck)";
        } else if (this.nodoRepasar) {
          bColor = "var(--atlasConocimientoRepaso)";
        } else if (this.aprendible) {
          bColor = "var(--atlasConocimientoAvailable)";
        } else {
          color = "#313131";
        }
      } else if (this.modoAtlas === "experto") {
        if (this.usuarioExpertoNodo) {
          bColor = "var(--atlasConocimientoCheck)";
        }
      }

      return {
        backgroundColor: bColor,
        color,
        minWidth:
          parseInt(this.estiloNombreBase.minWidth * this.factorZoom) + "px",
        fontSize:
          parseInt(this.estiloNombreBase.fontSize * this.factorZoom) + "px",
        minHeight:
          parseInt(this.estiloNombreBase.minHeight * this.factorZoom) + "px",
        padding:
          parseInt(this.estiloNombreBase.padding * this.factorZoom) + "px",
        borderRadius:
          parseInt(this.estiloNombreBase.borderRadius * this.factorZoom) + "px",
      };
    },
    usuarioExpertoNodo() {
      if (!this.usuario || !this.usuario.id) return false;
      return this.esteNodo.expertos.includes(this.usuario.id);
    },
    estiloFuerzaCentroMasa() {
      return {
        width:
          Math.round(this.esteNodo.fuerzaCentroMasa.fuerza * this.factorZoom) +
          "px",
        height: Math.round(3 * this.factorZoom) + "px",
        transform:
          "rotate(" + this.esteNodo.fuerzaCentroMasa.direccion + "rad)",
      };
    },
    estiloFuerzaColision() {
      return {
        width:
          Math.round(this.factorZoom * this.esteNodo.fuerzaColision.fuerza) +
          "px",
        height: Math.round(3 * this.factorZoom) + "px",
        transform: "rotate(" + this.esteNodo.fuerzaColision.direccion + "rad)",
      };
    },
    estiloBolita() {
      let border = "2px solid transparent";
      let backgroundColor = "rgb(195 195 195)";

      if (this.previoDeSeleccionado) {
        border = "2px solid var(--atlasConocimientoSeleccion)";
        backgroundColor = "rgb(195 195 195)";
      }
      if (this.seleccionado) {
        border = "2px solid transparent";
        backgroundColor = "var(--atlasConocimientoSeleccion)";
      }

      return {
        border,
        backgroundColor,
      };
    },
    diasRepaso() {
      if (!this.datosUsuarioEsteNodo?.periodoRepaso) {
        return 2;
      }
      return Math.floor(this.datosUsuarioEsteNodo.periodoRepaso / 86400000);
    },
  },
  methods: {
    setTipoNodo(nuevoTipoNodo) {
      if (!this.usuarioExpertoNodo) {
        return;
      }

      if (this.esteNodo.tipoNodo === nuevoTipoNodo) {
        console.log("Operación innecesaria");
        return;
      }
      this.settingTipoNodo = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idNodo: ID!, $nuevoTipoNodo: String!) {
              setTipoNodo(idNodo: $idNodo, nuevoTipoNodo: $nuevoTipoNodo) {
                id
                tipoNodo
              }
            }
          `,
          variables: {
            idNodo: this.esteNodo.id,
            nuevoTipoNodo,
          },
        })
        .then(() => {
          this.settingTipoNodo = false;
        })
        .catch((error) => {
          this.settingTipoNodo = false;

          console.log(`Error: ${error}`);
        });
    },
    setPeriodoRepaso() {
      const diasRepaso = parseInt(this.$refs.inputDiasRepaso.value);

      if (diasRepaso < 1) {
        console.log("Periodo ilegal");
        return;
      }

      var nuevoPeriodoRepaso = diasRepaso * 86400000;

      if (nuevoPeriodoRepaso === this.datosUsuarioEsteNodo.periodoRepaso) {
        this.editandoDiasRepaso = false;
        return;
      }

      this.settingPeriodoRepaso = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idNodo: ID!, $nuevoPeriodoRepaso: Int!) {
              setPeriodoRepasoNodoConocimientoUsuario(
                idNodo: $idNodo
                nuevoPeriodoRepaso: $nuevoPeriodoRepaso
              ) {
                id
                idNodo
                periodoRepaso
              }
            }
          `,
          variables: {
            idNodo: this.esteNodo.id,
            nuevoPeriodoRepaso,
          },
        })
        .then(() => {
          this.settingPeriodoRepaso = false;
          this.editandoDiasRepaso = false;
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
          this.settingPeriodoRepaso = false;
        });
    },
    clickCartelNombre(e) {
      if (this.seleccionado) {
        e.stopPropagation();
        this.mostrarDescripcion = !this.mostrarDescripcion;
      }
    },
    toggleAprendido() {
      var nuevoEstadoAprendido = this.nodoAprendido ? false : true;
      this.togglingAprendido = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idNodo: ID!, $nuevoEstadoAprendido: Boolean!) {
              setNodoAtlasAprendidoUsuario(
                idNodo: $idNodo
                nuevoEstadoAprendido: $nuevoEstadoAprendido
              ) {
                ...fragDatoNodoConocimiento
              }
            }
            ${fragmentoDatoNodoConocimiento}
          `,
          variables: {
            idNodo: this.esteNodo.id,
            nuevoEstadoAprendido,
          },
        })
        .then(({ data: { setNodoAtlasAprendidoUsuario } }) => {
          console.log(
            `${setNodoAtlasAprendidoUsuario.length} nodos modificados`
          );

          for (const res of setNodoAtlasAprendidoUsuario) {
            console.log(`Nombre: ` + res.nombreNodo);
          }

          this.togglingAprendido = false;

          const store = this.$apollo.provider.defaultClient;
          const cache = store.readQuery({
            query: QUERY_DATOS_USUARIO_NODOS,
          });
          var nuevoCache = JSON.parse(JSON.stringify(cache));

          var modificacionesRealizadas = false;
          for (const datoNodo of setNodoAtlasAprendidoUsuario) {
            if (!this.yo.atlas.datosNodos.some((dn) => dn.id === datoNodo.id)) {
              console.log(
                `No estaba en caché. Pushing ${JSON.stringify(datoNodo)}`
              );
              modificacionesRealizadas = true;
              nuevoCache.yo.atlas.datosNodos.push(datoNodo);
            }
          }

          if (modificacionesRealizadas) {
            store.writeQuery({
              query: QUERY_DATOS_USUARIO_NODOS,
              data: nuevoCache,
            });
          }
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
          this.togglingAprendido = false;
        });
    },
    // setNodoObjetivo(nuevoEstadoObjetivo) {
    //   this.$apollo
    //     .mutate({
    //       mutation: gql`
    //         mutation ($idNodo: ID!, $nuevoEstadoObjetivo: Boolean!) {
    //           setNodoObjetivo(
    //             idNodo: $idNodo
    //             nuevoEstadoObjetivo: $nuevoEstadoObjetivo
    //           )
    //         }
    //       `,
    //       variables: {
    //         idNodo: this.esteNodo.id,
    //         nuevoEstadoObjetivo,
    //       },
    //     })
    //     .then(({ data: { setNodoObjetivo } }) => {
    //       if (setNodoObjetivo) {
    //         this.$emit("cambieEstadoObjetivo", nuevoEstadoObjetivo);
    //       }
    //     });
    // },
    abrirPaginaNodo() {
      this.$router.push(
        this.$route.path + "/nodoConocimiento/" + this.esteNodo.id
      );
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
    eliminarEsteNodo() {
      if (!this.usuarioSuperadministrador && !this.usuarioAdministradorAtlas) {
        console.log(`No autorizado`);
        return;
      }
      this.$emit("eliminar", this.esteNodo.id);
    },
    arrastrarNodo(e) {
      if (!this.arrastrandoNodo) {
        return;
      }
      //console.log(`mouse move en ${e.pageX}, ${e.pageY}`);
      let posContenedor = document
        .getElementById("contenedorNodos")
        .getBoundingClientRect();
      let nuevoTop = Math.round(
        (e.clientY - posContenedor.top) / this.factorZoom
      );
      let nuevoLeft = Math.round(
        (e.clientX - posContenedor.left) / this.factorZoom
      );
      this.posicion.y = nuevoTop;
      this.posicion.x = nuevoLeft;
    },
    guardarPosicion() {
      if (!this.arrastrandoNodo) return;
      this.$emit("cambioDePosicionManual", this.esteNodo.id, {
        x: this.posicion.x,
        y: this.posicion.y,
      });

      this.arrastrandoNodo = false;
    },
    crearVinculo(tipo, nodoFrom, nodoTo) {
      console.log(`Creando vinculo entre ${nodoFrom} y ${nodoTo}`);
      if (!this.usuarioSuperadministrador && !this.usuarioAdministradorAtlas) {
        console.log(`No autorizado`);
        return;
      }
      console.log(
        `creando un vinculo tipo ${tipo} entre ${nodoFrom.nombre} y ${nodoTo.nombre} `
      );
      this.$emit("creacionVinculo", {
        tipo,
        idNodoFrom: nodoFrom.id,
        idNodoTo: nodoTo.id,
      });
    },
    eliminarVinculo(nodoFrom, nodoTo) {
      console.log(`Desconectando`);
      if (!this.usuarioSuperadministrador && !this.usuarioAdministradorAtlas) {
        console.log(`No autorizado`);
        return;
      }
      this.$emit("eliminacionVinculo", {
        idNodoFrom: nodoFrom.id,
        idNodoTo: nodoTo.id,
      });
    },
    stopProp(e) {
      console.log(`Stopping`);
      e.stopPropagation();
    },
    toggleNodoEnColeccion(idColeccion) {
      if (!this.usuario || !this.usuario.id) {
        return;
      }

      this.togglingNodoEnColeccion = idColeccion;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idNodo: ID!, $idColeccion: ID!, $idUsuario: ID!) {
              toggleNodoColeccionNodosAtlasConocimientoUsuario(
                idNodo: $idNodo
                idColeccion: $idColeccion
                idUsuario: $idUsuario
              ) {
                id
                idsNodos
                nodos {
                  id
                  nombre
                }
              }
            }
          `,
          variables: {
            idNodo: this.esteNodo.id,
            idColeccion,
            idUsuario: this.usuario.id,
          },
        })
        .then(() => {
          this.togglingNodoEnColeccion = null;
        })
        .catch((error) => {
          this.togglingNodoEnColeccion = null;
          console.log(`Error: ${error}`);
        });
    },
    iniciarGestionRepasos() {
      var elDatoNodo = this.yo.atlas.datosNodos.find(
        (dn) =>
          dn.idNodo === this.esteNodo.id && dn.iteracionesRepaso.length > 0
      );
      if (elDatoNodo) {
        console.log(`Este nodo ya tenía repasos`);
        this.$router.push({
          name: "ventanaRepasos",
          params: { idRepaso: elDatoNodo.id },
        });
      } else {
        console.log(`Este nodo no tenía repasos. Creando`);
        this.addIteracionRepaso();
      }
    },
    addIteracionRepaso() {
      console.log(`Enviando para add to lista repasos`);
      this.creandoIteracionRepaso = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idUsuario: ID!, $idNodo: ID!) {
              crearIteracionRepasoNodoConocimientoUsuario(
                idUsuario: $idUsuario
                idNodo: $idNodo
              ) {
                id
                iteracionesRepaso {
                  id
                  intervalo
                }
              }
            }
          `,
          variables: {
            idUsuario: this.usuario.id,
            idNodo: this.esteNodo.id,
          },
        })
        .then(({ data: { crearIteracionRepasoNodoConocimientoUsuario } }) => {
          this.creandoIteracionRepaso = false;
          this.$router.push({
            name: "ventanaRepasos",
            params: {
              idRepaso: crearIteracionRepasoNodoConocimientoUsuario.id,
            },
          });
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
          this.creandoIteracionRepaso = false;
        });
    },
    marcarEstudiado() {
      if (!this.usuarioLogeado) {
        return;
      }

      var fechaEstudiado = new Date();
      // fechaEstudiado.setDate(7);

      // fechaEstudiado.setHours(0);
      // fechaEstudiado.setMinutes(0);
      // fechaEstudiado.setSeconds(0);
      // fechaEstudiado.setMilliseconds(0);

      this.enviandoFechaEstudiado = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idUsuario: ID!, $idNodo: ID!, $fecha: Date!) {
              setDateNodoConocimientoEstudiadoUsuario(
                idUsuario: $idUsuario
                idNodo: $idNodo
                fecha: $fecha
              ) {
                ...fragDatoNodoConocimiento
              }
            }
            ${fragmentoDatoNodoConocimiento}
          `,
          variables: {
            idUsuario: this.usuario.id,
            idNodo: this.esteNodo.id,
            fecha: fechaEstudiado,
          },
        })
        .then(({ data: { setDateNodoConocimientoEstudiadoUsuario } }) => {
          this.enviandoFechaEstudiado = false;
          if (
            !this.yo.atlas.datosNodos.some(
              (dn) => dn.id === setDateNodoConocimientoEstudiadoUsuario.id
            )
          ) {
            console.log(
              `No estaba en caché. Pushing ${JSON.stringify(
                setDateNodoConocimientoEstudiadoUsuario
              )}`
            );
            const store = this.$apollo.provider.defaultClient;
            const cache = store.readQuery({
              query: QUERY_DATOS_USUARIO_NODOS,
            });
            var nuevoCache = JSON.parse(JSON.stringify(cache));

            nuevoCache.yo.atlas.datosNodos.push(
              setDateNodoConocimientoEstudiadoUsuario
            );
            store.writeQuery({
              query: QUERY_DATOS_USUARIO_NODOS,
              data: nuevoCache,
            });
          }
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
          this.enviandoFechaEstudiado = false;
        });
    },
  },
  watch: {
    esteNodo() {
      this.posicion = { ...this.esteNodo.coords };
    },
    editandoDiasRepaso(editando) {
      if (editando) {
        this.$nextTick(() => {
          this.$refs.inputDiasRepaso.value = this.diasRepaso;
          this.$refs.inputDiasRepaso.focus();
        });
      }
    },
    menuCx(mostrando) {
      if (!mostrando) {
        this.editandoDiasRepaso = false;
      }
    },
  },
  mounted() {
    this.posicion = { ...this.esteNodo.autoCoords };
  },
};
</script>

<style scoped>
#iconoNodo {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  width: 55%;
  height: 55%;
  z-index: 1;
  pointer-events: none;
  border-radius: 50%;
}

#iconoNodo img {
  width: 100%;
  height: 100%;
}
#iconoNodo.deNodoSeleccionado img {
  filter: var(--filtroBlanco);
}
.nodoConocimiento {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-size: 100% 100%;
  cursor: pointer;
  position: absolute;
  pointer-events: all;
}
.nodoConocimiento:not(.deNodoSeleccionado) {
  background-color: rgba(128, 128, 128, 0.349);
}
.nodoConocimiento.deNodoSeleccionado {
  background-color: var(--atlasConocimientoSeleccion);
}

#botonAbrirMenuCx {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);

  right: -40px;
}
#zonaArrastre {
  width: 500px;
  height: 500px;
  position: absolute;
  transform: translate(-50%, -50%);
}
.seleccionado {
  z-index: 10;
}
.fantasmeado {
  opacity: 0.2;
}

.escondido {
  visibility: hidden;
}
#nombre {
  position: absolute;
  top: 105%;
  text-align: center;
  left: 50%;
  transform: translateX(-50%);
  border-width: 1px;
  border-style: solid;
}

#menuContextual {
  position: absolute;
  top: 110%;
  left: 110%;
  min-width: 140px;
  padding: 5px 0px;
  z-index: 110;
  background-color: rgb(177, 177, 159);
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.2),
    0 1px 5px 0 rgba(0, 0, 0, 0.12);
}
.botonMenuCx {
  cursor: pointer;
  font-size: 14px;
  padding: 13px 10px;
  display: flex;
  align-items: center;
}

.iconoMenuCx {
  height: 13px;
  margin: 0px 5px;
}
.seccionMenuCx {
  font-size: 15px;
  color: rgb(71, 71, 71);
  padding: 5px;
}
.botonMenuCx:hover {
  background-color: gray;
}
.selectorSubseccionMenuCx {
  position: relative;
}

.subseccionMenuCx {
  position: absolute;
  left: 100%;
  top: 0%;
  display: none;
  background-color: rgb(177, 177, 159);
}
.selectorSubseccionMenuCx:hover > .subseccionMenuCx {
  display: block;
}
#opcionesTipoNodo {
  display: flex;
  justify-content: center;
  gap: 20px;
  align-items: center;
  padding: 10px 20px;
}

.cuadritoDescripcionNodo {
  position: absolute;
  top: 50%;
  left: 104%;
  width: 170px;
  transform: translateY(-50%);
  background-color: #ffdbaf;
  border: 1px solid rgb(0, 0, 44);
  border-radius: 10px;
}

.descripcionNodo {
  font-size: 15px;
  padding: 10px;
  min-height: 30px;
  white-space: pre-wrap;
}
.botonAbrirNodo {
  display: block;
  width: 24px;
  height: 24px;
  cursor: pointer;
  margin: 10px auto;
  border-radius: 50%;
  padding: 10px;
  background-color: rgb(214, 176, 130);
}
.botonAbrirNodo:hover {
  background-color: rgb(190, 145, 88);
}

.imagenTarget {
  width: 180%;
  position: absolute;
  top: -40%;
  left: -40%;
  z-index: 10;
  opacity: 0.86;
}
.imagenTarget:hover {
  opacity: 0.16;
}
.imagenAprendido {
  position: absolute;
  background-color: rgb(33, 168, 33);
  border-radius: 50%;
}
#botonCerrarDescripcion {
  left: 101%;
  bottom: 101%;
  width: 15px;
  height: 15px;
}
.fuerzaMovimiento {
  background-color: black;
  position: absolute;
  top: 50%;
  left: 50%;
  transform-origin: 0% 0%;
  z-index: 200;
}
#fuerzaCentroMasa {
  background-color: blue;
}
#fuerzaColision {
  background-color: red;
}
.flechitaFuerza {
  position: absolute;
  top: 50%;
  left: 100%;
  width: 1px;
  height: 1px;
  border: 5px solid transparent;
  border-left-color: black;
  transform: translate(-50%, -50%);
}
</style>