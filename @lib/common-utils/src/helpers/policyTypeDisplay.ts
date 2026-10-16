export const homePolicyTypeDisplay = (
  policyType: string,
  policyNumber: string
) => {
  let policyPrefixCandidate = policyNumber?.substring(0, 3) || '';
  policyPrefixCandidate =
    policyPrefixCandidate && policyPrefixCandidate === 'CEA'
      ? policyPrefixCandidate
      : '';
  if (
    policyType &&
    policyType.length > 1 &&
    policyType.substring(0, 2) === 'HO'
  ) {
    policyType = 'HO';
  }

  const policyTypeConcatPolicyPrefix = `${policyType}${policyPrefixCandidate}`;
  switch (policyTypeConcatPolicyPrefix) {
    case 'HOCEA':
      return 'Homeowner (CEA)';
    case 'CON':
      return 'Condo';
    case 'HO':
      return 'Homeowner';
    case 'RDP':
      return 'Rental Dwelling Property';
    case 'TEN':
      return 'Renters';
    case 'TENCEA':
      return 'Renters (CEA)';
    case 'HMO':
      return 'Missouri Home'; // we need to obtain the policy class and policy class description
    default:
      return 'Pending';
  }
};

export const autoPolicyTypeDisplay = (
  policyType: string,
  policyNumber: string
) => {
  let policyPrefixCandidate = policyNumber?.substring(0, 3) || '';
  const policyTypeConcatPolicyPrefix = `${policyType}${policyPrefixCandidate}`;
  switch (policyType) {
    case 'PPA':
      return 'Private Passenger Automobile';
    default: {
      if (policyPrefixCandidate === 'CAC') return 'Collector Car';
      else if (policyPrefixCandidate === 'CAR')
        return 'Assigned Risk Automobile';
      else return 'Pending';
    }
  }
};
