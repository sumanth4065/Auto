# Authentication Flow Documentation

This document describes the authentication flow for the Auto EFNOL (Electronic First Notice of Loss) application.

## Overview

The application supports two authentication modes:

1. **Anonymous Flow** — Users enter policy information manually (First Name, Last Name, Policy Number, ZIP)
2. **Behind Login Flow** — Users are already authenticated via the main AAA portal

## Entry Points

Routes are defined in `containers/Router.tsx`:

| Route          | Component           | Auth Mode    |
| -------------- | ------------------- | ------------ |
| `/`            | `<IntroTransition>` | Anonymous    |
| `/behindlogin` | `<IntroTransition>` | Behind Login |

Both routes render the same component but use different authentication providers.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              Router.tsx                                  │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                         <Layout>                                   │  │
│  │  ┌─────────────────────────────────────────────────────────────┐  │  │
│  │  │  isAnonymousRef = pathname !== '/behindlogin'               │  │  │
│  │  │                         │                                    │  │  │
│  │  │                         ▼                                    │  │  │
│  │  │  useAuthenticatedTokenAndPolicyNumber({ isAnonymous })      │  │  │
│  │  │                         │                                    │  │  │
│  │  │           ┌─────────────┴─────────────┐                     │  │  │
│  │  │           ▼                           ▼                     │  │  │
│  │  │   isAnonymous=true            isAnonymous=false             │  │  │
│  │  │           │                           │                     │  │  │
│  │  │           ▼                           ▼                     │  │  │
│  │  │   provideAceIdentity()    provideBehindLoginAceIdentity()   │  │  │
│  │  │           │                           │                     │  │  │
│  │  │           └─────────────┬─────────────┘                     │  │  │
│  │  │                         ▼                                    │  │  │
│  │  │                    <Outlet />                                │  │  │
│  │  │                         │                                    │  │  │
│  │  │                         ▼                                    │  │  │
│  │  │                 <IntroTransition>                            │  │  │
│  │  └─────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Anonymous Flow (`/`)

### Step 1: Layout Determines Auth Mode

When the user lands on `/`, `Layout.tsx` determines the authentication mode:

```typescript
const isAnonymousRef = useRef<boolean | null>(null);
if (isAnonymousRef.current === null) {
  isAnonymousRef.current = location.pathname !== Pages.BehindLoginEntry;
}
```

Since `pathname` is `/` (not `/behindlogin`), `isAnonymousRef.current` = `true`.

### Step 2: Token Retrieval

The `useAuthenticatedTokenAndPolicyNumber` hook is called with `isAnonymous: true`:

```typescript
const { loading, policyNumber, clubCode, clubCodeError } = useAuthenticatedTokenAndPolicyNumber({
  dispatch,
  isAnonymous: isAnonymousRef.current
});
```

### Step 3: AceIdentity Configuration

`AccessTokenHelper.ts` routes to the anonymous provider:

```typescript
const aceIdentity = isAnonymous
  ? provideAceIdentity(window.location.host)
  : provideBehindLoginAceIdentity(window.location.host);
```

The anonymous provider (`provideAceIdentity.ts`) is configured with:

```typescript
{
  env: aceIdentityEnv,
  redirectUri: `https://${host}/insurance/auto/file-a-claim`,
  loginFlow: 'anonymous',
  associatedApp: 'efnol',
  scopes: ['iss.anonymous.efnol'],
  template: 'firstLastPolicyZip',
  searchParams: { tagging: 'auto fnol' },
  disableBypassPkce: true,
  loginUrl: aceLoginUrl  // Points to .../identity/.../anonymous
}
```

### Step 4: User Authentication

User is redirected to the anonymous login page where they enter:

- First Name
- Last Name
- Policy Number
- ZIP Code

### Step 5: Token Processing

After authentication, the hook:

1. Decodes the JWT to extract `policyNumber`
2. Infers `clubCode` from the policy number
3. Dispatches state updates:
   - `setTokenInAppState(token)`
   - `setPolicyNumberInAppState(policyNumber)`
   - `setClubCodeInAppState(clubCode)`
   - `setIsAnonymous(true)`

### Step 6: Render Application

Once `loading=false` and credentials exist, Layout renders `<IntroTransition>` which fetches policy info and navigates to `/whattoexpect`.

---

## Behind Login Flow (`/behindlogin`)

### Step 1: Layout Determines Auth Mode

When the user lands on `/behindlogin`, the check evaluates:

```typescript
isAnonymousRef.current = location.pathname !== Pages.BehindLoginEntry;
// '/behindlogin' !== '/behindlogin' → false
```

`isAnonymousRef.current` = `false`.

### Step 2: Token Retrieval

The hook is called with `isAnonymous: false`.

### Step 3: AceIdentity Configuration

`AccessTokenHelper.ts` routes to the behind-login provider:

```typescript
const aceIdentity = provideBehindLoginAceIdentity(window.location.host);
```

The behind-login provider (`provideBehindLoginAceIdentity.ts`) is configured with:

```typescript
{
  env: aceIdentityEnv,
  redirectUri: `https://${host}/insurance/auto/file-a-claim/behindlogin`,
  loginUrl,  // Points to .../identity/.../login
  scopes: ['profile', 'clubCode', 'scope', 'openid', 'customerId', 'membershipStatus'],
  disableBypassPkce: true,
  bypassAuth2: true
}
```

### Step 4: User Authentication

User is expected to already be authenticated via the main AAA portal. If not, they are redirected to the standard login page.

### Step 5: Token Processing

Same as anonymous flow, but `setIsAnonymous(false)` is dispatched.

### Step 6: Render Application

Same as anonymous flow — renders `<IntroTransition>` and navigates to `/whattoexpect`.

---

## Configuration by Environment

### Anonymous Login URLs

| Environment | URL                                                               |
| ----------- | ----------------------------------------------------------------- |
| Dev1        | `https://appdev1.ace.aaa.com/enterprise/identity/dev/#/anonymous` |
| Dev2        | `https://appdev2.ace.aaa.com/enterprise/identity/dev/#/anonymous` |
| QA1         | `https://appqa1.ace.aaa.com/enterprise/identity/qa/#/anonymous`   |
| QA2         | `https://appqa2.ace.aaa.com/enterprise/identity/qa/#/anonymous`   |
| UAT1/2      | `https://appuat1.ace.aaa.com/enterprise/identity/uat/#/anonymous` |
| Prod        | `https://app.ace.aaa.com/enterprise/identity/prod#/anonymous`     |

### Behind Login URLs

| Environment | URL                                                                      |
| ----------- | ------------------------------------------------------------------------ |
| Dev1        | `https://appdev1.ace.aaa.com/enterprise/identity/dev/#/login`            |
| Dev2        | `https://appdev1.ace.aaa.com/enterprise/identity/dev/#/login/backend/b1` |
| QA1         | `https://appqa1.ace.aaa.com/enterprise/identity/qa/#/login`              |
| QA2         | `https://appqa1.ace.aaa.com/enterprise/identity/qa/#/login/backend/b1`   |
| UAT1        | `https://appuat1.ace.aaa.com/enterprise/identity/uat/#/login`            |
| UAT2        | `https://appuat1.ace.aaa.com/enterprise/identity/uat/#/login/backend/b1` |
| Prod        | `https://app.ace.aaa.com/enterprise/identity/#/login`                    |

---

## Key Differences Summary

| Aspect        | Anonymous (`/`)                      | Behind Login (`/behindlogin`)                                                  |
| ------------- | ------------------------------------ | ------------------------------------------------------------------------------ |
| `isAnonymous` | `true`                               | `false`                                                                        |
| Provider      | `provideAceIdentity()`               | `provideBehindLoginAceIdentity()`                                              |
| Login Flow    | `anonymous`                          | Standard login                                                                 |
| Scopes        | `['iss.anonymous.efnol']`            | `['profile', 'clubCode', 'scope', 'openid', 'customerId', 'membershipStatus']` |
| User Input    | First name, Last name, Policy #, ZIP | Existing authenticated session                                                 |
| Redirect URI  | `/insurance/auto/file-a-claim`       | `/insurance/auto/file-a-claim/behindlogin`                                     |

---

## State Management

The `isAnonymous` flag is stored in app state and persists throughout the session:

```typescript
// store/actions.ts
export const setIsAnonymous = (payload: boolean): Actions => ({
  type: ACTION_TYPE.SET_IS_ANONYMOUS,
  payload
});

// store/reducer.ts
export interface State {
  // ...
  isAnonymous?: boolean;
}

export const initialState: State = {
  // ...
  isAnonymous: true // Default to anonymous
};
```

---

## Development & Testing

### Authorization Bypass

In `local`, `localhost`, or `dev` environments, authentication can be bypassed for testing:

```typescript
// useGenerateTokenAndPolicyNumber.tsx
export const ALLOWS_AUTHORIZATION_HACK_IN = ['local', 'localhost', 'dev'];

export const allowsAuthorizationHack = () => {
  const env = getEnv(window.location.host);
  return ALLOWS_AUTHORIZATION_HACK_IN.includes(env);
};
```

Usage: Pass credentials via URL query parameters:

```
https://localhost:3000/insurance/auto/file-a-claim?token=xxx&policyNumber=xxx
```

### Mobile App Accident Detection

The app also supports passing accident detection parameters:

```
?isMobileAppAccidentDetection=true&crashDatePrediction=2024-01-15
```

These are stored in `localStorage` and persist across the authentication redirect.

---

## File Reference

| File                                                         | Purpose                                      |
| ------------------------------------------------------------ | -------------------------------------------- |
| `containers/Router.tsx`                                      | Route definitions                            |
| `containers/Layout/Layout.tsx`                               | Auth orchestration, determines flow type     |
| `hooks/useAuthenticatedTokenAndPolicyNumber/`                | Main authentication hook                     |
| `hooks/useGenerateTokenAndPolicyNumber/`                     | Deprecated wrapper (backwards compatibility) |
| `utils/AccessTokenHelper/AccessTokenHelper.ts`               | Token generation routing                     |
| `utils/AceIdentityProvider/provideAceIdentity.ts`            | Anonymous AceIdentity config                 |
| `utils/AceIdentityProvider/provideBehindLoginAceIdentity.ts` | Behind-login AceIdentity config              |
| `store/actions.ts`                                           | State actions including `setIsAnonymous`     |
| `store/reducer.ts`                                           | State reducer and initial state              |
| `shared/pages.ts`                                            | Route path constants                         |
