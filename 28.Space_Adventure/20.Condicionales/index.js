const div1 = document.getElementById("div1"); 

const div2 = document.getElementById("div2");

const div3 = document.getElementById("div3");

const div4 = document.getElementById("div4");

function portero(){
    let edad = parseInt(prompt("Que edad tienes"));
    if(edad > 18){
        return div1.innerHTML = "Está bien puedes pasar.";
    }else if(edad < 18){
       return div1.innerHTML = "No tienes edad para entrar."; 
    }else{
        return div1.innerHTML = "Que pequeño!, Está bien, puedes pasar por poco.";
    }
}

function color(){
    let color = prompt("Elije un color");
    switch (color){
        case "rojo":
            return div2.innerHTML = "Rojo como una manzana madura";
            break;

        case "azul":
            return div2.innerHTML = "Azul como el cielo despejado.";
            break;

        case "verde":
            return div2.innerHTML = "Verde como la hierba fresca.";
            break;
        
        case "amarillo":
            return div2.innerHTML = "Amarillo como el sol brillante.";
            break;

        case "negro":
            return div2.innerHTML = "Negro como la noche oscura.";
            break;

        default:
            return div2.innerHTML = "No tengo frase para este color.";
            
    }
}

function lampara(){
    alert("La lámpara no funciona");
    let resp = prompt("Está enchufada?S/N");
    resp = resp.toUpperCase();
    if (resp==="N"){
        return div3.innerHTML = "Enchufala";
    }else if (resp==="S"){
        resp = prompt("El foco está quemado?S/N");
        resp = resp.toUpperCase();
        if( resp === "S"){
            return div3.innerHTML = "Reemplaza el foco";
        }else if(resp === "N"){
            return div3.innerHTML = "Compra una nueva."
        }else{
            return div3.innerHTML = "Respuesta inválida";
        }
    }else{
      return div3.innerHTML = "Respuesta inválida";  
    }
}