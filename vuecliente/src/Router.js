import Vue from "vue"
import Router from "vue-router"
import atlasConocimiento from "./components/atlasConocimiento/AtlasConocimiento.vue"
import loginArea from "./components/LoginArea.vue"
import perfilPersonal from "./components/PerfilPersonal.vue"
import VisorNodoConocimiento from "./components/visorNodoConocimiento/VisorNodoConocimiento.vue"
import Grupos from "./components/grupos/Grupos.vue"
import Grupo from "./components/grupo/Grupo.vue"
import Registro from "./components/Registro.vue"
import ActividadesEstudiantiles from "./components/actividadesProfes/ActividadesEstudiantiles.vue"
import Personas from "./components/Personas.vue"
import ActividadesDeGrupo from "./components/actividadesProfes/ActividadesDeGrupo.vue"
import ActividadesDeProfe from "./components/actividadesProfes/ActividadesDeProfe.vue"
import store from "./store/index"
import PortadaActividadesEstudiantiles from "./components/actividadesProfes/PortadaActividadesEstudiantiles";
import ActividadEspecifica from "./components/actividadesProfes/ActividadEspecifica"
import Home from "./components/Home"
import Trabajo from "./components/atlasSolidaridad/paginaNodoSolidaridad/Trabajo"
import Objetivo from "./components/atlasSolidaridad/paginaNodoSolidaridad/Objetivo"
import ForosGenerales from "./components/ForosGenerales"
import AtlasSolidaridad from "./components/atlasSolidaridad/AtlasSolidaridad"
import CalendarioPersonal from "./components/CalendarioPersonal"

Vue.use(Router);

const routes = [
    {path: "/home", name:"home", component: Home},
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
        }
    },
    { path: "/calendarioPersonal", component: CalendarioPersonal },
    { path: "/atlasSolidaridad/:nv", component: AtlasSolidaridad },
    { path: "/atlasSolidaridad", component: AtlasSolidaridad },
    { path: "/foros", component: ForosGenerales },
    { path: "/nodoConocimiento/:idNodo", component: VisorNodoConocimiento },
    { path: "/grupos", name: "grupos", component: Grupos },
    { path: "/grupo/:idGrupo", name: "verGrupo", component: Grupo },
    { path: "/trabajo/:idTrabajo", name: "verTrabajo", component: Trabajo },
    { path: "/objetivo/:idObjetivo", name: "verObjetivo", component: Objetivo },
    { path: "/registro", name: "registro", component: Registro },
    {
        path: "/actividadesVirtuales2021", component: ActividadesEstudiantiles, children: [
            {
                path: 'grupoEstudiantil/:idGrupo',
                component: ActividadesDeGrupo,
                name: "ActividadesDeGrupo"
            },
            {
                path: 'actividadesProfes/:idProfe',
                component: ActividadesDeProfe,
                name: "ActividadesDeProfe"
            },
            {
                path:"",
                component: PortadaActividadesEstudiantiles
            }
        ]
    },    
    {path: "/actividad/:idActividad", name:"actividadEspecifica", component: ActividadEspecifica},    
    { path: "/personas", name: "personas", component: Personas},
    { path: "/", redirect: "/home" }
];

export const router = new Router({
    routes
});

router.beforeEach((to, from, next)=>{
    if(to.name!="loginArea" && (!store.state.usuario.id || !store.state.token)){
        console.log(`Usuario deslogeado, dirigiendo a loginArea`);
        next({name: "loginArea"});
    }
    else{
        next();
    }
})