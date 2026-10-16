// https://autoclub.atlassian.net/wiki/spaces/IC/pages/2858713136/Get+Call+center+hours+schedule
// https://autoclub.atlassian.net/wiki/spaces/QA/pages/3361931288/Insurance+Policy+Types

// infer clubCode from policy prefix

export const getClubcodeFromPolicyNumber = (
  policyNumber: string
): string | 'Invalid' => {
  const policyPrefix = policyNumber.substring(0, 3);
  switch (policyPrefix) {
    // MO
    case '':
    case '':
      return '065';
    // TX
    case 'THO':
      return '252';
    // ACE/CA
    case '':
      return '004';
    // ANE
    case '':
      return '???';
    default:
      return 'Invalid';
  }
};
