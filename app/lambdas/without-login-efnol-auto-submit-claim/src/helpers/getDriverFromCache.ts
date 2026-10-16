import {
  GuideWirePolicyRole,
  ICachedAutoContact,
  IGuideWireContact
} from '@lib/types';

export const getDriverFromCache = (
  cachedPolicyContacts: ICachedAutoContact[],
  lossDriverId: string
): IGuideWireContact => {
  const lossDriverCandidate: ICachedAutoContact | undefined =
    cachedPolicyContacts.find(contact => contact.contactId === lossDriverId);
  if (!lossDriverCandidate) {
    throw new Error('Unable to find a matching driver');
  }
  delete lossDriverCandidate.contactId;
  if (lossDriverCandidate.policyRole !== GuideWirePolicyRole.EXCLUDED_PARTY) {
    lossDriverCandidate.policyRole = GuideWirePolicyRole.INSURED;
  }
  return lossDriverCandidate;
};
