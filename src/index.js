import express from "express";
import cors from "cors";
import alumnosRoutes from "./routes/alumnos.routes.js";
import docentesRoutes from "./routes/docentes.routes.js";
import matriculasRoutes from "./routes/matriculas.routes.js";
import momentosRoutes from "./routes/momento.routes.js";
import moduloRoutes from "./routes/modulo.routes.js";
import temasRoutes from "./routes/tema.routes.js";
import subtemaRoutes from "./routes/subtema.routes.js";
import contenidoRoutes from "./routes/contenido.routes.js";

const app = express();

app.use(express.json());

app.use(cors());

app.use("/app2", alumnosRoutes);
app.use("/app2", docentesRoutes);
app.use("/app2", matriculasRoutes);
app.use("/app2", momentosRoutes);
app.use("/app2", moduloRoutes);
app.use("/app2", temasRoutes);
app.use("/app2", subtemaRoutes);
app.use("/app2", contenidoRoutes);

app.listen(3000);
console.log("Server on port", 3000);
