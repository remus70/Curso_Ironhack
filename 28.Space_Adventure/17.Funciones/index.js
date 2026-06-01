const div1 = document.getElementById("div1"); 

const div2 = document.getElementById("div2");

function calculadora() {
    let num1 = parseInt(prompt("dime el primer numero"));
    let num2 = parseInt(prompt("dime el segundo numero"));
    let operation = prompt("Quieres sumar o restar?");
    operation.toLowerCase();
    if (operation === "sumar"){
        sumar(num1,num2);
    }else if( operation === "restar"){
        restar(num1,num2);
    }else{
        alert("Operación no soportada");
    }


}

function sumar( num1, num2){
    let resultado = num1 + num2;
    return div2.innerHTML = "El resultado es " + resultado;
}

function restar( num1, num2){
    let resultado = num1 - num2;
    return div2.innerHTML = "El resultado es " + resultado;
}

function saludar() {
    let saludo = prompt("Dime que tipo de saludo quieres:");
    let nombre = prompt ("Cual es tu nombre?");
    div1.innerHTML = saludo + " " + nombre;
}