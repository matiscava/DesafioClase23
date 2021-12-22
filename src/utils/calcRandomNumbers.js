const req = require("express/lib/request");

const calcRandomNumbers = (numero) => {
    let objeto = [];
    for( let i=0; i<numero;i++){
        let valor = Math.floor(Math.random()*(1000-1)+1);
            if(objeto.length===0){
                objeto.push({numero: valor, repetido: 1});
            }else{
                let yaSalio = objeto.find(cifra => cifra.numero === valor);
                if(yaSalio){
                    valorNuevo = yaSalio.repetido+1;
                    objetoNuevo = objeto.filter(cifra => cifra.numero !== valor);
                    objetoNuevo.push({numero: valor, repetido: valorNuevo});
                    objeto=objetoNuevo;
                }else{
                    objeto.push({numero: valor, repetido: 1});
                }
            }
        }
        
        return objeto;
}

process.on('message', msg => {
    const cantidad = parseInt(msg)
    const objeto = calcRandomNumbers(cantidad);
    process.send(objeto)
})

module.exports = calcRandomNumbers;