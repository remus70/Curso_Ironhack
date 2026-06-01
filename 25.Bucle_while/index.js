const div1 = document.getElementById("div1"); 

const div2 = document.getElementById("div2");



function sumar(){
    let init = true;
    let acumulador = 0;
    
    while(init){
       let num1= parseInt(prompt("Elige el primer número"));
       let num2= parseInt(prompt("Elige el segundo número"));
       let resultado = num1 + num2;
       alert(`El resultado es ${resultado}`);
       acumulador += 1;
       let tmp = prompt("Desea sumar otra vez?(S/N)");
       tmp.toLowerCase();
       if(tmp === "n"){
        init = false;
        div1.innerHTML = `El número de sumas es ${acumulador}`;
       }else if(tmp ==="s"){
        init = true;
       }else{
        alert("Respuesta no válida. Reinicie la aplicación");
        init = false;
       }
    }
}

function negativo(){
    let tmp = true;
    let contador = 0;

    while(tmp){
        let num = parseInt(prompt("Elija un número"));
        
        if(num < 0){
            alert("Su número es negativo")
            contador += 1;
            div2.innerHTML = `El número de ciclos es ${contador}`;
            tmp = false;
        }else{
            alert("Continue seleccionando números")
            contador += 1;
        }
    }
}