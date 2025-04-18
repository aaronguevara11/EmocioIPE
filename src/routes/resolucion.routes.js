import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const router = Router();
const prisma = new PrismaClient({
  log: ["query"],
});

router.get("/verRespuesta", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const { idNivel } = req.body;
        const respuestas = await prisma.res_resolucion.findMany({
          where: {
            idNivel,
          },
        });
        res.json({
          respuestas: respuestas,
        });
      }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      message: "Error en el servidor",
    });
  }
});
router.post("/enviarRespuesta", async (req, res) => {
  try {
    const token = req.header("Authorization");

    if (!token) {
      return res.status(401).json({ message: "Token no proporcionado" });
    }

    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        return res.status(401).json({ message: "Token inválido" });
      }

      const { idNivel, respuesta } = req.body;

      if (!respuesta || !idNivel) {
        return res.status(400).json({ message: "Faltan datos" });
      }

      try {
        await prisma.res_resolucion.create({
          data: {
            idNivel: idNivel,
            respuesta: respuesta,
            nombre: payload.nombre,
            apaterno: payload.apaterno,
          },
        });
        return res.json({ message: "Respuesta enviada" });
      } catch (dbErr) {
        console.error("Error en BD:", dbErr);
        return res.status(500).json({ message: "Error al guardar en BD" });
      }
    });
  } catch (e) {
    console.error("Error general:", e);
    return res.status(500).json({ message: "Error inesperado" });
  }
});

export default router;
