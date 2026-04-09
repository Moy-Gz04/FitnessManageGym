async function cargarDashboard(){

const res = await fetch(API)
const miembros = await res.json()

const hoy = new Date()

let activos = 0
let vencidos = 0

miembros.forEach(m => {

const fechaVencimiento = new Date(m.fechaVencimiento)

if(fechaVencimiento < hoy){
vencidos++
}
else{
activos++
}

})

document.getElementById("activos").innerText = activos
document.getElementById("vencidos").innerText = vencidos
document.getElementById("miembrosTotal").innerText = miembros.length

}

cargarDashboard()
async function cargarIngresosMes(){

const res = await fetch("https://localhost:7123/api/pagos")
const pagos = await res.json()

const hoy = new Date()
const mes = hoy.getMonth()
const año = hoy.getFullYear()

let total = 0

pagos.forEach(p => {

const fecha = new Date(p.fechaPago)

if(fecha.getMonth() === mes && fecha.getFullYear() === año){

total += p.monto

}

})

document.getElementById("ingresosMes").innerText = "$" + total

}
