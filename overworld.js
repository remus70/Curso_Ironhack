//Clase padre que lleva el resto de los componentes

class Overworld {

    constructor(config) {

        this.element = config.element;
        this.canvas = this.element.querySelector(".game-canvas");
        this.ctx = this.canvas.getContext("2d");
    }

    startGameLoop(){

        const step = () => {

            this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);

            this.map.drawLowerImage(this.ctx);

            Object.values(this.map.gameObjects).forEach(object => {

                object.update({

                    arrow: this.directionInput.direction,
                    map: this.map   // 🔥 FIX IMPORTANTE

                });

                object.sprite.draw(this.ctx);
            });

            this.map.drawUpperImage(this.ctx);

            requestAnimationFrame(step);
        };

        step();
    }

    init(){

        this.map = new OverworldMap(
            //Mapa que se visualiza
            window.OverWorldMaps.Ia
        );

        this.map.mountObjects();

        this.directionInput = new DirectionInput();
        this.directionInput.init();

        this.map.lowerImage.onload = () => {
            this.startGameLoop();
        };
    }
}