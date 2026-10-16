import {
  cachedCreateAutoClaimBackendResponseFixtureWithLossDateAndLossTimeObjects,
  ICachedAutoClaim,
  IGuideWireClaimReporter,
  ISubmitAutoClaimFrontendRequest,
  NotListed,
  PhoneType,
  submitAutoClaimCarDrivenWithOneOtherParty
} from '@lib/types';

import { dtoDeepClone } from '@ace-clublabs/iss-common-util';
import { getReporterAndRelationship } from './reporterHelper';
import { PreferredContactMethod, Relationship } from '@ace-clublabs/iss-common-auto-efnol-models';

describe('reporter mapping', () => {
  let testAutoClaimFERequestBody: ISubmitAutoClaimFrontendRequest;
  let testCachedCreateAutoClaimBEResponseWithLossDateAndLossTimeObjects: ICachedAutoClaim;
  let testExpectedResult: IGuideWireClaimReporter;
  let baseExpectedResult: IGuideWireClaimReporter = {
    reportedBy: {
      firstName: 'Giovani',
      lastName: 'Aldi',
      tempID: '1',
      cellNumber: '9493334444',
      primaryPhoneType: PhoneType.Mobile,
      emailAddress1: 'someone@aaa.com',
      ace_PreferredDeliveryMethod: PreferredContactMethod.email
    },
    relationToInsured: Relationship.Other
  };

  beforeEach(() => {
    testAutoClaimFERequestBody = dtoDeepClone(submitAutoClaimCarDrivenWithOneOtherParty);
    testCachedCreateAutoClaimBEResponseWithLossDateAndLossTimeObjects = dtoDeepClone(
      cachedCreateAutoClaimBackendResponseFixtureWithLossDateAndLossTimeObjects
    );
    testExpectedResult = dtoDeepClone(baseExpectedResult);
  });

  it(`should throw an error with message "Unable to process reporter for backend request" when the reporter is missing (item#2)`, () => {
    delete testAutoClaimFERequestBody.reporter;
    try {
      const result = getReporterAndRelationship(
        testAutoClaimFERequestBody,
        testCachedCreateAutoClaimBEResponseWithLossDateAndLossTimeObjects
      );
    } catch (error) {
      expect(error.message).toEqual('Unable to process reporter for backend request');
    }
  });

  it(`should create a reporter object when the selectedReporterId is not known and a new reporter 
       must be created (item#2) and contact info is known and should map 'preferredContactMethod'
       to 'ace_PreferredDeliveryMethod' on the backend request payload`, () => {
    testAutoClaimFERequestBody.reporter = {
      driverId: NotListed.Reporter,
      nonListedReporter: {
        firstName: 'Giovani',
        lastName: 'Aldi',
        relationshipToPolicyHolder: Relationship.Other
      }
    };
    testAutoClaimFERequestBody.contactInfo = {
      phone: '9495556666',
      email: 'test1@aaa.com',
      preferredContactMethod: PreferredContactMethod.himarley
    };
    testAutoClaimFERequestBody.isTextCommunicationOptIn = true;
    testExpectedResult.reportedBy = {
      firstName: 'Giovani',
      lastName: 'Aldi',
      cellNumber: '9495556666',
      emailAddress1: 'test1@aaa.com',
      ace_PreferredDeliveryMethod: PreferredContactMethod.himarley,
      primaryPhoneType: PhoneType.Mobile,
      tempID: '1',
      automatedServiceUpdates_Ext: true,
      ace_EnrolledInHiMarley_Acc: true
    };
    testExpectedResult.relationToInsured = Relationship.Other;
    const result = getReporterAndRelationship(
      testAutoClaimFERequestBody,
      testCachedCreateAutoClaimBEResponseWithLossDateAndLossTimeObjects
    );
    expect(result).toEqual(testExpectedResult);
  });

  it(`for LossDateAndLossTimeObjects scenario, should create a reporter object when the selectedReporterId is known (item#2) and contact info is known 
  and should map 'preferredContactMethod' to 'ace_PreferredDeliveryMethod' on the backend request payload`, () => {
    testAutoClaimFERequestBody.reporter = {
      driverId: 'someUniqueId3'
    };
    testAutoClaimFERequestBody.contactInfo = {
      phone: '9497778888',
      email: 'test2@aaa.com',
      preferredContactMethod: PreferredContactMethod.email
    };
    testAutoClaimFERequestBody.isTextCommunicationOptIn = true;
    testExpectedResult = {
      relationToInsured: Relationship.Other,
      reportedBy: {
        displayName: 'MARIALITA SAMAYOA',
        publicID: 'cc:10474311',
        subtype: 'Person',
        workNumber: '9999999999',
        policyRole: 'insured',
        primaryAddress: {
          state: 'CA',
          country: 'US',
          displayName: '39813 CAMINO TEMPLADO, INDIO, CA 92203-3715, US',
          publicID: 'cc:57561002',
          county: 'Riverside',
          addressLine1: '39813 CAMINO TEMPLADO',
          city: 'INDIO',
          postalCode: '92203-3715',
          addressType: 'home'
        },
        dateOfBirth: '1939-02-20T08:00:00Z',
        gender: 'F',
        lastName: 'SAMAYOA',
        firstName: 'MARIALITA',
        contactType: 'Person',
        primaryPhoneType: PhoneType.Mobile,
        cellNumber: '9497778888',
        emailAddress1: 'test2@aaa.com',
        ace_PreferredDeliveryMethod: PreferredContactMethod.email,
        automatedServiceUpdates_Ext: true,
        ace_EnrolledInHiMarley_Acc: true
      }
    };
    const result = getReporterAndRelationship(
      testAutoClaimFERequestBody,
      testCachedCreateAutoClaimBEResponseWithLossDateAndLossTimeObjects
    );
    expect(result).toEqual(testExpectedResult);
  });

  it(`should create a reporter object when the selectedReporterId is not known and a new reporter 
       must be created (item#2) and contact info is known and should map 'preferredContactMethod'
       to 'ace_PreferredDeliveryMethod' on the backend request payload`, () => {
    testAutoClaimFERequestBody.reporter = {
      driverId: NotListed.Reporter,
      nonListedReporter: {
        firstName: 'Giovani',
        lastName: 'Aldi',
        relationshipToPolicyHolder: Relationship.Other
      }
    };
    testAutoClaimFERequestBody.contactInfo = {
      phone: '9495556666',
      email: 'test1@aaa.com',
      preferredContactMethod: PreferredContactMethod.himarley
    };
    testAutoClaimFERequestBody.isTextCommunicationOptIn = true;
    testExpectedResult.reportedBy = {
      firstName: 'Giovani',
      lastName: 'Aldi',
      cellNumber: '9495556666',
      emailAddress1: 'test1@aaa.com',
      ace_PreferredDeliveryMethod: PreferredContactMethod.himarley,
      primaryPhoneType: PhoneType.Mobile,
      tempID: '1',
      ace_EnrolledInHiMarley_Acc: true,
      automatedServiceUpdates_Ext: true
    };
    const result = getReporterAndRelationship(
      testAutoClaimFERequestBody,
      testCachedCreateAutoClaimBEResponseWithLossDateAndLossTimeObjects
    );
    expect(result).toEqual(testExpectedResult);
  });
});
