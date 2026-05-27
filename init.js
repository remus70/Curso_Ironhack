//Función que se inicia a si misma

(function (){

    const overworld = new Overworld({
        
        element: document.querySelector(".game-container")
    });
    overworld.init();

})();