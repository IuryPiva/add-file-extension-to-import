import { walk } from "https://deno.land/std@0.117.0/fs/mod.ts";
import { dirname, resolve } from "https://deno.land/std@0.117.0/path/mod.ts";

console.time("replacing");

for await (const entry of walk("./src")) {
  if (
    entry.isFile && (entry.name.endsWith(".ts") || entry.name.endsWith(".vue"))
  ) {
    let text = Deno.readTextFileSync(entry.path);

    const regex = /from "(.*?)";/gs;

    for (const iterator of text.matchAll(regex)) {
      const importedFile = iterator[1];

      if (
        importedFile.includes("./") &&
        !importedFile.split("/").pop()?.includes(".")
      ) {
        const resolvedPath = resolve(dirname(entry.path), importedFile)

        try {
          const vueFile = resolve(resolvedPath, "index.vue")
          Deno.readTextFileSync(vueFile)
          console.log(entry.path, importedFile, importedFile + "/index.vue");
          text = text.replace(`${importedFile}";`, `${importedFile + "/index.vue"}";`)
        } catch (_) {
          // console.log("nope")
        }

        try {
          const vueFile = resolvedPath + ".vue"
          Deno.readTextFileSync(vueFile)
          console.log(entry.path, importedFile, importedFile + ".vue");
          text = text.replace(`${importedFile}";`, `${importedFile + ".vue"}";`)

        } catch (_) {
          // console.log("nope")
        }
      }
    }
    Deno.writeTextFileSync(entry.path, text);
  }
}

// const text = `
// export { default as contractCreate } from "./create";
// export { default as contractDetails } from "./details.vue";
// `;
// const regex = /from "(.*?)";/gs;
// for (const iterator of text.matchAll(regex)) {
//   console.log(iterator[1]);
// }
console.timeLog("replacing");
console.log("\n");
