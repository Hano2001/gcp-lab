import "dotenv/config";
import express, { NextFunction } from "express";
import bunyan from "bunyan";
import { v4 } from "uuid";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./db/schema.js";
import postgres from "postgres";
import { eq } from "drizzle-orm/pg-core/expressions";

type Payment = {
  id: string;
  carId: string;
  amount: number;
};

type Outbox = {
  carId: string;
};

const log = bunyan.createLogger({
  name: "gcp-lab",
  serializers: bunyan.stdSerializers,
});
const dbUrl = process.env.POSTGRES_URL!;

const client = postgres(dbUrl);

const db = drizzle(client, { schema });

const app = express();
const port = 8080;

app.use((req: any, res, next: NextFunction) => {
  req.log = log.child({ req_id: v4() }, true);
  req.log.info({ message: req.method, req: req });
  res.on("finish", () => req.log.info({ message: "Response!", res }));
  next();
});

app.use(express.json());

app.get("/payments", async (req, res) => {
  try {
    log.info({ message: "GET payments", req: req });
    const payments = await db.query.payments.findMany();
    res.json(payments);
  } catch (error) {
    res.status(500).json("Failed to get payments from database");
  }
});

app.get("/status", (req, res) => {
  log.info({ message: "It's aliiive!", req: req });
  res.sendStatus(200);
});

app.post("/payments", async (req, res) => {
  try {
    log.info({ message: "Payment received", req: req });
    const newPayment = { ...req.body };

    const insertedPayment = await db.transaction(async (tx) => {
      await tx.insert(schema.payments).values(newPayment);
      await tx
        .insert(schema.paymentsOutbox)
        .values({ carId: newPayment.carId });

      const insertedPayment = await tx.query.payments.findFirst({
        where: eq(schema.payments.carId, newPayment.carId),
      });
      return insertedPayment;
    });

    const result = await fetch(
      "https://gha-gcp-lab-ynorbbawua-lz.a.run.app/cars",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ carId: insertedPayment!.carId }),
      },
    );
    if (result.status == 200) {
      await db
        .delete(schema.paymentsOutbox)
        .where(eq(schema.paymentsOutbox.carId, insertedPayment!.carId));
    }

    res.json(insertedPayment);
  } catch (error) {
    res.status(500).json("Failed to post payment to database");
  }
});

app.listen(port, async () => {
  console.log(`Example app listening on port ${port}`);
});

app.use((err: any, req: any, res: any, next: NextFunction) => {
  req.log.error({ message: err.message, err });
  res.status(500).json("Internal server error");
});
