import "dotenv/config";
import express, { Express, Request, Response } from "express";
import { Middleware } from "postgraphile";
import { installPostgraphile } from "./middlewares";

//handing to enable the subscription
export function getWebsocketMiddlewares(
  app: Express
): Middleware<Request, Response>[] {
  return app.get("websocketMiddlewares");
}

const makeApp = () => {
  const app = express();

  installPostgraphile(app);

  app.listen(process.env.PORT, () => {
    console.log(
      `Server running on http://localhost:${process.env.PORT}/graphiql`
    );
  });
};

export default makeApp;
