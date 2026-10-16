import { ICachedAutoContact, IGuideWireContact } from '@lib/types';

export const transformCacheContacts = (cacheContacts: ICachedAutoContact[]): IGuideWireContact[] =>
  cacheContacts.map(({ contactId, ...gw }) => {
    let tempPrimaryAddress = gw.primaryAddress;
    if (tempPrimaryAddress?.postalCode?.endsWith('-')) {
      tempPrimaryAddress.postalCode = tempPrimaryAddress.postalCode.slice(0, -1);
    }
    return {
      primaryAddress: tempPrimaryAddress,
      ...gw
    };
  });
