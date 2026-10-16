import { IPersonInfo } from '@ace-clublabs/iss-common-auto-efnol-models';
import {
  IGuideWireContact,
  IGuideWireRelatedContact,
  PhoneType
} from '@lib/types';

export const witnessHelper = (
  witness: IPersonInfo | undefined
): IGuideWireRelatedContact[] => {
  if (!witness) return undefined;
  const witnessRelatedContact = {
    role: 'witness',
    injured: false,
    contact: {
      firstName: witness?.firstName,
      lastName: witness?.lastName
    } as IGuideWireContact
  };

  if (witness?.mobilePhone) {
    witnessRelatedContact.contact.cellNumber = witness.mobilePhone;
    witnessRelatedContact.contact.primaryPhoneType = PhoneType.Mobile;
  }
  return [witnessRelatedContact];
};
