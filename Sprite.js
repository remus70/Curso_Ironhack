class Sprite {

    constructor(config){

        //Crear las imagenes
        this.image = new Image();
        this.image.src = config.src;
        this.image.onload = () =>{
            this.isLoaded = true;
        }

        // 🔥 TAMAÑO REAL DEL SPRITESHEET
        this.width = config.width || 32;
        this.height = config.height || 32;

        // 🔥 ESCALA VISUAL (IMPORTANTE PARA EVITAR COLISIONES VISUALES)
        this.scale = config.scale || 2;

        //Configurar animación
        this.animations = config.animations || {

            "idle-down": [[0,0]],
            "idle-right": [[0,1]],
            "idle-up": [[0,2]],
            "idle-left": [[0,3]],

            "walk-down": [[0,0],[1,0],[2,0],[3,0]],
            "walk-right": [[0,1],[1,1],[2,1],[3,1]],
            "walk-up": [[0,2],[1,2],[2,2],[3,2]],
            "walk-left": [[0,3],[1,3],[2,3],[3,3]],
        }

        this.currentAnimation = config.currentAnimation || "idle-down";
        this.currentAnimationFrame = 0;

        this.animationFrameLimit = config.animationFrameLimit || 8;
        this.animationFrameProgress = this.animationFrameLimit;

        this.gameObject = config.gameObject;
    }

    get frame(){

        const anim = this.animations[this.currentAnimation];

        if(!anim){
            return [0,0];
        }

        return anim[this.currentAnimationFrame] || anim[0];
    }

    setAnimation(key){
        if(this.currentAnimation !== key){
            this.currentAnimation = key;
            this.currentAnimationFrame = 0;
            this.animationFrameProgress = this.animationFrameLimit;
        }
    }

    updateAnimationProgress(){

        if(this.animationFrameProgress > 0){
            this.animationFrameProgress -= 1;
            return;
        }

        this.animationFrameProgress = this.animationFrameLimit;
        this.currentAnimationFrame += 1;

        const anim = this.animations[this.currentAnimation];

        if(this.currentAnimationFrame >= anim.length){
            this.currentAnimationFrame = 0;
        }
    }

    draw(ctx) {

        const x = this.gameObject.x;
        const y = this.gameObject.y;

        const [frameX, frameY] = this.frame;

        if(this.isLoaded){

            ctx.drawImage(
                this.image,

                frameX * this.width,
                frameY * this.height,

                this.width,
                this.height,

                // 🔥 OFFSET VISUAL (EVITA “CHOQUES VISUALES”)
                x - (this.width * this.scale - 32) / 2,
                y - (this.height * this.scale - 32) / 2,

                this.width * this.scale,
                this.height * this.scale
            );
        }

        this.updateAnimationProgress();
    }
}