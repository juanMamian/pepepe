<template>
    <div class="personas" @scroll="checkIfFetchMore">
        <router-view> </router-view>

        <div class="barraSeccion">
            <div class="contenedorControles" style="margin-left: auto">
                <div class="boton" @click="mostrandoConfiguracion = !mostrandoConfiguracion">
                    <img src="@/assets/iconos/cog.svg" alt="Configuración" style="" />
                </div>
            </div>
        </div>

        <div class="zonaConfiguracion" v-show="mostrandoConfiguracion">
            <div class="barraSeccion">Configuración</div>

            <div class="contenedorBloquesConfiguracion">
                <div class="bloqueConfiguracion">
                    <div class="campoConfiguracion">
                        <label for="checkMostrarEspacioActual">Mostrar espacio en el que se encuentra cada persona</label>
                        <input v-model="mostrarEspacioActual" type="checkbox" name="checkMostrarEspacioActual"
                            id="checkMostrarEspacioActual" ref="checkMostrarEspacioActual" />
                    </div>
                </div>
            </div>
        </div>

        <div class="zonaConfiguracion">
            <div class="contenedorBloquesConfiguracion">
                <div class="bloqueConfiguracion">
                    <div class="campoConfiguracion" id="campoUsuariosMostrados">
                        <span style="width: 100%"> Mostrar:</span>
                        <div class="opcion">
                            <label for="mostrarTodos">Todos</label>
                            <input type="radio" name="radioMostrarTodos" ref="mostrarTodos" value="todos"
                                v-model="tipoMostrarUsuarios" id="radioMostrarTodos" />
                        </div>
                        <div class="opcion">
                            <label for="mostrarEstudiantes">Estudiantes</label>
                            <input type="radio" name="radioMostrarEstudiantes" ref="mostrarEstudiantes" value="estudiantes"
                                v-model="tipoMostrarUsuarios" id="radioMostrarEstudiantes" />
                        </div>

                        <div class="opcion">
                            <label for="mostrarProfesores">Profesorxs</label>
                            <input type="radio" name="radioMostrarProfesores" ref="mostrarProfesores" value="profesores"
                                v-model="tipoMostrarUsuarios" id="radioMostrarProfesores" />
                        </div>

                        <div class="opcion">
                            <label for="mostrarGraduados">Graduados</label>
                            <input type="radio" name="radioMostrarGraduados" ref="mostrarGraduados" value="graduados"
                                v-model="tipoMostrarUsuarios" id="radioMostrarGraduados" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div id="zonaBuscar">
            <div class="barraSuperior">
                <input type="text" ref="inputBuscar" v-model="textoBuscar" @keypress.enter="getBuscados"
                    v-show="mostrandoInputBuscar" />
                <div class="boton" @click="iniciarBuscar" v-show="!mostrandoInputBuscar">
                    <img src="@/assets/iconos/search.svg" alt="Lupa" />
                </div>

                <div class="boton" title="Cancelar" @click="cancelarBusqueda" v-show="mostrandoInputBuscar">
                    <img src="@/assets/iconos/equis.svg" alt="Equis" />
                </div>
            </div>
        </div>


        <div ref="listaPersonas" id="listaPersonas" @click="idPersonaMenuCx = null">
            <loading v-show="mostrandoInputBuscar && descargandoBuscados" />
            <div class="anuncioZonaVacia" v-show="personasVisibles.length < 1">
            ...
            </div>
            <persona-vista-lista v-for="persona of personasVisibles" :key="persona.id"
                :seleccionado="idPersonaSeleccionada === persona.id" :estaPersona="persona"
                :personasConEspacio="personasConEspacio" :mostrarEspacioActual="mostrarEspacioActual"
                @click.native="idPersonaSeleccionada = persona.id" @alienandoPersona="$emit('alienandoPersona', $event)" />

                <div class="botonTexto" @click.stop="fetchMorePersonas" :class="{deshabilitado: $apollo.queries.personas.loading}">
                    Cargar mas...
                </div>

        </div>
        <loading v-show="$apollo.queries.personas.loading" texto="Cargando lista de personas..." />
    </div>
</template>

<script>
import { gql } from "@apollo/client/core";
import Loading from "./utilidades/Loading.vue";
import PersonaVistaLista from "./usuario/personaVistaLista.vue";
import debounce from "debounce";
import { similarity } from "./utilidades/funciones";
import stringSimilarity from "string-similarity";

const charProhibidosPermiso = /[^ a-zA-Z-]/;

export const QUERY_PERSONAS = gql`
    query {
        todosUsuarios {
            id
            nombres
            apellidos
            permisos
            username
            objetivos
        }
    }
    `;

export const QUERY_PERSONAS_BY_PERMISOS = gql`
    query($listaPermisos: [String], $pagina: Int!){
        usuariosByPermisos(listaPermisos: $listaPermisos, pagina: $pagina){
            id
            nombres
            apellidos
            permisos
            username
            objetivos
        }
    }
    `;

export default {
    name: "Personas",
    components: {
        Loading,
        PersonaVistaLista,
    },
    apollo: {
        personas: {
            query: QUERY_PERSONAS_BY_PERMISOS,
            variables() {
                return {
                    listaPermisos: this.arrayPermisosDescargarPersonas,
                    pagina: 0,
                }
            },
            update: function ({ usuariosByPermisos }) {
                if (usuariosByPermisos.length < this.sizePaginaPersonas) {
                    this.hayMasPaginasPersonas = false;
                }
                return usuariosByPermisos;
            },
            skip() {
                return !this.tipoMostrarUsuarios
            },
            fetchPolicy: "cache-and-network",
        },
        personasConEspacio: {
            query: gql`
                query ($dateActual: Date) {
                    todosUsuarios(dateActual: $dateActual) {
                        id
                        espacioActual
                    }
                }
                `,
            variables() {
                return {
                    dateActual: Date.now(),
                };
            },
            update({ todosUsuarios }) {
                return todosUsuarios;
            },
        },
    },
    data() {
        const stringConfiguracion = localStorage.getItem("configuracionPersonas");

        var configuracion = {};

        if (stringConfiguracion) {
            configuracion = JSON.parse(stringConfiguracion);
        }
        return {
            hayMasPaginasPersonas: true,
            sizePaginaPersonas: 10,
            personas: [],
            arrayPermisosDescargarPersonas: [],
            paginaFetchMorePersonas: 0,
            personasConEspacio: [],
            nodosSolidaridadPublicitados: [],
            idPersonaMenuCx: null,
            idPersonaSeleccionada: null,
            tipoMostrarUsuarios: "estudiantes",

            permisoInput: "",
            textoBuscar: null,
            mostrandoInputBuscar: false,
            personasBuscadas: [],
            descargandoBuscados: false,

            mostrarEspacioActual:
                configuracion.mostrarEspacioActual != null &&
                    configuracion.mostrarEspacioActual != undefined
                    ? configuracion.mostrarEspacioActual
                    : true,

            mostrandoConfiguracion: false,
        };
    },
    methods: {
        checkIfFetchMore() {
            let rect = this.$refs.listaPersonas.getBoundingClientRect();
            if (rect.bottom <= window.innerHeight) {
                this.fetchMorePersonas();
            }
        },

        fetchMorePersonas() {
            console.log("Refetching more personas");
            if (this.$apollo.queries.personas.loading) {
                return;
            }
            if (!this.hayMasPaginasPersonas) {
                return;
            }
            this.paginaFetchMorePersonas++;
            console.log("De página " + this.paginaFetchMorePersonas);

            this.$apollo.queries.personas.fetchMore({
                variables: {
                    permisos: this.arrayPermisosDescargarPersonas,
                    pagina: this.paginaFetchMorePersonas,
                },
                updateQuery: (prev, { fetchMoreResult }) => {
                    console.log("Updating query")
                    if (fetchMoreResult.usuariosByPermisos.length < this.sizePaginaPersonas) {
                        this.hayMasPaginasPersonas = false;
                    }

                    return {
                        usuariosByPermisos: [
                            ...prev.usuariosByPermisos,
                            ...fetchMoreResult.usuariosByPermisos,
                        ]
                    }
                }
            })

        },
        setLocalStorageConfiguracion() {
            const objeto = {
                mostrarEspacioActual: this.mostrarEspacioActual,
            };

            const objetoString = JSON.stringify(objeto);

            localStorage.setItem("configuracionPersonas", objetoString);
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
        eliminarPersonaDeDatabase(idPersona) {
            if (confirm("¿Seguro de eliminar a este individuo?")) {
                console.log(
                    `Se eliminara una persona con id ${idPersona} de la base de datos`
                );
            }
            this.$apollo
                .mutate({
                    mutation: gql`
                        mutation ($idUsuario: ID!) {
                            eliminarUsuario(idUsuario: $idUsuario)
                        }
                        `,
                    variables: {
                        idUsuario: idPersona,
                    },
                    update: (store, { data: { eliminarUsuario } }) => {
                        console.log(`Data: ${eliminarUsuario}`);
                        if (eliminarUsuario) {
                            try {
                                let cache = store.readQuery({
                                    query: QUERY_PERSONAS,
                                    variables: { idUsuario: idPersona },
                                });
                                console.log(`cache: ${cache}`);

                                let indexE = cache.todosUsuarios.findIndex(
                                    (p) => p.id == idPersona
                                );
                                if (indexE > -1) {
                                    cache.todosUsuarios.splice(indexE, 1);
                                }
                                console.log(`cache: ${cache}`);
                                store.writeQuery({
                                    query: QUERY_PERSONAS,
                                    variables: { idUsuario: idPersona },
                                    data: cache,
                                });
                            } catch (error) {
                                console.log(`Error actualizando cache. E:${error}`);
                            }
                        }
                    },
                })
                .then((res) => {
                    console.log(`Res: ${JSON.stringify(res)}`);
                    if (res.data) {
                        console.log(`Usuario eliminado exitosamente`);
                    }
                })
                .catch((error) => {
                    console.log(`Error eliminando usuario: E: ${error}`);
                });
        },
        asignarPermisoTodos() {
            if (this.permisoIlegal) {
                console.log(`No enviado`);
                return;
            }

            if (!confirm("¿Asignar este permiso a todas las personas?")) return;

            this.$apollo
                .mutate({
                    mutation: gql`
                        mutation ($nuevoPermiso: String!) {
                            asignarPermisoTodosUsuarios(nuevoPermiso: $nuevoPermiso)
                        }
                        `,
                    variables: {
                        nuevoPermiso: this.permisoInput,
                    },
                })
                .then(() => {
                    alert(
                        "Permiso " + this.permisoInput + " asignado para todos los usuarios"
                    );
                });
        },
        iniciarBuscar() {
            this.mostrandoInputBuscar = true;
            this.$nextTick(() => {
                this.$refs.inputBuscar.focus();
            });

        },
        cancelarBusqueda() {
            this.textoBuscar = null;
            this.mostrandoInputBuscar = false;
        },
        getBuscados() {
            this.textoBuscar = this.$refs.inputBuscar.value;
            if (!this.textoBuscar || this.textoBuscar.length < 3) {
                console.log("Demasiado corto");
                return;
            }
            this.textoBuscar = this.textoBuscar.trim();
            console.log("Descargando lista de personas buscadas");

            this.descargandoBuscados = true;
            this.$apollo.query({
                query: gql`
                query($textoBuscar: String!, $permisos: [String!]){
                    buscarPersonas(textoBuscar: $textoBuscar, permisos: $permisos){
            id
            nombres
            apellidos
            permisos
            username
            objetivos
                    }
                }
                `,
                variables: {
                    textoBuscar: this.textoBuscar,
                    permisos: this.arrayPermisosDescargarPersonas,
                }
            }).then(({ data: { buscarPersonas } }) => {
                this.descargandoBuscados = false;
                this.personasBuscadas = buscarPersonas;
            }).catch((error) => {
                this.descargandoBuscados = false;
                console.log("Error getting personas buscadas: " + error);
            })

        }
    },
    computed: {
        opcionesEspecialesPersona: function () {
            let opciones = [];
            if (this.usuarioSuperadministrador) {
                opciones = opciones.concat([
                    {
                        textoVisible: "Eliminar de la base de datos",
                        evento: "eliminandoseDeDatabase",
                    },
                    {
                        textoVisible: "resetear contraseña (123456)",
                        evento: "reseteandoPass",
                    },
                ]);
            }
            return opciones;
        },
        permisoIlegal() {
            if (this.permisoInput.length < 1) {
                return true;
            }
            if (charProhibidosPermiso.test(this.permisoInput)) {
                return true;
            }
            return false;
        },
        personasVisibles() {
            if (this.mostrandoInputBuscar) {
                return this.personasBuscadas;
            }

            return this.personas;
        },
    },
    watch: {
        tipoMostrarUsuarios: {
            handler: function (tipo, prev) {
                let arrayPermisos = [];
                if (tipo === 'estudiantes') {
                    arrayPermisos = ["maestraVida-estudiante"];
                }
                else if (tipo === 'profesores') {
                    arrayPermisos = ["maestraVida-profesor"];
                }
                else if (tipo === 'graduados') {
                    arrayPermisos = ["maestraVida-graduado"];
                }
                else if (tipo === 'todos') {
                    arrayPermisos = ["usuario"];
                }
                this.paginaFetchMorePersonas = 0;
                this.hayMasPaginasPersonas = true;
                this.mostrandoInputBuscar = false;
                this.textoBuscar=null;

                this.arrayPermisosDescargarPersonas = arrayPermisos;
            },
            immediate: true,
        },

        mostrarEspacioActual() {
            this.setLocalStorageConfiguracion();
        },
    },
};
</script>

<style scoped>
.personas {
    overflow-y: scroll;
}

#listaPersonas {
    display: flex;
    padding-bottom: 50px;
    flex-flow: row wrap;
}

#campoUsuariosMostrados {
    display: flex;
    flex-wrap: wrap;
}

#campoUsuariosMostrados .opcion {
    display: flex;
    align-items: center;
    gap: 10px;
}

#zonaBuscar {
    padding: 10px 5px;
}

#zonaBuscar .barraSuperior {
    display: flex;
    align-items: center;
}

#zonaBuscar .barraSuperior input {
    font-size: 20px;
    border: 2px solid gray;
    border-radius: 5px;
    padding: 5px;
    margin-right: 10px;
}

.personaVistaLista {}

.personaVistaLista:hover {
    background-color: rgba(128, 128, 128, 0.178);
}

.loading {
    margin: 20px auto;
}

.botonPermisos {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    padding: 3px;
    cursor: pointer;
}

.botonPermisos:hover {
    background-color: rgba(128, 128, 128, 0.726);
}
</style>
