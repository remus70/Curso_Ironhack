//Clase que permite a los personajes hacer ciertas acciones

class Person extends GameObject {

    constructor(config){

    super(config);

    this.movingProgressRemaining = 0;

    this.isPlayerControlled = config.isPlayerControlled || false;

    // 🔥 velocidad del personaje (px por frame)
    this.speed = config.speed || 1;

    this.directionUpdate = {
        "up" : ["y", -1],
        "down" : ["y", 1],
        "left" : ["x", -1],
        "right" : ["x", 1],
    }
}

    update(state){

        // 1. si está moviéndose, continuar
        if(this.movingProgressRemaining > 0){
            this.updatePosition();
        } else {

            // 2. intentar iniciar movimiento SOLO si hay input
            if(this.isPlayerControlled && state.arrow){

                // 🔥 FIX: evitar crash si map no existe
                if(state.map && !state.map.isSpaceTaken(
                    this.x,
                    this.y,
                    state.arrow
                )){

                    this.startBehavior(state,{
                        type:"walk",
                        direction: state.arrow
                    });
                }
            }
        }

        // 3. sprite siempre actualizado
        this.updateSprite(state);

        // 📍 LOG SOLO CUANDO EL PERSONAJE ESTÁ EN UNA NUEVA CASILLA
        if(this.movingProgressRemaining === 0 && this.isPlayerControlled){

            const gridX = this.x / 16;
            const gridY = this.y / 16;

        console.log("📍 GRID:", gridX, gridY);
}
    }

    startBehavior(state, behavior){

    this.direction = behavior.direction;

    if(behavior.type === "walk"){

        if(state.map.isSpaceTaken(this.x, this.y, this.direction)){
            return;
        }

        state.map.moveWall(this.x, this.y, this.direction);

        this.movingProgressRemaining = 16;
    }
}

    updatePosition(){

    const [property, change] = this.directionUpdate[this.direction];

    // 🔥 1 pixel por frame → 16 frames = 1 tile exacto
    this[property] += change;

    this.movingProgressRemaining -= 1;
}

    updateSprite(state){

        // 🔥 MOVIMIENTO
        if(this.movingProgressRemaining > 0){
            this.sprite.setAnimation("walk-" + this.direction);
            return;
        }

        // 🔥 IDLE CON INPUT
        if(this.isPlayerControlled && state.arrow){
            this.sprite.setAnimation("idle-" + state.arrow);
            return;
        }

        // 🔥 IDLE NORMAL
        this.sprite.setAnimation("idle-" + this.direction);
    }
}