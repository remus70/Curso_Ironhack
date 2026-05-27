class OverworldMap {

    constructor(config) {

        //Objetos presentes en el mapa
        this.gameObjects = config.gameObjects;

        //Terreno o capa inferior
        this.lowerImage = new Image();
        this.lowerImage.src = config.lowerSrc;

        //Elementos que se dibujan por encima de los personajes
        if (config.upperSrc) {

            this.upperImage = new Image();
            this.upperImage.src = config.upperSrc;

        } else {

            //Crear una imagen vacía para evitar errores
            this.upperImage = new Image();

        }
    }

    //Dibujar la capa inferior del mapa
    drawLowerImage(ctx) {

        ctx.drawImage(
            this.lowerImage,
            0,
            0,
            ctx.canvas.width,
            ctx.canvas.height
        );

    }

    //Dibujar la capa superior del mapa
    drawUpperImage(ctx) {

        ctx.drawImage(
            this.upperImage,
            0,
            0,
            ctx.canvas.width,
            ctx.canvas.height
        );

    }
}

//Objeto que contiene todos los mapas del juego
window.OverWorldMaps = {

    Start: {

        //Imagen del escenario
        lowerSrc: "/levels/start.png",

        //Imagen opcional para elementos que van encima del personaje
        //upperSrc: "/levels/start_upper.png",

        gameObjects: {

            hero: new Person({

                isPlayerControlled: true,

                x: utils.withGrid(19),
                y: utils.withGrid(16),

            }),

            npc1: new Person({

                x: utils.withGrid(22),
                y: utils.withGrid(22),

            })
        }

    },

    Pasillo: {

        lowerSrc: "/levels/pasillo.jpg",

        gameObjects: {

            hero: new Person({

                isPlayerControlled: true,

                x: utils.withGrid(19),
                y: utils.withGrid(16),

            }),

            npc1: new Person({

                x: utils.withGrid(22),
                y: utils.withGrid(22),

            })

        }

    },

    Infermeria: {

        lowerSrc: "/levels/infermeria.jpg",

        gameObjects: {

            hero: new Person({

                isPlayerControlled: true,

                x: utils.withGrid(19),
                y: utils.withGrid(16),

            }),

            npc1: new Person({

                x: utils.withGrid(22),
                y: utils.withGrid(22),

            })

        }

    },

    Ingenieria: {

        lowerSrc: "/levels/ingenieria.jpg",

        gameObjects: {

            hero: new Person({

                isPlayerControlled: true,

                x: utils.withGrid(19),
                y: utils.withGrid(16),

            }),

            npc1: new Person({

                x: utils.withGrid(22),
                y: utils.withGrid(22),

            })

        }

    },

    Control: {

        lowerSrc: "/levels/control.jpg",

        gameObjects: {

            hero: new Person({

                isPlayerControlled: true,

                x: utils.withGrid(19),
                y: utils.withGrid(16),

            }),

            npc1: new Person({

                x: utils.withGrid(22),
                y: utils.withGrid(22),

            })

        }

    },

    Ia: {

        lowerSrc: "/levels/ia.jpg",

        gameObjects: {

            hero: new Person({

                isPlayerControlled: true,

                x: utils.withGrid(19),
                y: utils.withGrid(16),

            }),

            npc1: new Person({

                x: utils.withGrid(22),
                y: utils.withGrid(22),

            })

        }

    }

};