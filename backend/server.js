// =============================
// 🚀 IMPORTACIONES
// =============================
const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

// =============================
// ⚠️ MANEJO GLOBAL DE ERRORES
// =============================
process.on("uncaughtException", (err) => {
  console.error("ERROR NO CAPTURADO:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("PROMESA RECHAZADA:", err);
});

// =============================
// ⚙️ CONFIGURACIÓN APP
// =============================
const app = express();

app.use(cors());
app.use(express.json());

// =============================
// 🔌 CONEXIÓN A POSTGRES
// =============================
const pool = new Pool({
  host: "dpg-d7btsvadbo4c73f0m00g-a.oregon-postgres.render.com",
  user: "gym_db_em23_user",
  password: "1xxxzhr1RZgklPvpMXgl3yTvzgSXq5LI",
  database: "gym_db_em23",
  port: 5432,
  ssl: {
    rejectUnauthorized: false
  },
  keepAlive: true
});

pool.on("error", (err) => {
  console.error("Error en PostgreSQL:", err);
});

// =============================
// 🏠 RUTA BASE
// =============================
app.get("/", (req, res) => {
  res.send("API del gimnasio funcionando 🚀");
});

// =============================
// 👥 OBTENER MIEMBROS
// =============================
app.get("/miembros", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM miembros ORDER BY id DESC");
    res.json(result.rows);
  } catch (error) {
    console.error("Error en /miembros:", error);
    res.status(500).json({ error: "Error al obtener miembros" });
  }
});

// =============================
// ➕ REGISTRAR MIEMBRO
// =============================
app.post("/miembros", async (req, res) => {
  try {
    const { nombres, apellidos, email, telefono, huella_id } = req.body;

    const result = await pool.query(
      `INSERT INTO miembros (nombres, apellidos, email, telefono, huella_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [nombres, apellidos, email, telefono, huella_id]
    );

    res.json(result.rows[0]);

  } catch (error) {
    console.error("Error en /miembros POST:", error);
    res.status(500).json({ error: "Error al registrar miembro" });
  }
});

// =============================
// 💰 REGISTRAR PAGO
// =============================
app.post("/pagos", async (req, res) => {
  try {
    const { miembro_id, tipo } = req.body;

    const tipoPago = await pool.query(
      "SELECT id, dias, precio FROM tipos_pago WHERE LOWER(nombre) = LOWER($1)",
      [tipo]
    );

    if (tipoPago.rows.length === 0) {
      return res.status(400).json({ error: "Tipo de pago no existe" });
    }

    const tipoData = tipoPago.rows[0];

    const tipo_id = tipoData.id;
    const dias = tipoData.dias;
    const monto = tipoData.precio;

    // Insertar pago
    await pool.query(
      `INSERT INTO pagos (miembro_id, monto)
       VALUES ($1, $2)`,
      [miembro_id, monto]
    );

    // Obtener miembro
    const result = await pool.query(
      "SELECT fecha_vencimiento FROM miembros WHERE id = $1",
      [miembro_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Miembro no existe" });
    }

    let nuevaFecha;

    if (
      !result.rows[0].fecha_vencimiento ||
      new Date(result.rows[0].fecha_vencimiento) < new Date()
    ) {
      nuevaFecha = `NOW() + INTERVAL '${dias} days'`;
    } else {
      nuevaFecha = `fecha_vencimiento + INTERVAL '${dias} days'`;
    }

    await pool.query(`
      UPDATE miembros
      SET fecha_vencimiento = ${nuevaFecha}
      WHERE id = $1
    `, [miembro_id]);

    res.json({
      ok: true,
      mensaje: "Pago registrado correctamente",
      monto,
      dias
    });

  } catch (error) {
    console.error("ERROR EN /pagos:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// =============================
// 📊 DASHBOARD
// =============================
app.get("/dashboard", async (req, res) => {
  try {

    const activos = await pool.query(`
      SELECT COUNT(*) FROM miembros 
      WHERE DATE(fecha_vencimiento) >= CURRENT_DATE
    `);

    const vencidos = await pool.query(`
      SELECT COUNT(*) FROM miembros 
      WHERE fecha_vencimiento IS NULL
         OR DATE(fecha_vencimiento) < CURRENT_DATE
    `);

    const total = await pool.query(`
      SELECT COUNT(*) FROM miembros
    `);

    const ingresos = await pool.query(`
      SELECT COALESCE(SUM(monto),0) FROM pagos 
      WHERE DATE_TRUNC('month', fecha) = DATE_TRUNC('month', CURRENT_DATE)
    `);

    // 🔥 NUEVOS DEL MES
    const nuevos = await pool.query(`
      SELECT COUNT(*) FROM miembros
      WHERE DATE_TRUNC('month', fecha_registro) = DATE_TRUNC('month', CURRENT_DATE)
    `);

    // ⚠️ POR VENCER (3 días)
    const porVencer = await pool.query(`
      SELECT COUNT(*) FROM miembros
      WHERE DATE(fecha_vencimiento) BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '3 days'
    `);

    res.json({
      activos: activos.rows[0].count,
      vencidos: vencidos.rows[0].count,
      total: total.rows[0].count,
      ingresos: ingresos.rows[0].coalesce,
      nuevos: nuevos.rows[0].count,
      porVencer: porVencer.rows[0].count
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================
// 📈 INGRESOS ANUALES
// =============================
app.get("/ingresos-anuales", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        m.mes,
        COALESCE(SUM(p.monto), 0) as total
      FROM (
        VALUES 
        (1,'Ene'), (2,'Feb'), (3,'Mar'), (4,'Abr'),
        (5,'May'), (6,'Jun'), (7,'Jul'), (8,'Ago'),
        (9,'Sep'), (10,'Oct'), (11,'Nov'), (12,'Dic')
      ) AS m(num, mes)
      LEFT JOIN pagos p 
        ON EXTRACT(MONTH FROM p.fecha) = m.num
      GROUP BY m.num, m.mes
      ORDER BY m.num
    `);

    res.json(result.rows);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// =============================
// 🚪 ÚLTIMOS ACCESOS (SIMULADO)
// =============================
app.get("/accesos", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT nombres || ' ' || apellidos AS nombre, NOW() as hora_entrada
      FROM miembros
      ORDER BY id DESC
      LIMIT 5
    `);

    res.json(result.rows);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =============================
// 🚀 INICIAR SERVIDOR
// =============================
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});