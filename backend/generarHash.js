const bcrypt = require("bcrypt");

async function generar() {

    const admin = await bcrypt.hash("Admin2026*", 10);

    const recepcion = await bcrypt.hash("Recep2026*", 10);

    console.log("ADMIN:");
    console.log(admin);

    console.log("\nRECEPCION:");
    console.log(recepcion);

}

generar();