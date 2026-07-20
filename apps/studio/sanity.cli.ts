import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || "jnxqbr4r",
    dataset: process.env.SANITY_STUDIO_DATASET || "production",
  },
  typegen: {
    path: "./schemaTypes/**/*.{ts,tsx}",
    generates: "../../apps/web/sanity.types.ts",
    overloadClientMethods: false,
  },
});
