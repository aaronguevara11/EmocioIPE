import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const router = Router();
const prisma = new PrismaClient({
  log: ["query"],
});

// Ver temas
router.get("/verTemas", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const docente = payload.dni;
        const tema1 = await prisma.modulo.findMany({
          where: {
            dniDocente: docente,
          },
          select: {
            id: true,
            nombre: true,
            descripcion: false,
            tema: {
              select: {
                titulo: true,
                subtema: {
                  select: {
                    titulo: true,
                  },
                },
              },
            },
          },
        });
        if (!tema1) {
          res.json({
            message: "El tema no existe",
          });
        }
        res.json({
          message: "Temas registrados: ",
          temas: tema1,
        });
      }
    });
  } catch {
    res.json({
      message: "Error",
    });
  }
});

// Agregar tema:
router.post("/agregarTemas", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({ message: "Error en el token" });
      } else {
        const { titulo, id: idModulo } = req.body;

        const modulo = await prisma.modulo.findUnique({
          where: {
            id: Number(idModulo),
            dniDocente: Number(payload.dni),
          },
        });

        if (!modulo) {
          res.json({ message: "El usuario no es docente del modulo" });
          return;
        }

        await prisma.tema.create({
          data: {
            idModulo: Number(idModulo),
            titulo: titulo,
          },
        });

        res.json({ message: "Tema agregado con exito" });
      }
    });
  } catch (error) {
    res.json({
      message: "Error",
    });
  }
});

// Actualizar temas:
router.put("/actualizarTemas", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const { id, titulo } = req.body;
        await prisma.tema.update({
          where: {
            id: Number(id),
          },
          data: {
            titulo: titulo,
          },
        });
        res.json({
          message: "Tema actualizado con exito",
        });
      }
    });
  } catch {
    res.json({
      message: "Error",
    });
  }
});

// Borrar tema:
router.delete("/borrarTemas", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const { id } = req.body;

        const existeTema = await prisma.tema.findFirst({
          where: {
            id: Number(id),
          },
        });

        if (!existeTema) {
          res.json({
            message: "El tema no existe",
          });
          return;
        }

        await prisma.tema.delete({
          where: {
            id: Number(id),
          },
        });

        res.json({
          message: "El tema se borro con exito",
        });
      }
    });
  } catch {
    res.json({
      message: "Error",
    });
  }
});

// Buscar temas
router.get("/buscarTemas", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const { id } = req.body;
        const docente = payload.dni;
        const tema1 = await prisma.modulo.findUnique({
          where: {
            id: Number(id),
            dniDocente: docente,
          },
          select: {
            nombre: true,
            tema: {
              select: {
                titulo: true,
              },
            },
          },
        });
        if (!tema1) {
          res.json({
            message: "El tema no existe",
          });
        }
        res.json({
          message: "Temas registrados: ",
          temas: tema1,
        });
      }
    });
  } catch {
    res.json({
      message: "Error",
    });
  }
});

export default router;
