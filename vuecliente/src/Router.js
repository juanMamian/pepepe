import Vue from "vue"
import Router from "vue-router"
import atlasConocimiento from "./components/AtlasConocimiento.vue"
import loginArea from "./components/LoginArea.vue"
import perfilPersonal from "./components/usuario/PerfilPersonal.vue"
import VisorNodoConocimiento from "./components/visorNodoConocimiento/VisorNodoConocimiento.vue"
import Proyectos from "./components/Proyectos.vue"
import Proyecto from "./components/Proyecto.vue"
import Registro from "./components/Registro.vue"
import Personas from "./components/Personas.vue"
import HomeNodo from "./components/atlasSolidaridad/homeNodo/HomeNodo"

// import ActividadesDeGrupo from "./components/actividadesProfes/ActividadesDeGrupo.vue"
// import ActividadesDeProfe from "./components/actividadesProfes/ActividadesDeProfe.vue"
// import ActividadesEstudiantiles from "./components/ActividadesEstudiantiles.vue"
// import PortadaActividadesEstudiantiles from "./components/actividadesProfes/PortadaActividadesEstudiantiles";
// import ActividadEspecifica from "./components/actividadesProfes/ActividadEspecifica"

import store from "./store/index"
import ForosGenerales from "./components/ForosGenerales"
import AtlasSolidaridad from "./components/atlasSolidaridad/AtlasSolidaridad"
import Espacios from "./components/Espacios"
import VentanaEventoPublico from "./components/utilidades/VentanaEventoPublico"
import VentanaEventoPersonal from "./components/utilidades/VentanaEventoPersonal"

Vue.use(Router);

const routes = [

    { path: "/atlas", name: "atlas", component: atlasConocimiento },
    {
        path: "/login", name: "loginArea",
        component: loginArea,
        beforeEnter: function (to, from, next) {
            if (store.state.usuario.id != null) {
                next("/miperfil");
            }
            else {
                next();
            }
        }

    },
    {
        path: "/miperfil",
        name: "perfilPersonal",
        component: perfilPersonal,
        beforeEnter: function (to, from, next) {
            if (store.state.usuario.id != null) {
                next();
            }
            else {
                next("/login");
            }
        },
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
    { path: "/atlasSolidaridad", component: AtlasSolidaridad },
    {
        path: "/homeNodoSolidaridad/:id", component: HomeNodo,
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
    { path: "/foros", component: ForosGenerales },
    { path: "/nodoConocimiento/:idNodo", component: VisorNodoConocimiento },
    { path: "/proyectos", name: "proyectos", component: Proyectos },
    { path: "/proyecto/:idProyecto", name: "verProyecto", component: Proyecto },
    { path: "/registro", name: "registro", component: Registro },
    // {
    //     path: "/actividadesVirtuales2021", component: ActividadesEstudiantiles, children: [
    //         {
    //             path: 'grupoEstudiantil/:idGrupo',
    //             component: ActividadesDeGrupo,
    //             name: "ActividadesDeGrupo"
    //         },
    //         {
    //             path: 'actividadesProfes/:idProfe',
    //             component: ActividadesDeProfe,
    //             name: "ActividadesDeProfe"
    //         },
    //         {
    //             path: "",
    //             component: PortadaActividadesEstudiantiles
    //         }
    //     ]
    // },
    // { path: "/actividad/:idActividad", name: "actividadEspecifica", component: ActividadEspecifica },
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
        path: "/", redirect() {
            console.log(`Redirecting`);
            if (!store.state.usuario || !store.state.usuario.id) {
                return "/login"
            }
            return "/miPerfil"
        }
    },

    /////////////////////////////////////7
    // {
    //     path: "/*", redirect() {
    //         if (!store.state.usuario || !store.state.usuario.id) {
    //             return "/login"
    //         }
    //         return "/miPerfil"
    //     }
    // },


];

export const router = new Router({
    routes
});

// router.beforeEach((to, from, next) => {
//     console.log(`Guarda before ${to.path}`);
//     if(to.path!='/login' && (!store.state.usuario || !store.state.usuario.id)){
//         next("/login");
//     }
//     else{
//         next();
//     }

//   })