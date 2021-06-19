import express, { Express, RequestHandler, Router } from "express";
import "express-async-errors";
import { NotFoundError } from "@iagosrm/common";
import { __prod__ } from "./constants";
import { Database } from "@infrastructure";
import { Server } from "http";
import helmet from "helmet";
import cors from "cors";

interface ApplicationParams {
  middleware: { [key: string]: RequestHandler };
  userRouter: Router;
  db: Database;
}

export class Application {
  _app: Express;
  _db: Database;
  _server: Server;
  baseUrn = "api/v1";

  constructor({ middleware, userRouter, db }: ApplicationParams) {
    this._app = express();
    this._db = db;

    // CORS
    const allowlist = process.env.CORS_ALLOW?.split(" ");
    const corsOptionsDelegate = function (req, callback) {
      let corsOptions;
      if (allowlist?.indexOf(req.header("Origin")) !== -1) {
        corsOptions = { origin: true }; // reflect (enable) the requested origin in the CORS response
      } else {
        corsOptions = { origin: false }; // disable CORS for this request
      }
      callback(null, corsOptions); // callback expects two parameters: error and options
    };
    this._app.use(cors(corsOptionsDelegate));

    //Middleware
    this._app.use(middleware.json);
    this._app.use(middleware.polyglot);

    // Security
    this._app.use(helmet());
    this._app.disable("x-powered-by");

    // Routers
    this._app.use(`/${this.baseUrn}/users`, userRouter);

    this._app.all("*", () => {
      throw new NotFoundError();
    });

    this._app.use(middleware.errorHandler);
  }

  async start() {
    await this._db.init();
    if (process.env.NODE_ENV !== "test") {
      this._server = this._app.listen(
        parseInt(process.env.APP_PORT || "3000"),
        () => {
          console.log(`Listening on port ${process.env.APP_PORT}`);
        }
      );
    }
  }

  async stop() {
    this._server.close();
  }
}
