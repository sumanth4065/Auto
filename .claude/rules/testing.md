# Testing Rules

## Test Coverage Requirements

- All business logic must have unit tests
- Lambda handlers must have integration tests
- Critical user flows must have E2E tests
- Maintain existing coverage levels (don't decrease coverage)
- Tests run in America/Los_Angeles timezone

## Unit Testing (Vitest)

- Test file naming: `*.test.ts` or `*.test.tsx`
- Place tests adjacent to source files
- Use descriptive test names: `it('should return error when policy not found', ...)`
- Follow AAA pattern: Arrange, Act, Assert
- Mock external dependencies (API calls, database)
- Use @testing-library/react for component tests
- Test user interactions, not implementation details

## Integration Testing

- Test Lambda handlers end-to-end
- Mock AWS services (DynamoDB, S3, etc.)
- Validate request/response formats
- Test error scenarios (timeouts, invalid input)
- Verify logging and tracing

## E2E Testing (Playwright)

- Located in `/tests/ui`
- Test critical user journeys
- Use stable selectors (data-testid)
- Run against deployed environments
- Include accessibility checks

## Test Commands

```bash
# Frontend tests
yarn test-web              # Run all web tests
yarn test-web-silent       # CI mode
cd web && yarn test:dev    # Watch mode with UI
cd web && yarn test:coverage  # Coverage report

# Backend tests
yarn test-app              # Lambda and lib tests

# All tests
yarn test                  # Full test suite
```

## Best Practices

- Write tests before fixing bugs (TDD for bugs)
- Test edge cases and error conditions
- Avoid testing implementation details
- Use factories/builders for test data
- Clean up test data/mocks after each test
- Don't test external libraries (trust they work)
- Keep tests fast and isolated
