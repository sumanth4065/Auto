export class MaskData {
  public static maskJSONFields(data: object, options?: maskJSONOptions) {
    const deepCloneData = JSON.parse(JSON.stringify(data));
    return this.maskFields(deepCloneData, options ?? DEFAULT_MASK_OPTIONS_FOR_CREDENTIALS);
  }

  static maskFields(data: object, options: maskJSONOptions) {
    if (!data || !options) return data;
    const keys = Object.keys(data);
    keys.forEach(key => {
      // if it's a complex object that matches the key, mask the whole object
      if (options.fields.includes(key)) {
        data[key] = options.maskWith ?? '******';

        // otherwise traverse the object and mask appropriately
      } else {
        const value = data[key];
        if (typeof value === 'object') {
          data[key] = MaskData.maskJSONFields(value, options);
        } else if (typeof value === 'string') {
          if (options.fields.includes(key)) data[key] = options.maskWith ?? '******';
        }
      }
    });

    return data;
  }
}

export interface maskJSONOptions {
  maskWith?: string;
  fields: string[];
}

export const DEFAULT_MASK_OPTIONS_FOR_PII: maskJSONOptions = {
  maskWith: '*******',
  fields: [
    'Authorization',
    'dateOfBirth',
    'displayName',
    'email',
    'emailAddress1',
    'licenseNumber',
    'membershipNumber',
    'membershipNumberEmail',
    'notes',
    'vin'
  ]
};

export const SECONDARY_MASK_OPTIONS_FOR_PII: maskJSONOptions = {
  maskWith: '*******',
  fields: [
    'addressLine1',
    'body',
    'cellNumber',
    'displayName',
    'homeNumber',
    'lastName',
    'phone',
    'phoneNumber',
    'publicID'
  ]
};

export const DEFAULT_MASK_OPTIONS_FOR_CREDENTIALS: maskJSONOptions = {
  maskWith: '*******',
  fields: [
    'adProxyAccountId',
    'Authorization',
    'client_id',
    'client_secret',
    'X-Ace-Guidewire-Id',
    'X-Ace-Guidewire-Secret',
    'X-Ace-Mulesoft-Id',
    'X-Ace-Mulesoft-Secret'
  ]
};

export const DEFAULT_MASK_OPTIONS_ALL: maskJSONOptions = {
  maskWith: '*******',
  fields: [
    ...DEFAULT_MASK_OPTIONS_FOR_PII.fields,
    ...DEFAULT_MASK_OPTIONS_FOR_CREDENTIALS.fields,
    ...SECONDARY_MASK_OPTIONS_FOR_PII.fields
  ]
};

export const DEFAULT_MASK_OPTIONS_ALL_PII: maskJSONOptions = {
  maskWith: '*******',
  fields: [
    ...DEFAULT_MASK_OPTIONS_FOR_PII.fields,
    ...SECONDARY_MASK_OPTIONS_FOR_PII.fields
  ]
};
