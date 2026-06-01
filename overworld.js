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

            Object.values(this.map.gameObjects).sort((a,b) => {
                return a.y -b.y;
            }).forEach(object => {

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

    bindActionInput(){
        new KeyPressListener("Enter", () => {
           //Hay una persona con la que hablar?
           this.map.checkForActionCutscene() 
        })
    }

    bindHeroPositionCheck() {
        document.addEventListener("PersonWalkingComplete", e => {
            if (e.detail.whoId === "hero") {
                //La posición del heroe cambia, revisamos si hay algun evento en esta posicion nueva
                this.map.checkForFootstepCutscene();
            }
        })
    }

    //Método que nos dice que mapa se visualiza
    startMap(mapConfig) {
    this.map = new OverworldMap(mapConfig);
    this.map.overworld = this;

    this.map.mountObjects();

    //intro automática del mapa
    if (
        mapConfig.introCutscene &&
        !playerState.storyFlags[`INTRO_${mapConfig.id}`]
    ) {
        playerState.storyFlags[`INTRO_${mapConfig.id}`] = true;
        this.map.startCutscene(mapConfig.introCutscene);
    }
}

    init(){

        this.startMap(
            //Mapa que se visualiza al iniciar
            window.OverworldMaps.Start
        );

        this.bindActionInput();
        this.bindHeroPositionCheck();

        this.directionInput = new DirectionInput();
        this.directionInput.init();

        this.map.lowerImage.onload = () => {
            this.startGameLoop();
        };
        //Inicializar escena inicial
        this.map.startCutscene([
            {who: "hero", type: "walk", direction: "down"},
            {who: "hero", type: "walk", direction: "down"},
            {who: "hero", type: "stand", direction: "left", time: 800},
            {who: "hero", type: "stand", direction: "right", time: 800},
            {who: "hero", type: "stand", direction: "down", time: 800},
            //Escena de texto
            {type: "textMessage", text : "Protocolo de emergencia activado."},
            {type: "textMessage", text : "Superviviente detectado."},
            {type: "textMessage", text : "Funciones vitales estabilizadas."},
            {type: "textMessage", text : "Error crítico... Conexión con la tripulación no disponible."},
        ])
    }
}