import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: "0.0.0.0",
  },
  plugins: [react()],
  assetsInclude: ["**/*.onnx", "**/*.wasm"], // This tells Vite to handle .onnx and .wasm files correctly
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined, // Optional: prevents excessive code splitting if you're hosting your PeerJS/VAD in a simple project
      },
    },
  },
});
