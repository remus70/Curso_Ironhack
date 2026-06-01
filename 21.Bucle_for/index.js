for(let i =50; i >= 20; i--){
    console.log(i);
}

let num1= parseInt(prompt("Dime un número"));
let num2 = parseInt(prompt("Dime otro número"));
alert("Puedes ver los números pares entre esos dos números en consola.");
for(num1; num1 <= num2; num1++){
    if(num1 % 2 === 0){
        console.log("Número par entre los números asignados: " + num1);
    }
}

alert("Ahora vamos a hacer un carrito de la compra!");

let total = 0;

for(let i = 1; i <= 5; i++){
    let precio = parseInt(prompt("Introduce el precio del producto " + i + " :"));
    total += precio;
}

if(total >= 100){
    let descuento = total * 0.15;
    let precioFinal = total - descuento;

    console.log("Precio original: " + total + "€");
    console.log("Precio con descuento: " + precioFinal + "€");

} else {
    console.log("Total: " + total + "€");
}

alert("Revisa el resultado en consola!");