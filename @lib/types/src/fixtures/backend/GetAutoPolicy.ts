import { IAutoPolicyInfoBackendResponse } from '../../contracts';

export const guidewireBackendResponse: IAutoPolicyInfoBackendResponse = {
  overview: {
    policyNumber: 'AMO000141255',
    productType: 'Auto',
    effective: { start: '02/27/2024', end: '08/27/2024' },
    class: 'PPA',
    tenant: 'Guidewire',
    priorPolicyNumber: 'MOA189411101'
  }
};

export const huonAutoPolicyBackendResponse: IAutoPolicyInfoBackendResponse = {
  overview: {
    policyNumber: 'MOA189411101',
    productType: 'Auto',
    effective: { start: '08/27/2023', end: '02/27/2024' },
    class: 'PPA',
    tenant: 'Huon',
    priorPolicyNumber: 'A78351418'
  }
};

export const anjAutoPolicyBackendResponse: IAutoPolicyInfoBackendResponse = {
  overview: {
    policyNumber: 'ANJ000407834',
    productType: 'Auto',
    effective: { start: '03/15/2024', end: '09/15/2024' },
    class: 'PPA',
    tenant: 'Guidewire',
    priorPolicyNumber: ''
  }
};
