import { FunctionShield } from '@ace-clublabs/aws-lambda-v3';

if (!process.env.AWS_SAM_LOCAL) {
  FunctionShield.configure();
}

export const handler = async event => {
  const inputOrigin = event.headers && (event.headers.Origin || event.headers.origin);

  const parsedAllowedOrigins = process.env.ALLOWED_ORIGINS.split('|');
  const customHeaders = process.env.ALLOWED_HEADERS;
  const corsOrigin = isWhiteListed(parsedAllowedOrigins, inputOrigin)
    ? inputOrigin
    : parsedAllowedOrigins[0];

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': corsOrigin,
      'Access-Control-Allow-Headers':
        'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token' +
        (customHeaders?.length > 0 ? `,${customHeaders}` : ''),
      'Access-Control-Allow-Methods': 'DELETE, GET, OPTIONS, POST, PUT'
    }
  };
};

function isWhiteListed(whiteListedUrls: string[], hostName: string) {
  let result = false;
  whiteListedUrls.forEach(domainName => {
    const regex = new RegExp(`${domainName}$`, 'i');
    if (regex.test(hostName)) {
      result = true;
      return;
    }
  });
  return result;
}

export default exports;
