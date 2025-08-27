import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tsconfigPaths from "vite-tsconfig-paths"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  build: {
    outDir: "dist",
    // Gera sourcemap só em desenvolvimento (útil pra debug local, mas não pesa no deploy)
    sourcemap: process.env.NODE_ENV !== "production",
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("@supabase/supabase-js")) {
              return "supabase"
            }
            return "vendor"
          }
        }
      }
    }
  }
})

})
