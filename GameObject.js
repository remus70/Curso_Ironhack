class GameObject{

    constructor(config){

        //Crear un id para que cada objeto tenga un comportamiento unico
        this.id = null;

        this.isMounted = false;

        //Le paso la cordenada del objeto del juego o se pone en 0 por defecto
        this.x = config.x || 0;
        this.y = config.y || 0;

        //Direccion del objeto
        this.direction = config.direction || "down";

        // Hitbox de colision
        this.hitbox = {
            width: 16,
            height: 16,
            offsetX: 0,
            offsetY: 0
        };

        //Captura como sera la imagen del objeto
        this.sprite = new Sprite({
            gameObject: this,
            src: config.src || "/sprites/hero.png",
        });

        this.behaviorLoop = config.behaviorLoop || [];
        this.behaviorLoopIndex = 0;

        this.talking = config.talking || [];
    }

    mount(map){
        this.isMounted = true;

        //Se añade el muro en la posición del objeto
        map.addWall(this.x,this.y);

        //Si tiene un comportamiento lo creamos despues de un delay
        setTimeout(() => {
            this.doBehaviorEvent(map);
        },10)
    }

    async doBehaviorEvent(map){

        //No hacer nada si hay una escena  or no tengo configuracion todavia
        if( map.isCutscenePlaying || this.behaviorLoop.length === 0 || this.isStanding){
            return;
        }

        //Preparar el evento con info relevante
        let eventConfig = this.behaviorLoop[this.behaviorLoopIndex];
        eventConfig.who = this.id;
        //Crear una instancia de evento para el siguiente evento
        const eventHandler = new OverworldEvent ({map, event: eventConfig});
        await eventHandler.init();

        //Preparar el siguiente evento
        this.behaviorLoopIndex += 1;
        if(this.behaviorLoopIndex === this.behaviorLoop.length) {
            this.behaviorLoopIndex = 0;
        }
        //Repetir
        this.doBehaviorEvent(map);
    }
}