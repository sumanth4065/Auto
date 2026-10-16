---
name: review
description: Comprehensive code review for pull requests
invocation: /review [pr-number]
---

# Code Review Command

Performs a thorough code review following ACE standards and project conventions.

## What This Command Does

1. **Fetch PR Details**: Gets PR description, changed files, and commits
2. **Static Analysis**: Checks code style, conventions, patterns
3. **Security Review**: Identifies potential vulnerabilities
4. **Test Coverage**: Verifies tests exist for changes
5. **Documentation**: Checks if docs need updates
6. **Dependencies**: Reviews package.json changes
7. **Breaking Changes**: Identifies API/interface changes

## Review Checklist

### Code Quality
- [ ] Follows TypeScript strict mode guidelines
- [ ] Naming conventions adhered to
- [ ] No code smells (magic numbers, duplicated logic)
- [ ] Error handling implemented properly
- [ ] Logging includes correlation IDs

### Testing
- [ ] Unit tests added for new functions
- [ ] Integration tests for Lambda handlers
- [ ] E2E tests for new user flows
- [ ] Test coverage maintained or improved
- [ ] Edge cases covered

### Security
- [ ] No secrets or credentials in code
- [ ] Input validation implemented
- [ ] SQL/NoSQL injection prevention
- [ ] XSS prevention in frontend
- [ ] Proper authentication checks

### API Design
- [ ] RESTful conventions followed
- [ ] Proper HTTP status codes
- [ ] Consistent request/response format
- [ ] CORS configured correctly
- [ ] Rate limiting considered

### Performance
- [ ] No obvious performance issues
- [ ] Database queries optimized
- [ ] Lambda memory/timeout appropriate
- [ ] No unnecessary re-renders (React)
- [ ] Bundle size impact minimal

### Documentation
- [ ] CLAUDE.md updated if architecture changed
- [ ] Comments added for complex logic
- [ ] README updated if commands changed
- [ ] API docs updated if endpoints changed

### Infrastructure
- [ ] CDK changes follow patterns
- [ ] No hard-coded values (use parameters)
- [ ] Tags applied correctly
- [ ] IAM permissions follow least privilege

## Usage Examples

```bash
# Review current PR
/review

# Review specific PR
/review 329

# Review with focus on security
/review --focus=security

# Quick review (skip detailed analysis)
/review --quick
```

## Output Format

The review will produce:

1. **Summary**: High-level assessment (approve, request changes, comment)
2. **Critical Issues**: Must-fix items (security, bugs)
3. **Suggestions**: Nice-to-have improvements
4. **Praise**: What was done well
5. **Questions**: Areas needing clarification

## Integration

- Links to specific files and line numbers
- References to relevant rules from .claude/rules/
- Suggests fixes where possible
- Creates GitHub review comments (if gh CLI available)
