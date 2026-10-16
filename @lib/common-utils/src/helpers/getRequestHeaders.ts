import { DateTime } from 'luxon';
import { HttpProxy } from '@ace-clublabs/aws-lambda-v3';
import { HeaderKeys, TeamId } from '@ace-clublabs/iss-common-util';
import { Guidewire } from '@lib/shared-contracts';
import { getHeaderCaseInsensitive } from './getHeaderCaseInsensitive';

interface GuidewireCredentials {
  clientId: string;
  clientSecret: string;
}

const extractTestTrackFromHeaders = (
  eventHeaders: Record<string, string | undefined> | undefined
): string | undefined => {
  const raw = getHeaderCaseInsensitive(eventHeaders, 'X-Ace-Test-Track');
  const trimmed = raw?.trim();
  return trimmed || undefined;
};

export const getRequestHeaders = (
  eventHeaders: { [key: string]: string },
  guidewireCreds: GuidewireCredentials | null,
  correlationId: string,
  sessionId: string,
  appName: string,
  clubCode?: string
) => {
  const testRegion = HttpProxy.getHeaderValue(eventHeaders, HeaderKeys.TestRegion);
  const regionMapping: any = {
    A1: '1',
    B1: '2',
    '': ''
  };
  const environmentMapping: any = {
    dev: 'dev',
    qa: 'qa',
    uat: 'uat',
    prod: ''
  };

  const headerURLRegion =
    regionMapping[testRegion?.trimEnd()?.trimStart()?.toUpperCase() ?? ''] ?? '';
  const headerURLEnvironment = environmentMapping[process.env.ENVIRONMENT] ?? '';

  const urlPattern = 'https://apixy.ace.aaa.com';
  const originUrl = urlPattern.replace('x', headerURLEnvironment).replace('y', headerURLRegion);

  const guidewireScope =
    (process.env?.ENVIRONMENT || '') === 'prod'
      ? Guidewire.SCOPE.replace('planet_class.lower', 'planet_class.prod')
      : Guidewire.SCOPE;

  const testTrack = extractTestTrackFromHeaders(eventHeaders);

  const headers: { [key: string]: string } = {
    // common X-ace headers
    'X-Ace-Correlation-Id': correlationId,
    'X-Ace-Session-Id': sessionId,
    'X-Ace-Test-Region': eventHeaders?.['X-Ace-Test-Region'],
    'X-ConsumerRequestSentTimeStamp': DateTime.now().toUTC().toISO(),
    'X-Request-Id': eventHeaders['X-Request-Id'],
    ...(clubCode ? { clubCode } : {}),
    Origin: originUrl,
    [HeaderKeys.BypassContext]: HttpProxy.getHeaderValue(eventHeaders, HeaderKeys.BypassContext),
    [HeaderKeys.TeamId]: TeamId.InsuranceSelfService,
    [HeaderKeys.UserApplication]: appName,
    ...(testTrack ? { 'X-Ace-Test-Track': testTrack } : {})
  };

  if (guidewireCreds?.clientId && guidewireCreds?.clientSecret) {
    headers['X-Ace-Guidewire-Client-Name'] = appName;
    headers[HeaderKeys.GuidewireId] = guidewireCreds.clientId;
    headers[HeaderKeys.GuidewireSecret] = guidewireCreds.clientSecret;
    headers[HeaderKeys.GuidewireScopes] = guidewireScope;
  }

  return headers;
};
