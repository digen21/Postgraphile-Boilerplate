import { Express } from "express";
import { resolve } from "path";
import postgraphile from "postgraphile";
import { makePgSmartTagsFromFilePlugin } from "postgraphile/plugins";
import { handleErrors } from "../helpers";

const TagsFilePlugin = makePgSmartTagsFromFilePlugin(
  // We're using JSONC for VSCode compatibility; also using an explicit file
  // path keeps the tests happy.
  resolve(__dirname, "../../postgraphile.tags.jsonc")
);

const isDev = process.env.NODE_ENV !== "production";

console.log("process.env.DATABASE_URL", process.env.DATABASE_URL);

const installPostgraphile = (app: Express) => {
  app.use(
    postgraphile(process.env.DATABASE_URL, "app_public", {
      watchPg: true,
      enhanceGraphiql: true,
      graphiql: true,
      retryOnInitFail: true,
      appendPlugins: [TagsFilePlugin],
      dynamicJson: true,
      subscriptions: true,
      ignoreRBAC: false,
      handleErrors,
      ignoreIndexes: false,
      disableQueryLog: true,
      sortExport: true,
      exportGqlSchemaPath: isDev
        ? `${__dirname}/../graphql/schema.graphql`
        : undefined,
    })
  );
};

export default installPostgraphile;
