const div1 = document.getElementById("div1"); 

const div2 = document.getElementById("div2");

const div3 = document.getElementById("div3");


function adivinar(){
    let randnum = Math.floor(Math.random()*10) + 1;
    let init = true;
    let contador = 0

    while(init){
        let guess = parseInt(prompt("Adivina el número entre 1 y 10 "));
        contador += 1;
        
        if (guess === randnum){
            div1.innerHTML = `Felicidades, has acertado!. Intentos ${contador}`;
            init = false;
        }else{
            alert("Número equivocado, sigue intentandolo.")
        }
    }

}

// intercambio de variables: let x = 5; let y = 8;
let x = 5;
let y = 8;
let z = 0;
z = x;
x = y;
y = z;

div2.innerHTML =`la x vale: ${x} y la y vale: ${y} <br>`;

div3.innerHTML = "Ver tablas de multiplicar por consola"

for ( let i = 1; i <= 10; i++){

    for (let j = 0; j <= 10; j++){
        console.log(`${i} x ${j} = ` + (i*j));
    }
}