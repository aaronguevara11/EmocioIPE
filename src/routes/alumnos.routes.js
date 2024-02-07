import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const router = Router();
const prisma = new PrismaClient({
  log: ["query"],
});

//Ver alumnos registrados:
router.get("/verAlumnos", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const alumnos = await prisma.alumnos.findMany({
          include: {
            matriculas: {
              select: {
                modulo: {
                  select: {
                    nombre: true,
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
            },
          },
        });
        res.json({
          message: "Alumnos registrados: ",
          alumnos: alumnos,
        });
      }
    });
  } catch (e) {
    console.log(e);
    res.json({
      message: "error",
    });
  }
});

//Buscar alumnos según su número de dni
router.get("/buscarAlumnos", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const { dni } = req.body;
        const busqueda = await prisma.alumnos.findFirst({
          where: {
            dni: Number(dni),
          },
          select: {
            nombre: true,
            apaterno: true,
            amaterno: true,
            matriculas: {
              select: {
                modulo: {
                  select: {
                    nombre: true,
                  },
                },
              },
            },
          },
        });

        if (!busqueda) {
          res.json({
            message: "El alumno no existe",
          });
          return;
        }

        res.json({
          message: "Alumno encontrado",
          busqueda: busqueda,
        });
      }
    });
  } catch {
    res.json({
      message: "Error",
    });
  }
});

//Registrar nuevos alumnos
router.post("/registrarAlumnos", async (req, res) => {
  try {
    const { nombre, apaterno, amaterno, correo, password, numero, dni } =
      req.body;
    const alumno = await prisma.alumnos.findUnique({
      where: {
        dni: Number(dni),
      },
    });

    if (alumno) {
      res.json({
        message: "El alumno ya existe",
      });
      return;
    }

    await prisma.alumnos.create({
      data: {
        nombre: nombre,
        apaterno: apaterno,
        amaterno: amaterno,
        correo: correo,
        dni: Number(dni),
        password: password,
        numero: Number(numero),
      },
    });
    console.log("Alumno registrado");
    res.json({
      message: "Alumno registrado con éxito",
    });
  } catch (e) {
    console.log(e);
    res.json({
      message: "Error",
    });
  }
});

//Actualizar datos del alumno:
router.put("/actualizarAlumnos", async (req, res) => {
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

        const alumno = await prisma.alumnos.findUnique({
          where: { dni: Number(dni) },
        });

        if (!alumno) {
          res.json({
            message: "El alumno no existe",
          });
          return;
        }

        await prisma.alumnos.update({
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
          message: "Información del Alumno actualizada correctamente.",
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

//Borrar alumnos:
router.delete("/borrarAlumnos", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const { dni } = req.body;

        // Verifica la existencia del alumno
        const existeAlumno = await prisma.alumnos.count({
          where: {
            dni: Number(dni),
          },
        });

        if (!existeAlumno) {
          res.json({
            message: "El alumno no existe",
          });
          return;
        }

        await prisma.alumnos.delete({
          where: {
            dni: Number(dni),
          },
        });
        res.json({
          message: "El alumno ha sido borrado",
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

//Iniciar sesion
router.put("/loginAlumnos", async (req, res) => {
  try {
    const { correo = null, password = null } = req.body;
    const respuesta = await prisma.alumnos.findUnique({
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
      message: "error",
    });
  }
});

//Restablecer contraseña del alumno
router.put("/alumnoRestablecer", async (req, res) => {
  try {
    const { correo, dni } = req.body;
    const res1 = await prisma.alumnos.count({
      where: {
        correo: correo,
        dni: Number(dni),
      },
    });
    //  Validar si el usuario existe
    if (res1 == 1) {
      //  Reestablecer contraseña
      await prisma.alumnos.update({
        where: {
          dni: Number(dni),
        },
        data: {
          password: Number(dni),
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

export default router;
