const div1 = document.getElementById("div1");
const ul = document.createElement("ul"); 
let pasajeros = [];


function visualizar(){

     ul.innerHTML = "";
    pasajeros.forEach(pasajero => {
    const li = document.createElement("li");
    li.textContent = pasajero;
    ul.appendChild(li);
  });

  div1.appendChild(ul);
}

function add(){
    tmp = true;

    while (tmp){
        let pasajero = prompt("Añada un pasajero al viaje:");
        pasajeros.push(pasajero);
        let continuar = prompt("Quiere añadir más pasajeros? S/N");
        continuar.toLowerCase();
        if(continuar === "n"){
            tmp = false;
            visualizar();
        }else if(continuar === "s"){
            tmp = true;
        }else{
            alert("No se ha podido realizar la operación");
        }
    }

}

function update(){

    let pasajero = prompt("Que pasajero desea sustituir?");
    let posicion = pasajeros.indexOf(pasajero);
    
    let nuevoPasajero = prompt("Quien ocupará su lugar?");
    pasajeros[posicion] = nuevoPasajero;
    visualizar();
}

function remove (){

    let pasajero = prompt("Que pasajero quieres eliminar?");
    let posicion = pasajeros.indexOf(pasajero);
    pasajeros.splice(posicion,1);

    visualizar();
}
