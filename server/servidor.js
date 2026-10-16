import express from 'express' // es como encender el motor: me permite crear las rutas
import cors from 'cors' // medida de seguridad
import mysql from 'mysql2/promise' // la conexión a la BD usando node.js

const app = express() // creo el servidor
app.use(cors()) // permitir que otros dominios hagan peticiones
app.use(express.json()) // convierte las peticiones a objetos de js

const conexion = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'sistema_de_tueste_cafe',
})

// Ruta para obtener 5 preguntas al azar con sus opciones
app.get('/api/preguntas', async (req, res) => {
  try {
    const cantidad = 5

    // 1) Traer 5 preguntas al azar de la base de datos
    const [preguntas] = await conexion.query(
      'SELECT id_pregunta, enunciado FROM pregunta ORDER BY RAND() LIMIT ?',
      [cantidad],
    )

    // si no hay preguntas, se detiene
    if (preguntas.length === 0) {
      return res.json([])
    }

    // 2) Obtener los IDs de esas preguntas para buscar sus opciones
    const ids = preguntas.map((p) => p.id_pregunta)
    const [opciones] = await conexion.query(
      'SELECT id_pregunta, letra, texto, es_correcta FROM opcion_respuesta WHERE id_pregunta IN (?) ORDER BY letra',
      [ids],
    )

    // 3) Unir cada pregunta con sus respectivas opciones
    const resultado = preguntas.map((p) => ({
      id: p.id_pregunta,
      enunciado: p.enunciado,
      opciones: opciones
        .filter((o) => o.id_pregunta === p.id_pregunta)
        .map((o) => ({
          letra: o.letra,
          texto: o.texto,
          correcta: o.es_correcta === 1,
        })),
    }))

    // Devolvemos el paquete listo en formato JSON
    res.json(resultado)
  } catch (error) {
    console.error('Error al obtener preguntas:', error)
    res
      .status(500)
      .json({ error: 'Error al obtener preguntas de la base de datos' })
  }
})

// Encender el servidor en el puerto 3000
const PUERTO = 3000
app.listen(PUERTO, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PUERTO}`)
})
