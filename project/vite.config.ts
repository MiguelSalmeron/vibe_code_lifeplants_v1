import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// When running with the Firebase Functions emulator, set this to:
//   http://127.0.0.1:5001
// The proxy will rewrite /api/chat → /life--plants-app/us-central1/chat, etc.
const functionsEmulatorOrigin = process.env.VITE_RAIZ_FUNCTIONS_ORIGIN;
const firebaseProject = "life--plants-app";
const firebaseRegion  = "us-central1";

export default defineConfig({
  plugins: [reactRouter(), tsconfigPaths()],
  server: functionsEmulatorOrigin
    ? {
        proxy: {
          "/api": {
            target: functionsEmulatorOrigin,
            changeOrigin: true,
            // /api/chat → /{project}/{region}/chat
            // /api/tts  → /{project}/{region}/tts
            rewrite: (path) =>
              path.replace(
                /^\/api\/(.+)/,
                `/${firebaseProject}/${firebaseRegion}/$1`,
              ),
          },
        },
      }
    : undefined,
});
