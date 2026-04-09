from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import traceback

app = Flask(__name__)
CORS(app)

# =========================
# CONEXIÓN SQLITE
# =========================
conn = sqlite3.connect("gym.db", check_same_thread=False)
cursor = conn.cursor()

# Crear tabla si no existe
cursor.execute("""
CREATE TABLE IF NOT EXISTS miembros (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombres TEXT,
    apellidoPaterno TEXT,
    apellidoMaterno TEXT,
    telefono TEXT,
    correo TEXT,
    fechaNacimiento TEXT,
    huella INTEGER,
    fechaRegistro TEXT DEFAULT CURRENT_TIMESTAMP
)
""")
conn.commit()


# =========================
# INSERTAR MIEMBRO
# =========================
@app.route('/api/miembros', methods=['POST'])
def registrar_miembro():
    data = request.get_json()

    print("📩 Datos recibidos:", data)

    if not data:
        return jsonify({"error": "No se recibieron datos"}), 400

    try:
        cursor.execute("""
            INSERT INTO miembros
            (nombres, apellidoPaterno, apellidoMaterno, telefono, correo, fechaNacimiento, huella)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            data.get("nombres"),
            data.get("apellidoPaterno"),
            data.get("apellidoMaterno"),
            data.get("telefono"),
            data.get("correo"),
            str(data.get("fechaNacimiento") or ""),
            int(data.get("huella") or 0)
        ))

        conn.commit()

        print("✅ Insert exitoso")

        return jsonify({
            "mensaje": "Miembro guardado correctamente"
        }), 200

    except Exception as e:
        print("❌ Error al insertar:")
        traceback.print_exc()
        return jsonify({
            "error": str(e)
        }), 500


# =========================
# OBTENER MIEMBROS
# =========================
@app.route('/api/miembros', methods=['GET'])
def obtener_miembros():
    try:
        cursor.execute("SELECT * FROM miembros")
        rows = cursor.fetchall()

        resultado = []

        for row in rows:
            resultado.append({
                "id": row[0],
                "nombres": row[1],
                "apellidoPaterno": row[2],
                "apellidoMaterno": row[3],
                "telefono": row[4],
                "correo": row[5],
                "fechaNacimiento": row[6],
                "huella": row[7],
                "fechaRegistro": row[8]
            })

        return jsonify(resultado)

    except Exception as e:
        print("❌ Error al consultar:")
        traceback.print_exc()
        return jsonify({
            "error": str(e)
        }), 500


# =========================
# INICIAR SERVIDOR
# =========================
if __name__ == '__main__':
    app.run(port=3000, debug=True)