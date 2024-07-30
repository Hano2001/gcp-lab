import express, { NextFunction } from "express";
import bunyan from "bunyan";
import { v4 } from "uuid";

const log = bunyan.createLogger({
  name: "gcp-lab",
  serializers: bunyan.stdSerializers,
});

const app = express();
const port = 3000;

app.use((req: any, res, next: NextFunction) => {
  req.log = log.child({ req_id: v4() }, true);
  req.log.info({ req: req });
  res.on("finish", () => req.log.info({ res }));
  next();
});

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/status", (req, res) => {
  res.sendStatus(200);
});

app.post("/payments", (req, res) => {
  res.json(req.body);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

app.use((err: any, req: any, res: any, next: NextFunction) => {
  req.log.error({ err });
  res.status(500).json("Internal server error");
});
