import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const router = Router();
const prisma = new PrismaClient({
  log: ["query"],
});

//Ver docentes
router.get("/verDocentes", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const docentes = await prisma.docente.findMany({
          select: {
            nombre: true,
            apaterno: true,
            amaterno: true,
            modulo: {
              select: {
                nombre: true,
              },
            },
          },
        });
        res.json({
          message: "Docentes registrados: ",
          docentes: docentes,
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

//Registrar docentes:
router.post("/registrarDocentes", async (req, res) => {
  try {
    const { nombre, apaterno, amaterno, correo, numero, dni, password } =
      req.body;

    const docente = await prisma.docente.findUnique({
      where: {
        dni: Number(dni),
      },
    });

    if (docente) {
      res.json({
        message: "El docente ya existe",
      });
      return;
    }

    await prisma.docente.create({
      data: {
        dni: dni,
        nombre: nombre,
        apaterno: apaterno,
        amaterno: amaterno,
        correo: correo,
        password: password,
        numero: numero,
      },
    });
    console.log("Docente registrado");
    res.json({
      message: "Docente registrado con éxito",
    });
  } catch (e) {
    console.log(e);
    res.json({
      message: "Error",
    });
  }
});

//Actualizar docentes:
router.put("/actualizarDocentes", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const { nombre, apaterno, amaterno, correo, numero, dni, password } =
          req.body;
        const up = await prisma.docente.findUnique({
          where: {
            dni: Number(dni),
          },
        });

        if (!up) {
          res.json({
            message: "El docente no existe",
          });
          return;
        }

        await prisma.docente.update({
          where: { dni: Number(dni) },
          data: {
            nombre: nombre,
            apaterno: apaterno,
            amaterno: amaterno,
            correo: correo,
            password: password,
            numero: numero,
          },
        });
        res.json({
          message: "Docente actualizado",
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

//Borrar docentes:
router.delete("/borrarDocentes", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const { dni } = req.body;
        const dc = await prisma.docente.delete({
          where: {
            dni: Number(dni),
          },
        });
        if (!dc) {
          res.json({
            message: "El docente no existe",
          });
          return;
        }

        res.json({
          message: "El docente se borro con exito",
        });
      }
    });
  } catch (e) {
    console.log(e);
    res.json({
      message: "Docente no encontrado",
    });
  }
});

//Iniciar sesion:
router.put("/loginDocentes", async (req, res) => {
  try {
    const { correo = null, password = null } = req.body;
    const respuesta = await prisma.docente.findUnique({
      where: {
        correo,
        password,
      },
    });
    if (respuesta == null) {
      res.json({
        message: "Datos incorrectos",
      });
    } else {
      const token = jwt.sign(respuesta, process.env.JWT_KEY, {
        expiresIn: 3600,
      });
      res.json({
        message: "Loggeo exitoso",
        token,
      });
    }
  } catch (e) {
    console.log(e);
    res.json({
      message: "Error",
    });
  }
});

// Reestablecer contraseña:
router.put("/passwordDocente", async (req, res) => {
  try {
    const { correo, dni } = req.body;
    const res1 = await prisma.docente.count({
      where: {
        correo: correo,
        dni: dni,
      },
    });
    // Validar si el usuario existe
    if (res1 == 1) {
      // Reestablecer
      await prisma.docente.update({
        where: {
          dni: dni,
        },
        data: {
          password: dni,
        },
      });
      res.json({
        message: "Contraseña actualizada con exito",
      });
    } else {
      res.json({
        message: "Datos no encontrados",
      });
    }
  } catch {
    res.json({
      message: "error",
    });
  }
});

//Eliminar cuenta
router.delete("/eliminarDocente", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const { password } = req.body;
        const verifica = await prisma.docente.findUnique({
          where: {
            dni: Number(payload.dni),
            password: password,
          },
        });
        if (verifica == null) {
          res.json({
            message: "Contraseña incorrecta",
          });
        } else {
          await prisma.docente.delete({
            where: {
              dni: Number(payload.dni),
            },
          });
          res.json({
            message: "Cuenta eliminada con exito",
          });
        }
      }
    });
  } catch {
    res.json({
      message: "Error",
    });
  }
});

export default router;
