export const getERSURL = () => {
  if (process.env.ENVIRONMENT != 'prod') {
    return 'https://harsochatbotqastorage.z22.web.core.windows.net';
  } else {
    return 'https://chat.ace.aaa.com';
  }
};
