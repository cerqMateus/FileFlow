import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    include: ["src/**/*.db.test.ts"],
    environment: "node",
    fileParallelism: false,
    testTimeout: 20_000,
    hookTimeout: 20_000,
    restoreMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,
  },
});
