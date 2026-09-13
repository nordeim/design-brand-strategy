import { defineConfig, globalIgnores } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  // Keep the starter on the flat config export that actually runs under the pinned ESLint/Next toolchain.
  ...nextCoreWebVitals,
  // skills/ is operator-managed and excluded from checks/tests/compilation per the
  // operator contract — keep its vendored JS out of lint output.
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "skills/**", "infrastructure/**"]),
]);
