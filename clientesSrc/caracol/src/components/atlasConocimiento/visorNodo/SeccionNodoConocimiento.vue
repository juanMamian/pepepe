<template>
    <div class="seccionNodoConocimiento">
        <div class="contenedorControles">
            <div class="boton" v-if="usuarioExperto || usuarioSuperadministrador" @click="editando = !editando">
                <img src="@/assets/iconos/edit.svg" alt="Editar" />
            </div>
        </div>
        <div id="zonaFront" class="frontDeSeccion" v-show="!editando" :key="versionArchivo">
            <iframe ref="iframeSeccion" id="iframeSeccion" @load="reheight(); startObserving()" :src="srcIframe" :style="[offsetIframe]"
                v-if="estaSeccion.modo === 'enlace' || (estaSeccion.tipoPrimario && estaSeccion.tipoPrimario.substring(0, 5) != 'image')"
                frameborder="0"></iframe>
            <img :src=" direccionNodo + '/' + estaSeccion.id + '/?v=' + versionArchivo "
                v-if=" estaSeccion.modo === 'archivo' && estaSeccion.tipoPrimario && estaSeccion.tipoPrimario.substring(0, 5) === 'image' " />
        </div>

        <div id="zonaAdministracion" v-if=" usuarioExperto || usuarioSuperadministrador " v-show=" editando ">
            <div id="nombre" v-show=" !editandoNombre " @click=" iniciarEdicionNombre ">
                {{ estaSeccion.nombre }}
            </div>
            <input v-show=" editandoNombre " type="text" name="" :value=" estaSeccion.nombre " id="inputNuevoNombre"
                ref="inputNuevoNombre" :class=" { deshabilitado: enviandoNuevoNombre } " @blur=" guardarNuevoNombre "
                @keypress.enter=" guardarNuevoNombre " />
            <loading texto="" v-show=" enviandoNuevoNombre " />
            <div class="contenedorControles">
                <div class="boton" title="Subir un archivo" @click=" $refs.inputArchivoContenido.click() "
                    v-if=" modo === 'archivo' " v-show=" !subiendoArchivo ">
                    <img src="@/assets/iconos/plusCircle.svg" alt="Plus" />
                </div>
                <loading texto="" v-show=" subiendoArchivo " />

                <div class="boton" :title="
                    estaSeccion.modo === 'archivo'
                    ? 'Cambiar modo a enlace'
                    : 'Cambiar modo a archivo'
                " @click.stop=" toggleModo ">
                    <img src="@/assets/iconos/file.svg" v-show=" modo === 'archivo' " alt="Archivo" />
                    <img src="@/assets/iconos/link.svg" v-show=" modo === 'enlace' " alt="Archivo" />
                </div>
            </div>

            <div id="listaArchivos" v-show=" modo === 'archivo' ">
                <input type="file" class="inputArchivoContenido" ref="inputArchivoContenido" v-show=" false "
                    @change=" subirArchivoContenido($event) " />
                <archivo-seccion-nodo :esteArchivo=" archivo " :usuarioExperto=" usuarioExperto " :idNodo=" idNodo "
                    :idSeccion=" estaSeccion.id " v-for=" archivo  of     archivosOrdenados    " :key=" archivo.id "
                    @meElimine=" $emit('archivoEliminado', archivo.nombre) " @soyPrimario="
                        $emit('tengoNuevoPrimario', archivo.nombre);
                        versionArchivo++;
                    " />
            </div>

            <div id="zonaEnlace" v-show=" modo === 'enlace' ">

                <input type="text" id="inputNuevoEnlace" ref="inputNuevoEnlace" v-model=" inputNuevoEnlace "
                    @blur=" guardarNuevoEnlace " placeholder="Enlace al recurso" @keypress.enter=" guardarNuevoEnlace ">
            </div>
        </div>
    </div>
</template>

<script>
import axios from "axios";

import ArchivoSeccionNodo from "./archivoSeccionNodo.vue";
import Loading from "../../utilidades/Loading.vue";
import { charProhibidosNombreCosa } from "../../configs";
import { gql } from "@apollo/client/core";

let ro = null;

export default {
    props: {
        estaSeccion: Object,
        idNodo: String,
        usuarioExperto: Boolean,
    },
    components: {
        ArchivoSeccionNodo,
        Loading,
    },
    name: "SeccionNodoConocimiento",
    data() {
        return {
            observer: null,
            editando: false,
            subiendoArchivo: false,
            versionArchivo: 0,

            editandoNombre: false,
            enviandoNuevoNombre: false,
            guardandoNuevoEnlace: false,
            inputNuevoEnlace: this.estaSeccion.enlace,
            modo: "",
            offsetIframe: {
                height: '900px',
            }
        };
    },
    methods: {
        startObserving() {
            ro = new ResizeObserver(lista => {
                this.reheight();

            })

            ro.observe(document.getElementById("iframeSeccion").contentWindow.document.body);
        },
        reheight() {
            let nuevoHeight = this.$refs.iframeSeccion.contentWindow.document.body.scrollHeight;
            this.offsetIframe.height = Math.round(nuevoHeight +40) + "px";
        },

        subirArchivoContenido(e) {
            const inputArchivo = e.target;
            var datos = new FormData();
            const nuevoArchivo = inputArchivo.files[0];

            datos.append("nuevoArchivo", nuevoArchivo);
            datos.append("idNodo", this.idNodo);
            datos.append("idSeccion", this.estaSeccion.id);
            this.subiendoArchivo = true;
            axios({
                method: "post",
                url: this.serverUrl + "/api/atlas/subirArchivoContenidoSeccionNodo",
                data: datos,
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + this.usuario.token,
                },
            })
                .then(({ data: { infoArchivo } }) => {
                    this.subiendoArchivo = false;
                    this.versionArchivo++;
                    this.$emit("subiArchivo", infoArchivo);
                })
                .catch((error) => {
                    this.subiendoArchivo = false;

                    console.log(`Error subiendo archivo. E: ${error}`);
                });
        },
        iniciarEdicionNombre() {
            this.$refs.inputNuevoNombre.value = this.estaSeccion.nombre;
            this.editandoNombre = true;
        },
        guardarNuevoNombre() {
            var nuevoNombre = this.$refs.inputNuevoNombre.value.trim();
            if (nuevoNombre == this.estaSeccion.nombre) {
                this.editandoNombre = false;
                return;
            }

            if (nuevoNombre.length < 1) {
                return;
            }
            if (charProhibidosNombreCosa.test(nuevoNombre)) {
                console.log(`Caracteres ilegales`);
                return;
            }

            console.log(`guardando nuevo nombre`);
            this.enviandoNuevoNombre = true;
            this.$apollo
                .mutate({
                    mutation: gql`
            mutation (
              $idNodo: ID!
              $idSeccion: ID!
              $nuevoNombre: String!
            ) {
              editarNombreSeccionNodoConocimiento(
                idNodo: $idNodo
                idSeccion: $idSeccion
                nuevoNombre: $nuevoNombre
              ) {
                id
                nombre
              }
            }
          `,
                    variables: {
                        idNodo: this.idNodo,
                        idSeccion: this.estaSeccion.id,
                        nuevoNombre: nuevoNombre,
                    },
                })
                .then((data) => {
                    console.log(`fin de la mutacion. Data: ${JSON.stringify(data)} `);
                    this.enviandoNuevoNombre = false;
                    this.editandoNombre = false;
                })
                .catch((error) => {
                    this.enviandoNuevoNombre = false;
                    console.log(`Error. E :${error}`);
                });
        },
        toggleModo() {
            const nuevoModo = this.modo === 'archivo' ? 'enlace' : 'archivo';
            console.log("Cambiando a " + nuevoModo);
            this.modo = nuevoModo;
        },
        guardarNuevoEnlace() {
            console.log("guardar nuevo enlace");
            var nuevoEnlace = this.$refs.inputNuevoEnlace.value.trim();
            console.log(nuevoEnlace);

            if (nuevoEnlace === this.estaSeccion.enlace || !nuevoEnlace || nuevoEnlace.length < 5) {
                return
            }

            if (!this.usuarioExperto && !this.usuarioSuperadministrador) {
                return
            }
            this.guardandoNuevoEnlace = true;
            this.$apollo.mutate({
                mutation: gql`
          mutation($idNodo: ID!, $idSeccion:ID!, $nuevoEnlace:String!){
            setNuevoEnlaceSeccionNodo(idNodo: $idNodo, idSeccion: $idSeccion, nuevoEnlace: $nuevoEnlace){
              id
              modo
              enlace
            }
          }
        `,
                variables: {
                    idNodo: this.idNodo,
                    idSeccion: this.estaSeccion.id,
                    nuevoEnlace,
                }

            }).then(() => {
                this.guardandoNuevoEnlace = false;
            }).catch((error) => {
                console.log("Error: " + error);
                this.guardandoNuevoEnlace = true;

            })

        }
    },
    computed: {
        direccionNodo: function () {
            return this.serverUrl + "/assetsAtlas/contenidosNodos/" + this.idNodo;
        },
        archivosOrdenados() {
            var archivos = JSON.parse(JSON.stringify(this.estaSeccion.archivos));
            archivos.sort((a) => {
                if (a.primario) return -1;
                return 0;
            });
            return archivos;
        },
        srcIframe() {
            if (this.estaSeccion.modo === 'enlace' && this.estaSeccion.enlace) {
                var elEnlace = this.estaSeccion.enlace;
                console.log("Server URL: " + this.serverUrl);
                console.log("elEnlace: " + elEnlace);

                //elEnlace = elEnlace.replace("192.168.1.100", "192.168.1.105");

                console.log("Queda " + elEnlace);
                return elEnlace;
            }
            return this.direccionNodo + '/' + this.estaSeccion.id + '/?v=' + this.versionArchivo;
        },

    },
    watch: {
        'estaSeccion.modo': {
            handler: function () {
                this.modo = this.estaSeccion.modo
            },
            immediate: true,
        }
    },
    mounted() {


    }
};
</script>

<style scoped>
.seccionNodoConocimiento {
    width: 100%;
}

#zonaFront {
    max-width: 100vw;
    margin: 5px auto;
}

#zonaFront iframe {

    width: 100%;
}

#zonaFront img {
    max-width: 100%;
    margin: 0px auto;
    display: block;
}

#inputNuevoEnlace {
    margin: 10px auto;
    display: block;
}

#iframeSeccion {
    width: 100%;
    min-height: 100px;
}

h #zonaAdministracion {
    width: min(500px, 90vw);
    border-radius: 10px;
    margin: 0px auto;
    background-color: var(--paletaMain);
    padding: 10px 0px;
    min-height: 300px;
}

#nombre {
    text-align: center;
}

#inputNuevoNombre {
    display: block;
    margin: 15px auto;
    padding: 5px;
    border-radius: 5px;
    font-size: 16px;
    color: rgb(48, 48, 48);
}
</style>
