import { getRequestHeaders } from './getRequestHeaders';
import { mockHeaders, mockEvent } from './fixtures';
import { DateTime } from 'luxon';
import { AppName } from '@lib/shared-contracts';

jest.mock('luxon');

jest.spyOn(DateTime, 'now').mockImplementation(
  () =>
    ({
      toUTC: () => ({ toISO: () => '2024-02-16T20:34:10.354Z' })
    } as any)
);

process.env.ENVIRONMENT = 'dev';

describe('getRequestHeaders', () => {
  let result;

  it('should not have the guidewire headers when guidewireCreds is null', () => {
    const newMockEvent: any = { ...mockEvent };
    newMockEvent.headers = {
      ...mockEvent.headers,
      'X-Ace-Test-Region': 'A1'
    };
    result = getRequestHeaders(
      newMockEvent.headers,
      null,
      'someCorrelationId',
      'someSessionId',
      AppName.clublabsHomeEFNOL,
      '065'
    );

    const {
      'X-Ace-Guidewire-Client-Name': _gwName,
      'X-Ace-Guidewire-Id': _gwId,
      'X-Ace-Guidewire-Secret': _gwSecret,
      'X-Ace-Guidewire-Scopes': _gwScopes,
      ...expectedHeaders
    } = mockHeaders;

    expect(result).toEqual({
      ...expectedHeaders,
      'X-Ace-Test-Region': 'A1'
    });
  });

  it('should create the request header with guidewire creds', () => {
    const newMockEvent: any = { ...mockEvent };
    newMockEvent.headers = {
      ...mockEvent.headers,
      'X-Ace-Test-Region': 'A1'
    };
    result = getRequestHeaders(
      newMockEvent.headers,
      {
        clientId: 'some-guidewire-client-id',
        clientSecret: 'some-guidewire-client-secret'
      },
      'someCorrelationId',
      'someSessionId',
      AppName.clublabsHomeEFNOL,
      '065'
    );

    expect(result).toEqual({
      ...mockHeaders,
      'X-Ace-Test-Region': 'A1'
    });
  });

  it('forwards X-Ace-Test-Track when header key uses non-canonical casing', () => {
    const newMockEvent: any = { ...mockEvent };
    newMockEvent.headers = {
      ...mockEvent.headers,
      'X-Ace-Test-Region': 'A1',
      'x-ace-test-track': 'gateway-style'
    };
    result = getRequestHeaders(
      newMockEvent.headers,
      {
        clientId: 'some-guidewire-client-id',
        clientSecret: 'some-guidewire-client-secret'
      },
      'someCorrelationId',
      'someSessionId',
      AppName.clublabsHomeEFNOL,
      '065'
    );

    expect(result['X-Ace-Test-Track']).toBe('gateway-style');
  });

  it('forwards X-Ace-Test-Track when present on the event', () => {
    const newMockEvent: any = { ...mockEvent };
    newMockEvent.headers = {
      ...mockEvent.headers,
      'X-Ace-Test-Region': 'A1',
      'X-Ace-Test-Track': '  my-track  '
    };
    result = getRequestHeaders(
      newMockEvent.headers,
      {
        clientId: 'some-guidewire-client-id',
        clientSecret: 'some-guidewire-client-secret'
      },
      'someCorrelationId',
      'someSessionId',
      AppName.clublabsHomeEFNOL,
      '065'
    );

    expect(result['X-Ace-Test-Track']).toBe('my-track');
  });

  it('should create the request header for UAT2', () => {
    process.env.ENVIRONMENT = 'uat';
    const newMockEvent: any = { ...mockEvent };
    newMockEvent.headers = {
      ...mockEvent.headers,
      'X-Ace-Test-Region': 'B1'
    };

    result = getRequestHeaders(
      newMockEvent.headers,
      {
        clientId: 'some-guidewire-client-id',
        clientSecret: 'some-guidewire-client-secret'
      },
      'someCorrelationId',
      'someSessionId',
      AppName.clublabsHomeEFNOL,
      '065'
    );

    expect(result).toEqual({
      ...mockHeaders,
      Origin: 'https://apiuat2.ace.aaa.com',
      'X-Ace-Test-Region': 'B1'
    });
  });

  it('should create the request header for PROD', () => {
    process.env.ENVIRONMENT = 'prod';
    const newMockEvent: any = { ...mockEvent };
    newMockEvent.headers = {
      ...mockEvent.headers
    };

    result = getRequestHeaders(
      newMockEvent.headers,
      {
        clientId: 'some-guidewire-client-id',
        clientSecret: 'some-guidewire-client-secret'
      },
      'someCorrelationId',
      'someSessionId',
      AppName.clublabsHomeEFNOL,
      '065'
    );

    expect(result).toEqual({
      ...mockHeaders,
      'X-Ace-Guidewire-Scopes':
        'tenant.acsc project.gwcp planet_class.prod pc.service pc.allowusercontext scp.pc.acsc_ebiz_policyinfo scp.pc.acsc_ebiz',
      Origin: 'https://api.ace.aaa.com'
    });
  });
});
