class GameObject{

    constructor(config){

        this.isMounted = false;

        //Le pasamos la cordenada del objeto del juego o se pone en 0 por defecto
        this.x = config.x || 0;
        this.y = config.y || 0;

        //Direccion del objeto
        this.direction = config.direction || "down";

        // 🔥 HITBOX PARA COLISIÓN (desacoplada del sprite)
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
    }

    mount(map){
        this.isMounted = true;

        //Se añade el muro en la posición del objeto
        map.addWall(this.x,this.y);
    }

    //Permite añadir actualizaciones a ciertos objetos
    update(){

    }
}