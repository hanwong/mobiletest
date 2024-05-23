import { mergeConfig } from "vite"
import { app } from "./vite.config.root"

export default mergeConfig(app, {
  resolve: { alias: { "../scripts/ui": "../scripts/web" } },
  server: { port: 2048 },
})
