import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const router = Router();
const prisma = new PrismaClient({
  log: ["query"],
});

router.get("/verRespuestas", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const { idNivel } = req.body;

        const docentes = await prisma.res_emotiMatch.findMany({
          where: {
            idNivel: idNivel,
          },
        });
        res.json({
          message: "Respuestas: ",
          respuestas: docentes,
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

router.post("/enviarRespuesta", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const { idNivel } = req.body;
        const idAlumno = payload.dni;
        const nombre = payload.nombre;
        const apaterno = payload.apaterno;

        await prisma.res_emotiMatch.create({
          data: {
            idNivel: idNivel,
            respuesta: "Enviado",
            dniAlumno: Number(idAlumno),
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

router.delete("/eliminarRespuesta", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const { id } = req.body;

        const borrar = await prisma.res_emotiMatch.delete({
          where: {
            id: Number(id),
          },
        });

        res.json({
          message: "Respuesta borrada con éxito",
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
