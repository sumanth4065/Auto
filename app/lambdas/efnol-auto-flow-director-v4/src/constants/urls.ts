import { FlowDirectorConfig } from "@lib/common-utils";
export const autoUrls: { flowDirector: FlowDirectorConfig } = {
  flowDirector: {
    dev: {
      referrerURLv2: 'https://appdev1.ace.aaa.com/insurance/auto/file-a-claim/behindlogin'
    },
    qa: {
      referrerURLv2: 'https://appqa1.ace.aaa.com/insurance/auto/file-a-claim/behindlogin'
    },
    uat: {
      referrerURLv2: 'https://appuat1.ace.aaa.com/insurance/auto/file-a-claim/behindlogin'
    },
    prod: {
      referrerURLv2: 'https://app.ace.aaa.com/insurance/auto/file-a-claim/behindlogin'
    }
  }
};
