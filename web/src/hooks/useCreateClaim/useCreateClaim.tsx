import { ICanonicalDriver, ICreateAutoClaimRequest, ICreateAutoClaimResponse } from '@lib/types';
import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router';
import { State } from '../../store/reducer';
import { sources } from '../../api/sources';
import {
  setCreateClaimInformation,
  setErrorReason,
  setSerializedError
} from '../../store/actions';
import { LossCause, LossType } from '@ace-clublabs/iss-common-auto-efnol-models';
import { ISerializedError } from '../../types';
import { serializeError } from '../../utils/LogCannonHelper';
import { resolveClaimPolicyNumber } from '../../utils/policyNumberHelper';

// The backend orchestrator may pass through raw policy retrieval driver data
// with emailAddress/phoneNumber instead of the canonical email/mobileNumber fields.
interface IRawApiDriver extends ICanonicalDriver {
  emailAddress?: string;
  phoneNumber?: string;
}

export const useCreateClaim = (shouldExecute: boolean) => {
  const [appState, dispatch] = useOutletContext<[State, Function]>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ISerializedError | null>(null);
  const alreadySubmittedInSession = appState.claimSubmittedForClaimNumber != null;

  const createRequestBody = () => {
    const {
      policyNumber,
      lossDateFormat,
      effectiveDate,
      expirationDate,
      priorPolicyNumber,
      isMobileAppAccidentDetection,
      lossDateISO
    } = appState;
    const lossTime = lossDateFormat!.split(' ')[1]!;
    const resolvedPolicyNumber = resolveClaimPolicyNumber(
      appState.conversionResult,
      lossDateISO,
      policyNumber!
    );
    const createAutoClaimRequest: ICreateAutoClaimRequest = {
      lossDate: lossDateISO!,
      lossTime,
      policy: {
        // This can change in the future, but from the moment we can use directly the policy number see insurance-efnol auto as reference
        policyNumber: policyNumber!,
        resolvedPolicyNumber,
        policyType: policyNumber!.substring(0, 3),
        effectiveDate: effectiveDate!,
        expirationDate: expirationDate!,
        priorPolicyNumber: priorPolicyNumber
      },
      lossType: LossType.AUTO,
      lossCause: LossCause.OTHERCOMP,
      isNotificationOnly: false, // we dont have this one for the moment , in create auto claim is false
      isMobileAppAccidentDetection
    };
    return createAutoClaimRequest;
  };

  const createVehicleOptions = (vehicles: any[]): any[] => {
    return vehicles.map(vehicle => {
      return {
        ...vehicle,
        vehicleTitle: `${vehicle.year} ${vehicle.make} ${vehicle.model}`
      };
    });
  };

  const executeRequest = async () => {
    setLoading(true);
    try {
      const requestBody = createRequestBody();
      const response: ICreateAutoClaimResponse = await sources(
        appState.token!,
        appState.policyGuid!,
        appState.loginFlowType
      ).createAutoClaim(requestBody);

      // Convert canonical response to frontend types if drivers and vehicles are present
      const vehicleSummaries = response.vehicleSummaries
        ? response.vehicleSummaries.map(vehicle => ({
            ...vehicle,
            year: String(vehicle.year) // Convert number to string for frontend compatibility
          }))
        : undefined;

      const driverSummaries = response.driverSummaries
        ? response.driverSummaries.map(driver => {
            const rawDriver = driver as IRawApiDriver;
            return {
              ...rawDriver,
              id: rawDriver.driverId,
              email: rawDriver.email ?? rawDriver.emailAddress,
              mobileNumber: rawDriver.mobileNumber ?? rawDriver.phoneNumber
            };
          })
        : undefined;

      const vehicleOptions = vehicleSummaries
        ? createVehicleOptions(vehicleSummaries as any)
        : undefined;

      const { insuredFullName, policyStatus, policyType, policyState, policyProduct } = response;

      dispatch(
        setCreateClaimInformation({
          claimNumber: response.claimNumber,
          driverSummaries,
          vehicleSummaries,
          vehicleOptions,
          insuredFullName,
          policyStatus,
          policyType,
          policyState,
          policyProduct
        })
      );
    } catch (error: any) {
      const serializedError = serializeError(error, useCreateClaim.name);
      const errorMessage = serializedError?.errorMessage || 'Unknown error during claim creation';

      dispatch(setSerializedError(serializedError));
      dispatch(setErrorReason(errorMessage));
      setError(serializedError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (alreadySubmittedInSession) {
      setLoading(false);
      return;
    }
    if (!appState.duplicatedClaim && shouldExecute) {
      executeRequest();
    }
  }, [shouldExecute, alreadySubmittedInSession, appState.duplicatedClaim]);

  return {
    loading,
    error
  };
};
