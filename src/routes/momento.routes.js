import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const router = Router();
const prisma = new PrismaClient({
  log: ["query"],
});

// Ver momentos
router.get("/verMomentos", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      console.log(payload);
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const momentos = await prisma.momentos.findMany({
          select: {
            id: true,
            modulo: {
              select: {
                nombre: true,
                descripcion: true,
                docente: {
                  select: {
                    nombre: true,
                    apaterno: true,
                    amaterno: true,
                  },
                },
              },
            },
          },
        });
        res.json({
          message: "Momentos registrados ",
          momentos: momentos,
        });
      }
    });
  } catch {
    res.json({
      message: "Error ",
    });
  }
});

// Registrar momento
router.post("/crearMomento", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const { numeroMomento, nombre } = req.body;
        const cm = await prisma.momentos.findUnique({
          where: {
            numeroMomento: Number(numeroMomento),
          },
        });

        if (cm) {
          res.json({
            message: "El momento ya existe",
          });
        }
        await prisma.momentos.create({
          data: {
            nombre: nombre,
            numeroMomento: numeroMomento,
          },
        });
        res.json({
          message: "El momento ha sido creado con exito",
        });
      }
    });
  } catch {
    res.json({
      message: "error",
    });
  }
});

// Buscar momento:
router.get("/buscarMomento", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const { id } = req.body;
        const result = await prisma.momentos.findFirst({
          where: {
            id: Number(id),
          },
          select: {
            nombre: true,
            modulo: {
              select: {
                nombre: true,
                matriculas: {
                  select: {
                    alumnos: {
                      select: {
                        nombre: true,
                        amaterno: true,
                        apaterno: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });
        if (!result) {
          res.json({
            message: "El momento no existe",
          });
        }

        res.json({
          message: "Momentos registrados",
          result: result,
        });
      }
    });
  } catch {
    res.json({
      message: "error",
    });
  }
});

// Borrar momento:
router.delete("/eliminarMomento", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const { id } = req.body;

        // Verifica si el momento existe
        const momento = await prisma.momentos.findUnique({
          where: {
            id: Number(id),
          },
        });

        if (!momento) {
          return res.json({
            message: "El momento no existe",
          });
        }

        // Elimina el momento
        await prisma.momentos.delete({
          where: {
            id: Number(id),
          },
        });
        res.json({
          message: "El momento ha sido borrado con éxito",
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
