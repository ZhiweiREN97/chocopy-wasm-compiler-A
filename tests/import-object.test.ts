import { readFileSync } from "fs";
import { importObjectErrors } from "../errors";
import {STRING} from "../utils";

enum Type { Num, Bool, None, String }

function stringify(typ: Type, arg: any): string {
  switch (typ) {
    case Type.Num:
      return (arg as number).toString();
    case Type.Bool:
      return (arg as boolean) ? "True" : "False";
    case Type.None:
      return "None";
    case Type.String:
      // add Enter at the end of the sentence
      if (arg as number == -2) {
        return "\n"
      // return null when detecting the start symbol -1
      }else if (arg as number == -1) {
        return ""
      }
      else {
        return String.fromCharCode(arg as number);
      }
  }
}

function print(typ: Type, arg: any): any {
  importObject.output += stringify(typ, arg);
  if (typ != Type.String) {
    importObject.output += "\n";
  }
  return arg;
}

// function assert_not_none(arg: any) : any {
//   if (arg === 0)
//     throw new Error("RUNTIME ERROR: cannot perform operation on none");
//   return arg;
// }

export async function addLibs() {
  const bytes = readFileSync("build/memory.wasm");
  const bytesStrings = readFileSync("build/strings.wasm");
  const memory = new WebAssembly.Memory({initial:10, maximum:100});
  const memoryModule = await WebAssembly.instantiate(bytes, { js: { mem: memory }, imports: {} })
  const stringsModule = await WebAssembly.instantiate(bytesStrings, { js: { mem: memory }, imports: {print_str: (arg: number) => print(Type.String, arg)}, libmemory: memoryModule.instance.exports })

  importObject.libmemory = memoryModule.instance.exports;
  importObject.strmemory = stringsModule.instance.exports,
      importObject.memory_values = memory;
  importObject.js = {memory};
  return importObject;
}

export const importObject : any = {
  imports: {
    // we typically define print to mean logging to the console. To make testing
    // the compiler easier, we define print so it logs to a string object.
    //  We can then examine output to see what would have been printed in the
    //  console.
    // assert_not_none: (arg: any) => assert_not_none(arg),
    print: (arg: any) => print(Type.Num, arg),
    print_num: (arg: number) => print(Type.Num, arg),
    print_bool: (arg: number) => print(Type.Bool, arg),
    print_none: (arg: number) => print(Type.None, arg),
    abs: Math.abs,
    min: Math.min,
    max: Math.max,
    pow: Math.pow,
  },
  errors: importObjectErrors,

  output: "",
};
