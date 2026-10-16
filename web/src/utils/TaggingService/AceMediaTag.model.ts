export interface StaticTagParts {
  channel: string;
  subchannel1: string;
  subchannel2: string;
  category: string[];
}

export interface DynamicTagParts {
  confirmation_id?: string;
  cta?: string;
  error?: string;
  flow: string;
  ins_claim_id?: string;
  need_confirmation_id?: boolean;
  page: string;
  platform?: string;
  product?: string[];
  quantity?: string[];
  sessionid?: string;
  text_opt_in?: string;
}
