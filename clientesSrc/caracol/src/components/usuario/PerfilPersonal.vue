<template>
    <div class="perfilPersonal" v-if="usuarioLogeado">
        <loading texto="Cargando" v-show="$apollo.queries.esteUsuario.loading" />
        <div id="zonaSelectores" class="contenedorControles">
            <div class="boton" title="Información personal" @click="seccion = 'informacionPersonal'">
                <img src="@/assets/iconos/info.svg" alt="Informacion" />
            </div>
            <div class="boton" title="Cambiar contraseña" @click="seccion = 'cambiarPass'">
                <img src="@/assets/iconos/key.svg" alt="Pass" />
            </div>
            <div class="boton" title="Mi calendario" @click="seccion = 'calendario'">
                <img src="@/assets/iconos/calendar.svg" alt="Calendario" />
            </div>
            <!-- <div class="boton" title="Organizador semanal" @click="seccion = 'organizadorSemanal'">
        <img src="@/assets/iconos/calendarWeek.svg" alt="Calendario" />
      </div> -->
        </div>
        <div id="contenido" v-if="!$apollo.queries.esteUsuario.loading">
            <div id="infoSubscripcion" v-if="esteUsuario?.finSubscripcion">
                Subscripción activa hasta {{ enrichedToReadableDate(esteUsuario.finSubscripcion) }}
            </div>
            <div id="zonaInformacionPersonal" v-show="seccion === 'informacionPersonal'">
                <div id="fotografia">
                    <img :src="serverUrl +
                        '/api/usuarios/fotografias/' +
                        usuario.id +
                        '?v=' +
                        versionFoto
                        " alt="Fotografía" />
                    <input type="file" ref="inputFotoUsuario" v-show="false" @change="uploadNuevaFoto" />
                </div>
                <div id="zonaCamposEditablesInformacionPersonal">
                    <div class="informacionPersonal" id="nombres" style="align-self: center">
                        {{ esteUsuario.nombres }}
                    </div>
                    <div class="informacionPersonal" id="apellidos" style="align-self: center">
                        {{ esteUsuario.apellidos }}
                    </div>
                    <div class="informacionPersonal" id="email">
                        <img src="@/assets/iconos/envelope.svg" alt="Mail" class="iconoInformacionPersonal"
                            title="Correo electrónico" />
                        <span> {{ esteUsuario.email }}</span>
                    </div>
                    <img src="@/assets/iconos/whatsapp.svg" alt="Mail" class="iconoInformacionPersonal"
                        title="Añdir un número móvil" />
                    <div class="informacionPersonal numeroMovil" v-for="numeroMovil of esteUsuario.numerosMovil"
                        :key="numeroMovil.id">
                        <span>
                            {{ esteUsuario.numeroMovil }}
                        </span>
                    </div>
                </div>
            </div>

            <div id="zonaCambiarPass" v-show="seccion === 'cambiarPass'">
                <div class="tituloSeccion">Cambio de contraseña</div>
                <input v-model="inputCurrentPass" placeholder="Contraseña actual" type="password" id="inputCurrentPass"
                    class="inputCambiarPass" />
                <div id="instruccionesNuevoPass" v-show="newPassIlegal && !inputCurrentPassIlegal">
                    La contraseña debe tener al menos 8 caracteres y no contener espacios.
                </div>
                <input v-model="newPass" v-show="!inputCurrentPassIlegal" placeholder="Nueva contraseña" type="password"
                    id="inputNuevoPass" class="inputCambiarPass" :class="{ aprobado: !newPassIlegal }" />
                <input :disabled="newPassIlegal" v-model="newPass2" v-show="!newPassIlegal"
                    placeholder="Nueva contraseña (Otra vez)" type="password" id="inputNuevoPass2" class="inputCambiarPass"
                    :class="{ aprobado: !newPassIlegal && !newPass2Ilegal }" @keypress.enter="enviarCambioPass" />

                <div id="botonEnviarNuevoPass" @click="enviarCambioPass" :class="{
                        deshabilitado:
                            newPassIlegal || newPass2Ilegal || enviandoCambioPass,
                    }">
                    <span> Enviar</span>
                    <loading texto="" v-show="enviandoCambioPass" />
                </div>

                <div id="textoResultadoCambioPass">
                    {{ textoResultadoCambioPass }}
                </div>
            </div>

            <div id="zonaCalendario" v-if="seccion === 'calendario'">
                <calendario v-if="usuarioLogeado" :enfasis="'eventosPersonales'" :idUsuarioTarget="this.usuario.id" />
            </div>

            <div id="zonaOrganizadorSemanal" v-if="seccion === 'organizadorSemanal'">
                <organizador-horario-semanal />
            </div>
        </div>

        <router-view />
    </div>
</template>

<script>
import {
    minLengthPassword,
    maxLengthPassword,
    charProhibidosPassword,
} from "./configuracion";
import axios from "axios";
import gql from "graphql-tag";
import Loading from "../utilidades/Loading.vue";
import Calendario from "../utilidades/Calendario.vue";
import OrganizadorHorarioSemanal from "../calendario/OrganizadorHorarioSemanal.vue";
export default {
    components: { Loading, Calendario, OrganizadorHorarioSemanal },
    name: "PerfilPersonal",
    apollo: {
        esteUsuario: {
            query: gql`
        query {
          yo {
            nombres
              finSubscripcion
            apellidos
            username
            email
            numeroTel
          }
        }
      `,
            update({ yo }) {
                return yo;
            },
        },
    },
    data() {
        return {
            seccion: "informacionPersonal",
            esteUsuario: {
                permisos: [],
                id: null,
            },

            inputCurrentPass: null,
            newPass: null,
            newPass2: null,
            enviandoCambioPass: false,

            textoResultadoCambioPass: null,

            mostrandoOpcionesCrearSubNodo: false,
            creandoSubNodo: false,
            versionFoto: 0,
        };
    },
    computed: {
        inputCurrentPassIlegal() {
            return (
                !this.inputCurrentPass ||
                this.inputCurrentPass.length < minLengthPassword
            );
        },
        newPassIlegal() {
            if (
                !this.newPass ||
                this.newPass.length < minLengthPassword ||
                this.newPass.length > maxLengthPassword ||
                charProhibidosPassword.test(this.newPass)
            ) {
                return true;
            }

            return false;
        },
        newPass2Ilegal() {
            if (!this.newPass2 || !this.newPass || this.newPass != this.newPass2) {
                return true;
            }
            return false;
        },
    },
    methods: {
        enviarCambioPass() {
            if (this.newPassIlegal || this.newPass2Ilegal) {
                return;
            }
            this.textoResultadoCambioPass = null;

            if (this.newPass === this.inputCurrentPass) {
                return;
            }

            this.enviandoCambioPass = true;

            this.$apollo
                .mutate({
                    mutation: gql`
            mutation ($dizqueCurrentPassword: String!, $newPassword: String!) {
              cambiarPassword(
                dizqueCurrentPassword: $dizqueCurrentPassword
                newPassword: $newPassword
              )
            }
          `,
                    variables: {
                        dizqueCurrentPassword: this.inputCurrentPass,
                        newPassword: this.newPass,
                    },
                })
                .then(({ data: { cambiarPassword } }) => {
                    if (cambiarPassword) {
                        alert("Contraseña cambiada");
                    }
                    this.enviandoCambioPass = false;
                    this.inputCurrentPass = null;
                    this.newPass = null;
                    this.newPass2 = null;
                })
                .catch((error) => {
                    console.log(`Error cambiando pass: ${error}`);
                    this.enviandoCambioPass = false;
                    this.textoResultadoCambioPass = "Error";
                });
        },
        uploadNuevaFoto(e) {
            console.log(`Uploading foto`);
            const inputArchivo = e.target;
            var datos = new FormData();
            const nuevoArchivo = inputArchivo.files[0];

            datos.append("nuevaFoto", nuevoArchivo);
            this.subiendoNuevaFoto = true;
            axios({
                method: "post",
                url: this.serverUrl + "/api/usuarios/updateFoto",
                data: datos,
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + this.usuario.token,
                },
            })
                .then(({ data: { resultado } }) => {
                    this.subiendoNuevaFoto = false;
                    if (resultado) {
                        console.log(`Foto actualizada`);
                        this.versionFoto++;
                    }
                })
                .catch((error) => {
                    this.subiendoNuevaFoto = false;
                    console.log(`Error subiendo archivo. E: ${error}`);
                });
        },
    },
};
</script>

<style scoped>
.perfilPersonal {}

#contenido {
    width: 100%;
}

.boton {
    height: 20px;
    width: 20px;
}

#zonaInformacionPersonal {
    display: flex;
    flex-direction: column;
    align-items: center;
}

#fotografia {
    width: 200px;
    height: 200px;
    border-radius: 50%;
    overflow: hidden;
    margin: 8vh 0px;
    margin-bottom: 2vh;
}

#fotografia img {
    width: 100%;
    height: 100%;
}

#apellidos {
    margin-bottom: 30px;
}

#zonaCamposEditablesInformacionPersonal {
    display: flex;
    flex-direction: column;
    width: min(300px, 90vw);
}

.informacionPersonal {
    margin: 10px 0px;
    display: flex;
    align-items: center;
}

#nombres {
    margin-bottom: 0px;
}

.iconoInformacionPersonal {
    width: 20px;
    margin-right: 10px;
}

#zonaSelectores .boton {
    margin: 0px min(10px, 2%);
}

.tituloSeccion {
    font-size: 22px;
    text-align: center;
    margin-bottom: 8vh;
}

#zonaCambiarPass {
    display: flex;
    flex-direction: column;
    margin-top: 5vh;
}

#instruccionesNuevoPass {
    font-size: 11px;
    font-style: italic;
    color: rgb(78, 78, 78);
    text-align: center;
}

.inputCambiarPass {
    margin: 15px auto;
    font-size: 20px;
    width: min(300px, 90%);
    font-family: Poppins, Helvetica, Arial, sans-serif;
    border-radius: 7px;
    padding: 3px 10px;
}

.inputCambiarPass.aprobado {
    border-color: var(--mainColorLight);
    border-style: solid;
    background-color: #6da83236;
}

.inputCambiarPass.aprobado:active {
    border-color: var(--mainColorDark) !important;
}

#inputCurrentPass {
    margin-bottom: 50px;
}

#textoResultadoCambioPass {
    font-size: 13px;
    font-style: italic;
    text-align: center;
}

#botonEnviarNuevoPass {
    border-radius: 30px;
    height: 60px;
    width: 200px;
    background-color: var(--mainColorLight);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 60px auto;
    color: whitesmoke;
}

#botonEnviarNuevoPass:hover {
    background-color: var(--mainColorDark);
}

#zonaMisNodos {
    width: min(900px, 90%);
    margin: 10px auto;
}

.tituloBloque {
    font-weight: bold;
    font-size: 14px;
}

.barraSuperiorGeneral {
    height: 30px;
    display: flex;
    padding: 5px 20px;
}

.botonBarraSuperiorGeneral {
    opacity: 0.7;
    height: 15px;
    box-sizing: border-box;
    user-select: none;
    cursor: pointer;
}

.botonBarraSuperiorGeneral:hover {
    opacity: 1;
}

.botonBarraSuperiorGeneral img {
    height: 100%;
}

.opcionCrear {
    margin: 0px 5px;
}

.controlesBloque {
    margin-left: auto;
    display: flex;
}
                #infoSubscripcion{
                    font-size: 11px;
                    font-weight: normal;
                    font-style: italic;
                    color: #717171;
                    width: min(200px, 90%);
                    margin: 10px auto;
                    text-align: center;
                }
</style>
