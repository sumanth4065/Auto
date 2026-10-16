import { IContactInfo } from '@ace-clublabs/iss-common-auto-efnol-models';
import {
  IGuideWireContact,
  PhoneType
} from '@lib/types';

export const getExistingLossDriver = (
  reqBodyContactInfo: IContactInfo,
  lossDriverGWContact: IGuideWireContact,
  reportedByPublicID: string,
  isTextCommunicationOptIn: boolean
) => {
  const returnLossDriverGWContact: IGuideWireContact = {
    ...lossDriverGWContact
  };

  if (returnLossDriverGWContact.publicID === reportedByPublicID) {
    returnLossDriverGWContact.ace_PreferredDeliveryMethod =
      reqBodyContactInfo.preferredContactMethod;
    returnLossDriverGWContact.cellNumber = reqBodyContactInfo.phone;
    returnLossDriverGWContact.primaryPhoneType = PhoneType.Mobile;
    returnLossDriverGWContact.emailAddress1 = reqBodyContactInfo.email;
    returnLossDriverGWContact.automatedServiceUpdates_Ext = true;

    if (isTextCommunicationOptIn === true) {
      returnLossDriverGWContact.ace_EnrolledInHiMarley_Acc = true;
    }
  }
  return returnLossDriverGWContact;
};
