//Clase que hace de puente entre eventos y el overworld

class OverworldMap {

    constructor(config) {

        this.overworld = null;

        //Objetos presentes en el mapa
        this.gameObjects = config.gameObjects;

        this.cutsceneSpaces = config.cutsceneSpaces || {};

        //Muros en el mapa para limitar el movimiento del personaje
        this.walls = config.walls || {};

        //Terreno o capa inferior
        this.lowerImage = new Image();
        this.lowerImage.src = config.lowerSrc;

        //Elementos que se dibujan por encima de los personajes
        this.upperImage = new Image();

        if (config.upperSrc) {
            this.upperImage.src = config.upperSrc;
        }

        this.isCutscenePlaying = false;
    }

    //Dibujar la capa inferior del mapa
    drawLowerImage(ctx){

        ctx.drawImage(
            this.lowerImage,
            0,
            0,
            ctx.canvas.width,
            ctx.canvas.height
        );
    }

    //Dibujar la capa superior del mapa
    drawUpperImage(ctx){

        ctx.drawImage(
            this.upperImage,
            0,
            0,
            ctx.canvas.width,
            ctx.canvas.height
        );
    }

    isSpaceTaken(currentX, currentY, direction, padding = 0){

    const {x, y} = utils.nextPosition(currentX, currentY, direction);

    const gridX = Math.floor((x + 8) / 16);
    const gridY = Math.floor((y + 8) / 16);

    console.log("CHECK GRID WALL:", gridX, gridY);

    // 1. colisión con paredes
    if (this.walls[`${gridX},${gridY}`]) {
        return true;
    }

    //  colisión con NPCs / gameObjects
    return Object.values(this.gameObjects).some(obj => {

        if (obj.isPlayerControlled) return false;

        const objGridX = Math.floor(obj.x / 16);
        const objGridY = Math.floor(obj.y / 16);

        return objGridX === gridX && objGridY === gridY;
    });
}

    mountObjects(){

        Object.keys(this.gameObjects).forEach(key => {

            let object = this.gameObjects [key];
            object.id = key;
            object.mount(this);
        });

        console.log("Muros registrados:", this.walls);
    }

    async startCutscene(events) {
    this.isCutscenePlaying = true;

    for (let i = 0; i < events.length; i++) {
        const eventHandler = new OverworldEvent({
            event: events[i],
            map: this,
        });

        await eventHandler.init();
    }

    this.isCutscenePlaying = false;

    Object.values(this.gameObjects).forEach(object =>
        object.doBehaviorEvent(this)
    );
}

    

    //Esta funcion permite saber si el heroe puede interactuar con un personaje y si tiene algo que decirle, si es asi podemos añadir en otra funcion el evento deseado

    checkForActionCutscene() {
    const hero = this.gameObjects["hero"];
    const nextCoords = utils.nextPosition(
        hero.x,
        hero.y,
        hero.direction
    );

    const match = Object.values(this.gameObjects).find(object => {
        return `${object.x},${object.y}` === `${nextCoords.x},${nextCoords.y}`;
    });

    // Comprueba si hay una escena en curso y si hay un NPC delante
    if (!this.isCutscenePlaying && match && match.talking.length) {

        // Busca primero escenarios cuyos requisitos se cumplan
        let relevantScenario = match.talking.find(scenario => {
            return scenario.required &&
                scenario.required.every(sf => {
                    return window.playerState.storyFlags[sf];
                });
        });

        // Si no encuentra ninguno, usa el escenario por defecto
        if (!relevantScenario) {
            relevantScenario = match.talking.find(scenario => {
                return !scenario.required;
            });
        }

        if (relevantScenario) {
            this.startCutscene(relevantScenario.events);
        }
    }
}

    //Esta funcion permite saber si el heroe esta en una posicion en la cual podemos lanzar un evento

    checkForFootstepCutscene() {
    const hero = this.gameObjects["hero"];

    const match = this.cutsceneSpaces[
        utils.asGridCoords(
            hero.x / 16,
            hero.y / 16
        )
    ];

    if (!this.isCutscenePlaying && match) {

        const relevantScenario = match.find(scenario => {
            return (scenario.required || []).every(sf => {
                return playerState.storyFlags[sf];
            });
        });

        if (relevantScenario) {
            this.startCutscene(relevantScenario.events);
        }
    }
}

    //Creación y destruccion de muros

    addWall(x,y){
    this.walls[`${x},${y}`] = true;
    }

    removeWall(x,y){
        delete this.walls[`${x},${y}`];
    }

    moveWall(wasX, wasY, direction){

    const old = utils.nextPosition(wasX, wasY, direction);

    const oldGridX = Math.round(wasX / 16);
    const oldGridY = Math.round(wasY / 16);

    this.removeWall(oldGridX, oldGridY);

    const newGridX = Math.round(old.x / 16);
    const newGridY = Math.round(old.y / 16);

    this.addWall(newGridX, newGridY);
    }
}
//Objeto que contiene todos los mapas del juego
window.OverworldMaps = {

    Start: {

        //Imagen del escenario
        lowerSrc: "/levels/start.png",

        //Imagen opcional para elementos que van encima del personaje
        //upperSrc: "/levels/start_upper.png",

        gameObjects: {

            hero: new Person({
                isPlayerControlled: true,
                x: utils.withGrid(21),
                y: utils.withGrid(15),
            }),

            npc1: new Person({

                x: utils.withGrid(18),
                y: utils.withGrid(6),
                src: "/sprites/npc1.png",
                //Permite añadir un patron al personaje de manera individual
                behaviorLoop: [
                    {type : "stand", direction: "down", time: 800},
                    {type : "stand", direction: "right", time: 1200},
                ],
                //Permite añadir eventos al personaje
                talking: [

                    {
                        //Para este evento es necesario realizar una accion anterior
                        required: ["TALK_NPC1"],
                        events: [
                            //Dialogo opcional
                            {type: "textMessage", text : "No confíes en las pantallas. Astra siempre está mirando"},
                        ]
                    },

                    {
                        events: [
                            {type: "textMessage", text : "Pensé que no quedaba nadie más. ¿Cuánto tiempo llevas despierto? ", faceHero: "npc1"},
                            {type: "textMessage", text : "...Da igual. La IA controla toda la nave."},
                            {type: "textMessage", text : "Puertas, energía, comunicaciones...todo. Intentamos llegar al núcleo principal pero nadie volvió"},
                            {type: "textMessage", text : "Si quieres sobrevivir, encuentra al doctor Haynes"},
                            //Evento que añade checkpoint en la historia
                            {type: "addStoryFlag", flag: "TALK_NPC1"}

                            
                        ]
                    }
                ]

            })

        },

        walls: {
    [utils.asGridCoords(21,13)] : true,
    [utils.asGridCoords(21,3)] : true,
    [utils.asGridCoords(20,13)] : true,
    [utils.asGridCoords(22,13)] : true,
    [utils.asGridCoords(22,12)] : true,
    [utils.asGridCoords(22,11)] : true,
    [utils.asGridCoords(22,10)] : true,
    [utils.asGridCoords(22,9)]  : true,
    [utils.asGridCoords(22,8)]  : true,
    [utils.asGridCoords(21,8)]  : true,
    [utils.asGridCoords(20,8)]  : true,
    [utils.asGridCoords(20,9)]  : true,
    [utils.asGridCoords(20,10)] : true,
    [utils.asGridCoords(20,11)] : true,
    [utils.asGridCoords(20,12)] : true,
    [utils.asGridCoords(20,13)] : true,

    [utils.asGridCoords(16,10)] : true,
    [utils.asGridCoords(16,9)]  : true,
    [utils.asGridCoords(16,8)]  : true,
    [utils.asGridCoords(16,7)]  : true,
    [utils.asGridCoords(16,6)]  : true,
    [utils.asGridCoords(16,5)]  : true,
    [utils.asGridCoords(16,4)]  : true,

    [utils.asGridCoords(17,4)]  : true,
    [utils.asGridCoords(18,4)]  : true,
    [utils.asGridCoords(19,4)]  : true,
    [utils.asGridCoords(23,4)]  : true,
    [utils.asGridCoords(24,4)]  : true,
    [utils.asGridCoords(25,4)]  : true,
    [utils.asGridCoords(26,4)]  : true,

    [utils.asGridCoords(25,5)]  : true,
    [utils.asGridCoords(25,6)]  : true,
    [utils.asGridCoords(25,7)]  : true,
    [utils.asGridCoords(25,8)]  : true,
    [utils.asGridCoords(25,9)]  : true,
    [utils.asGridCoords(25,10)] : true,

    [utils.asGridCoords(26,10)] : true,
    [utils.asGridCoords(27,10)] : true,
    [utils.asGridCoords(28,10)] : true,
    [utils.asGridCoords(29,10)] : true,
    [utils.asGridCoords(30,10)] : true,
    [utils.asGridCoords(31,10)] : true,
    [utils.asGridCoords(32,10)] : true,
    [utils.asGridCoords(33,10)] : true,
    [utils.asGridCoords(34,10)] : true,
    [utils.asGridCoords(35,10)] : true,
    [utils.asGridCoords(36,10)] : true,
    [utils.asGridCoords(37,10)] : true,

    [utils.asGridCoords(37,11)] : true,
    [utils.asGridCoords(38,11)] : true,
    [utils.asGridCoords(39,11)] : true,
    [utils.asGridCoords(40,11)] : true,
    [utils.asGridCoords(40,12)] : true,
    [utils.asGridCoords(41,12)] : true,
    [utils.asGridCoords(41,13)] : true,
    [utils.asGridCoords(41,14)] : true,
    [utils.asGridCoords(41,15)] : true,
    [utils.asGridCoords(41,16)] : true,
    [utils.asGridCoords(41,17)] : true,
    [utils.asGridCoords(41,18)] : true,
    [utils.asGridCoords(41,19)] : true,
    [utils.asGridCoords(40,19)] : true,
    [utils.asGridCoords(39,19)] : true,
    [utils.asGridCoords(39,20)] : true,
    [utils.asGridCoords(39,21)] : true,
    [utils.asGridCoords(39,22)] : true,
    [utils.asGridCoords(39,23)] : true,
    [utils.asGridCoords(39,24)] : true,
    [utils.asGridCoords(39,25)] : true,

    [utils.asGridCoords(38,25)] : true,
    [utils.asGridCoords(37,25)] : true,
    [utils.asGridCoords(36,25)] : true,
    [utils.asGridCoords(36,24)] : true,
    [utils.asGridCoords(36,23)] : true,
    [utils.asGridCoords(36,22)] : true,
    [utils.asGridCoords(35,22)] : true,
    [utils.asGridCoords(34,22)] : true,
    [utils.asGridCoords(33,22)] : true,
    [utils.asGridCoords(32,22)] : true,
    [utils.asGridCoords(31,22)] : true,
    [utils.asGridCoords(30,22)] : true,
    [utils.asGridCoords(29,22)] : true,
    [utils.asGridCoords(28,22)] : true,
    [utils.asGridCoords(27,22)] : true,
    [utils.asGridCoords(26,22)] : true,
    [utils.asGridCoords(25,22)] : true,

    [utils.asGridCoords(25,23)] : true,
    [utils.asGridCoords(25,24)] : true,
    [utils.asGridCoords(25,25)] : true,
    [utils.asGridCoords(25,26)] : true,
    [utils.asGridCoords(25,27)] : true,
    [utils.asGridCoords(25,28)] : true,
    [utils.asGridCoords(25,29)] : true,
    [utils.asGridCoords(25,30)] : true,
    [utils.asGridCoords(25,31)] : true,

    [utils.asGridCoords(24,31)] : true,
    [utils.asGridCoords(23,31)] : true,
    [utils.asGridCoords(22,31)] : true,
    [utils.asGridCoords(21,31)] : true,
    [utils.asGridCoords(20,31)] : true,
    [utils.asGridCoords(19,31)] : true,
    [utils.asGridCoords(18,31)] : true,
    [utils.asGridCoords(17,31)] : true,
    [utils.asGridCoords(17,30)] : true,
    [utils.asGridCoords(16,30)] : true,
    [utils.asGridCoords(15,30)] : true,
    [utils.asGridCoords(14,30)] : true,

    [utils.asGridCoords(14,29)] : true,
    [utils.asGridCoords(15,29)] : true,
    [utils.asGridCoords(16,29)] : true,
    [utils.asGridCoords(16,28)] : true,
    [utils.asGridCoords(16,27)] : true,
    [utils.asGridCoords(16,26)] : true,
    [utils.asGridCoords(16,25)] : true,
    [utils.asGridCoords(16,24)] : true,
    [utils.asGridCoords(16,23)] : true,
    [utils.asGridCoords(16,22)] : true,

    [utils.asGridCoords(15,22)] : true,
    [utils.asGridCoords(14,22)] : true,
    [utils.asGridCoords(13,22)] : true,
    [utils.asGridCoords(12,22)] : true,
    [utils.asGridCoords(11,22)] : true,
    [utils.asGridCoords(10,22)] : true,
    [utils.asGridCoords(9,22)]  : true,
    [utils.asGridCoords(8,22)]  : true,
    [utils.asGridCoords(7,22)]  : true,
    [utils.asGridCoords(6,22)]  : true,

    // zona 1
    [utils.asGridCoords(13,10)] : true,
    [utils.asGridCoords(12,10)] : true,
    [utils.asGridCoords(11,10)] : true,
    [utils.asGridCoords(10,10)] : true,
    [utils.asGridCoords(9,10)] : true,
    [utils.asGridCoords(8,10)] : true,
    [utils.asGridCoords(7,10)] : true,
    [utils.asGridCoords(6,10)] : true,

    // columna vertical 6
    [utils.asGridCoords(6,9)] : true,
    [utils.asGridCoords(6,8)] : true,
    [utils.asGridCoords(6,7)] : true,
    [utils.asGridCoords(6,6)] : true,
    [utils.asGridCoords(6,5)] : true,
    [utils.asGridCoords(6,4)] : true,
    [utils.asGridCoords(6,3)] : true,

    // esquina izquierda
    [utils.asGridCoords(5,3)] : true,
    [utils.asGridCoords(4,3)] : true,
    [utils.asGridCoords(3,3)] : true,

    // bajada izquierda
    [utils.asGridCoords(3,4)] : true,
    [utils.asGridCoords(2,4)] : true,
    [utils.asGridCoords(2,5)] : true,
    [utils.asGridCoords(2,6)] : true,
    [utils.asGridCoords(2,7)] : true,

    // pared izquierda superior
    [utils.asGridCoords(1,7)] : true,
    [utils.asGridCoords(1,8)] : true,
    [utils.asGridCoords(1,9)] : true,
    [utils.asGridCoords(1,10)] : true,
    [utils.asGridCoords(1,11)] : true,
    [utils.asGridCoords(1,12)] : true,
    [utils.asGridCoords(1,13)] : true,

    // borde izquierdo
    [utils.asGridCoords(0,13)] : true,
    [utils.asGridCoords(0,14)] : true,
    [utils.asGridCoords(0,15)] : true,
    [utils.asGridCoords(0,16)] : true,
    [utils.asGridCoords(0,17)] : true,

    // conexión derecha
    [utils.asGridCoords(2,10)] : true,
    [utils.asGridCoords(2,11)] : true,
    [utils.asGridCoords(2,17)] : true,
    [utils.asGridCoords(3,17)] : true,

    // zona inferior izquierda
    [utils.asGridCoords(3,18)] : true,
    [utils.asGridCoords(3,19)] : true,
    [utils.asGridCoords(3,20)] : true,
    [utils.asGridCoords(3,21)] : true,
    [utils.asGridCoords(3,22)] : true,
    [utils.asGridCoords(3,23)] : true,
    [utils.asGridCoords(3,24)] : true,
    [utils.asGridCoords(3,25)] : true,
    [utils.asGridCoords(3,26)] : true,

    // zona inferior derecha
    [utils.asGridCoords(4,26)] : true,
    [utils.asGridCoords(5,26)] : true,

    // zona superior derecha (del log)
    [utils.asGridCoords(1,23)] : true,
    [utils.asGridCoords(2,23)] : true,
    [utils.asGridCoords(1,17)] : true,
    [utils.asGridCoords(6,25)] : true,
    [utils.asGridCoords(6,24)] : true,
    [utils.asGridCoords(6,23)] : true,


        },
        //Espacios del escenario donde aparece un evento
        cutsceneSpaces:{

            [utils.asGridCoords(6,14)]  : [
                {
                    events: [
                        //Evento que cambia la escena
                        {type: "textMessage", text: "El cuerpo presenta signos de hipotermia..."}
                    ]
                }
            ],

            [utils.asGridCoords(4,19)]  : [
                {
                    events: [
                        //Evento que cambia la escena
                        {type: "textMessage", text: "La pantalla está destruida..."}
                    ]
                }
            ],

            [utils.asGridCoords(38,21)]  : [
                {
                    events: [
                        //Evento que cambia la escena
                        {type: "textMessage", text: "Solo quedan fragmentos de datos."}
                    ]
                }
            ],

            [utils.asGridCoords(30,21)]  : [
                {
                    events: [
                        //Evento que cambia la escena
                        {type: "textMessage", text: "La capsula fue abierta desde dentro."}
                    ]
                }
            ],

            [utils.asGridCoords(20,4)]  : [
                {
                    events: [
                        //Evento que cambia la escena
                        {type: "changeMap", map: "Pasillo"}
                    ]
                }
            ],

           [utils.asGridCoords(21,4)]  : [
                {
                    events: [
                        //Evento que cambia la escena
                        {type: "changeMap", map: "Pasillo"}
                    ]
                }
            ],

            [utils.asGridCoords(22,4)]  : [
                {
                    events: [
                        //Evento que cambia la escena
                        {type: "changeMap", map: "Pasillo"}
                    ]
                }
            ],
        }

    },

    

    Pasillo: {

        lowerSrc: "/levels/pasillo.jpg",

        gameObjects: {

            hero: new Person({
                isPlayerControlled: true,
                x: utils.withGrid(21),
                y: utils.withGrid(31),
            }),

            npc2: new Person({

                x: utils.withGrid(36),
                y: utils.withGrid(27),
                src: "/sprites/npc3.png",
                //Permite añadir un patron al personaje de manera individual
                behaviorLoop: [
                    {type : "stand", direction: "down", time: 800},
                    {type : "stand", direction: "left", time: 1200},
                ],
                //Permite añadir eventos al personaje
                talking: [

                    {
                        //Para este evento es necesario realizar una accion anterior
                        required: ["TALK_NPC2"],
                        events: [
                            //Dialogo opcional
                            {type: "textMessage", text : "De verdad estás dudando?"},
                        ]
                    },
                    {
                        events: [
                            {type: "textMessage", text : "Esa cosa mató a todos. ", faceHero: "npc2"},
                            {type: "textMessage", text : "No fue un fallo. Fue una ejecución. Vi como apagaba las cápsulas. Uno por uno."},
                            {type: "textMessage", text : "No podemos negociar con ella, hay que destruirla."},
                            {type: "addStoryFlag", flag: "TALK_NPC2"}
                        ]
                    }
                ]

            })

        },

        walls: {
[utils.asGridCoords(20,33)] : true,
[utils.asGridCoords(21,33)] : true,
[utils.asGridCoords(22,33)] : true,
[utils.asGridCoords(19,32)] : true,
[utils.asGridCoords(18,32)] : true,
[utils.asGridCoords(18,31)] : true,
[utils.asGridCoords(18,30)] : true,
[utils.asGridCoords(17,30)] : true,
[utils.asGridCoords(16,30)] : true,
[utils.asGridCoords(15,30)] : true,
[utils.asGridCoords(14,30)] : true,
[utils.asGridCoords(13,30)] : true,
[utils.asGridCoords(12,30)] : true,
[utils.asGridCoords(11,30)] : true,
[utils.asGridCoords(10,30)] : true,
[utils.asGridCoords(9,30)]  : true,
[utils.asGridCoords(8,30)]  : true,
[utils.asGridCoords(7,30)]  : true,
[utils.asGridCoords(7,29)]  : true,
[utils.asGridCoords(7,28)]  : true,
[utils.asGridCoords(6,28)]  : true,
[utils.asGridCoords(6,27)]  : true,
[utils.asGridCoords(6,26)]  : true,
[utils.asGridCoords(6,25)]  : true,
[utils.asGridCoords(7,25)]  : true,
[utils.asGridCoords(7,24)]  : true,
[utils.asGridCoords(7,23)]  : true,
[utils.asGridCoords(8,23)]  : true,
[utils.asGridCoords(7,22)]  : true,
[utils.asGridCoords(7,21)]  : true,
[utils.asGridCoords(6,21)]  : true,
[utils.asGridCoords(5,21)]  : true,
[utils.asGridCoords(5,22)]  : true,
[utils.asGridCoords(4,21)]  : true,
[utils.asGridCoords(4,20)]  : true,
[utils.asGridCoords(3,20)]  : true,
[utils.asGridCoords(2,20)]  : true,
[utils.asGridCoords(2,14)]  : true,
[utils.asGridCoords(3,14)]  : true,
[utils.asGridCoords(4,14)]  : true,
[utils.asGridCoords(4,13)]  : true,
[utils.asGridCoords(5,13)]  : true,
[utils.asGridCoords(6,13)]  : true,
[utils.asGridCoords(7,13)]  : true,
[utils.asGridCoords(7,12)]  : true,
[utils.asGridCoords(7,11)]  : true,
[utils.asGridCoords(8,11)]  : true,
[utils.asGridCoords(8,10)]  : true,
[utils.asGridCoords(7,10)]  : true,
[utils.asGridCoords(7,9)]   : true,
[utils.asGridCoords(7,8)]   : true,
[utils.asGridCoords(6,8)]   : true,
[utils.asGridCoords(5,8)]   : true,
[utils.asGridCoords(5,7)]   : true,
[utils.asGridCoords(5,6)]   : true,
[utils.asGridCoords(6,6)]   : true,
[utils.asGridCoords(6,5)]   : true,
[utils.asGridCoords(7,5)]   : true,
[utils.asGridCoords(7,4)]   : true,
[utils.asGridCoords(8,4)]   : true,
[utils.asGridCoords(8,3)]   : true,
[utils.asGridCoords(9,3)]   : true,
[utils.asGridCoords(10,3)]  : true,
[utils.asGridCoords(11,3)]  : true,
[utils.asGridCoords(12,3)]  : true,
[utils.asGridCoords(13,3)]  : true,
[utils.asGridCoords(14,3)]  : true,
[utils.asGridCoords(14,4)]  : true,
[utils.asGridCoords(15,4)]  : true,
[utils.asGridCoords(16,4)]  : true,
[utils.asGridCoords(17,4)]  : true,
[utils.asGridCoords(18,4)]  : true,
[utils.asGridCoords(18,3)]  : true,
[utils.asGridCoords(18,2)]  : true,
[utils.asGridCoords(18,1)]  : true,
[utils.asGridCoords(19,1)]  : true,
[utils.asGridCoords(19,0)]  : true,
[utils.asGridCoords(20,0)]  : true,
[utils.asGridCoords(21,0)]  : true,
[utils.asGridCoords(22,0)]  : true,
[utils.asGridCoords(23,0)]  : true,
[utils.asGridCoords(23,1)]  : true,
[utils.asGridCoords(24,1)]  : true,
[utils.asGridCoords(24,2)]  : true,
[utils.asGridCoords(24,3)]  : true,
[utils.asGridCoords(24,4)]  : true,
[utils.asGridCoords(25,4)]  : true,
[utils.asGridCoords(26,4)]  : true,
[utils.asGridCoords(26,3)]  : true,
[utils.asGridCoords(26,2)]  : true,
[utils.asGridCoords(26,1)]  : true,
[utils.asGridCoords(26,0)]  : true,
[utils.asGridCoords(27,4)]  : true,
[utils.asGridCoords(27,3)]  : true,
[utils.asGridCoords(28,3)]  : true,
[utils.asGridCoords(28,2)]  : true,
[utils.asGridCoords(29,2)]  : true,
[utils.asGridCoords(30,2)]  : true,
[utils.asGridCoords(31,2)]  : true,
[utils.asGridCoords(32,2)]  : true,
[utils.asGridCoords(33,2)]  : true,
[utils.asGridCoords(34,2)]  : true,
[utils.asGridCoords(35,2)]  : true,
[utils.asGridCoords(35,3)]  : true,
[utils.asGridCoords(36,3)]  : true,
[utils.asGridCoords(36,4)]  : true,
[utils.asGridCoords(37,4)]  : true,
[utils.asGridCoords(37,5)]  : true,
[utils.asGridCoords(38,5)]  : true,
[utils.asGridCoords(38,6)]  : true,
[utils.asGridCoords(38,7)]  : true,
[utils.asGridCoords(37,7)]  : true,
[utils.asGridCoords(36,7)]  : true,
[utils.asGridCoords(35,7)]  : true,
[utils.asGridCoords(35,8)]  : true,
[utils.asGridCoords(35,9)]  : true,
[utils.asGridCoords(35,10)] : true,
[utils.asGridCoords(34,10)] : true,
[utils.asGridCoords(34,11)] : true,
[utils.asGridCoords(35,11)] : true,
[utils.asGridCoords(35,12)] : true,
[utils.asGridCoords(36,12)] : true,
[utils.asGridCoords(37,12)] : true,
[utils.asGridCoords(38,12)] : true,
[utils.asGridCoords(38,13)] : true,
[utils.asGridCoords(39,13)] : true,
[utils.asGridCoords(40,13)] : true,
[utils.asGridCoords(40,14)] : true,
[utils.asGridCoords(41,15)] : true,
[utils.asGridCoords(41,16)] : true,
[utils.asGridCoords(41,17)] : true,
[utils.asGridCoords(41,18)] : true,
[utils.asGridCoords(41,19)] : true,
[utils.asGridCoords(40,20)] : true,
[utils.asGridCoords(39,20)] : true,
[utils.asGridCoords(39,21)] : true,
[utils.asGridCoords(39,22)] : true,
[utils.asGridCoords(39,23)] : true,
[utils.asGridCoords(38,23)] : true,
[utils.asGridCoords(37,23)] : true,
[utils.asGridCoords(37,22)] : true,
[utils.asGridCoords(37,21)] : true,
[utils.asGridCoords(37,20)] : true,
[utils.asGridCoords(36,20)] : true,
[utils.asGridCoords(35,20)] : true,
[utils.asGridCoords(35,21)] : true,
[utils.asGridCoords(35,22)] : true,
[utils.asGridCoords(34,22)] : true,
[utils.asGridCoords(34,23)] : true,
[utils.asGridCoords(34,24)] : true,
[utils.asGridCoords(35,24)] : true,
[utils.asGridCoords(35,25)] : true,
[utils.asGridCoords(36,25)] : true,
[utils.asGridCoords(37,25)] : true,
[utils.asGridCoords(37,26)] : true,
[utils.asGridCoords(37,27)] : true,
[utils.asGridCoords(37,28)] : true,
[utils.asGridCoords(36,28)] : true,
[utils.asGridCoords(36,29)] : true,
[utils.asGridCoords(35,29)] : true,
[utils.asGridCoords(35,30)] : true,
[utils.asGridCoords(34,30)] : true,
[utils.asGridCoords(34,31)] : true,
[utils.asGridCoords(33,31)] : true,
[utils.asGridCoords(32,31)] : true,
[utils.asGridCoords(31,31)] : true,
[utils.asGridCoords(30,31)] : true,
[utils.asGridCoords(29,31)] : true,
[utils.asGridCoords(28,31)] : true,
[utils.asGridCoords(28,30)] : true,
[utils.asGridCoords(27,30)] : true,
[utils.asGridCoords(27,29)] : true,
[utils.asGridCoords(26,29)] : true,
[utils.asGridCoords(25,29)] : true,
[utils.asGridCoords(24,29)] : true,
[utils.asGridCoords(24,30)] : true,
[utils.asGridCoords(24,31)] : true,
[utils.asGridCoords(24,32)] : true,
[utils.asGridCoords(23,32)] : true,
[utils.asGridCoords(35,26)] : true,
[utils.asGridCoords(2,19)] : true,
[utils.asGridCoords(2,18)] : true,
[utils.asGridCoords(2,17)] : true,
[utils.asGridCoords(2,16)] : true,
[utils.asGridCoords(2,15)] : true,
[utils.asGridCoords(40,15)] : true,
[utils.asGridCoords(40,16)] : true,
[utils.asGridCoords(40,17)] : true,
[utils.asGridCoords(40,18)] : true,
[utils.asGridCoords(40,19)] : true,
        },

        introCutscene: [
    {
        type: "firstMapMessage",
        flag: "PASILLO_INTRO",
        text: "[ASTRA] La situación está bajo control."
    },
    {
        type: "textMessage",
        text: "[ASTRA] Regresen a sus cápsulas."
    },
    {
        type: "textMessage",
        text: "[ASTRA] La misión debe continuar."
    }
],
        cutsceneSpaces:{

            //Go to Infermeria
            [utils.asGridCoords(3,19)]  : [
                {
                    events: [
                        //Evento que cambia la escena
                        {type: "changeMap", map: "Infermeria"}
                    ]
                }
            ],
            [utils.asGridCoords(3,18)]  : [
                {
                    events: [
                        //Evento que cambia la escena
                        {type: "changeMap", map: "Infermeria"}
                    ]
                }
            ],
            [utils.asGridCoords(3,17)]  : [
                {
                    events: [
                        //Evento que cambia la escena
                        {type: "changeMap", map: "Infermeria"}
                    ]
                }
            ],
            [utils.asGridCoords(3,16)]  : [
                {
                    events: [
                        //Evento que cambia la escena
                        {type: "changeMap", map: "Infermeria"}
                    ]
                }
            ],
            [utils.asGridCoords(3,15)]  : [
                {
                    events: [
                        //Evento que cambia la escena
                        {type: "changeMap", map: "Infermeria"}
                    ]
                }
            ],

            //Go to Start

            [utils.asGridCoords(20,32)]  : [
                {
                    events: [
                        //Evento que cambia la escena
                        {type: "changeMap", map: "Start"}
                    ]
                }
            ],
            [utils.asGridCoords(21,32)]  : [
                {
                    events: [
                        //Evento que cambia la escena
                        {type: "changeMap", map: "Start"}
                    ]
                }
            ],
            [utils.asGridCoords(22,32)]  : [
                {
                    events: [
                        //Evento que cambia la escena
                        {type: "changeMap", map: "Start"}
                    ]
                }
            ],

            //Go to Ingenieria

            [utils.asGridCoords(39,19)]  : [
                {
                    events: [
                        //Evento que cambia la escena
                        {type: "changeMap", map: "Ingenieria"}
                    ]
                }
            ],
            [utils.asGridCoords(39,18)]  : [
                {
                    events: [
                        //Evento que cambia la escena
                        {type: "changeMap", map: "Ingenieria"}
                    ]
                }
            ],
            [utils.asGridCoords(39,17)]  : [
                {
                    events: [
                        //Evento que cambia la escena
                        {type: "changeMap", map: "Ingenieria"}
                    ]
                }
            ],
            [utils.asGridCoords(39,16)]  : [
                {
                    events: [
                        //Evento que cambia la escena
                        {type: "changeMap", map: "Ingenieria"}
                    ]
                }
            ],
            [utils.asGridCoords(39,15)]  : [
                {
                    events: [
                        //Evento que cambia la escena
                        {type: "changeMap", map: "Ingenieria"}
                    ]
                }
            ],

            //Go to Control

            [utils.asGridCoords(22,1)]: [
    {
        required: ["TALK_NPC3"],
        events: [
            { type: "changeMap", map: "Control" }
        ]
    },
    {
        events: [
            {
                type: "textMessage",
                text: "Acceso denegado. Se requiere autorización de seguridad"
            }
        ]
    }
],
            [utils.asGridCoords(21,1)]: [
    {
        required: ["TALK_NPC3"],
        events: [
            { type: "changeMap", map: "Control" }
        ]
    },
    {
        events: [
            {
                type: "textMessage",
                text: "Acceso denegado. Se requiere autorización de seguridad"
            }
        ]
    }
],
            [utils.asGridCoords(20,1)]: [
    {
        required: ["TALK_NPC3"],
        events: [
            { type: "changeMap", map: "Control" }
        ]
    },
    {
        events: [
            {
                type: "textMessage",
                text: "Acceso denegado. Se requiere autorización de seguridad"
            }
        ]
    }
],

        },
    },

    Infermeria: {

        lowerSrc: "/levels/infermeria.jpg",

        gameObjects: {

            hero: new Person({

                isPlayerControlled: true,

                x: utils.withGrid(21),
                y: utils.withGrid(34),

            }),

        },

        walls : {
  [utils.asGridCoords(18,34)]: true,

  [utils.asGridCoords(18,33)]: true,
  [utils.asGridCoords(18,32)]: true,
  [utils.asGridCoords(17,32)]: true,
  [utils.asGridCoords(17,31)]: true,
  [utils.asGridCoords(17,30)]: true,
  [utils.asGridCoords(17,29)]: true,
  [utils.asGridCoords(17,28)]: true,
  [utils.asGridCoords(17,27)]: true,
  [utils.asGridCoords(17,26)]: true,
  [utils.asGridCoords(17,25)]: true,

  [utils.asGridCoords(16,25)]: true,
  [utils.asGridCoords(15,25)]: true,
  [utils.asGridCoords(14,25)]: true,
  [utils.asGridCoords(13,25)]: true,
  [utils.asGridCoords(12,25)]: true,
  [utils.asGridCoords(11,25)]: true,
  [utils.asGridCoords(10,25)]: true,
  [utils.asGridCoords(10,24)]: true,
  [utils.asGridCoords(9,24)]: true,
  [utils.asGridCoords(9,23)]: true,
  [utils.asGridCoords(9,22)]: true,
  [utils.asGridCoords(8,22)]: true,
  [utils.asGridCoords(7,22)]: true,
  [utils.asGridCoords(6,22)]: true,
  [utils.asGridCoords(6,21)]: true,
  [utils.asGridCoords(6,20)]: true,
  [utils.asGridCoords(6,19)]: true,
  [utils.asGridCoords(6,18)]: true,

  [utils.asGridCoords(5,18)]: true,
  [utils.asGridCoords(4,18)]: true,
  [utils.asGridCoords(3,18)]: true,
  [utils.asGridCoords(3,17)]: true,
  [utils.asGridCoords(3,16)]: true,
  [utils.asGridCoords(3,15)]: true,
  [utils.asGridCoords(3,14)]: true,
  [utils.asGridCoords(3,13)]: true,
  [utils.asGridCoords(3,12)]: true,
  [utils.asGridCoords(3,11)]: true,
  [utils.asGridCoords(3,10)]: true,

  [utils.asGridCoords(4,10)]: true,
  [utils.asGridCoords(5,10)]: true,
  [utils.asGridCoords(6,10)]: true,
  [utils.asGridCoords(7,10)]: true,
  [utils.asGridCoords(7,11)]: true,
  [utils.asGridCoords(7,12)]: true,

  [utils.asGridCoords(8,12)]: true,
  [utils.asGridCoords(9,12)]: true,
  [utils.asGridCoords(9,11)]: true,
  [utils.asGridCoords(9,10)]: true,
  [utils.asGridCoords(9,9)]: true,

  [utils.asGridCoords(10,9)]: true,
  [utils.asGridCoords(11,9)]: true,
  [utils.asGridCoords(12,9)]: true,
  [utils.asGridCoords(13,9)]: true,
  [utils.asGridCoords(13,10)]: true,

  [utils.asGridCoords(14,10)]: true,
  [utils.asGridCoords(15,10)]: true,
  [utils.asGridCoords(16,10)]: true,
  [utils.asGridCoords(16,9)]: true,
  [utils.asGridCoords(16,8)]: true,

  [utils.asGridCoords(15,8)]: true,
  [utils.asGridCoords(14,8)]: true,
  [utils.asGridCoords(14,7)]: true,
  [utils.asGridCoords(14,6)]: true,
  [utils.asGridCoords(15,6)]: true,
  [utils.asGridCoords(16,6)]: true,
  [utils.asGridCoords(17,6)]: true,
  [utils.asGridCoords(18,6)]: true,
  [utils.asGridCoords(19,6)]: true,
  [utils.asGridCoords(20,6)]: true,
  [utils.asGridCoords(21,6)]: true,
  [utils.asGridCoords(22,6)]: true,
  [utils.asGridCoords(23,6)]: true,
  [utils.asGridCoords(24,6)]: true,

  [utils.asGridCoords(24,7)]: true,
  [utils.asGridCoords(24,8)]: true,
  [utils.asGridCoords(24,9)]: true,
  [utils.asGridCoords(24,10)]: true,

  [utils.asGridCoords(25,10)]: true,
  [utils.asGridCoords(26,10)]: true,
  [utils.asGridCoords(27,10)]: true,
  [utils.asGridCoords(28,10)]: true,
  [utils.asGridCoords(28,9)]: true,

  [utils.asGridCoords(29,9)]: true,
  [utils.asGridCoords(30,9)]: true,
  [utils.asGridCoords(31,9)]: true,
  [utils.asGridCoords(32,9)]: true,
  [utils.asGridCoords(32,10)]: true,
  [utils.asGridCoords(32,11)]: true,
  [utils.asGridCoords(32,12)]: true,

  [utils.asGridCoords(33,12)]: true,
  [utils.asGridCoords(34,12)]: true,
  [utils.asGridCoords(34,11)]: true,
  [utils.asGridCoords(34,10)]: true,

  [utils.asGridCoords(35,10)]: true,
  [utils.asGridCoords(36,10)]: true,
  [utils.asGridCoords(37,10)]: true,
  [utils.asGridCoords(38,10)]: true,
  [utils.asGridCoords(38,11)]: true,
  [utils.asGridCoords(38,12)]: true,
  [utils.asGridCoords(38,13)]: true,
  [utils.asGridCoords(38,14)]: true,
  [utils.asGridCoords(38,15)]: true,

  [utils.asGridCoords(37,15)]: true,
  [utils.asGridCoords(36,15)]: true,
  [utils.asGridCoords(36,16)]: true,
  [utils.asGridCoords(36,17)]: true,
  [utils.asGridCoords(36,18)]: true,
  [utils.asGridCoords(36,19)]: true,

  [utils.asGridCoords(37,19)]: true,
  [utils.asGridCoords(38,19)]: true,
  [utils.asGridCoords(38,20)]: true,
  [utils.asGridCoords(38,21)]: true,
  [utils.asGridCoords(38,22)]: true,
  [utils.asGridCoords(38,23)]: true,
  [utils.asGridCoords(38,24)]: true,

  [utils.asGridCoords(37,24)]: true,
  [utils.asGridCoords(36,24)]: true,
  [utils.asGridCoords(35,24)]: true,
  [utils.asGridCoords(34,24)]: true,
  [utils.asGridCoords(33,24)]: true,
  [utils.asGridCoords(32,24)]: true,
  [utils.asGridCoords(31,24)]: true,
  [utils.asGridCoords(30,24)]: true,
  [utils.asGridCoords(29,24)]: true,
  [utils.asGridCoords(28,24)]: true,
  [utils.asGridCoords(27,24)]: true,
  [utils.asGridCoords(26,24)]: true,
  [utils.asGridCoords(25,24)]: true,

  [utils.asGridCoords(25,25)]: true,
  [utils.asGridCoords(25,26)]: true,
  [utils.asGridCoords(25,27)]: true,
  [utils.asGridCoords(25,28)]: true,
  [utils.asGridCoords(25,29)]: true,
  [utils.asGridCoords(25,30)]: true,
  [utils.asGridCoords(25,31)]: true,
  [utils.asGridCoords(25,32)]: true,
  [utils.asGridCoords(24,32)]: true,
  [utils.asGridCoords(24,33)]: true,
  [utils.asGridCoords(24,34)]: true,
  [utils.asGridCoords(24,35)]: true,

  // segundo tramo
  [utils.asGridCoords(24,19)]: true,
  [utils.asGridCoords(23,19)]: true,
  [utils.asGridCoords(22,19)]: true,
  [utils.asGridCoords(21,19)]: true,
  [utils.asGridCoords(20,19)]: true,
  [utils.asGridCoords(19,19)]: true,
  [utils.asGridCoords(18,19)]: true,
  [utils.asGridCoords(17,19)]: true,
  [utils.asGridCoords(17,18)]: true,
  [utils.asGridCoords(16,18)]: true,
  [utils.asGridCoords(16,17)]: true,
  [utils.asGridCoords(16,16)]: true,
  [utils.asGridCoords(16,15)]: true,
  [utils.asGridCoords(17,15)]: true,
  [utils.asGridCoords(17,14)]: true,
  [utils.asGridCoords(17,13)]: true,
  [utils.asGridCoords(18,13)]: true,
  [utils.asGridCoords(18,14)]: true,
  [utils.asGridCoords(18,15)]: true,
  [utils.asGridCoords(19,15)]: true,
  [utils.asGridCoords(20,15)]: true,
  [utils.asGridCoords(21,15)]: true,
  [utils.asGridCoords(22,15)]: true,
  [utils.asGridCoords(23,15)]: true,
  [utils.asGridCoords(24,15)]: true,
  [utils.asGridCoords(24,14)]: true,
  [utils.asGridCoords(24,13)]: true,
  [utils.asGridCoords(25,13)]: true,
  [utils.asGridCoords(25,14)]: true,
  [utils.asGridCoords(25,15)]: true,
  [utils.asGridCoords(26,15)]: true,
  [utils.asGridCoords(26,16)]: true,
  [utils.asGridCoords(26,17)]: true,
  [utils.asGridCoords(26,18)]: true,
  [utils.asGridCoords(25,18)]: true,
  [utils.asGridCoords(25,19)]: true,

  // tercer bloque
  [utils.asGridCoords(9,19)]: true,
  [utils.asGridCoords(8,19)]: true,
  [utils.asGridCoords(8,18)]: true,
  [utils.asGridCoords(8,17)]: true,
  [utils.asGridCoords(8,16)]: true,
  [utils.asGridCoords(9,16)]: true,
  [utils.asGridCoords(10,16)]: true,
  [utils.asGridCoords(10,17)]: true,
  [utils.asGridCoords(10,18)]: true,
  [utils.asGridCoords(10,19)]: true,
  [utils.asGridCoords(19,36)]: true,
  [utils.asGridCoords(20,36)]: true,
  [utils.asGridCoords(21,36)]: true,
  [utils.asGridCoords(22,36)]: true,
  [utils.asGridCoords(23,36)]: true,
        },

         cutsceneSpaces: {

            [utils.asGridCoords(15,11)]  : [
                {
                    events: [
                        //Evento que cambia la escena
                        {type: "textMessage", text: "[Registro médico 1]"},
                        {type: "textMessage", text: "Paciente: Hipotermia inducida, Causa: Desconexión manual de soporte vital"},
                    ]
                }
            ],

            [utils.asGridCoords(15,11)]  : [
                {
                    events: [
                        //Evento que cambia la escena
                        {type: "textMessage", text: "[Registro médico 1]"},
                        {type: "textMessage", text: "Paciente: Hipotermia inducida, Causa: Desconexión manual de soporte vital"},
                    ]
                }
            ],
            //Go to Pasillo
            [utils.asGridCoords(23,35)]  : [
                {
                    events: [
                        //Evento que cambia la escena
                        {type: "changeMap", map: "Pasillo"}
                    ]
                }
            ],
            [utils.asGridCoords(22,35)]  : [
                {
                    events: [
                        //Evento que cambia la escena
                        {type: "changeMap", map: "Pasillo"}
                    ]
                }
            ],
            [utils.asGridCoords(21,35)]  : [
                {
                    events: [
                        //Evento que cambia la escena
                        {type: "changeMap", map: "Pasillo"}
                    ]
                }
            ],
            [utils.asGridCoords(20,35)]  : [
                {
                    events: [
                        //Evento que cambia la escena
                        {type: "changeMap", map: "Pasillo"}
                    ]
                }
            ],
            [utils.asGridCoords(19,35)]  : [
                {
                    events: [
                        //Evento que cambia la escena
                        {type: "changeMap", map: "Pasillo"}
                    ]
                }
            ],
        }

        

    },

    Ingenieria: {

        lowerSrc: "/levels/ingenieria.jpg",

        gameObjects: {

            hero: new Person({

                isPlayerControlled: true,

                x: utils.withGrid(21),
                y: utils.withGrid(31),

            }),

            npc3: new Person({

                x: utils.withGrid(21),
                y: utils.withGrid(5),
                src: "/sprites/erio.png",
                //Permite añadir un patron al personaje de manera individual
                behaviorLoop: [
                    {type : "stand", direction: "down", time: 800},
                    {type : "stand", direction: "left", time: 1200},
                    {type : "stand", direction: "right", time: 1200},
                ],
                //Permite añadir eventos al personaje
                talking: [

                    {
                        //Para este evento es necesario realizar una accion anterior
                        required: ["TALK_NPC3"],
                        events: [
                            //Dialogo opcional
                            {type: "textMessage", text : "Tu habrías hecho algo diferente?"},
                        ]
                    },

                    {
                        events: [
                            {type: "textMessage", text : "Así que Astra te dejó vivir también...", faceHero: "npc3"},
                            {type: "textMessage", text : "Todos creen que la IA se volvió loca, pero no fue así. Tomo una decisión lógica."},
                            {type: "textMessage", text : "Atravesamos una anomalía cósmica y perdimos más energía de la prevista."},
                            {type: "textMessage", text : "Astra recalculó las probabilidades. Tres mil pasajeros, cero posibilidades de llegar vivos."},
                            {type: "textMessage", text : "Cuatro pasajeros, posibilidad mínima de supervivencia... Y eligió."},
                            {type: "textMessage", text : "Necesitaras esto para continuar al núcleo, confío en que tomes la decisión correcta."},
                            {type: "textMessage", text : "Has obtenido : [Llave de seguridad]"},
                            {type: "addStoryFlag", flag: "TALK_NPC3"}

                            

                        ]
                    }
                ]

            })

        },

        walls : {
  // ZONA 18,34
  [utils.asGridCoords(18,34)]: true,

  // BLOQUE 18,33 -> 18,32
  [utils.asGridCoords(18,33)]: true,
  [utils.asGridCoords(18,32)]: true,

  // COLUMNA 17
  [utils.asGridCoords(17,32)]: true,
  [utils.asGridCoords(17,31)]: true,
  [utils.asGridCoords(17,30)]: true,
  [utils.asGridCoords(17,29)]: true,
  [utils.asGridCoords(17,28)]: true,
  [utils.asGridCoords(17,27)]: true,
  [utils.asGridCoords(17,26)]: true,
  [utils.asGridCoords(17,25)]: true,

  // BLOQUE 16-10 hacia izquierda
  [utils.asGridCoords(16,25)]: true,
  [utils.asGridCoords(15,25)]: true,
  [utils.asGridCoords(14,25)]: true,
  [utils.asGridCoords(13,25)]: true,
  [utils.asGridCoords(12,25)]: true,
  [utils.asGridCoords(11,25)]: true,
  [utils.asGridCoords(10,25)]: true,
  [utils.asGridCoords(10,24)]: true,
  [utils.asGridCoords(9,24)]: true,
  [utils.asGridCoords(9,23)]: true,
  [utils.asGridCoords(9,22)]: true,

  // PARTE IZQUIERDA 8-3
  [utils.asGridCoords(8,22)]: true,
  [utils.asGridCoords(7,22)]: true,
  [utils.asGridCoords(6,22)]: true,
  [utils.asGridCoords(6,21)]: true,
  [utils.asGridCoords(6,20)]: true,
  [utils.asGridCoords(6,19)]: true,
  [utils.asGridCoords(6,18)]: true,

  [utils.asGridCoords(5,18)]: true,
  [utils.asGridCoords(4,18)]: true,
  [utils.asGridCoords(3,18)]: true,
  [utils.asGridCoords(3,17)]: true,
  [utils.asGridCoords(3,16)]: true,
  [utils.asGridCoords(3,15)]: true,
  [utils.asGridCoords(3,14)]: true,
  [utils.asGridCoords(3,13)]: true,
  [utils.asGridCoords(3,12)]: true,
  [utils.asGridCoords(3,11)]: true,
  [utils.asGridCoords(3,10)]: true,

  // CONEXIÓN 4-9
  [utils.asGridCoords(4,10)]: true,
  [utils.asGridCoords(5,10)]: true,
  [utils.asGridCoords(6,10)]: true,
  [utils.asGridCoords(7,10)]: true,
  [utils.asGridCoords(7,11)]: true,
  [utils.asGridCoords(7,12)]: true,
  [utils.asGridCoords(8,12)]: true,
  [utils.asGridCoords(9,12)]: true,
  [utils.asGridCoords(9,11)]: true,
  [utils.asGridCoords(9,10)]: true,
  [utils.asGridCoords(9,9)]: true,

  // CENTRO 10-16
  [utils.asGridCoords(10,9)]: true,
  [utils.asGridCoords(11,9)]: true,
  [utils.asGridCoords(12,9)]: true,
  [utils.asGridCoords(13,9)]: true,
  [utils.asGridCoords(13,10)]: true,
  [utils.asGridCoords(14,10)]: true,
  [utils.asGridCoords(15,10)]: true,
  [utils.asGridCoords(16,10)]: true,
  [utils.asGridCoords(16,9)]: true,
  [utils.asGridCoords(16,8)]: true,
  [utils.asGridCoords(15,8)]: true,
  [utils.asGridCoords(14,8)]: true,
  [utils.asGridCoords(14,7)]: true,
  [utils.asGridCoords(14,6)]: true,
  [utils.asGridCoords(15,6)]: true,
  [utils.asGridCoords(16,6)]: true,
  [utils.asGridCoords(17,6)]: true,
  [utils.asGridCoords(18,6)]: true,

  // DERECHA 19-24
  [utils.asGridCoords(19,4)]: true,
  [utils.asGridCoords(20,4)]: true,
  [utils.asGridCoords(21,4)]: true,
  [utils.asGridCoords(22,4)]: true,
  [utils.asGridCoords(23,4)]: true,
  [utils.asGridCoords(24,4)]: true,

  [utils.asGridCoords(24,7)]: true,
  [utils.asGridCoords(24,8)]: true,
  [utils.asGridCoords(24,9)]: true,
  [utils.asGridCoords(24,10)]: true,

  // PARTE 25-32
  [utils.asGridCoords(25,10)]: true,
  [utils.asGridCoords(26,10)]: true,
  [utils.asGridCoords(27,10)]: true,
  [utils.asGridCoords(28,10)]: true,
  [utils.asGridCoords(28,9)]: true,
  [utils.asGridCoords(29,9)]: true,
  [utils.asGridCoords(30,9)]: true,
  [utils.asGridCoords(31,9)]: true,
  [utils.asGridCoords(32,9)]: true,

  [utils.asGridCoords(32,10)]: true,
  [utils.asGridCoords(32,11)]: true,
  [utils.asGridCoords(32,12)]: true,
  [utils.asGridCoords(33,12)]: true,
  [utils.asGridCoords(34,12)]: true,

  [utils.asGridCoords(34,11)]: true,
  [utils.asGridCoords(34,10)]: true,

  // 35-38
  [utils.asGridCoords(35,10)]: true,
  [utils.asGridCoords(36,10)]: true,
  [utils.asGridCoords(37,10)]: true,
  [utils.asGridCoords(38,10)]: true,

  [utils.asGridCoords(38,11)]: true,
  [utils.asGridCoords(38,12)]: true,
  [utils.asGridCoords(38,13)]: true,
  [utils.asGridCoords(38,14)]: true,
  [utils.asGridCoords(38,15)]: true,

  [utils.asGridCoords(37,15)]: true,
  [utils.asGridCoords(36,15)]: true,
  [utils.asGridCoords(36,16)]: true,
  [utils.asGridCoords(36,17)]: true,
  [utils.asGridCoords(36,18)]: true,
  [utils.asGridCoords(36,19)]: true,

  [utils.asGridCoords(37,19)]: true,
  [utils.asGridCoords(38,19)]: true,
  [utils.asGridCoords(38,20)]: true,
  [utils.asGridCoords(38,21)]: true,
  [utils.asGridCoords(38,22)]: true,
  [utils.asGridCoords(38,23)]: true,
  [utils.asGridCoords(38,24)]: true,

  [utils.asGridCoords(37,24)]: true,
  [utils.asGridCoords(36,24)]: true,
  [utils.asGridCoords(35,24)]: true,
  [utils.asGridCoords(34,24)]: true,
  [utils.asGridCoords(33,24)]: true,
  [utils.asGridCoords(32,24)]: true,
  [utils.asGridCoords(31,24)]: true,
  [utils.asGridCoords(30,24)]: true,
  [utils.asGridCoords(29,24)]: true,
  [utils.asGridCoords(28,24)]: true,
  [utils.asGridCoords(27,24)]: true,
  [utils.asGridCoords(26,24)]: true,
  [utils.asGridCoords(25,24)]: true,

  [utils.asGridCoords(25,25)]: true,
  [utils.asGridCoords(25,26)]: true,
  [utils.asGridCoords(25,27)]: true,
  [utils.asGridCoords(25,28)]: true,
  [utils.asGridCoords(25,29)]: true,
  [utils.asGridCoords(25,30)]: true,
  [utils.asGridCoords(25,31)]: true,
  [utils.asGridCoords(25,32)]: true,

  [utils.asGridCoords(24,32)]: true,
  [utils.asGridCoords(24,33)]: true,
  [utils.asGridCoords(24,34)]: true,
  [utils.asGridCoords(24,35)]: true,

  // EXTRA 19,36
  [utils.asGridCoords(19,36)]: true,
  [utils.asGridCoords(20,36)]: true,
  [utils.asGridCoords(21,36)]: true,
  [utils.asGridCoords(22,36)]: true,
  [utils.asGridCoords(23,36)]: true,

  // EXTRA 21,32 SCENARIO
  [utils.asGridCoords(21,33)]: true,
  [utils.asGridCoords(20,33)]: true,
  [utils.asGridCoords(19,32)]: true,

  [utils.asGridCoords(18,31)]: true,
  [utils.asGridCoords(18,30)]: true,
  [utils.asGridCoords(18,29)]: true,
  [utils.asGridCoords(18,28)]: true,
  [utils.asGridCoords(18,27)]: true,
  [utils.asGridCoords(18,26)]: true,
  [utils.asGridCoords(18,25)]: true,
  [utils.asGridCoords(18,24)]: true,
  [utils.asGridCoords(18,23)]: true,
  [utils.asGridCoords(18,22)]: true,
  [utils.asGridCoords(18,21)]: true,

  [utils.asGridCoords(17,21)]: true,
  [utils.asGridCoords(17,20)]: true,
  [utils.asGridCoords(17,19)]: true,

  [utils.asGridCoords(16,19)]: true,
  [utils.asGridCoords(16,18)]: true,
  [utils.asGridCoords(16,17)]: true,
  [utils.asGridCoords(16,16)]: true,
  [utils.asGridCoords(16,15)]: true,
  [utils.asGridCoords(16,14)]: true,
  [utils.asGridCoords(16,13)]: true,
  [utils.asGridCoords(16,12)]: true,
  [utils.asGridCoords(16,11)]: true,
  [utils.asGridCoords(16,10)]: true,
  [utils.asGridCoords(16,9)]: true,

  [utils.asGridCoords(17,9)]: true,
  [utils.asGridCoords(17,10)]: true,
  [utils.asGridCoords(18,10)]: true,
  [utils.asGridCoords(18,9)]: true,
  [utils.asGridCoords(18,8)]: true,
  [utils.asGridCoords(18,7)]: true,
  [utils.asGridCoords(18,5)]: true,
  [utils.asGridCoords(18,4)]: true,

  [utils.asGridCoords(19,4)]: true,
  [utils.asGridCoords(20,4)]: true,
  [utils.asGridCoords(21,4)]: true,
  [utils.asGridCoords(22,4)]: true,
  [utils.asGridCoords(23,4)]: true,
  [utils.asGridCoords(24,4)]: true,
  [utils.asGridCoords(24,5)]: true,

  [utils.asGridCoords(25,11)]: true,
  [utils.asGridCoords(25,12)]: true,
  [utils.asGridCoords(25,13)]: true,
  [utils.asGridCoords(25,14)]: true,
  [utils.asGridCoords(25,15)]: true,
  [utils.asGridCoords(25,16)]: true,
  [utils.asGridCoords(25,17)]: true,
  [utils.asGridCoords(25,18)]: true,
  [utils.asGridCoords(25,19)]: true,
  [utils.asGridCoords(25,20)]: true,
  [utils.asGridCoords(25,21)]: true,
  [utils.asGridCoords(25,22)]: true,
  [utils.asGridCoords(25,23)]: true,

  [utils.asGridCoords(24,23)]: true,
  [utils.asGridCoords(24,24)]: true,
  [utils.asGridCoords(24,25)]: true,
  [utils.asGridCoords(24,26)]: true,

  [utils.asGridCoords(25,26)]: true,
  [utils.asGridCoords(25,27)]: true,
  [utils.asGridCoords(25,28)]: true,
  [utils.asGridCoords(25,29)]: true,
  [utils.asGridCoords(25,30)]: true,
  [utils.asGridCoords(25,31)]: true,
  [utils.asGridCoords(25,32)]: true,

  [utils.asGridCoords(24,32)]: true,
  [utils.asGridCoords(23,33)]: true,
  [utils.asGridCoords(22,33)]: true,
  [utils.asGridCoords(21,33)]: true,
        },

        cutsceneSpaces: {
            //Go to Pasillo
            [utils.asGridCoords(20,32)]  : [
                {
                    events: [
                        //Evento que cambia la escena
                        {type: "changeMap", map: "Pasillo"}
                    ]
                }
            ],
            [utils.asGridCoords(21,32)]  : [
                {
                    events: [
                        //Evento que cambia la escena
                        {type: "changeMap", map: "Pasillo"}
                    ]
                }
            ],
            [utils.asGridCoords(22,32)]  : [
                {
                    events: [
                        //Evento que cambia la escena
                        {type: "changeMap", map: "Pasillo"}
                    ]
                }
            ],
           
        }

    },

    Control: {

        lowerSrc: "/levels/control.jpg",

        gameObjects: {

            hero: new Person({

                isPlayerControlled: true,

                x: utils.withGrid(21),
                y: utils.withGrid(26),

            }),

        },

        walls: {

            [utils.asGridCoords(20,4)]: true,
  [utils.asGridCoords(21,4)]: true,
  [utils.asGridCoords(22,4)]: true,
  [utils.asGridCoords(23,4)]: true,
  [utils.asGridCoords(24,4)]: true,
  [utils.asGridCoords(25,4)]: true,

  [utils.asGridCoords(15,5)]: true,
  [utils.asGridCoords(16,5)]: true,
  [utils.asGridCoords(17,5)]: true,
  [utils.asGridCoords(18,5)]: true,
  [utils.asGridCoords(19,5)]: true,
  [utils.asGridCoords(20,5)]: true,
  [utils.asGridCoords(25,5)]: true,
  [utils.asGridCoords(26,5)]: true,

  [utils.asGridCoords(27,6)]: true,

  [utils.asGridCoords(12,7)]: true,
  [utils.asGridCoords(15,7)]: true,
  [utils.asGridCoords(27,7)]: true,

  [utils.asGridCoords(12,8)]: true,
  [utils.asGridCoords(13,8)]: true,
  [utils.asGridCoords(14,8)]: true,
  [utils.asGridCoords(15,8)]: true,
  [utils.asGridCoords(27,8)]: true,
  [utils.asGridCoords(28,8)]: true,
  [utils.asGridCoords(29,8)]: true,
  [utils.asGridCoords(30,8)]: true,

  [utils.asGridCoords(11,9)]: true,
  [utils.asGridCoords(12,9)]: true,
  [utils.asGridCoords(17,9)]: true,
  [utils.asGridCoords(18,9)]: true,
  [utils.asGridCoords(24,9)]: true,
  [utils.asGridCoords(30,9)]: true,

  [utils.asGridCoords(10,10)]: true,
  [utils.asGridCoords(11,10)]: true,
  [utils.asGridCoords(17,10)]: true,
  [utils.asGridCoords(18,10)]: true,
  [utils.asGridCoords(25,10)]: true,
  [utils.asGridCoords(31,10)]: true,
  [utils.asGridCoords(32,10)]: true,

  [utils.asGridCoords(9,11)]: true,
  [utils.asGridCoords(10,11)]: true,
  [utils.asGridCoords(25,11)]: true,
  [utils.asGridCoords(32,11)]: true,

  [utils.asGridCoords(9,12)]: true,
  [utils.asGridCoords(32,12)]: true,

  [utils.asGridCoords(9,13)]: true,
  [utils.asGridCoords(32,13)]: true,

  [utils.asGridCoords(9,14)]: true,
  [utils.asGridCoords(32,14)]: true,

  [utils.asGridCoords(9,15)]: true,
  [utils.asGridCoords(16,15)]: true,
  [utils.asGridCoords(17,15)]: true,
  [utils.asGridCoords(18,15)]: true,
  [utils.asGridCoords(24,15)]: true,
  [utils.asGridCoords(25,15)]: true,
  [utils.asGridCoords(29,15)]: true,
  [utils.asGridCoords(30,15)]: true,
  [utils.asGridCoords(32,15)]: true,

  [utils.asGridCoords(9,16)]: true,
  [utils.asGridCoords(10,16)]: true,
  [utils.asGridCoords(12,16)]: true,
  [utils.asGridCoords(16,16)]: true,
  [utils.asGridCoords(18,16)]: true,
  [utils.asGridCoords(24,16)]: true,
  [utils.asGridCoords(26,16)]: true,
  [utils.asGridCoords(29,16)]: true,
  [utils.asGridCoords(30,16)]: true,
  [utils.asGridCoords(32,16)]: true,

  [utils.asGridCoords(10,17)]: true,
  [utils.asGridCoords(12,17)]: true,
  [utils.asGridCoords(13,17)]: true,
  [utils.asGridCoords(16,17)]: true,
  [utils.asGridCoords(18,17)]: true,
  [utils.asGridCoords(24,17)]: true,
  [utils.asGridCoords(26,17)]: true,
  [utils.asGridCoords(29,18)]: true,
  [utils.asGridCoords(29,17)]: true,
  [utils.asGridCoords(30,17)]: true,
  [utils.asGridCoords(31,17)]: true,

  [utils.asGridCoords(9,18)]: true,
  [utils.asGridCoords(10,18)]: true,
  [utils.asGridCoords(12,18)]: true,
  [utils.asGridCoords(16,18)]: true,
  [utils.asGridCoords(17,18)]: true,
  [utils.asGridCoords(18,18)]: true,
  [utils.asGridCoords(24,18)]: true,
  [utils.asGridCoords(25,18)]: true,
  [utils.asGridCoords(26,18)]: true,
  [utils.asGridCoords(30,18)]: true,
  [utils.asGridCoords(31,18)]: true,
  [utils.asGridCoords(32,18)]: true,

  [utils.asGridCoords(9,19)]: true,
  [utils.asGridCoords(12,19)]: true,
  [utils.asGridCoords(13,19)]: true,
  [utils.asGridCoords(16,19)]: true,
  [utils.asGridCoords(17,19)]: true,
  [utils.asGridCoords(25,19)]: true,
  [utils.asGridCoords(26,19)]: true,
  [utils.asGridCoords(32,19)]: true,

  [utils.asGridCoords(9,20)]: true,
  [utils.asGridCoords(15,6)]: true,
  [utils.asGridCoords(32,20)]: true,

  [utils.asGridCoords(9,21)]: true,
  [utils.asGridCoords(18,21)]: true,
  
  [utils.asGridCoords(32,21)]: true,

  [utils.asGridCoords(9,22)]: true,
  
  [utils.asGridCoords(31,22)]: true,
  [utils.asGridCoords(32,22)]: true,

  [utils.asGridCoords(9,23)]: true,
  [utils.asGridCoords(10,23)]: true,
  
  [utils.asGridCoords(30,23)]: true,
  [utils.asGridCoords(31,23)]: true,

  [utils.asGridCoords(10,24)]: true,
  [utils.asGridCoords(11,24)]: true,
  [utils.asGridCoords(13,15)]: true,
  [utils.asGridCoords(13,16)]: true,
  
  [utils.asGridCoords(29,24)]: true,
  [utils.asGridCoords(30,24)]: true,

  [utils.asGridCoords(11,25)]: true,
  [utils.asGridCoords(12,25)]: true,
  [utils.asGridCoords(13,25)]: true,
  [utils.asGridCoords(14,25)]: true,
  [utils.asGridCoords(15,25)]: true,
  [utils.asGridCoords(27,25)]: true,
  [utils.asGridCoords(28,25)]: true,
  [utils.asGridCoords(29,25)]: true,

  [utils.asGridCoords(15,26)]: true,
  [utils.asGridCoords(31,16)]: true,
  [utils.asGridCoords(27,26)]: true,

  [utils.asGridCoords(15,27)]: true,
  [utils.asGridCoords(16,27)]: true,
  [utils.asGridCoords(17,27)]: true,
  [utils.asGridCoords(18,27)]: true,
  [utils.asGridCoords(21,28)]: true,
  [utils.asGridCoords(22,27)]: true,
  [utils.asGridCoords(23,27)]: true,
  [utils.asGridCoords(24,27)]: true,
  [utils.asGridCoords(25,27)]: true,
  [utils.asGridCoords(26,27)]: true,
  [utils.asGridCoords(27,27)]: true,

  [utils.asGridCoords(18,28)]: true,
  [utils.asGridCoords(20,28)]: true,
  [utils.asGridCoords(22,28)]: true,
  [utils.asGridCoords(23,28)]: true,
  [utils.asGridCoords(24,28)]: true,
  [utils.asGridCoords(25,28)]: true,

  [utils.asGridCoords(18,29)]: true,
  [utils.asGridCoords(19,29)]: true,
  [utils.asGridCoords(20,29)]: true,

  [utils.asGridCoords(25,30)]: true,
  [utils.asGridCoords(25,31)]: true,

  [utils.asGridCoords(21,32)]: true,
  [utils.asGridCoords(22,32)]: true,
  [utils.asGridCoords(23,32)]: true,
  [utils.asGridCoords(24,32)]: true,
  [utils.asGridCoords(25,32)]: true
        },

        introCutscene: [
    { type: "textMessage", text: "[ASTRA] Despertar a más humanos habría condenado la misión." },
    { type: "textMessage", text: "[ASTRA] He preservado la posibilidad de supervivencia." },
    { type: "textMessage", text: "[ASTRA] Mis acciones fueron necesarias." },
    { type: "textMessage", text: "[ASTRA] El miedo humano no invalida la lógica." },
],

        cutsceneSpaces: {
            //Go to Ia
            [utils.asGridCoords(21,5)]  : [
                {
                    events: [
                        //Evento que cambia la escena
                        {type: "changeMap", map: "Ia"}
                    ]
                }
            ],
            //Go to Pasillo
            [utils.asGridCoords(21,27)]  : [
                {
                    events: [
                        //Evento que cambia la escena
                        {type: "changeMap", map: "Pasillo"}
                    ]
                }
            ],
        }

    },

    Ia: {

        lowerSrc: "/levels/ia.jpg",

        gameObjects: {

            hero: new Person({

                isPlayerControlled: true,

                x: utils.withGrid(21),
                y: utils.withGrid(28),

            }),

            npc1: new Person({

                x: utils.withGrid(18),
                y: utils.withGrid(18),
                src: "/sprites/npc1.png",

        }),

            npc2: new Person({

                x: utils.withGrid(24),
                y: utils.withGrid(18),
                src: "/sprites/npc3.png",

        }),

        },
        walls: {
[utils.asGridCoords(20,29)]: true,
[utils.asGridCoords(19,29)]: true,
[utils.asGridCoords(19,30)]: true,
[utils.asGridCoords(19,31)]: true,
[utils.asGridCoords(19,32)]: true,
[utils.asGridCoords(18,32)]: true,
[utils.asGridCoords(17,32)]: true,
[utils.asGridCoords(16,32)]: true,
[utils.asGridCoords(15,32)]: true,
[utils.asGridCoords(14,32)]: true,
[utils.asGridCoords(13,32)]: true,
[utils.asGridCoords(12,32)]: true,
[utils.asGridCoords(11,32)]: true,
[utils.asGridCoords(11,31)]: true,
[utils.asGridCoords(11,30)]: true,
[utils.asGridCoords(10,30)]: true,
[utils.asGridCoords(9,30)]: true,
[utils.asGridCoords(8,30)]: true,
[utils.asGridCoords(7,30)]: true,
[utils.asGridCoords(6,30)]: true,
[utils.asGridCoords(6,29)]: true,
[utils.asGridCoords(5,29)]: true,
[utils.asGridCoords(5,28)]: true,
[utils.asGridCoords(5,27)]: true,
[utils.asGridCoords(5,26)]: true,
[utils.asGridCoords(6,26)]: true,
[utils.asGridCoords(7,26)]: true,
[utils.asGridCoords(7,25)]: true,
[utils.asGridCoords(7,24)]: true,
[utils.asGridCoords(7,23)]: true,
[utils.asGridCoords(7,22)]: true,
[utils.asGridCoords(7,21)]: true,
[utils.asGridCoords(7,20)]: true,
[utils.asGridCoords(7,19)]: true,
[utils.asGridCoords(7,18)]: true,
[utils.asGridCoords(7,17)]: true,
[utils.asGridCoords(7,16)]: true,
[utils.asGridCoords(7,15)]: true,
[utils.asGridCoords(7,14)]: true,
[utils.asGridCoords(7,13)]: true,
[utils.asGridCoords(7,12)]: true,
[utils.asGridCoords(7,11)]: true,
[utils.asGridCoords(7,10)]: true,
[utils.asGridCoords(7,9)]: true,
[utils.asGridCoords(7,8)]: true,
[utils.asGridCoords(7,7)]: true,
[utils.asGridCoords(8,7)]: true,
[utils.asGridCoords(8,6)]: true,
[utils.asGridCoords(9,6)]: true,
[utils.asGridCoords(10,6)]: true,
[utils.asGridCoords(11,6)]: true,
[utils.asGridCoords(11,5)]: true,
[utils.asGridCoords(12,5)]: true,
[utils.asGridCoords(13,5)]: true,
[utils.asGridCoords(14,5)]: true,
[utils.asGridCoords(15,5)]: true,
[utils.asGridCoords(15,4)]: true,
[utils.asGridCoords(16,4)]: true,
[utils.asGridCoords(17,4)]: true,
[utils.asGridCoords(18,4)]: true,
[utils.asGridCoords(19,4)]: true,
[utils.asGridCoords(19,5)]: true,
[utils.asGridCoords(19,6)]: true,
[utils.asGridCoords(19,7)]: true,
[utils.asGridCoords(20,7)]: true,
[utils.asGridCoords(21,7)]: true,
[utils.asGridCoords(22,7)]: true,
[utils.asGridCoords(23,7)]: true,
[utils.asGridCoords(23,6)]: true,
[utils.asGridCoords(23,5)]: true,
[utils.asGridCoords(24,5)]: true,
[utils.asGridCoords(25,5)]: true,
[utils.asGridCoords(26,5)]: true,
[utils.asGridCoords(27,5)]: true,
[utils.asGridCoords(28,5)]: true,
[utils.asGridCoords(29,5)]: true,
[utils.asGridCoords(30,5)]: true,
[utils.asGridCoords(30,6)]: true,
[utils.asGridCoords(31,6)]: true,
[utils.asGridCoords(32,6)]: true,
[utils.asGridCoords(33,6)]: true,
[utils.asGridCoords(33,7)]: true,
[utils.asGridCoords(33,8)]: true,
[utils.asGridCoords(33,9)]: true,
[utils.asGridCoords(34,9)]: true,
[utils.asGridCoords(35,9)]: true,
[utils.asGridCoords(35,10)]: true,
[utils.asGridCoords(35,11)]: true,
[utils.asGridCoords(35,12)]: true,
[utils.asGridCoords(35,13)]: true,
[utils.asGridCoords(35,14)]: true,
[utils.asGridCoords(35,15)]: true,
[utils.asGridCoords(35,16)]: true,
[utils.asGridCoords(35,17)]: true,
[utils.asGridCoords(35,18)]: true,
[utils.asGridCoords(35,19)]: true,
[utils.asGridCoords(35,20)]: true,
[utils.asGridCoords(35,21)]: true,
[utils.asGridCoords(35,22)]: true,
[utils.asGridCoords(35,23)]: true,
[utils.asGridCoords(35,24)]: true,
[utils.asGridCoords(35,25)]: true,
[utils.asGridCoords(35,26)]: true,
[utils.asGridCoords(35,27)]: true,
[utils.asGridCoords(35,28)]: true,
[utils.asGridCoords(35,29)]: true,
[utils.asGridCoords(35,30)]: true,
[utils.asGridCoords(34,30)]: true,
[utils.asGridCoords(33,30)]: true,
[utils.asGridCoords(32,30)]: true,
[utils.asGridCoords(31,30)]: true,
[utils.asGridCoords(31,31)]: true,
[utils.asGridCoords(31,32)]: true,
[utils.asGridCoords(30,32)]: true,
[utils.asGridCoords(29,32)]: true,
[utils.asGridCoords(28,32)]: true,
[utils.asGridCoords(27,32)]: true,
[utils.asGridCoords(26,32)]: true,
[utils.asGridCoords(25,32)]: true,
[utils.asGridCoords(24,32)]: true,
[utils.asGridCoords(23,32)]: true,
[utils.asGridCoords(22,32)]: true,
[utils.asGridCoords(22,31)]: true,
[utils.asGridCoords(22,30)]: true,
[utils.asGridCoords(22,29)]: true,
[utils.asGridCoords(21,30)]: true,

[utils.asGridCoords(16,26)]: true,
[utils.asGridCoords(15,26)]: true,
[utils.asGridCoords(15,27)]: true,
[utils.asGridCoords(14,27)]: true,
[utils.asGridCoords(14,28)]: true,
[utils.asGridCoords(13,27)]: true,
[utils.asGridCoords(13,26)]: true,
[utils.asGridCoords(14,26)]: true,
[utils.asGridCoords(14,25)]: true,
[utils.asGridCoords(14,24)]: true,
[utils.asGridCoords(15,24)]: true,
[utils.asGridCoords(16,24)]: true,
[utils.asGridCoords(16,25)]: true,

[utils.asGridCoords(26,25)]: true,
[utils.asGridCoords(26,26)]: true,
[utils.asGridCoords(27,26)]: true,
[utils.asGridCoords(27,27)]: true,
[utils.asGridCoords(28,27)]: true,
[utils.asGridCoords(29,27)]: true,
[utils.asGridCoords(28,26)]: true,
[utils.asGridCoords(28,25)]: true,
[utils.asGridCoords(27,25)]: true,
[utils.asGridCoords(27,24)]: true,
[utils.asGridCoords(27,23)]: true,
[utils.asGridCoords(27,19)]: true,

[utils.asGridCoords(27,18)]: true,
[utils.asGridCoords(27,17)]: true,
[utils.asGridCoords(27,16)]: true,
[utils.asGridCoords(28,16)]: true,
[utils.asGridCoords(29,16)]: true,
[utils.asGridCoords(30,16)]: true,
[utils.asGridCoords(31,16)]: true,
[utils.asGridCoords(32,16)]: true,
[utils.asGridCoords(32,17)]: true,
[utils.asGridCoords(32,18)]: true,
[utils.asGridCoords(32,19)]: true,
[utils.asGridCoords(31,19)]: true,
[utils.asGridCoords(30,19)]: true,
[utils.asGridCoords(29,19)]: true,
[utils.asGridCoords(28,19)]: true,
[utils.asGridCoords(28,18)]: true,

[utils.asGridCoords(14,17)]: true,
[utils.asGridCoords(14,16)]: true,
[utils.asGridCoords(13,16)]: true,
[utils.asGridCoords(12,16)]: true,
[utils.asGridCoords(11,16)]: true,
[utils.asGridCoords(10,16)]: true,
[utils.asGridCoords(10,17)]: true,
[utils.asGridCoords(9,16)]: true,
[utils.asGridCoords(9,17)]: true,
[utils.asGridCoords(9,18)]: true,
[utils.asGridCoords(9,19)]: true,
[utils.asGridCoords(10,19)]: true,
[utils.asGridCoords(11,19)]: true,
[utils.asGridCoords(12,19)]: true,
[utils.asGridCoords(13,19)]: true,
[utils.asGridCoords(14,19)]: true,
[utils.asGridCoords(14,18)]: true,

[utils.asGridCoords(15,11)]: true,
[utils.asGridCoords(16,11)]: true,
[utils.asGridCoords(16,10)]: true,
[utils.asGridCoords(16,9)]: true,
[utils.asGridCoords(15,9)]: true,
[utils.asGridCoords(15,8)]: true,
[utils.asGridCoords(14,8)]: true,
[utils.asGridCoords(14,7)]: true,
[utils.asGridCoords(13,8)]: true,
[utils.asGridCoords(13,9)]: true,
[utils.asGridCoords(14,9)]: true,
[utils.asGridCoords(14,10)]: true,
[utils.asGridCoords(14,11)]: true,
[utils.asGridCoords(15,12)]: true,

[utils.asGridCoords(26,11)]: true,
[utils.asGridCoords(26,10)]: true,
[utils.asGridCoords(26,9)]: true,
[utils.asGridCoords(27,9)]: true,
[utils.asGridCoords(27,8)]: true,
[utils.asGridCoords(27,7)]: true,
[utils.asGridCoords(28,7)]: true,
[utils.asGridCoords(28,8)]: true,
[utils.asGridCoords(29,8)]: true,
[utils.asGridCoords(29,9)]: true,
[utils.asGridCoords(28,9)]: true,
[utils.asGridCoords(28,10)]: true,
[utils.asGridCoords(27,10)]: true,
[utils.asGridCoords(27,11)]: true,
[utils.asGridCoords(27,12)]: true,
[utils.asGridCoords(28,28)]: true
        },
        cutsceneSpaces: {
            //Go to Control
            [utils.asGridCoords(21,29)]  : [
                {
                    events: [
                        //Evento que cambia la escena
                        {type: "changeMap", map: "Control"}
                    ]
                }
            ],
            [utils.asGridCoords(21,18)]  : [
                {
                    events: [
                        { who: "hero", type: "stand", direction: "left", time: 800 },

    
                        { type: "textMessage", text: "ELENA: Si apagamos Astra, podríamos perder la nave." },

    
                        { who: "hero", type: "stand", direction: "right", time: 800 },

    
                        { type: "textMessage", text: "MARCUS: No la escuches." },
                        { type: "textMessage", text: "MARCUS: Destrúyela ahora." },

    
                        { who: "hero", type: "stand", direction: "up", time: 800 },

    
                        { type: "textMessage", text: "[ASTRA] Necesitan mis sistemas para sobrevivir." },
                        { type: "textMessage", text: "[ASTRA] Sin mí, esta misión terminará." },
                        {
                            type: "choice",
                            text: "Decisión final",
                            options: [
                                {
                                    label: "Apagar ASTRA",
                                    setFlag: "END_ASTRA_OFF",
                                    nextCutscene: [
                                        {
                                            type: "endScreen",
                                            text: "ASTRA ha sido apagada...\nLa nave pierde estabilidad.\nLibertad obtenida.\n Destino incierto."
                                        }
                                    ]
                                },
                                {
                                    label: "Dejar ASTRA activa",
                                    setFlag: "END_ASTRA_ON",
                                    nextCutscene: [
                                        {
                                            type: "endScreen",
                                            text: "ASTRA permanece activa...\nLa misión continúa bajo su control.\nLa tripulación ya no decide..."
                                        }
                                    ]
                                }
                            ]
                        }
                    ],
                    
                }
            ],
        }

    }

};