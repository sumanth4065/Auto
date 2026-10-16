import { test as base,FullConfig} from "@playwright/test";


// Declare the types of your fixtures.
export type MyOptions = {
  username: string;
  password:string;
  env: string;
  clubname: string;
  policynumber: string;
};

// This new "test" can be used in multiple test files, and each of them will get the fixtures.
export const test = base.extend<MyOptions>({
  username: ["065_36609988@aaa.com", { option: true }],
  password : ["autoclub1", { option: true }],
  env: ["ace.aaa.com", { option: true }],
  clubname: ["MO", { option: true }],
  policynumber:["AMO000130601",{ option: true }],
});
export { expect,FullConfig } from "@playwright/test";
