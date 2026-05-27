const utils = {

    //Convierte una posición de grid a píxeles
    withGrid(n){
        return n * 16;
    },

    asGridCoords(x,y){
        return `${x},${y}`;
    },

    nextPosition(initialX,initialY,direction){

        let x = initialX;
        let y = initialY;

        const size = 16;

        if(direction === "left"){
            x -= size;
        } else if(direction === "right"){
            x += size;
        } else if(direction === "up"){
            y -= size;
        } else if(direction === "down"){
            y += size;
        }

        return {x,y};
    }
}