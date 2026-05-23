    function rellenarTicket(){

      let nombre = document.getElementById("nombre").value;
      let fecha = document.getElementById("fecha").value;
      let fila = document.getElementById("fila").value;
      let asiento = document.getElementById("asiento").value;

      document.getElementById("ticketNombre").textContent = nombre;
      document.getElementById("ticketFecha").textContent = fecha;
      document.getElementById("ticketFila").textContent = fila;
      document.getElementById("ticketAsiento").textContent = asiento;
    }