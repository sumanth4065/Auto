export const getPolicyPrefix = (policyNumber: string): string => {
  const POLICY_PREFIX_REGEX = /[\s.\-;,?%0-9]/g;
  return policyNumber.replace(POLICY_PREFIX_REGEX, '');
};
