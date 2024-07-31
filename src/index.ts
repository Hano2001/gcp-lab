import express, { NextFunction } from "express";
import bunyan from "bunyan";
import { v4 } from "uuid";

type Payment = {
  id: string;
  carId: string;
  amount: number;
};

const payments: Payment[] = [{ id: "1", carId: "whatevs", amount: 666 }];

type Outbox = {
  carId: string;
};
const outbox: Outbox[] = [
  {
    carId: "whatevs",
  },
];

const log = bunyan.createLogger({
  name: "gcp-lab",
  serializers: bunyan.stdSerializers,
});

const app = express();
const port = 3000;

app.use((req: any, res, next: NextFunction) => {
  req.log = log.child({ req_id: v4() }, true);
  req.log.info({ message: req.method, req: req });
  res.on("finish", () => req.log.info({ message: "Response!", res }));
  next();
});

app.use(express.json());

app.get("/payments", (req, res) => {
  log.info({ message: "GET payments", req: req });
  res.json(payments);
});

app.get("/status", (req, res) => {
  log.info({ message: "It's aliiive!", req: req });
  res.sendStatus(200);
});

app.post("/payments", async (req, res) => {
  log.info({ message: "Payment received", req: req });
  const newPayment = { id: v4(), ...req.body };
  await payments.push(newPayment);
  await outbox.push({ carId: newPayment.carId });
  const result = await fetch(
    "https://gcp-lab-ynorbbawua-lz.a.run.app/payments",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ carId: newPayment.carId }),
    }
  );
  if (result.status == 200)
    outbox.filter((item) => {
      item.carId != newPayment.carId;
    });
  res.json(newPayment);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

app.use((err: any, req: any, res: any, next: NextFunction) => {
  req.log.error({ message: err.message, err });
  res.status(500).json("Internal server error");
});
