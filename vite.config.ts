import { defineConfig } from "vite";
import liveReload from "vite-plugin-live-reload";

import glsl from "vite-plugin-glsl";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    hmr: false,
  },
  plugins: [
    glsl({
      compress: true,
    }),
  ],
});
