import typescript from "@rollup/plugin-typescript"
export default {
  input: "./src/index.ts",
  output: [
    //1.cjs -> commonjs
    //2.esm
    {
      format: "cjs",
      file: "lib/guide-vue.cjs.js"
    },
    {
      format: "es",
      file: "lib/guide-vue.esm.js"
    }
  ],

  plugins: [
    typescript()
  ]
}
