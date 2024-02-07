import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const router = Router();
const prisma = new PrismaClient({
  log: ["query"],
});

// Ver subtemas
router.get("/verSubtemas", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const { id: idModulo } = req.body;
        const es = await prisma.modulo.findUnique({
          where: {
            id: Number(idModulo),
            dniDocente: Number(payload.dni),
          },
        });

        if (!es) {
          res.json({
            message: "El modulo no existe o no es docente",
          });
        }

        const tema1 = await prisma.tema.findMany({
          where: {
            idModulo: Number(idModulo),
          },
          select: {
            id: true,
            titulo: true,
            subtema: {
              select: {
                titulo: true,
                descripcion: true,
              },
            },
          },
        });
        if (!tema1) {
          res.json({
            message: "El subtema no existe",
          });
        }
        res.json({
          message: "Subtemas registrados: ",
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

// Agregar subtemas:
router.post("/agregarSubtemas", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const { idModulo, idTema, titulo, descripcion } = req.body;
        const modulo = await prisma.tema.findUnique({
          where: {
            id: Number(idTema),
            idModulo: Number(idModulo),
          },
        });

        if (!modulo) {
          res.json({
            message: "El tema y/o el modulo no existen",
          });
          return;
        }

        await prisma.subtema.create({
          data: {
            idTema: Number(idTema),
            titulo: titulo,
            descripcion: descripcion,
          },
        });

        res.json({
          message: "Subtema agregado con exito",
        });
      }
    });
  } catch {}
});

// Actualizar subtema
router.put("/actualizarSubtemas", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const { id, titulo, descripcion } = req.body;

        await prisma.subtema.update({
          where: {
            id: Number(id),
          },
          data: {
            titulo: titulo,
            descripcion: descripcion,
          },
        });
        res.json({
          message: "Subtema actualizado con exito",
        });
      }
    });
  } catch {
    res.json({
      message: "Error",
    });
  }
});

//Borrar subtema
router.delete("/borrarSubtemas", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const { id } = req.body;

        const existeTema = await prisma.subtema.findFirst({
          where: {
            id: Number(id),
          },
        });

        if (!existeTema) {
          res.json({
            message: "El subtema no existe",
          });
          return;
        }

        await prisma.subtema.delete({
          where: {
            id: Number(id),
          },
        });

        res.json({
          message: "El subtema se borro con exito",
        });
      }
    });
  } catch {
    res.json({
      message: "Error",
    });
  }
});

// Buscar subtemas
router.get("/buscarSubtemas", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const { id } = req.body;
        const subtema1 = await prisma.subtema.findFirst({
          where: {
            id: Number(id),
          },
          select: {
            titulo: true,
          },
        });
        if (!tema1) {
          res.json({
            message: "El subtema no existe",
          });
        }
        res.json({
          message: "Subtemas registrados: ",
          temas: subtema1,
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
