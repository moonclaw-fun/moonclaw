import { codeInspectorPlugin } from "code-inspector-plugin";

const result = codeInspectorPlugin({
  bundler: "turbopack",
});

console.log(JSON.stringify(result, null, 2));
