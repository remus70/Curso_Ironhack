
function iniciar(){
    calculadora();
}

function calculadora(){
        let calcular = true;
    let continuar = "";
    while(calcular){
        let num1= parseInt(prompt("Introduzca el primer número"));
        let num2= parseInt(prompt("Introduzca el segundo número"));
        let result = sumar(num1,num2);
        alert("Tu resultado es " + result);
        continuar = prompt("Desea continuar? Y/N");
        continuar = continuar.toUpperCase();
        if(continuar === "N"){
            calcular = false;
        }else if(continuar ==="Y"){
            calcular = true;
        }else{
            alert("Introduzca un carácter válido");
            calcular = false;
        }
    } 
}

function sumar (num1,num2){
    return num1 + num2;
}