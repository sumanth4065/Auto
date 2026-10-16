import app from './index';
import event from '../event.json';

process.env.ALLOWED_ORIGINS = 'https://appqa1.ace.aaa.com|https://appqa2.ace.aaa.com';
process.env.ALLOWED_HEADERS = 'X-Ace-Mock'

describe('CorsHandler', function () {
  let inputOrigin;
  let expectedResult;
  let mockEvent;

  it('should return first whitelisted origin if input origin is not white-listed', async () => {
    mockEvent = {
      ...event
    }
    inputOrigin = 'https://appqa1.ace.aaa.com';
    expectedResult = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": inputOrigin,
        "Access-Control-Allow-Headers": 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Ace-Mock',
        "Access-Control-Allow-Methods": "DELETE, GET, OPTIONS, POST, PUT"
      }
    };
    const result = await app.handler(mockEvent);
    expect(result).toEqual(expectedResult);
  });

  it('should return input origin if input origin is white-listed', async () => {
    mockEvent = {
      ...event,
      headers: {
        Origin: "https://appqa2.ace.aaa.com"
      }
    }
    inputOrigin = 'https://appqa2.ace.aaa.com';
    expectedResult = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": inputOrigin,
        "Access-Control-Allow-Headers": 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Ace-Mock',
        "Access-Control-Allow-Methods": "DELETE, GET, OPTIONS, POST, PUT"
      }
    };
    const result = await app.handler(mockEvent);
    expect(result).toEqual(expectedResult);
  });

  describe('when headers origin is lower cased', () => {
    it('should return input origin if input origin is white-listed', async () => {
      mockEvent = {
        ...event,
        headers: {
          origin: "https://appqa2.ace.aaa.com"
        }
      }
      inputOrigin = 'https://appqa2.ace.aaa.com';
      expectedResult = {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": inputOrigin,
          "Access-Control-Allow-Headers": 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Ace-Mock',
          "Access-Control-Allow-Methods": "DELETE, GET, OPTIONS, POST, PUT"
        }
      };
      const result = await app.handler(mockEvent);
      expect(result).toEqual(expectedResult);
    });
  })
});