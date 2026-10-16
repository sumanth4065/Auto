# Code Style Rules

## TypeScript Standards

- Use TypeScript strict mode for all new code
- Prefer `const` over `let`, never use `var`
- Use async/await over promise chains
- Use arrow functions for callbacks and functional code
- Use template literals over string concatenation
- Destructure objects and arrays when it improves readability
- Use optional chaining (`?.`) and nullish coalescing (`??`)

## Naming Conventions

- **Files**: kebab-case for files (`change-finance-company.tsx`)
- **Components**: PascalCase (`FinanceCompanySelector`)
- **Functions/Variables**: camelCase (`handleSubmit`, `userData`)
- **Constants**: SCREAMING_SNAKE_CASE (`MAX_RETRY_COUNT`)
- **Types/Interfaces**: PascalCase (`UserPolicy`, `ApiResponse`)
- **Lambdas**: Prefix with `cfc-` (Change Finance Company)

## React Patterns

- Use functional components exclusively (no class components)
- Hooks follow React naming convention (`use` prefix)
- Keep components focused and single-purpose
- Extract complex logic into custom hooks
- Use @ace-clublabs/shared-component-library when available
- Place component tests adjacent to component files
- Use data-testid for test selectors

## Lambda Patterns

- Export handler as named export `handler`
- Use middleware from @lib/lambda-shared
- Always include error handling with proper status codes
- Return consistent response format: `{ statusCode, body: JSON.stringify(data) }`
- Log correlation IDs for tracing
- Validate input at handler entry point
- Use @lib/types for request/response types

## Import Order

1. External libraries (react, aws-sdk, etc.)
2. ACE internal libraries (@ace-clublabs/*)
3. Local shared libraries (@lib/*)
4. Relative imports (./components, ../utils)
5. CSS/styles (if applicable)

## Error Handling

- Use try-catch blocks for async operations
- Return appropriate HTTP status codes (400 for client errors, 500 for server errors)
- Include meaningful error messages for debugging
- Never expose sensitive data in error responses
- Log errors with sufficient context

## File Organization

- Keep files under 300 lines when possible
- Group related functions together
- Export public APIs at bottom of file
- Keep test files adjacent to source files
- Use index.ts for clean exports from directories
