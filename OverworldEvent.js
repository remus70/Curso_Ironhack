//Clase que controla los eventos del mapa

class OverworldEvent {
    constructor ({map, event}) {
        this.map = map;
        this.event = event;
    }

    //Evento de estar quieto
    stand(resolve){
        const who = this.map.gameObjects[this.event.who];
        who.startBehavior({
            map: this.map
        }, {
            type: "stand",
            direction: this.event.direction,
            time: this.event.time
        })

        //Crear un handler para completar caminar y resolver el evento

        const completeHandler = e => {
            if(e.detail.whoId === this.event.who){
               document.removeEventListener("PersonStandingComplete", completeHandler);
               resolve() 
            }
        }

        document.addEventListener("PersonStandingComplete", completeHandler)


    }
    //Evento de caminar
    walk(resolve) {
        const who = this.map.gameObjects[this.event.who];
        who.startBehavior({
            map: this.map
        }, {
            type: "walk",
            direction: this.event.direction,
            //Volver a intentar si el heroe se pone en la trayectoria
            retry: true
        })

        //Crear un handler para completar caminar y resolver el evento

        const completeHandler = e => {
            if(e.detail.whoId === this.event.who){
               document.removeEventListener("PersonWalkingComplete", completeHandler);
               resolve() 
            }
        }

        document.addEventListener("PersonWalkingComplete", completeHandler)
    }
    //Evento mensaje de texto
    textMessage(resolve){
        //Se checkea si el npc está mirando al hero y si no lo pone mirandolo
        if(this.event.faceHero) {
            const obj = this.map.gameObjects[this.event.faceHero];
            obj.direction = utils.oppositeDirection(this.map.gameObjects["hero"].direction);
        }

    const message = new TextMessage({
        text: this.event.text,
        onComplete: () => resolve()
    });

    message.init(document.querySelector(".game-container"));
    }

    //Evento que cambia el mapa
    changeMap(resolve) {
    const nextMap = window.OverworldMaps?.[this.event.map];

    if (!nextMap) {
        console.error("❌ Mapa no encontrado:", this.event.map);
        resolve();
        return;
    }

    
    

    const sceneTransition = new SceneTransition();

    sceneTransition.init(document.querySelector(".game-container"), () => {

        this.map.overworld.startMap(nextMap);

        if (
            nextMap.introCutscene &&
            !playerState.storyFlags[`INTRO_${this.event.map}`]
        ) {
            playerState.storyFlags[`INTRO_${this.event.map}`] = true;

            this.map.startCutscene(nextMap.introCutscene);
        }

        resolve();

        sceneTransition.fadeOut();
    });
}

    //Evento de tomar decisión final
    choice(resolve) {

    const options = this.event.options;

    const message = new TextMessage({
        text: this.event.text || "¿Qué decides?",
        options: options.map(opt => opt.label),

        onComplete: async (selection) => {

            const chosen = options[selection];

            // guardar flag
            if (chosen.setFlag) {
                window.playerState.storyFlags[chosen.setFlag] = true;
            }

            // si hay cutscene final → Esperar
            if (chosen.nextCutscene) {

                await this.map.startCutscene(chosen.nextCutscene);

                resolve();
                return;
            }

            resolve();
        }
    });

    message.init(document.querySelector(".game-container"));
}


    //Evento que añade checkpoints al mapa
    addStoryFlag(resolve){
        window.playerState.storyFlags[this.event.flag] = true;
        resolve();
    }

    //Evento al entrar en un mapa

    firstMapMessage(resolve) {

    if (!playerState.storyFlags[this.event.flag]) {

        playerState.storyFlags[this.event.flag] = true;

        const message = new TextMessage({
            text: this.event.text,
            onComplete: () => resolve()
        });

        message.init(document.querySelector(".game-container"));

    } else {
        resolve();
    }
}

    //Evento de final / epílogo con pantalla negra
endScreen(resolve) {

    window.playerState.gameOver = true;

    const container = document.querySelector(".game-container");

    const div = document.createElement("div");
    div.classList.add("EndScreen");

    div.innerText = this.event.text;

    container.appendChild(div);

    // bloquear input si quieres
    resolve();
}


    init() {
       return new Promise( resolve => {
            this[this.event.type](resolve)
       }) 
    }
}