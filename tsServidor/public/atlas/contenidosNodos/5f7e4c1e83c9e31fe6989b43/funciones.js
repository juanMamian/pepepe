

document.getElementById("boton").addEventListener("click", function(){
    console.log(`pausando video`);
    var elVideo=document.getElementById("explicacionEcuacion");
    elVideo.offsetWidth=10;
    console.log(`video pausado`);
});