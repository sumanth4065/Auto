import { test as base} from "@playwright/test";


// Declare the types of your fixtures.
export type MyOptions = {
  username: string;
  password:string;
  env:string;
  hasdocuments:number;
  hasmortgage:number;
  state:string;
  region:string;
  clubname:string;
  policynumber:string;
  firstname:string;
  lastname:string;
  zipcode:string;
  
};

// This new "test" can be used in multiple test files, and each of them will get the fixtures.
export const test = base.extend<MyOptions>({
  firstname: ["Jaz", { option: true }],
  lastname : ["Connecticut", { option: true }],
  env : ["ace.aaa.com", { option: true }],
  //hasdocuments : [0, { option: true }],
  //hasmortgage : [0, { option: true }],
  state :  ["CA", { option: true }],
  region: ["B1", { option: true }],
  clubname :  ["RI", { option: true }],
  policynumber :  ["CTA000045114", { option: true }],
  zipcode :  ["06612", { option: true }],
});
export { expect,chromium} from "@playwright/test";
