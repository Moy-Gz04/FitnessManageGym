// =============================
// 🚀 IMPORTACIONES
// =============================
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
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
// 📁 CARPETA UPLOADS
// =============================
const uploadsPath = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath);
}

// Servir archivos estáticos
app.use("/uploads", express.static(uploadsPath));

// =============================
// 📤 CONFIGURAR MULTER
// =============================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsPath);
  },

  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);

    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  }
});

// Validar imágenes
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const ext = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  const mime = allowedTypes.test(file.mimetype);

  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error("Solo se permiten imágenes (jpg, jpeg, png, webp)"));
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter
});

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
// 👥 OBTENER UN MIEMBRO
// =============================
app.get("/miembros/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM miembros WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Miembro no encontrado" });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error("Error en GET /miembros/:id:", error);
    res.status(500).json({ error: "Error obteniendo miembro" });
  }
});
// =============================
// ➕ REGISTRAR MIEMBRO
// =============================

app.post("/miembros", async (req, res) => {

  try {

    let {

      nombres,
      apellidos,
      email,
      telefono,
      huella_id,
      nfc_uid

    } = req.body;

    // =============================
    // NORMALIZAR
    // =============================

    email =
      email?.trim() || null;

    telefono =
      telefono?.trim() || null;

    huella_id =
      huella_id || null;

    nfc_uid =
      nfc_uid || null;

    // =============================
    // VALIDACIÓN BÁSICA
    // =============================

    if (!nombres || !apellidos) {

      return res.status(400).json({

        error:
          "Nombre y apellidos son obligatorios"

      });

    }

    // =============================
    // VALIDAR NFC DUPLICADO
    // =============================

    if (nfc_uid) {

      const nfcExistente =
        await pool.query(
          `
          SELECT id
          FROM miembros
          WHERE nfc_uid = $1
          LIMIT 1
          `,
          [nfc_uid]
        );

      if (
        nfcExistente.rows.length > 0
      ) {

        return res.status(409).json({

          error:
            "La tarjeta NFC ya está asignada a otro miembro"

        });

      }

    }

    // =============================
    // VALIDAR HUELLA DUPLICADA
    // =============================

    if (huella_id) {

      const huellaExistente =
        await pool.query(
          `
          SELECT id
          FROM miembros
          WHERE huella_id = $1
          LIMIT 1
          `,
          [huella_id]
        );

      if (
        huellaExistente.rows.length > 0
      ) {

        return res.status(409).json({

          error:
            "La huella ya está registrada en otro miembro"

        });

      }

    }

    // =============================
    // INSERTAR
    // =============================

    const result =
      await pool.query(

        `
        INSERT INTO miembros (

          nombres,
          apellidos,
          email,
          telefono,
          huella_id,
          nfc_uid

        )

        VALUES (

          $1,
          $2,
          $3,
          $4,
          $5,
          $6

        )

        RETURNING *
        `,

        [

          nombres,
          apellidos,
          email,
          telefono,
          huella_id,
          nfc_uid

        ]

      );

    // =============================
    // RESPUESTA
    // =============================

    res.json(
      result.rows[0]
    );

  } catch (error) {

    console.error(
      "🔥 ERROR REAL POST:",
      error
    );

    res.status(500).json({

      error:
        error.message

    });

  }

});

// =============================
// ➕ ELIMINAR MIEMBRO
// =============================
app.delete("/miembros/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM miembros WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Miembro no encontrado" });
    }

    res.json({
      ok: true,
      mensaje: "Miembro eliminado correctamente"
    });

  } catch (error) {
    console.error("Error en DELETE /miembros/:id:", error);
    res.status(500).json({ error: "Error eliminando miembro" });
  }
});

// =============================
// ✏️ ACTUALIZAR MIEMBRO
// =============================
app.put("/miembros/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombres, apellidos, email, telefono } = req.body;

    const result = await pool.query(
      `UPDATE miembros
       SET nombres = $1,
           apellidos = $2,
           email = $3,
           telefono = $4
       WHERE id = $5
       RETURNING *`,
      [nombres, apellidos, email, telefono, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Miembro no encontrado" });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error("ERROR PUT /miembros:", error);
    res.status(500).json({ error: "Error al actualizar miembro" });
  }
});


// =============================
// 📶 ASIGNAR NFC
// =============================

app.put(
  "/miembros/:id/nfc",
  async (req, res) => {

    try {

      const { id } =
        req.params;

      const { nfc_uid } =
        req.body;

      if (!nfc_uid) {

        return res.status(400).json({
          error: "NFC requerido"
        });
      }

      await pool.query(`
        UPDATE miembros
        SET nfc_uid = $1
        WHERE id = $2
      `, [
        nfc_uid,
        id
      ]);

      res.json({
        ok: true,
        mensaje:
          "NFC asignado"
      });

    } catch (err) {

      console.error(
        "ERROR NFC:",
        err
      );

      res.status(500).json({
        error: err.message
      });
    }
  }
);

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
// 🚪 ÚLTIMOS ACCESOS
// =============================

app.get("/accesos", async (req, res) => {

  try {

    const result = await pool.query(`

      SELECT

        a.id,
        a.fecha,
        a.metodo_acceso,
        a.acceso_permitido,
        a.observaciones,
        a.dispositivo,

        CASE
          WHEN m.id IS NOT NULL
          THEN m.nombres || ' ' || m.apellidos
          ELSE 'DESCONOCIDO'
        END AS nombre

      FROM accesos a

      LEFT JOIN miembros m
        ON a.miembro_id = m.id

      ORDER BY a.fecha DESC

      LIMIT 50

    `);

    res.json(result.rows);

  } catch (error) {

    console.error(
      "ERROR /accesos:",
      error
    );

    res.status(500).json({
      error: error.message
    });
  }

});

// =============================
// 🎨 OBTENER TODOS LOS TEMAS
// =============================
app.get("/temas", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM temas
      ORDER BY id ASC
    `);

    res.json(result.rows);

  } catch (error) {
    console.error("Error en /temas:", error);
    res.status(500).json({ error: "Error obteniendo temas" });
  }
});

// =============================
// ⚙️ OBTENER CONFIGURACIÓN ACTUAL
// =============================
app.get("/configuracion", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.id,
        c.nombre_gym,
        c.logo_url,
        c.fondo_url,
        c.tema_id,
        c.modo_oscuro,

        t.nombre AS tema_nombre,
        t.color_primario,
        t.color_secundario,
        t.color_acento,
        t.color_fondo,
        t.color_superficie,
        t.color_sidebar,
        t.color_header,
        t.color_texto,
        t.color_texto_secundario,
        t.color_texto_sidebar,
        t.color_exito,
        t.color_error,
        t.color_alerta,
        t.color_info,
        t.color_boton_primario,
        t.color_boton_secundario,
        t.color_boton_peligro,
        t.borde_radio,
        t.sombra

      FROM configuracion c
      LEFT JOIN temas t ON c.tema_id = t.id
      WHERE c.id = 1
    `);

    res.json(result.rows[0]);

  } catch (error) {
    console.error("Error en /configuracion:", error);
    res.status(500).json({ error: "Error obteniendo configuración" });
  }
});

// =============================
// 🔄 ACTUALIZAR CONFIGURACIÓN
// =============================
app.put("/configuracion", async (req, res) => {
  try {
    const {
      nombre_gym,
      logo_url,
      fondo_url,
      tema_id,
      modo_oscuro
    } = req.body;

    await pool.query(`
      UPDATE configuracion
      SET 
        nombre_gym = $1,
        logo_url = $2,
        fondo_url = $3,
        tema_id = $4,
        modo_oscuro = $5
      WHERE id = 1
    `, [
      nombre_gym,
      logo_url,
      fondo_url,
      tema_id,
      modo_oscuro
    ]);

    res.json({
      ok: true,
      mensaje: "Configuración actualizada correctamente"
    });

  } catch (error) {
    console.error("Error en PUT /configuracion:", error);
    res.status(500).json({ error: "Error actualizando configuración" });
  }
});

// =============================
// 🖼️ SUBIR IMÁGENES DE CONFIGURACIÓN
// =============================
app.post(
  "/upload-config",
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "fondo", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      let logoUrl = null;
      let fondoUrl = null;

      // Logo
      if (req.files["logo"]) {
        logoUrl = `/uploads/${req.files["logo"][0].filename}`;
      }

      // Fondo
      if (req.files["fondo"]) {
        fondoUrl = `/uploads/${req.files["fondo"][0].filename}`;
      }

      // Obtener configuración actual
      const actual = await pool.query(
        "SELECT logo_url, fondo_url FROM configuracion WHERE id = 1"
      );

      const logoFinal = logoUrl || actual.rows[0].logo_url;
      const fondoFinal = fondoUrl || actual.rows[0].fondo_url;

      // Actualizar DB
      await pool.query(`
        UPDATE configuracion
        SET logo_url = $1,
            fondo_url = $2
        WHERE id = 1
      `, [logoFinal, fondoFinal]);

      res.json({
        ok: true,
        logo_url: logoFinal,
        fondo_url: fondoFinal,
        mensaje: "Imágenes actualizadas correctamente"
      });

    } catch (error) {
      console.error("Error subiendo imágenes:", error);

      res.status(500).json({
        ok: false,
        error: error.message
      });
    }
  }
);
// =============================
// 📶 IDENTIFICAR NFC
// =============================

app.post(
  "/acceso-nfc",
  async (req, res) => {

    try {

      const { nfc_uid } =
        req.body;

      if (!nfc_uid) {

        return res.status(400).json({
          success: false
        });
      }

      // =============================
      // BUSCAR MIEMBRO
      // =============================

      const resultado =
        await pool.query(`
          SELECT *
          FROM miembros
          WHERE nfc_uid = $1
          LIMIT 1
        `, [nfc_uid]);

      // NO EXISTE
      if (
        resultado.rows.length === 0
      ) {

        return res.json({
          success: false
        });
      }

      const miembro =
        resultado.rows[0];

      // =============================
      // CALCULAR DÍAS RESTANTES
      // =============================

      let diasRestantes = 0;

      if (miembro.fecha_vencimiento) {

        const hoy =
          new Date();

        const vencimiento =
          new Date(
            miembro.fecha_vencimiento
          );

        const diferencia =
          vencimiento - hoy;

        diasRestantes =
          Math.ceil(
            diferencia /
            (1000 * 60 * 60 * 24)
          );
      }

      // =============================
      // VALIDAR MEMBRESÍA
      // =============================

      const hoy =
  new Date();

hoy.setHours(
  0,0,0,0
);

const vencimiento =
  new Date(
    miembro.fecha_vencimiento
  );

vencimiento.setHours(
  0,0,0,0
);

const diferencia =
  vencimiento - hoy;

diasRestantes =
  Math.ceil(
    diferencia /
    (1000 * 60 * 60 * 24)
  );

const accesoPermitido =
  diasRestantes >= 0;

      // =============================
      // REGISTRAR ACCESO
      // =============================

      await pool.query(`
        INSERT INTO accesos (

          miembro_id,
          metodo_acceso,
          acceso_permitido,
          observaciones,
          dispositivo

        )
        VALUES (
          $1,
          'NFC',
          $2,
          $3,
          'PC RECEPCION'
        )
      `, [

        miembro.id,

        accesoPermitido,

        accesoPermitido
          ? 'Acceso NFC correcto'
          : 'Membresía vencida'

      ]);

      // =============================
      // RESPUESTA
      // =============================

      res.json({

        success: true,

        miembro: {

          id:
            miembro.id,

          nombre:
            miembro.nombres +
            " " +
            miembro.apellidos,

          vencimiento:
            miembro.fecha_vencimiento,

          dias_restantes:
            diasRestantes,

          estado:
            accesoPermitido
              ? "Activo"
              : "Vencido",

          ultimo_acceso:
            new Date().toLocaleString()

        }

      });

    } catch (err) {

      console.error(
        "ERROR NFC:",
        err
      );

      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  }
);

// =============================
// 🖐 ACCESO BIOMÉTRICO
// =============================

app.post(
  "/acceso-biometrico",
  async (req, res) => {

    try {

      const { credentialId } =
        req.body;

      console.log(
        "HUELLA:",
        credentialId
      );

      if (!credentialId) {

        return res.status(400).json({

          success: false,

          error:
            "Credential requerida"

        });
      }

      // =============================
      // BUSCAR MIEMBRO
      // =============================

      const resultado =
        await pool.query(`
          SELECT *
          FROM miembros
          WHERE huella_id = $1
          LIMIT 1
        `, [credentialId]);

      // NO EXISTE
      if (
        resultado.rows.length === 0
      ) {

        await pool.query(`
          INSERT INTO accesos (

            miembro_id,
            metodo_acceso,
            acceso_permitido,
            observaciones,
            dispositivo

          )
          VALUES (

            NULL,
            'BIOMETRIA',
            false,
            'Huella no reconocida',
            'PC RECEPCION'

          )
        `);

        return res.json({
          success: false
        });
      }

      const miembro =
        resultado.rows[0];

      // =============================
      // CALCULAR DÍAS
      // =============================

      let diasRestantes = 0;

      if (miembro.fecha_vencimiento) {

        const hoy =
          new Date();

        const vencimiento =
          new Date(
            miembro.fecha_vencimiento
          );

        const diferencia =
          vencimiento - hoy;

        diasRestantes =
          Math.ceil(
            diferencia /
            (1000 * 60 * 60 * 24)
          );
      }

      // =============================
      // VALIDAR
      // =============================

      const hoy =
  new Date();

hoy.setHours(
  0,0,0,0
);

const vencimiento =
  new Date(
    miembro.fecha_vencimiento
  );

vencimiento.setHours(
  0,0,0,0
);

const diferencia =
  vencimiento - hoy;

diasRestantes =
  Math.ceil(
    diferencia /
    (1000 * 60 * 60 * 24)
  );

const accesoPermitido =
  diasRestantes >= 0;

      // =============================
      // REGISTRAR ACCESO
      // =============================

      await pool.query(`
        INSERT INTO accesos (

          miembro_id,
          metodo_acceso,
          acceso_permitido,
          observaciones,
          dispositivo

        )
        VALUES (

          $1,
          'BIOMETRIA',
          $2,
          $3,
          'PC RECEPCION'

        )
      `, [

        miembro.id,

        accesoPermitido,

        accesoPermitido
          ? 'Acceso biométrico correcto'
          : 'Membresía vencida'

      ]);

      // =============================
      // RESPUESTA
      // =============================

      res.json({

        success: true,

        miembro: {

          nombre:
            miembro.nombres +
            " " +
            miembro.apellidos,

          vencimiento:
            miembro.fecha_vencimiento,

          dias_restantes:
            diasRestantes,

          estado:
            accesoPermitido
              ? "Activo"
              : "Vencido",

          ultimo_acceso:
            new Date().toLocaleString()

        }

      });

    } catch (err) {

      console.error(
        "ERROR BIOMÉTRICO:",
        err
      );

      res.status(500).json({

        success: false,

        error:
          err.message

      });
    }
  }
);

// =============================
// 🚀 INICIAR SERVIDOR
// =============================
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});