import { createRouter, createWebHistory } from 'vue-router'
import { apolloClient } from '../apollo'
import { QUERY_AUTH_USUARIO } from '../globalMixin'
import { fragmentoBloqueSubscripcion } from '../components/frags/fragsSubscripciones'
import atlasConocimiento from '../components/atlasConocimiento/AtlasConocimiento.vue'
import adminNodosConocimiento from '../components/atlasConocimiento/adminNodosConocimiento.vue'
import VisorNodoConocimiento from '../components/atlasConocimiento/visorNodo/VisorNodoConocimiento.vue'
import RutaGrado from '../components/usuario/RutaGrado.vue'
import loginArea from '../components/LoginArea.vue'
import perfilPersonal from '../components/usuario/PerfilPersonal.vue'
import Registro from '../components/Registro.vue'
import Personas from '../components/Personas.vue'
import Espacios from '../components/Espacios.vue'
import VentanaEventoPublico from '../components/utilidades/VentanaEventoPublico.vue'
import VentanaEventoPersonal from '../components/utilidades/VentanaEventoPersonal.vue'
import Landing from "../landing/Landing.vue"
import LoginScreen from "../landing/LoginScreen.vue"
import LogoutScreen from "../landing/LogoutScreen.vue"
import PromptSubscripcion from "../components/usuario/PromptSubscripcion.vue"

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/", name: "home", component: Landing, children: [{ path: "login", name: "loginScreen", component: LoginScreen }],

        },
        { path: "/logout", name: "logoutScreen", component: LogoutScreen },
        {
            path: "/atlas/:tipoBrowse/:idBrowsed", name: "atlas", component: atlasConocimiento, children: [
                {
                    path: "verNodo/:idNodo",
                    name: "visorNodoConocimiento",
                    component: VisorNodoConocimiento,
                }
            ]
        },
        {
            path: "/rutaGrado/:idUsuario", name: "rutaGrado", component: RutaGrado, props: true
        },
        { path: "/adminNodosConocimiento", name: "adminNodosConocimiento", component: adminNodosConocimiento },
        {
            path: "/login", name: "loginArea",
            component: loginArea,
        },
        {
            path: "/miperfil",
            name: "perfilPersonal",
            component: perfilPersonal,
            children: [
                {
                    path: "ventanaEventoPublico/:idEvento",
                    component: VentanaEventoPublico,
                    name: "VentanaEventoPublico",
                },
                {
                    path: "ventanaEventoPersonal/:idEvento",
                    component: VentanaEventoPersonal,
                    name: "VentanaEventoPersonal",
                }
            ]
        },
        // { path: "/foros", component: ForosGenerales },
        { path: "/nodoConocimiento/:idNodo", component: VisorNodoConocimiento },
        { path: "/registro", name: "registro", component: Registro },
        {
            path: "/personas", name: "personas", component: Personas,
            children: [
                {
                    path: "ventanaEventoPublico/:idEvento",
                    component: VentanaEventoPublico,
                    name: "VentanaEventoPublico",
                },
                {
                    path: "ventanaEventoPersonal/:idEvento",
                    component: VentanaEventoPersonal,
                    name: "VentanaEventoPersonal",
                }
            ]
        },
        {
            path: "/espacios", name: "espacios", component: Espacios, children: [
                {
                    path: "ventanaEventoPublico/:idEvento",
                    component: VentanaEventoPublico,
                    name: "VentanaEventoPublico",
                },
                {
                    path: "ventanaEventoPersonal/:idEvento",
                    component: VentanaEventoPersonal,
                    name: "VentanaEventoPersonal",
                }
            ]
        },
        {
            path:"/subscripcionVencida",
            name: "promptSubscripcion",
            component: PromptSubscripcion,
        },
        { path: "/:catchAll(.*)", redirect() { return "/" } },
    ]
})


router.beforeEach(async (to, from) => {
    if (!apolloClient) {
        return false;
    }

    let datosUsuario = apolloClient.readQuery({
        query: QUERY_AUTH_USUARIO
    });

    if (datosUsuario?.auth_usuario && !datosUsuario.auth_usuario.subscripcionIlimitada && (!datosUsuario.auth_usuario.millisFinSubscripcion || datosUsuario.auth_usuario.millisFinSubscripcion < Date.now())) {
        let rutasAllowed = ["home", "perfilPersonal", "logoutScreen", "promptSubscripcion"];
        if (!rutasAllowed.includes(to.name)) {
            return { name: "promptSubscripcion" };

        }
    }

    if (datosUsuario?.auth_usuario?.id) {
        if (to.name == 'loginScreen') {
            return { name: "home" }
        }
    }
    else {
        if (to.name != 'loginScreen') {
            return { name: "loginScreen" }
        }
    }
})
export default router
