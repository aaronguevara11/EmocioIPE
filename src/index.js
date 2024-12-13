import express from "express";
import cors from "cors";
import alumnosRoutes from "./routes/alumnos.routes.js";
import docentesRoutes from "./routes/docentes.routes.js";
import emotiquizRoutes from "./routes/emotiquiz.routes.js";
import comunicacionRoutes from "./routes/comunicacion.routes.js";
import trabajoRoutes from "./routes/trabajo.routes.js";
import liderazgoRoutes from "./routes/liderazgo.routes.js";
import resolucionRoutes from "./routes/resolucion.routes.js";
import modulo3Routes from "./routes/modulo3.routes.js";
import actuaRoutes from "./routes/actua.routes.js";
import ordenaloRoutes from "./routes/ordenalo.routes.js";

const app = express();

app.use(express.json());

app.use(cors());

app.use("/app", alumnosRoutes);
app.use("/app", docentesRoutes);
app.use("/app/emotiquiz", emotiquizRoutes);
app.use("/app/comunicacion", comunicacionRoutes);
app.use("/app/trabajo", trabajoRoutes);
app.use("/app/liderazgo", liderazgoRoutes);
app.use("/app/resolucion", resolucionRoutes);
app.use("/app/modulo3", modulo3Routes);
app.use("/app/actua", actuaRoutes);
app.use("/app/ordenalo", ordenaloRoutes);
app.listen(3000);
console.log("Server on port", 3000);
