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
        const respuestas = await prisma.res_ordenalo.findMany({
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
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const { idNivel, orden1, orden2, orden3, orden4, orden5 } = req.body;
        const nombre = payload.nombre;
        const apaterno = payload.apaterno;

        await prisma.res_ordenalo.create({
          data: {
            idNivel: idNivel,
            orden1: orden1,
            orden2: orden2,
            orden3: orden3,
            orden4: orden4,
            orden5: orden5,
            nombre: nombre,
            apaterno: apaterno,
          },
        });
        res.json({
          message: "Respuesta enviada",
        });
      }
    });
  } catch (e) {
    console.log(e);
    res.json({
      message: "Error",
    });
  }
});

export default router;
