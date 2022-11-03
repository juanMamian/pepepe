<template>
  <div class="personaVistaLista" :class="{ seleccionado }">
    <div id="barraSuperior" :style="[colorBarraSuperior]">
      <div class="iconoPersona">
        <img
          src="@/assets/iconos/teacher.svg"
          alt="Profesor"
          v-if="estaPersona.permisos.includes('maestraVida-profesor')"
        />
        <img
          src="@/assets/iconos/graduationCap.svg"
          alt="CapGraduacion"
          @click="
            usuarioSuperadministrador
              ? togglePermiso('maestraVida-estudiante')
              : ''
          "
          v-if="estaPersona.permisos.includes('maestraVida-estudiante')"
        />
        <img
          src="@/assets/iconos/user.svg"
          alt="Usuario"
          @click="
            usuarioSuperadministrador
              ? togglePermiso('maestraVida-estudiante')
              : ''
          "
          v-if="
            !estaPersona.permisos.includes('maestraVida-profesor') &&
            !estaPersona.permisos.includes('maestraVida-estudiante')
          "
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
          v-if="usuarioSuperadministrador || usuarioProfe"
          :title="
            mostrando === 'nodosSolidaridadPublicitados'
              ? 'Ocultar nodosSolidaridadPublicitados'
              : 'Mostrar nodosSolidaridadPublicitados'
          "
          :class="{ activo: mostrando === 'nodosSolidaridadPublicitados' }"
          @click="
            mostrando =
              mostrando === 'nodosSolidaridadPublicitados'
                ? null
                : 'nodosSolidaridadPublicitados'
          "
        >
          <img src="@/assets/iconos/productHunt.svg" alt="P" />
        </div>
        <div
          class="boton selector"
          v-if="usuarioSuperadministrador"
          :title="
            mostrando === 'administracion'
              ? 'Ocultar administracion'
              : 'Mostrar administracion'
          "
          :class="{ activo: mostrando === 'administracion' }"
          @click="
            mostrando = mostrando === 'administracion' ? null : 'administracion'
          "
        >
          <img src="@/assets/iconos/cog.svg" alt="Cog" />
        </div>
        <div
          class="boton"
          @click="alienar"
          title="alienar"
          v-show="usuarioProfe || usuarioAdministrador"
        >
          <img src="@/assets/iconos/alienar.svg" alt="Virus" />
        </div>
        <div
          class="boton selector"
          v-if="usuarioLogeado && usuarioProfe"
          style="width: 100px"
          :title="
            mostrando === 'informe' ? 'Ocultar informe' : 'Mostrar informe'
          "
          @click="mostrando = mostrando === 'informe' ? null : 'informe'"
          :class="{ activo: mostrando === 'informe' }"
        >
          Informes
        </div>
        <div
          class="boton selector"
          v-if="usuarioLogeado"
          :title="
            mostrando === 'objetivos'
              ? 'Ocultar objetivos'
              : 'Mostrar objetivos'
          "
          @click="mostrando = mostrando === 'objetivos' ? null : 'objetivos'"
          :class="{ activo: mostrando === 'objetivos' }"
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
            class="boton selector"
            v-if="usuarioSuperadministrador"
            :class="{ activo: mostrandoPermisos }"
            @click="mostrandoPermisos = !mostrandoPermisos"
            :title="mostrandoPermisos ? 'Ocultar permisos' : 'Mostrar permisos'"
          >
            <img src="@/assets/iconos/idBadge.svg" alt="Id" />
          </div>
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
        <div
          id="listaPermisos"
          v-if="usuarioSuperadministrador"
          v-show="mostrandoPermisos"
          :class="{ deshabilitado: togglingPermiso }"
        >
          <div
            class="activadorPermiso"
            @click="togglePermiso(permiso)"
            :class="{ permisoGranted: estaPersona.permisos.includes(permiso) }"
            v-for="permiso of permisosPosibles"
            :key="permiso + 'permiso'"
          >
            {{ permiso }}
          </div>
        </div>
      </div>
      <div id="zonaInforme" v-show="mostrando === 'informe'">
        <div class="contenedorSeccionInforme">
          <div class="contenedorControles">
            <div
              id="selectoresPeriodo"
              style="display: flex"
              v-show="usuarioSuperadministrador"
            >
              <div
                class="boton selector"
                @click="periodoInforme = 'primero'"
                :class="{ activo: periodoInforme === 'primero' }"
              >
                I
              </div>
              <div
                class="boton selector"
                @click="periodoInforme = 'segundo'"
                :class="{ activo: periodoInforme === 'segundo' }"
              >
                II
              </div>
              <div
                class="boton selector"
                @click="periodoInforme = 'tercero'"
                :class="{ activo: periodoInforme === 'tercero' }"
              >
                III
              </div>
            </div>

            <div
              class="boton"
              @click="descargarArchivoInforme"
              v-show="!creandoDocumentoInforme"
            >
              <img src="@/assets/iconos/file.svg" alt="archivo" />
            </div>
            <loading texto="" v-show="creandoDocumentoInforme" />
          </div>
          <div class="tituloSeccionInforme">Sobre objetivos</div>
          <textarea
            id="textAreaInformeObjetivos"
            @blur="guardarInforme('objetivos')"
            ref="inputInformeCategoriaObjetivos"
            class="seccionInforme"
            v-model="nuevoInformeObjetivos"
            :class="{
              deshabilitado: guardandoInformeObjetivos,
              guardado: nuevoInformeObjetivos == misInformesActivos.objetivos,
            }"
          ></textarea>
          <div class="controlesSeccionInforme">
            <div
              v-show="
                nuevoInformeObjetivos != misInformesActivos.objetivos &&
                !guardandoInformeObjetivos
              "
              class="boton"
              @click="guardarInforme('objetivos')"
            >
              <img src="@/assets/iconos/guardar.png" alt="Guardar" />
            </div>
            <loading v-show="guardandoInformeObjetivos" />
          </div>

          <div class="tituloSeccionInforme">Sobre proyectos</div>
          <textarea
            id="textAreaInformeProyectos"
            @blur="guardarInforme('proyectos')"
            ref="inputInformeCategoriaProyectos"
            class="seccionInforme"
            v-model="nuevoInformeProyectos"
            :class="{
              deshabilitado: guardandoInformeProyectos,
              guardado: nuevoInformeProyectos == misInformesActivos.proyectos,
            }"
          ></textarea>
          <div class="controlesSeccionInforme">
            <div
              v-show="
                nuevoInformeProyectos != misInformesActivos.proyectos &&
                !guardandoInformeProyectos
              "
              class="boton"
              @click="guardarInforme('proyectos')"
            >
              <img src="@/assets/iconos/guardar.png" alt="Guardar" />
            </div>
            <loading v-show="guardandoInformeProyectos" />
          </div>

          <div class="tituloSeccionInforme">Sobre espacios</div>
          <textarea
            id="textAreaInformeProyectos"
            @blur="guardarInforme('espacios')"
            ref="inputInformeCategoriaEspacios"
            class="seccionInforme"
            v-model="nuevoInformeEspacios"
            :class="{
              deshabilitado: guardandoInformeEspacios,
              guardado: nuevoInformeEspacios == misInformesActivos.espacios,
            }"
          ></textarea>
          <div class="controlesSeccionInforme">
            <div
              v-show="
                nuevoInformeEspacios != misInformesActivos.espacios &&
                !guardandoInformeEspacios
              "
              class="boton"
              @click="guardarInforme('espacios')"
            >
              <img src="@/assets/iconos/guardar.png" alt="Guardar" />
            </div>
            <loading v-show="guardandoInformeEspacios" />
          </div>

          <div class="tituloSeccionInforme">Comentario</div>
          <textarea
            id="textAreaInformeComentario"
            @blur="guardarInforme('comentario')"
            ref="inputInformeCategoriaComentario"
            class="seccionInforme"
            v-model="nuevoInformeComentario"
            :class="{
              deshabilitado: guardandoInformeComentario,
              guardado: nuevoInformeComentario == misInformesActivos.comentario,
            }"
          ></textarea>
          <div class="controlesSeccionInforme">
            <div
              v-show="
                nuevoInformeComentario != misInformesActivos.comentario &&
                !guardandoInformeComentario
              "
              class="boton"
              @click="guardarInforme('comentario')"
            >
              <img src="@/assets/iconos/guardar.png" alt="Guardar" />
            </div>
            <loading v-show="guardandoInformeComentario" />
            <img v-show="nuevoInformeComentario===misInformesActivos.comentario" src="@/assets/iconos/check.svg" alt="Check">
          </div>
        </div>
      </div>
      <div
        v-show="mostrando === 'nodosSolidaridadPublicitados'"
        id="zonaNodosSolidaridadPublicitados"
        class="zonaPrimerNivel"
      >
        <div
          class="selectorNodoSolidaridad"
          :class="{
            deshabilitado: settingPresenciaNodoSolidaridad,
            activo: nodoSolidaridadPublicitado.responsables.includes(
              estaPersona.id
            ),
          }"
          @click="toggleResponsableNodoSolidaridad(nodoSolidaridadPublicitado)"
          v-for="nodoSolidaridadPublicitado of nodosSolidaridadPublicitados"
          :key="nodoSolidaridadPublicitado.id"
        >
          {{ nodoSolidaridadPublicitado.nombre }}
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
      <div
        id="zonaObjetivos"
        class="zonaPrimerNivel"
        v-if="mostrando === 'objetivos'"
      >
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
import VentanaLista from "../atlasSolidaridad/ventanaLista/ventanaLista.vue";
import { QUERY_PERSONAS } from "../Personas.vue";
import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TableRow,
  TableCell,
  Table,
  WidthType,
  TextRun,
} from "docx";
import { saveAs } from "file-saver";

export default {
  components: { Calendario, Loading, VentanaLista },
  props: {
    estaPersona: Object,
    seleccionado: Boolean,
    nodosSolidaridadPublicitados: Array,
  },
  name: "PersonaVistaLista",
  data() {
    return {
      permisosPosibles: [
        "usuario",
        "administrador",
        "atlasAdministrador",
        "superadministrador",
        "maestraVida",
        "maestraVida-estudiante",
        "maestraVida-profesor",
        "maestraVida-acompañante",
      ],

      mostrando: null,
      reseteandoPassword: false,
      alienando: false,

      mostrandoPermisos: false,
      togglingPermiso: false,

      settingPresenciaNodoSolidaridad: false,

      guardandoInformeObjetivos: false,
      guardandoInformeEspacios: false,
      guardandoInformeComentario: false,
      guardandoInformeProyectos: false,
      creandoDocumentoInforme: false,

      nuevoInformeObjetivos: null,
      nuevoInformeProyectos: null,
      nuevoInformeEspacios: null,
      nuevoInformeComentario: null,

      periodoInforme: "tercero",
      activable: 0,
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
    alienar() {
      if (!this.usuarioProfe && !this.usuarioSuperadministrador) {
        return;
      }

      this.alienando = true;
      this.$apollo
        .query({
          query: gql`
            query ($idAlienado: ID!) {
              alienarUsuario(idAlienado: $idAlienado)
            }
          `,
          variables: {
            idAlienado: this.estaPersona.id,
          },
        })
        .then(({ data: { alienarUsuario } }) => {
          console.log(`Alienando`);
          this.alienando = true;
          this.$store.commit("logearse", alienarUsuario);
          this.$router.push("/miPerfil");
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
          this.alienando = false;
        });
    },
    togglePermiso(permiso) {
      if (!this.usuarioSuperadministrador) {
        return;
      }
      this.togglingPermiso = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($permiso: String!, $idUsuario: ID!) {
              togglePermisoUsuario(permiso: $permiso, idUsuario: $idUsuario) {
                id
                permisos
              }
            }
          `,
          variables: {
            permiso,
            idUsuario: this.estaPersona.id,
          },
        })
        .then(() => {
          this.togglingPermiso = false;
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
          this.togglingPermiso = false;
        });
    },
    toggleResponsableNodoSolidaridad(nodo) {
      console.log(
        `Setting presencia de ${this.estaPersona.id} en el nodo ${nodo.id}`
      );
      const personaEnResponsables = nodo.responsables.includes(
        this.estaPersona.id
      );

      if (personaEnResponsables) {
        console.log(`Sacándolo`);

        this.settingPresenciaNodoSolidaridad = true;
        this.$apollo
          .mutate({
            mutation: gql`
              mutation ($idNodo: ID!, $idUsuario: ID!) {
                removeResponsableNodoSolidaridad(
                  idNodo: $idNodo
                  idUsuario: $idUsuario
                ) {
                  id
                  responsables
                }
              }
            `,
            variables: {
              idNodo: nodo.id,
              idUsuario: this.estaPersona.id,
            },
          })
          .then(() => {
            this.settingPresenciaNodoSolidaridad = false;
          })
          .catch((error) => {
            console.log(`Error: ${error}`);
            this.settingPresenciaNodoSolidaridad = false;
          });
      } else {
        console.log(`Dentrándolo`);
        this.settingPresenciaNodoSolidaridad = true;

        this.$apollo
          .mutate({
            mutation: gql`
              mutation ($idNodo: ID!, $idUsuario: ID!) {
                addResponsableNodoSolidaridad(
                  idNodo: $idNodo
                  idUsuario: $idUsuario
                ) {
                  id
                  responsables
                }
              }
            `,
            variables: {
              idNodo: nodo.id,
              idUsuario: this.estaPersona.id,
            },
          })
          .then(() => {
            this.settingPresenciaNodoSolidaridad = false;
          })
          .catch((error) => {
            console.log(`Error: ${error}`);
            this.settingPresenciaNodoSolidaridad = false;
          });
      }
    },
    guardarInforme(categoria) {
      console.log("Guardando informe");
      var texto = null;
      if (categoria === "objetivos") {
        this.guardandoInformeObjetivos = true;
        texto = this.$refs.inputInformeCategoriaObjetivos.value;
        if (texto) {
          texto = texto.trim();
        }
        this.nuevoInformeObjetivos = texto;
      }
      if (categoria === "espacios") {
        this.guardandoInformeEspacios = true;
        texto = this.$refs.inputInformeCategoriaEspacios.value;
        if (texto) {
          texto = texto.trim();
        }
        this.nuevoInformeEspacios = texto;
      }
      if (categoria === "comentario") {
        this.guardandoInformeComentario = true;
        texto = this.$refs.inputInformeCategoriaComentario.value;
        if (texto) {
          texto = texto.trim();
        }
        this.nuevoInformeComentario = texto;
      }
      if (categoria === "proyectos") {
        this.guardandoInformeProyectos = true;
        texto = this.$refs.inputInformeCategoriaProyectos.value;
        if (texto) {
          texto = texto.trim();
        }
        this.nuevoInformeProyectos = texto;
      }

      this.$apollo
        .mutate({
          mutation: gql`
            mutation (
              $idUsuario: ID!
              $year: Int!
              $periodo: String!
              $idProfe: ID!
              $categoria: String!
              $texto: String!
            ) {
              guardarInformeEstudianteMaestraVida(
                idUsuario: $idUsuario
                year: $year
                periodo: $periodo
                idProfe: $idProfe
                categoria: $categoria
                texto: $texto
              ) {
                id
                year
                periodo
                idProfe
                categoria
                texto
              }
            }
          `,
          variables: {
            idUsuario: this.estaPersona.id,
            year: 2022,
            periodo: this.periodoInforme,
            idProfe: this.usuario.id,
            categoria,
            texto,
          },
        })
        .then(({ data: { guardarInformeEstudianteMaestraVida } }) => {
          

          const store = this.$apollo.provider.defaultClient;
          const cache = store.readQuery({
            query: QUERY_PERSONAS,
          });

          var nuevoCache = JSON.parse(JSON.stringify(cache));

          var laPersona = nuevoCache.todosUsuarios.find(
            (u) => u.id === this.estaPersona.id
          );
          var elInforme = laPersona.informesMaestraVida.find(
            (i) => i.id === guardarInformeEstudianteMaestraVida.id
          );
          if (!elInforme) {
            //Add al cache
            laPersona.informesMaestraVida.push(
              guardarInformeEstudianteMaestraVida
            );

            store.writeQuery({
              query: QUERY_PERSONAS,
              data: nuevoCache,
            });
          }

          if (categoria === "objetivos") {
            this.guardandoInformeObjetivos = false;
          }
          if (categoria === "espacios") {
            this.guardandoInformeEspacios = false;
          }
          if (categoria === "comentario") {
            this.guardandoInformeComentario = false;
          }
          if (categoria === "proyectos") {
            this.guardandoInformeProyectos = false;
          }
        })
        .catch((error) => {
          console.log("error: " + error);
          if (categoria === "objetivos") {
            this.guardandoInformeObjetivos = false;
          }
          if (categoria === "espacios") {
            this.guardandoInformeEspacios = false;
          }
          if (categoria === "comentario") {
            this.guardandoInformeComentario = false;
          }
          if (categoria === "proyectos") {
            this.guardandoInformeProyectos = false;
          }
        });
    },
    descargarArchivoInforme() {
      console.log(
        "Creando documento docx de informe para " + this.estaPersona.nombres
      );

      this.creandoDocumentoInforme = true;

      var filaObjetivos = new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                text: "Acerca de los objetivos",
                style: "nombreSeccion",
                alignment: AlignmentType.CENTER,
              }),
            ],
            width: {
              size: 300,
              type: WidthType.DXA,
            },
          }),
          new TableCell({
            children: [
              ...this.estaPersona.informesMaestraVida
                .filter(
                  (i) =>
                    i.year == 2022 &&
                    i.periodo === this.periodoInforme &&
                    i.categoria === "objetivos" &&
                    i.texto &&
                    i.texto.length > 10
                )
                .reduce((acc, informe) => {
                  return acc.concat([
                    new Paragraph({
                      children: informe.texto.split("\n").map((textR) => {
                        return new TextRun({
                          text: textR,
                          break: 1
                          
                          ,
                        });
                      }),
                      style: "textoProfe",

                      // {
                      // text: informe.texto,
                      // style: "textoProfe",
                      // }
                    }),
                    new Paragraph({
                      text: informe.nombreProfe,
                      style: "firmaProfe",
                    }),
                  ]);
                }, []),
            ],
            width: {
              size: 700,
              type: WidthType.DXA,
            },
          }),
        ],
      });

      var filaProyectos = new TableRow({
        children: [
          new TableCell({
            width: {
              size: 3000,
              type: WidthType.DXA,
            },
            children: [
              new Paragraph({
                text: "Proyectos pedagógicos productivos",
                style: "nombreSeccion",
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
          new TableCell({
            width: {
              size: 2700,
              type: WidthType.DXA,
            },
            children: [
              ...this.estaPersona.informesMaestraVida
                .filter(
                  (i) =>
                    i.year == 2022 &&
                    i.periodo === this.periodoInforme &&
                    i.categoria === "proyectos" &&
                    i.texto &&
                    i.texto.length > 10
                )
                .reduce((acc, informe) => {
                  return acc.concat([
                    new Paragraph({
                      text: informe.texto,
                      style: "textoProfe",
                    }),
                    new Paragraph({
                      text: informe.nombreProfe,
                      style: "firmaProfe",
                    }),
                  ]);
                }, []),
            ],
          }),
        ],
      });

      var filaEspacios = new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                text: "Acerca de los espacios",
                style: "nombreSeccion",
                alignment: AlignmentType.CENTER,
              }),
            ],
            width: {
              size: 300,
              type: WidthType.DXA,
            },
          }),
          new TableCell({
            children: [
              ...this.estaPersona.informesMaestraVida
                .filter(
                  (i) =>
                    i.year == 2022 &&
                    i.periodo === this.periodoInforme &&
                    i.categoria === "espacios" &&
                    i.texto &&
                    i.texto.length > 10
                )
                .reduce((acc, informe) => {
                  return acc.concat([
                    new Paragraph({
                      text: informe.texto,
                      style: "textoProfe",
                    }),
                    new Paragraph({
                      text: informe.nombreProfe,
                      style: "firmaProfe",
                    }),
                  ]);
                }, []),
            ],
            width: {
              size: 700,
              type: WidthType.DXA,
            },
          }),
        ],
      });

      var filaComentario = new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                text: "Comentario",
                style: "nombreSeccion",
                alignment: AlignmentType.CENTER,
              }),
            ],
            width: {
              size: 300,
              type: WidthType.DXA,
            },
          }),
          new TableCell({
            children: [
              ...this.estaPersona.informesMaestraVida
                .filter(
                  (i) =>
                    i.year == 2022 &&
                    i.periodo === this.periodoInforme &&
                    i.categoria === "comentario" &&
                    i.texto &&
                    i.texto.length > 10
                )
                .reduce((acc, informe) => {
                  return acc.concat([
                    new Paragraph({
                      text: informe.texto,
                      style: "textoProfe",
                    }),
                    new Paragraph({
                      text: informe.nombreProfe,
                      style: "firmaProfe",
                    }),
                  ]);
                }, []),
            ],
            width: {
              size: 700,
              type: WidthType.DXA,
            },
          }),
        ],
      });

      var tablaFinal = new Table({
        rows: [filaObjetivos, filaProyectos, filaEspacios, filaComentario],
        width: {
          size: 8500,
          type: WidthType.DXA,
        },
      });

      var archivo = new Document({
        styles: {
          paragraphStyles: [
            {
              id: "estiloGlobal",
              name: "Estilo global",
              run: {
                font: "Maiandra GD",
              },
            },
            {
              id: "titulos",
              name: "titulos",
              basedOn: "estiloGlobal",
              run: {
                bold: true,
                size: 24,
              },
              paragraph: {
                spacing: {
                  after: 200,
                },
              },
            },
            {
              id: "nombreEstudiante",
              name: "nombre del estudiante",
              basedOn: "estiloGlobal",
              run: {
                bold: true,
                allCaps: true,
              },
              paragraph: {
                spacing: {
                  after: 120,
                },
              },
            },
            {
              id: "nombreSeccion",
              name: "nombre de seccion",
              basedOn: "estiloGlobal",
              run: {
                bold: true,
                size: 24,
              },
              paragraph: {
                spacing: {
                  after: 120,
                },
              },
            },
            {
              id: "objetivo",
              name: "Objetivo del estudiante",
              basedOn: "estiloGlobal",
              run: { size: 24 },
            },
            {
              id: "textoProfe",
              name: "Texto escrito por un profe",
              basedOn: "estiloGlobal",
              run: { size: 24 },
              paragraph: {
                spacing: {
                  after: 30,
                },
              },
            },
            {
              id: "firmaProfe",
              name: "Firma del profe",
              basedOn: "estiloGlobal",
              run: {
                italics: true,
                size: 18,
              },
              paragraph: {
                spacing: {
                  after: 100,
                },
              },
            },
          ],
        },
        sections: [
          {
            children: [
              new Paragraph({
                text: "INSTITUCIÓN EDUCATIVA MAESTRA VIDA",
                heading: HeadingLevel.TITLE,
                style: "titulos",
                alignment: AlignmentType.CENTER,
              }),
              new Paragraph({
                text: "RESOLUCIÓN DE APROBACIÓN N° 5549 DE JUNIO DE 2013",
                heading: HeadingLevel.TITLE,
                style: "titulos",
                alignment: AlignmentType.CENTER,
              }),
              new Paragraph({
                text: "EVALUACIÓN DE CONOCIMIENTO Y DESEMPEÑO",
                heading: HeadingLevel.TITLE,
                style: "titulos",
                alignment: AlignmentType.CENTER,
              }),
              new Paragraph({
                text: "PERIODO AGOSTO - OCTUBRE DE 2022",
                style: "titulos",
                alignment: AlignmentType.CENTER,
              }),
              new Paragraph({
                text:
                  "Nombre:  " +
                  this.estaPersona.nombres +
                  " " +
                  this.estaPersona.apellidos,
                style: "nombreEstudiante",
              }),
              new Paragraph({
                text: "Objetivos",
                style: "nombreSeccion",
              }),

              ...this.estaPersona.objetivosEstudiante.map((objetivo) => {
                return new Paragraph({
                  text: objetivo.nombre,
                  style: "objetivo",
                  bullet: {
                    level: 0,
                  },
                });
              }),

              new Paragraph({
                text: "",
                spacing: {
                  after: 200,
                },
              }),

              tablaFinal,

              new Paragraph({
                children: [
                  new TextRun({
                    text: "EQUIPO PEDAGÓGICO",
                    bold: true,
                  }),
                ],
                alignment: AlignmentType.CENTER,
                style: "estiloGlobal",
                spacing: {
                  before: 1500,
                },
              }),
              new Paragraph({
                text: "Corporación Maestra Vida",
                heading: HeadingLevel.TITLE,
                style: "titulos",
                alignment: AlignmentType.CENTER,
              }),
            ],
          },
        ],
      });

      saveDocumentToFile(archivo, `informe${this.estaPersona.username}.docx`);
      this.creandoDocumentoInforme = false;
    },
  },
  computed: {
    misInformesActivos() {
      if (!this.estaPersona.informesMaestraVida) {
        return {
          objetivos: null,
          espacios: null,
          comentario: null,
          proyectos: null,
        };
      }
      var miInformeObjetivos = this.estaPersona.informesMaestraVida.find(
        (i) =>
          i.year === 2022 &&
          i.periodo === this.periodoInforme &&
          i.idProfe === this.usuario.id &&
          i.categoria === "objetivos"
      );
      var miInformeEspacios = this.estaPersona.informesMaestraVida.find(
        (i) =>
          i.year === 2022 &&
          i.periodo === this.periodoInforme &&
          i.idProfe === this.usuario.id &&
          i.categoria === "espacios"
      );
      var miInformeComentario = this.estaPersona.informesMaestraVida.find(
        (i) =>
          i.year === 2022 &&
          i.periodo === this.periodoInforme &&
          i.idProfe === this.usuario.id &&
          i.categoria === "comentario"
      );
      var miInformeProyectos = this.estaPersona.informesMaestraVida.find(
        (i) =>
          i.year === 2022 &&
          i.periodo === this.periodoInforme &&
          i.idProfe === this.usuario.id &&
          i.categoria === "proyectos"
      );
      return {
        objetivos: miInformeObjetivos ? miInformeObjetivos.texto : null,
        espacios: miInformeEspacios ? miInformeEspacios.texto : null,
        comentario: miInformeComentario ? miInformeComentario.texto : null,
        proyectos: miInformeProyectos ? miInformeProyectos.texto : null,
      };
    },
    cantidadMisInformesEscritos() {
      if (!this.usuarioLogeado) {
        return 0;
      }
      if (!this.estaPersona.informesMaestraVida) {
        return 0;
      }

      var cuenta = 0;
      cuenta += this.activable;
      cuenta = 0;

      if (
        this.misInformesActivos.objetivos &&
        this.misInformesActivos.objetivos.length > 5
      ) {
        cuenta++;
      }
      if (
        this.misInformesActivos.proyectos &&
        this.misInformesActivos.proyectos.length > 5
      ) {
        cuenta++;
      }
      if (
        this.misInformesActivos.espacios &&
        this.misInformesActivos.espacios.length > 5
      ) {
        cuenta++;
      }
      if (
        this.misInformesActivos.comentario &&
        this.misInformesActivos.comentario.length > 5
      ) {
        cuenta++;
      }

      return cuenta;
    },
    colorBarraSuperior() {
      if (
        !this.usuarioLogeado ||
        !this.estaPersona.permisos ||
        !this.estaPersona.permisos.includes("maestraVida-estudiante")
      ) {
        return {};
      }
      var elColor = "rgb(161, 240, 82)";
      if (this.cantidadMisInformesEscritos < 4) {
        elColor = "#f2aa87";
      }
      if (this.cantidadMisInformesEscritos < 1) {
        elColor = "#972b2b";
      }
      return {
        backgroundColor: elColor,
      };
    },
  },
  watch: {
    seleccionado(seleccionado) {
      if (!seleccionado) {
        this.mostrando = null;
      }
    },
    "estaPersona.informesMaestraVida": function () {
      this.activable++;
    },
    misInformesActivos() {
      this.nuevoInformeObjetivos = this.misInformesActivos.objetivos;
      this.nuevoInformeProyectos = this.misInformesActivos.proyectos;
      this.nuevoInformeEspacios = this.misInformesActivos.espacios;
      this.nuevoInformeComentario = this.misInformesActivos.comentario;
    },
  },
  mounted() {
    setTimeout(() => {
      this.activable++;
    }, 1000);

    this.nuevoInformeObjetivos = this.misInformesActivos.objetivos;
    this.nuevoInformeProyectos = this.misInformesActivos.proyectos;
    this.nuevoInformeEspacios = this.misInformesActivos.espacios;
    this.nuevoInformeComentario = this.misInformesActivos.comentario;
  },
};

function saveDocumentToFile(doc, fileName) {
  // Create a mime type that will associate the new file with Microsoft Word
  const mimeType =
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  // Create a Blob object from Packer containing the Document instance and the mimeType
  Packer.toBlob(doc).then((blob) => {
    const docblob = blob.slice(0, blob.size, mimeType);
    // Save the file using saveAs from the file-saver package
    saveAs(docblob, fileName);
  });
}
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
#barraInfoAdicional {
  display: flex;
}
#contenedorControlesPersona {
  margin-left: auto;
}
#listaPermisos {
  max-width: 150px;
  margin-left: auto;
}
.activadorPermiso {
  padding: 5px 15px;
  cursor: pointer;
  font-size: 13px;
}
.activadorPermiso.permisoGranted {
  background-color: var(--paletaSelect);
  color: whitesmoke;
}
.selectorNodoSolidaridad {
  padding: 5px 15px;
  cursor: pointer;
}
.selectorNodoSolidaridad.activo {
  background-color: var(--paletaSelect);
  color: white;
}

.contenedorSeccionInforme {
  padding: 15px 2vw;
}

.seccionInforme {
  height: 150px;
  width: 90%;
  margin: 10px 15px;
  margin-bottom: 5px;
  border-radius: 10px;
  padding: 5px;
  border: 2px solid #4f4f4f;
}
.seccionInforme.guardado {
  background-color: rgba(26, 172, 21, 0.46);
}
.tituloSeccionInforme {
  font-weight: bold;
  color: #2f2f2f;
}
.controlesSeccionInforme {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px 10px;
  margin-bottom: 30px;
}
.controlesSeccionInforme .boton {
  height: 30px;
  width: 30px;
}
</style>