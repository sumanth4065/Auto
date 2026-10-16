import { ICustomReporter } from "@ace-clublabs/iss-common-auto-efnol-models";

export interface ISelectedReporter {
  id: string;
  fullName: string;
  customReporter?: ICustomReporter;
};
