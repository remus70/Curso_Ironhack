const p = document.getElementById("frase");
const secret = document.querySelector("#div2 p");
const pelota = document.querySelector(".pelota");

function edad(){
    let edad = parseInt(prompt("Cual es tu edad?"));
    if (edad <= 35){
       document.querySelector("img").setAttribute("src","img/niño.jpg");
       document.querySelector("img").setAttribute("alt","foto niño");
       document.querySelector("img").style.height = "500px";
       p.innerHTML = "Eres un chaval!"; 
    }else if (edad > 35 && edad <= 65){
        document.querySelector("img").setAttribute("src","img/joven.jpg");
        document.querySelector("img").setAttribute("alt","foto adulto");
        document.querySelector("img").style.height = "500px";
        p.innerHTML = "Pero si estás en la crema de la vida!"; 
    }else{
        document.querySelector("img").setAttribute("src","img/viejo.png");
        document.querySelector("img").setAttribute("alt","foto persona mayor");
        document.querySelector("img").style.height = "500px";
        p.innerHTML = "Felicidades, la sabiduria viene con el tiempo"; 
    }
}

function descubrirMensaje(){
    secret.classList.remove("secreto");
}

function startAnim(){
    pelota.classList.add("animar");
}

function stopAnim(){
    pelota.classList.remove("animar");
}