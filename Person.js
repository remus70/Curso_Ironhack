//Clase que permite a los personajes hacer ciertas acciones

class Person extends GameObject {

    constructor(config){

    super(config);

    this.movingProgressRemaining = 0;

    this.isStanding = false;

    this.isPlayerControlled = config.isPlayerControlled || false;

    // velocidad del personaje
    this.speed = config.speed || 1;

    this.directionUpdate = {
        "up" : ["y", -1],
        "down" : ["y", 1],
        "left" : ["x", -1],
        "right" : ["x", 1],
    }
}

    update(state){

        //  si está moviéndose, continuar
        if(this.movingProgressRemaining > 0){
            this.updatePosition();
        } else {

            //  intentar iniciar movimiento SOLO si hay input y no hay una cinematica
            if(!state.map.isCutscenePlaying && this.isPlayerControlled && state.arrow){

                //evitar crash si map no existe
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

        // 3sprite siempre actualizado
        this.updateSprite(state);

        if(this.movingProgressRemaining === 0 && this.isPlayerControlled){

            const gridX = this.x / 16;
            const gridY = this.y / 16;

}
    }

    startBehavior(state, behavior){

    this.direction = behavior.direction;

    if(behavior.type === "walk"){

        if(state.map.isSpaceTaken(this.x, this.y, this.direction)){
            //Si el heroe se pone en la trayectoria del npc, tras un delay vuelve a probar a hacer su evento
            behavior.retry && setTimeout(() => {
                this.startBehavior(state,behavior)
            },10)
            return;
        }

        state.map.moveWall(this.x, this.y, this.direction);

        this.movingProgressRemaining = 16;
        
    }

    if(behavior.type === "stand") {
        this.isStanding = true;
        setTimeout(() => {
            utils.emitEvent("PersonStandingComplete",{
                whoId: this.id
            })
            this.isStanding = false;
        }, behavior.time)
    }
}

    updatePosition(){

    const [property, change] = this.directionUpdate[this.direction];

    // 🔥 1 pixel por frame → 16 frames = 1 tile exacto
    this[property] += change;

    this.movingProgressRemaining -= 1;

    if (this.movingProgressRemaining === 0) {
        //Ha acabado el evento de caminar
        utils.emitEvent("PersonWalkingComplete", {
            whoId: this.id
        })
    }
}

    updateSprite(state){

        // MOVIMIENTO
        if(this.movingProgressRemaining > 0){
            this.sprite.setAnimation("walk-" + this.direction);
            return;
        }

        // IDLE CON INPUT
        if(this.isPlayerControlled && state.arrow){
            this.sprite.setAnimation("idle-" + state.arrow);
            return;
        }

        //IDLE NORMAL
        this.sprite.setAnimation("idle-" + this.direction);
    }
}