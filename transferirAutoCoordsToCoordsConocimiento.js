const mongoose = require("mongoose");

const NodoConocimiento = require("./comunaBuild/model/atlas/Nodo").ModeloNodo
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


iniciar();

async function iniciar() {


    await iniciarMongoose();

    try {
        var todosNodos = await NodoConocimiento.find({}).exec();        
        console.log(`Total: ${todosNodos.length} nodos`);
    }
    catch (error) {
        console.log(`error getting todos nodos. e: ` + error);
        return;
    }

    todosNodos.forEach(n=>{
        n.coords=n.autoCoords;
        n.coordsManuales=n.autoCoords;
    })

    
        console.log(`Uploading...`);
        await uploadNodos(todosNodos);
    


}


async function uploadNodos(todosNodos) {
    todosNodos.forEach(async function (nodo) {
        try {
            await nodo.save();
        }
        catch (error) {
            console.log(`error guardando el nodo. e: ` + error);
            return res.status(400).send('');
        }
    })
}


function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
