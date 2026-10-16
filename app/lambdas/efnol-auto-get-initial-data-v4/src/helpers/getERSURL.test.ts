import { getERSURL } from './getERSURL';

describe('getERSURL', () => {
  it('resolves lower envs URL when env is QA', () => {
    process.env.ENVIRONMENT = 'qa';

    const result = getERSURL();

    expect(result).toEqual(
      'https://harsochatbotqastorage.z22.web.core.windows.net'
    );
  });

  it('resolves lower envs URL when env is DEV', () => {
    process.env.ENVIRONMENT = 'dev';

    const result = getERSURL();

    expect(result).toEqual(
      'https://harsochatbotqastorage.z22.web.core.windows.net'
    );
  });

  it('resolves lower envs URL when env is UAt', () => {
    process.env.ENVIRONMENT = 'uat';

    const result = getERSURL();

    expect(result).toEqual(
      'https://harsochatbotqastorage.z22.web.core.windows.net'
    );
  });

  it('resolves prod env URL when env is prod', () => {
    process.env.ENVIRONMENT = 'prod';

    const result = getERSURL();

    expect(result).toEqual('https://chat.ace.aaa.com');
  });
});
