import { resolve } from "node:path";
import type { Plugin } from "vite";
import { defineConfig } from "vitest/config";

const pages = ["index", "clocks", "alarm", "stopwatch", "countdown"];

const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data: https://upload.wikimedia.org https://thumb.wikimedia.org",
  "connect-src 'self' https://commons.wikimedia.org",
  "font-src 'self'",
  "media-src 'self'",
  "base-uri 'self'",
  "form-action 'none'",
  "object-src 'none'",
].join("; ");

const securityPolicy = (): Plugin => ({
  name: "security-policy",
  apply: "build",
  transformIndexHtml: () => [
    {
      tag: "meta",
      attrs: {
        "http-equiv": "Content-Security-Policy",
        content: contentSecurityPolicy,
      },
      injectTo: "head-prepend",
    },
  ],
});

const failOnWarning = (message: string): never => {
  throw new Error(message);
};

export default defineConfig({
  base: "./",
  plugins: [securityPolicy()],
  css: {
    preprocessorOptions: {
      scss: {
        logger: { warn: failOnWarning },
      },
    },
  },
  build: {
    target: "esnext",
    rolldownOptions: {
      input: Object.fromEntries(
        pages.map((page) => [page, resolve(import.meta.dirname, `${page}.html`)]),
      ),
      onLog: (level, log, handler) => {
        if (level === "warn") failOnWarning(log.message);
        handler(level, log);
      },
    },
  },
  test: {
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/lib/time.ts", "src/lib/countries.ts", "src/lib/photos.ts", "src/lib/timer.ts"],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
    },
  },
});
