//Clase padre que lleva el resto de los componentes

class Overworld {

    constructor(config) {

        //Elemento principal del juego
        this.element = config.element;

        //Canvas donde se dibuja el juego
        this.canvas = this.element.querySelector(".game-canvas");

        //Contexto que permite dibujar en el canvas
        this.ctx = this.canvas.getContext("2d");
    }

    //Loop principal del juego
    //Se ejecuta continuamente para mostrar el estado más reciente
    startGameLoop() {

        const step = () => {

            //Limpiar completamente el canvas antes de volver a dibujar
            this.ctx.clearRect(
                0,
                0,
                this.canvas.width,
                this.canvas.height
            );

            //Dibujar la capa inferior del mapa (suelo)
            this.map.drawLowerImage(this.ctx);

            //Dibujar todos los objetos existentes en el mapa
            Object.values(this.map.gameObjects).forEach(object => {

                object.update({

                    arrow: this.directionInput.direction

                });

                object.sprite.draw(this.ctx);

            });

            //Dibujar la capa superior del mapa
            //Permite que ciertos elementos aparezcan por encima del personaje
            if (this.map.upperImage && this.map.upperImage.complete) {
                this.map.drawUpperImage(this.ctx);
            }

            //Solicitar el siguiente frame para mantener el juego en movimiento
            requestAnimationFrame(() => {
                step();
            });

        };

        //Comenzar el loop
        step();
    }

    //Iniciar el juego
    init() {

        //Cargar el mapa inicial
        this.map = new OverworldMap(
            window.OverWorldMaps.Start
        );

        //Inicializar entrada de teclado
        this.directionInput = new DirectionInput();
        this.directionInput.init();

        //Esperar a que la imagen principal del mapa termine de cargar
        this.map.lowerImage.onload = () => {

            //Iniciar el loop del juego una vez cargado el escenario
            this.startGameLoop();

        };
    }
}