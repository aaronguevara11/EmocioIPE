import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const router = Router();
const prisma = new PrismaClient({
  log: ["query"],
});

// Ver contenido
router.get("/verContenido", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const tema1 = await prisma.contenido.findMany({
          select: {
            id: true,
            subtema: {
              select: {
                id: true,
                titulo: true,
                descripcion: true,
              },
            },
            contenido: true,
          },
        });
        if (!tema1) {
          res.json({
            message: "El contenido no existe",
          });
        }
        res.json({
          message: "Contenido agregados: ",
          contenido: tema1,
        });
      }
    });
  } catch {
    res.json({
      message: "Error",
    });
  }
});

// Agregar contenido:
router.post("/agregarContenido", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const { idSubtema, contenido } = req.body;

        const modulo = await prisma.subtema.findUnique({
          where: {
            id: Number(idSubtema),
          },
        });

        if (!modulo) {
          res.json({
            message: "El tema y/o el subtema no existe ",
          });
          return;
        }

        await prisma.contenido.create({
          data: {
            idSubtema: idSubtema,
            contenido: contenido,
          },
        });

        res.json({
          message: "Contenido agregado con exito",
        });
      }
    });
  } catch {
    res.json({
      message: "error",
    });
  }
});

// Actualizar contenido:
router.put("/actualizarContenido", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const { id, contenido } = req.body;
        const st = await prisma.contenido.findUnique({
          where: {
            id: Number(id),
          },
        });

        if (!st) {
          res.json({
            message: "El contenido no ha sido encontrado o no existe",
          });
        }

        await prisma.contenido.update({
          where: {
            id: Number(id),
          },
          data: {
            contenido: contenido,
          },
        });
        res.json({
          message: "Contenido actualizado con exito",
        });
      }
    });
  } catch {
    res.json({
      message: "Error",
    });
  }
});

// Borrar contenido:
router.delete("/borrarContenido", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const { id } = req.body;

        const existeContenido = await prisma.contenido.findFirst({
          where: {
            id: Number(id),
          },
        });

        if (!existeContenido) {
          res.json({
            message: "El contenido no existe",
          });
          return;
        }

        await prisma.contenido.delete({
          where: {
            id: Number(id),
          },
        });

        res.json({
          message: "El contenido se borro con exito",
        });
      }
    });
  } catch {
    res.json({
      message: "Error",
    });
  }
});

// Buscar contenido
router.get("/buscarContenido", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const { id: idSubtema } = req.body;
        const sub = await prisma.subtema.findUnique({
          where: {
            id: Number(idSubtema),
          },
        });

        if (!sub) {
          res.json({
            message: "Subtema no encontrado o no existe",
          });
        }

        const tema1 = await prisma.contenido.findMany({
          where: {
            idSubtema: Number(idSubtema),
          },
          select: {
            subtema: {
              select: {
                titulo: true,
                descripcion: true,
              },
            },
            contenido: true,
          },
        });
        if (!tema1) {
          res.json({
            message: "El contenido no existe",
          });
        }
        res.json({
          message: "Contenido agregados: ",
          contenido: tema1,
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
