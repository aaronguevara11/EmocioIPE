import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const router = Router();
const prisma = new PrismaClient({
  log: ["query"],
});

// Ver matriculas
router.get("/verMatriculas", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      console.log(payload);
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const matriculas = await prisma.matriculas.findMany({
          select: {
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
          message: "Matriculas realizadas: ",
          matriculas: matriculas,
        });
      }
    });
  } catch {
    res.json({
      message: "Error ",
    });
  }
});

// Buscar matricula
router.get("/buscarMatricula", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const { id } = req.body;
        const bm = await prisma.matriculas.findUnique({
          where: {
            id: Number(id),
          },
        });

        if (!bm) {
          res.json({
            message: "La matricula no existe o ha sido borrada",
          });
        }

        const result = await prisma.matriculas.findFirst({
          where: {
            id: Number(id),
          },
          select: {
            estado: true,
            alumnos: {
              select: {
                nombre: true,
                amaterno: true,
                apaterno: true,
              },
            },
            modulo: {
              select: {
                nombre: true,
              },
            },
          },
        });
        res.json({
          message: "Matriculas realizadas: ",
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

// Matricular alumno:
router.post("/matricularAlumno", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      console.log(payload);
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const { idModulo } = req.body;
        // Verifica si el modulo existe
        const modulo = await prisma.modulo.findUnique({
          where: {
            id: Number(idModulo),
          },
        });
        if (!modulo) {
          return res.json({
            message: "El modulo no existe",
          });
        }
        // Verifica si el alumno ya está matriculado en el modulo
        const matriculas = await prisma.matriculas.findMany({
          where: {
            dniAlumno: Number(payload.dni),
            idModulo: Number(idModulo),
          },
        });

        if (matriculas.length > 0) {
          return res.json({
            message: "El alumno ya está matriculado en este curso",
          });
        }

        // Matricula al alumno
        await prisma.matriculas.create({
          data: {
            idModulo: Number(idModulo),
            dniAlumno: Number(payload.dni),
          },
        });
        res.json({
          message: "Alumno matriculado con éxito",
        });
      }
    });
  } catch {
    res.json({
      message: "Error",
    });
  }
});

// Borrar matriculas
router.delete("/borrarMatricula", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const { id } = req.body;
        const em = await prisma.matriculas.findUnique({
          where: {
            id: Number(id),
          },
        });

        if (!em) {
          res.json({
            message: "La matricula no existe",
          });
        }

        await prisma.matriculas.delete({
          where: { id: Number(id) },
        });
        res.json({
          message: "La matricula ha sido borrada con exito",
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
