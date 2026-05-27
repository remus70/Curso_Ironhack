//Clase que permite a los personajes hacer ciertas acciones

class Person extends GameObject {

    constructor (config) {

        super(config);
        this.movingProgressRemaining = 0;

        this.isPlayerControlled = config.isPlayerControlled || false;

        this.directionUpdate = {

            "up" : ["y", -1],
            "down" : ["y", 1],
            "left" : ["x", -1],
            "right" : ["x" ,1],

        }
    }

    update(state){

        // ❌ Solo el jugador puede recibir input
        if(this.isPlayerControlled){
            this.handleInput(state);
        }

        this.updatePosition();
        this.updateSprite(state);
    }

    handleInput(state){

        // Si no está en movimiento y hay input → iniciar movimiento
        if(this.movingProgressRemaining === 0 && state.arrow){
            this.direction = state.arrow;
            this.movingProgressRemaining = 16;
        }
    }

    updatePosition(){

        if(this.movingProgressRemaining > 0){
            const [property, change] = this.directionUpdate[this.direction];
            this[property] += change * 1.5;
            this.movingProgressRemaining -= 1;
        }
    }

    updateSprite(state){

        // 🔥 MOVIMIENTO → WALK
        if(this.movingProgressRemaining > 0){
            this.sprite.setAnimation("walk-" + this.direction);
            return;
        }

        // 🔥 IDLE DEL JUGADOR CON TECLA PRESIONADA
        if(this.isPlayerControlled && state.arrow){
            this.sprite.setAnimation("idle-" + state.arrow);
            return;
        }

        // 🔥 IDLE GENERAL (NPCs o sin input)
        this.sprite.setAnimation("idle-" + this.direction);
    }
}