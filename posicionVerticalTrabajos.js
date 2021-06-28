const mongoose = require("mongoose");
const Objetivo = require("./comunaBuild/model/Objetivo").ModeloObjetivo
const Trabajo = require("./comunaBuild/model/Trabajo").ModeloTrabajo
const Proyecto = require("./comunaBuild/model/Proyecto").ModeloProyecto
const dotenv = require("dotenv");
dotenv.config();


mongoose.set('useFindAndModify', false);
const iniciarMongoose = async () => {
    try {
        await mongoose.connect(
            process.env.DB_CONNECT,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true
            }
        );
    } catch (error) {
        console.log(`Error conectando con la base de datos: E:${error}`);
    }
}



const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log(`¡Base de datos conectada!`);
});
//setInterval(() => posicionar(), 5000);
 iniciar();

async function iniciar() {
    await iniciarMongoose();

    try {
        
        var todosObjetivos = await Objetivo.find({}).exec();
        var todosTrabajos = await Trabajo.find({}).exec();

        todosTrabajos.forEach(trabajo=>trabajo.tipo="trabajo");
        todosObjetivos.forEach(objetivo=>objetivo.tipo="objetivo");
        var todosNodos=todosObjetivos.concat(todosTrabajos);
    }
    catch (error) {
        console.log(`error getting todos nodos. e: ` + error);
        return;
    }

    
    //Limpiar de nodos huerfanos
    todosNodos.forEach(nodo=>{
        var nodosHuerfanos=0;
        var indexHuerfanos=[];
        nodo.vinculos.forEach((vinculo, index)=>{
            if(!todosNodos.some(n=>n.id==vinculo.idRef)){
                nodosHuerfanos++;
                indexHuerfanos.push(index);
            }
        });
        if(nodosHuerfanos>0){
            console.log(`El nodo ${nodo.nombre} tiene ${nodosHuerfanos} vinculos huerfanos de ${nodo.vinculos.length}`);
            console.log(`Indexs: ${indexHuerfanos}`);
            indexHuerfanos=indexHuerfanos.sort((a, b)=>b-a);
            console.log(`Ordenado: ${indexHuerfanos}`);
            indexHuerfanos.forEach(i=>{
                console.log(`   Eliminando el ${i}`);
                nodo.vinculos.splice(i, 1);
            })
        }
    })        

    //Reset niveles

    todosNodos.forEach(nodo=>{
        nodo.nivel=null;
        nodo.turnoNivel=null;
    })

    //Definir niveles
    
    var nodosUbicados=0;
    var nivel=0;
    var puestoEnNivel={};

    idsNodosNivel=[];
    var nodosSinRequerimentos=todosNodos.filter(n=>n.vinculos.length==0);
    idsNodosNivel[0]=nodosSinRequerimentos.map(n=>n.id);
    nodosSinRequerimentos.forEach(nodo=>{
        nodo.nivel=0;
    });
    puestoEnNivel["0"]=0;
    console.log(`${nodosSinRequerimentos.length} nodos ubicados en el nivel ${nivel}`);    

    nodosUbicados+=nodosSinRequerimentos.length;

    while(nodosUbicados<todosNodos.length && nivel<100){
        nivel++;

        let estosNodos=todosNodos.filter(n=>{
            if(n.nivel!=null)return false;
            const refsVinculos=n.vinculos.map(v=>v.idRef);
            if(refsVinculos.length<1)return false;
            
            return refsVinculos.every(v=>{
                const nodoTarget=todosNodos.find(n=>n.id==v);
                return nodoTarget.nivel!=null;
            })            
        });
        idsNodosNivel[nivel]=estosNodos.map(n=>n.id);
        puestoEnNivel[nivel]=0;
        estosNodos.forEach(nodo=>{
            nodo.nivel=nivel;            
        });
        console.log(`${estosNodos.length} nodos ubicados en el nivel ${nivel}`);
        nodosUbicados+=estosNodos.length;        
    }

    todosNodos.filter(n=>n.nivel==2).forEach(nodo=>{
        console.log(`Nodo ${nodo.nombre} está en el nivel 1`);
    });

    //Ubicar puestoEnNivel
    todosNodos.filter(n=>idsNodosNivel[nivel].includes(n.id)).forEach((nodo)=>{        
        ubicarNodo(nodo, 0, todosNodos, puestoEnNivel );        
    })  

    //Ubicar a los que faltaron (No son requerimento de nadie)

    todosNodos.filter(n=>n.turnoNivel===null).forEach(nodo=>{
        ubicarNodo(nodo, 0, todosNodos, puestoEnNivel );        
    });

    todosNodos.filter(n=>n.nivel==1).forEach(nodo=>{
        console.log(`Nodo ${nodo.nombre} está en el nivel 1`);
    })

    //Set coords
    const stepY=200;
    const stepX=200;
    todosNodos.forEach(async function(nodo){
        nodo.coords.y=nodo.nivel*stepY;
        nodo.coords.x=nodo.turnoNivel*stepX;
        try{
            await nodo.save()            
        }
        catch(error){
            console.log(`error . e: `+error);            
        }
    })


    // while(true){
    //     await sleep(5000);
    // }

    
}



function ubicarNodo(nodo, minPuesto, todosNodos, puestoEnNivel){
    if(nodo.nivel===null){
        console.log(`Tratando de ubicar un nodo que no está en ningún nivel`);
        return;
    }

    var turnoTentativo=Math.max(minPuesto, puestoEnNivel[nodo.nivel]);
    var turnoFinal=turnoTentativo;
    
    const idsHijos=nodo.vinculos.map(v=>v.idRef);
    var hijosNoUbicados=todosNodos.filter(n=>idsHijos.includes(n.id)&&!n.turnoNivel);
    if(hijosNoUbicados.length>0){
        const minPuestoHijos=turnoTentativo-(hijosNoUbicados.length/2);
    
        var posicionesHijos=[]
        hijosNoUbicados.forEach(hijo=>{
            posicionesHijos.push(ubicarNodo(hijo, minPuestoHijos, todosNodos, puestoEnNivel ) );
        });
        
        turnoFinal=posicionesHijos.reduce((a, b)=>a+b, 0)/posicionesHijos.length;
    }
    
    nodo.turnoNivel=Number(turnoFinal.toFixed(2));
    puestoEnNivel[nodo.nivel]=nodo.turnoNivel+1;
    return nodo.turnoNivel;
}

function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }   