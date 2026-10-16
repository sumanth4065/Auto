# API Design Conventions

## API Gateway Structure

- RESTful endpoints using AWS API Gateway
- Base path: `/change-finance-company`
- CORS handled by dedicated `cfc-cors-handler` Lambda
- Authentication via ACE Identity integration
- All responses return JSON

## HTTP Methods

- **GET**: Retrieve data (idempotent, cacheable)
- **POST**: Create new resources or complex queries
- **PUT**: Update entire resource
- **PATCH**: Partial update (use sparingly)
- **DELETE**: Remove resource

## Request Format

```typescript
// Headers
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <token>",
  "X-Correlation-Id": "<uuid>",
  "X-Request-Id": "<uuid>"
}
```

## Response Format

### Success Response (2xx)

```typescript
{
  "statusCode": 200,
  "body": {
    "data": {},
    "metadata": {
      "requestId": "uuid",
      "timestamp": "ISO8601"
    }
  }
}
```

### Error Response (4xx/5xx)

```typescript
{
  "statusCode": 400,
  "body": {
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "Human-readable error message",
      "details": []
    },
    "metadata": {
      "requestId": "uuid",
      "timestamp": "ISO8601"
    }
  }
}
```

## Status Codes

- **200 OK**: Successful GET, PUT, PATCH
- **201 Created**: Successful POST creating resource
- **204 No Content**: Successful DELETE
- **400 Bad Request**: Invalid input, validation failure
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Valid auth but insufficient permissions
- **404 Not Found**: Resource doesn't exist
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server-side error

## Security

- Never expose sensitive data (SSN, full account numbers)
- Mask PII in logs and errors
- Use AWS Secrets Manager for credentials
- Validate JWT tokens from ACE Identity
- Apply principle of least privilege
