import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const router = Router();
const prisma = new PrismaClient({
  log: ["query"],
});

// Ver modulos registrados
router.get("/verModulos", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Hubo un error en el token",
        });
      } else {
        const dniDocente = Number(payload.dni);

        // Obtiene los modulos del docente
        const modulos = await prisma.modulo.findMany({
          where: {
            dniDocente: dniDocente,
          },
          select: {
            id: true,
            nombre: true,
            descripcion: true,
            idMomento: true,
            tema: {
              select: {
                id: true,
                titulo: true,
              },
            },
            momentos: {
              select: {
                numeroMomento: true,
              },
            },
            matriculas: {
              select: {
                alumnos: {
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
          message: "Modulos registrados",
          modulos: modulos,
        });
      }
    });
  } catch {
    res.json({
      message: "Error en el sistema",
    });
  }
});

// Crear modulos
router.post("/crearModulo", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const resultado = await prisma.docente.findUnique({
          where: {
            dni: Number(payload.dni),
          },
        });
        if (!resultado) {
          res.json({
            message: "El docente no existe o borro la cuenta",
          });
        } else {
          const { nombre, descripcion, idMomento } = req.body;
          await prisma.modulo.create({
            data: {
              nombre: nombre,
              descripcion: descripcion,
              idMomento: Number(idMomento),
              dniDocente: Number(payload.dni),
            },
          });
          res.json({
            message: "El modulo ha sido creado con exito",
          });
        }
      }
    });
  } catch {
    res.json({
      message: "error",
    });
  }
});

// Actualizar modulo
router.put("/actualizarModulo", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const { id, nombre, descripcion } = req.body;

        const modulo = await prisma.modulo.findUnique({
          where: {
            id: Number(id),
            dniDocente: Number(payload.dni),
          },
        });

        if (!modulo) {
          res.json({
            message:
              "El usuario no es docente del modulo y/o el modulo no existe",
          });
          return;
        }

        await prisma.modulo.update({
          where: { id: Number(id) },
          data: {
            nombre: nombre,
            descripcion: descripcion,
          },
        });
        res.json({
          message: "Modulo actualizado con exito",
        });
      }
    });
  } catch {
    res.json({
      message: "Error",
    });
  }
});

// Borrar modulo
router.delete("/eliminarModulo", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const { id } = req.body;

        // Verifica si el curso existe
        const modulo = await prisma.modulo.findUnique({
          where: {
            id: Number(id),
            dniDocente: Number(payload.dni),
          },
        });

        if (!modulo) {
          return res.json({
            message: "El modulo no existe o no es docente del modulo",
          });
        }

        // Elimina el curso
        await prisma.modulo.delete({
          where: {
            id: Number(id),
          },
        });
        res.json({
          message: "El modulo ha sido borrado con éxito",
        });
      }
    });
  } catch {
    res.json({
      message: "Error",
    });
  }
});

// Buscar modulo
router.get("/buscarModulo", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const { id } = req.body;
        const result = await prisma.modulo.findFirst({
          where: {
            id: id,
          },
          select: {
            id: false,
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
        });
        if (!result) {
          res.json({
            message: "El modulo no existe",
          });
        }
        res.json({
          message: "Modulo encontrados:",
          result: result,
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
