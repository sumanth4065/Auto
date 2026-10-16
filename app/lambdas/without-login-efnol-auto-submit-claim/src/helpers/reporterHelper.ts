import {
  ICachedAutoClaim,
  IGuideWireClaimReporter,
  ISubmitAutoClaimFrontendRequest,
  NotListed,
  PhoneType,
} from '@lib/types';
import { dtoDeepClone } from '@ace-clublabs/iss-common-util';
import { Relationship } from '@ace-clublabs/iss-common-auto-efnol-models';

export const getReporterAndRelationship = (
  reqBody: ISubmitAutoClaimFrontendRequest,
  claimFromCacheData: ICachedAutoClaim
): IGuideWireClaimReporter => {
  let claimReporter: IGuideWireClaimReporter;
  let contactInfo = reqBody.contactInfo;
  if (!reqBody || !reqBody.reporter)
    throw new Error('Unable to process reporter for backend request');
  if (reqBody.reporter.driverId !== NotListed.Reporter) {
    let tempReporter: any = claimFromCacheData.contacts.find(
      contact => contact.contactId === reqBody.reporter.driverId
    );
    if (tempReporter) {
      let tempReporterClone = dtoDeepClone(tempReporter);
      delete tempReporterClone.contactId;
      claimReporter = {
        reportedBy: tempReporterClone,
        relationToInsured: Relationship.Other //Note relationToInsured is not stored in a IGuideWireContact type object, so we will just choose Other.
      };
    }
  } else if (
    reqBody.reporter.driverId === NotListed.Reporter &&
    reqBody.reporter.nonListedReporter &&
    reqBody.reporter.nonListedReporter.firstName &&
    reqBody.reporter.nonListedReporter.lastName &&
    reqBody.reporter.nonListedReporter.relationshipToPolicyHolder
  ) {
    claimReporter = {
      reportedBy: {
        firstName: reqBody.reporter.nonListedReporter.firstName,
        lastName: reqBody.reporter.nonListedReporter.lastName,
        tempID: '1' //per instruction from GW assign an arbitrary value
      },
      relationToInsured: reqBody.reporter.nonListedReporter.relationshipToPolicyHolder
    }
  } else {
    throw new Error('Unable to process reporter for backend request');
  }
  if (contactInfo && contactInfo.phone && contactInfo.email) {
    claimReporter.reportedBy.cellNumber = contactInfo.phone;
    claimReporter.reportedBy.primaryPhoneType = PhoneType.Mobile;
    claimReporter.reportedBy.emailAddress1 = contactInfo.email;
    claimReporter.reportedBy.ace_PreferredDeliveryMethod = contactInfo.preferredContactMethod;
    claimReporter.reportedBy.automatedServiceUpdates_Ext = true;
    if (reqBody.isTextCommunicationOptIn === true) {
      claimReporter.reportedBy.ace_EnrolledInHiMarley_Acc = true;
    }
  } else {
    throw new Error('No contactInfo available for the reporter');
  }
  return claimReporter;
};
