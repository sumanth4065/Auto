---
name: deploy
description: Automated deployment workflow for different environments
trigger: when user mentions "deploy", "deployment", "push to dev/test/prod"
context_weight: lightweight
---

# Deploy Skill

Handles deployment workflows for web, Lambda, API Gateway, and DynamoDB across environments.

## Trigger Conditions

- User says "deploy to [env]"
- User asks "how do I deploy"
- User mentions "push to production"
- After completing feature implementation
- When CI/CD pipeline fails

## Pre-Deployment Checklist

1. **Code Quality**
   - [ ] All tests passing
   - [ ] No TypeScript errors
   - [ ] Linting passes
   - [ ] Build succeeds locally

2. **Security**
   - [ ] No secrets in code
   - [ ] Dependencies scanned
   - [ ] IAM permissions reviewed

3. **Communication**
   - [ ] Team notified
   - [ ] Rollback plan ready

## Deployment Slots

- **Dev**: Continuous deployment from main
- **Test**: Automatic after dev success
- **Prod**: Manual approval required

## Rollback Procedure

1. Identify failed deployment
2. Check CloudWatch logs for errors
3. Revert PR if possible
4. Or deploy previous stable version
5. Notify team of rollback
