import { ClubCodes, ITenant, PolicyTypeAndTenantHelper } from '@ace-clublabs/iss-common-util';
import { LoginFlowType } from '@lib/shared-contracts';
import { mobileOrDesktop } from './TaggingService';
import { State } from '../store/reducer';
/**
 * Builds a standardized log data object for analytics and monitoring.
 *
 * This helper derives club and tenant information from the provided
 * application state and augments it with page and platform details.
 *
 * @param appState - Application state containing at least `clubCode` and `policyNumber`.
 * @param location - String identifier for the current page or route (e.g. path or name).
 *
 * @returns An object containing club, page, platform, and policy metadata suitable for logging.
 *
 * @example
 * const logData = getLogData(
 *   { clubCode: "XXX", policyNumber: "ABC1234567" },
 *   "/policy/overview"
 * );
 * // logData = {
 * //   clubCode: "XXX",
 * //   clubName: "...",
 * //   page: "/policy/overview",
 * //   platform: "mobile" | "desktop",
 * //   policyTenant: "...",
 * //   policyPrefix: "ABC",
 * //   policyNumber: "ABC1234567"
 * // }
 */

export const getLogData = (appState: State, location: string) => {
  const clubName = Object.keys(ClubCodes).find(key => ClubCodes[key] === appState.clubCode);
  let tenantValue;
  if (appState && appState.policyNumber != null) {
    ({ tenant: tenantValue } = PolicyTypeAndTenantHelper.getTenantAndProductFromPolicyNumber(
      appState.policyNumber
    ));
  }
  const tenant = Object.keys(ITenant).find(key => ITenant[key] === tenantValue);
  const POLICY_PREFIX_REGEX = /[\s.\-;,?%0-9]/g;
  const policyPrefix = appState.policyNumber?.replace(POLICY_PREFIX_REGEX, '') || '';

  const loginFlowType =
    appState.loginFlowType ||
    (window.location?.pathname?.includes('/behindlogin')
      ? LoginFlowType.BEHIND_LOGIN
      : LoginFlowType.ANONYMOUS);

  return {
    clubCode: appState.clubCode,
    clubLabel: clubName || 'N/A',
    page: location,
    platform: mobileOrDesktop(),
    policyTenant: tenant,
    policyPrefix,
    policyNumber: appState.policyNumber,
    loginFlowType,
    policyGuid: appState.policyGuid,
    sourceApp: appState.sourceApp,
    claimNumber: appState.claimNumber,
    policyStatus: appState.policyStatus,
    policyType: appState.policyType,
    textCommunication: appState.enableTextCommunication,
    electronicMailCommunication: appState.enableEmailCommunication,
    lossCause: appState.lossCause?.toString(),
    lossDate: appState.lossDate?.toISOString(),
    lossTime: appState.lossTime,
    numberOfVehiclesInvolved: appState.numberOfVehiclesInvolved?.toString()
  };
};
