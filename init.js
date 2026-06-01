//Función que se inicia a si misma y el juego

(function (){

    const overworld = new Overworld({
        
        element: document.querySelector(".game-container")
    });
    overworld.init();

})();