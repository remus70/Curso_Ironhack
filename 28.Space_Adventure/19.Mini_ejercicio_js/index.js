const div1 = document.getElementById("div1"); 

const div2 = document.getElementById("div2");

const div3 = document.getElementById("div3");

const div4 = document.getElementById("div4");

function calculadora() {
    let num1 = parseInt(prompt("dime el primer numero"));
    let num2 = parseInt(prompt("dime el segundo numero"));
    let result = num1 + num2;
    return div1.innerHTML = "El resultado es " + result;


}

function saludar() {
    let nombre = prompt ("Cual es tu nombre?");
    let localidad = prompt ("Donde vives?");
    let hobby = prompt ("Dime uno de tus hobbys");
    return div2.innerHTML = "Te llamas " + nombre + ", " + "vives en " + localidad + ", y te gusta " + hobby; 
}

function calcArea(){
    let radio = parseInt(prompt("Dime un radio para calcular el área"));
    let area = Math.round(Math.PI * radio * radio);
    return div3.innerHTML = "El área es " + area;
}

function compra(){
    let camiseta = 10;
    let pantalon = 20;
    let zapato = 30;
    let cantidad = parseInt(prompt("Cuantas camisetas quieres comprar?"));
    let resultado = camiseta * cantidad;
    cantidad = prompt("Cuantos pantaloes quieres?");
    resultado += pantalon * cantidad;
    cantidad = prompt("Cuantos zapatos quieres?");
    resultado += zapato * cantidad;
    return div4.innerHTML = "El total de su compra es " + resultado;
}