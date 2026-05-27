class GameObject{

    constructor(config){

        //Le pasamos la cordenada del objeto del juego o se pone en 0 por defecto
        this.x = config.x || 0;
        this.y = config.y || 0;
        //Direccion del objeto
        this.direction = config.direction || "down";
        //Captura como sera la imagen del objeto
        this.sprite = new Sprite({
            gameObject: this,
            src: config.src || "/sprites/hero.png",
        });
    }

    //Permite añadir actualizaciones a ciertos objetos
    update(){



    }
}