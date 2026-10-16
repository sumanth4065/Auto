---
name: setup-splunk-apm-rum
description: Sets up Splunk OpenTelemetry instrumentation for ACE Clublabs projects — Splunk RUM (@splunk/otel-web) for Vite/React frontends and Splunk APM via Lambda Layer + CDK env vars for AWS Lambda backends.
trigger: when user mentions "setup-splunk-apm-rum", "add Splunk RUM", "add Splunk APM", "instrument the frontend with Splunk", "add observability", "set up OTel", "add tracing to Lambda", "configure Splunk monitoring", "add @splunk/otel-web", or "add the Splunk Lambda layer"
arguments: [pattern]
allowed-tools: Bash(find *) Bash(ls *) Bash(grep *) Read Write Edit
---

# Setup Splunk APM + RUM

Instruments ACE Clublabs projects with Splunk OpenTelemetry. Two independent patterns — apply one or both depending on the project.

- **Web RUM** — Vite/React frontends via `@splunk/otel-web`
- **Lambda APM** — AWS Lambda (Node.js, ARM64) via Splunk APM Lambda Layer + CDK env vars; zero handler code changes required

If `$pattern` is `web`, apply Pattern A only. If `lambda`, Pattern B only. If omitted, ask the user which they need.

---

## Getting Tokens

Splunk tokens are provisioned by **DCS Monitoring Engineering** — your team manages where they are stored.

### Step 1 — Request tokens from DCS Monitoring Engineering

Raise a Work Order at: https://aceitsm-is.onbmc.com/helix/index.html#/com.bmc.dsm.itsm-applications/view/com.bmc.dsm.itsm-applications:Work%20Order%20PV%20View?mappingName=createWorkorder

Assign it to: **DCS Monitoring Engineering**

Include in the request:
- Project / application name
- Which tokens are needed: RUM token, APM token, or both
- Target environments (dev, qa, uat, prod)

DCS will provision the tokens in Splunk Observability Cloud and send the values back to you.

### Step 2 — Store the tokens (your team owns this)

DCS does not have access to your GitHub repo or AWS accounts — token storage is your team's responsibility.

**For the RUM token (Web pattern):**

Add it as a GitHub Actions secret in your repo:
- Go to **Settings → Secrets and variables → Actions → New repository secret**
- Name: `VITE_SPLUNK_RUM_AUTH`
- Value: the token DCS provided

The CI build injects it automatically — no code change needed. When DCS rotates the token, update this secret with the new value.

**For the APM token (Lambda pattern):**

Store it in AWS Secrets Manager before deploying the CDK stack:
```bash
aws secretsmanager create-secret \
  --name splunk/apm/token \
  --secret-string "TOKEN_FROM_DCS" \
  --region us-west-2 \
  --profile YOUR_AWS_PROFILE
```

When DCS rotates it, update the secret value:
```bash
aws secretsmanager put-secret-value \
  --secret-id splunk/apm/token \
  --secret-string "NEW_TOKEN_FROM_DCS" \
  --region us-west-2 \
  --profile YOUR_AWS_PROFILE
```

### Responsibility split

| Task | Owner |
|---|---|
| Provision token in Splunk Observability Cloud | DCS Monitoring Engineering |
| Rotate token when required | DCS Monitoring Engineering (notifies you of new value) |
| Add/update GitHub Actions secret | Your team |
| Add/update AWS Secrets Manager secret | Your team |

---

## Placeholders

Collect these values from the user before starting — tokens come from the work order above:

| Placeholder | Description | Example |
|---|---|---|
| `VITE_SPLUNK_RUM_AUTH` | Splunk RUM access token (from DCS Monitoring Engineering) | `1xXpKs5uud8mHSRwfioqYQ` |
| `YOUR_APP_NAME` | App name shown in Splunk dashboards | `TravelSchedulerWeb` |
| `YOUR_LAMBDA_NAME_PREFIX` | Prefix for Lambda service names in APM | `travel-scheduler` |
| `your/secretsmanager/path` | Secrets Manager path for the APM token | `splunk/apm/token` |

These are shared constants — use verbatim:
- Beacon URL: `https://rum-ingest.us1.signalfx.com/v1/rum`
- Splunk realm: `us1`
- Lambda layer ARN: `arn:aws:lambda:${region}:254067382080:layer:splunk-apm-arm:49`

---

## Pattern A: Web RUM

### Step 1 — Add npm dependencies

In the web package's `package.json`, add to `dependencies` (not `devDependencies`):

```json
"@splunk/otel-web": "^3.0.0",
"@ace-clublabs/log-cannon": "^10.2.2"
```

Skip any that are already present.

### Step 2 — Create the instrumentation module

Create `src/splunk-instrumentation.ts` in the web package:

```ts
import { getEnvironmentFromHost } from '@ace-clublabs/log-cannon';
import SplunkOtelWeb from '@splunk/otel-web';
import { splunkRUM } from './constants';

const getAppVersionFromMeta = () => {
  return (
    document?.querySelector('meta[name="version"]')?.getAttribute('content') ||
    'unknown-version'
  );
};

if (import.meta.env.PROD && splunkRUM.SPLUNK_RUM_AUTH) {
  SplunkOtelWeb.init({
    beaconEndpoint: splunkRUM.SPLUNK_BEACON_URL,
    rumAccessToken: splunkRUM.SPLUNK_RUM_AUTH,
    applicationName: splunkRUM.SPLUNK_APP_NAME,
    version: getAppVersionFromMeta(),
    deploymentEnvironment: getEnvironmentFromHost(),
  });
}
```

### Step 3 — Add the splunkRUM constants

In the project's constants file (typically `src/constants.ts`), add:

```ts
export const splunkRUM = {
  SPLUNK_RUM_AUTH: import.meta.env.VITE_SPLUNK_RUM_AUTH as string,
  SPLUNK_BEACON_URL: 'https://rum-ingest.us1.signalfx.com/v1/rum',
  SPLUNK_APP_NAME: 'YOUR_APP_NAME',
};
```

Add the var to `.env` (gitignored — populate with the token from the work order):

```
VITE_SPLUNK_RUM_AUTH=''
```

Add it to `.env.example` (committed — empty value, documents that the var is required):

```
VITE_SPLUNK_RUM_AUTH=''
```

The token is never committed to source control. CI/CD pipelines inject `VITE_SPLUNK_RUM_AUTH` as a build-time environment variable so Vite bakes the correct value into each environment's bundle.

### Step 4 — Wire the import into the entry point

In `src/main.tsx` (or whichever file calls `ReactDOM.createRoot`), add as the **very first line**:

```ts
import './splunk-instrumentation';
```

OTel must initialise before React's module graph evaluates. First import = first to execute.

### Step 5 — Add the version meta tag

In `index.html`, inside `<head>`, add:

```html
<meta name="version" content="%VERSION%" />
```

`%VERSION%` is replaced at build time. Confirm the build pipeline's injection mechanism (Vite plugin, CI `sed`, etc.). The SDK falls back to `'unknown-version'` if unsubstituted — not a crash, but version filtering in Splunk won't work.

### Verification — Web RUM

- [ ] `@splunk/otel-web` is in `dependencies` (not `devDependencies`)
- [ ] `splunk-instrumentation.ts` exists and calls `SplunkOtelWeb.init()` with all five fields
- [ ] `import './splunk-instrumentation'` is the first import in the entry point
- [ ] `<meta name="version" content="%VERSION%">` is present in `index.html`
- [ ] No unsubstituted placeholders (`YOUR_APP_NAME`) remain and `VITE_SPLUNK_RUM_AUTH` is set in `.env.local` / CI secrets

---

## Pattern B: Lambda APM

### Step 1 — Locate the CDK Lambda construct

Find the file that instantiates `NodejsFunction`. In projects following the standard ACE pattern this is a class extending `NestedStack`. In simpler projects it may be inline in a single stack file.

### Step 2 — Add the layer and env vars

Immediately before the `NodejsFunction` instantiation, add:

```ts
const envLambdaName = `YOUR_LAMBDA_NAME_PREFIX-${lambdaName}-${environment}`;

const lambdaLayers = [
  lambda.LayerVersion.fromLayerVersionArn(
    this,
    `${envLambdaName}-SplunkAPMLayer`,
    `arn:aws:lambda:${this.region}:254067382080:layer:splunk-apm-arm:49`,
  ),
];

const splunkAPMvars = {
  SPLUNK_ACCESS_TOKEN: cdk.SecretValue.secretsManager('your/secretsmanager/path').toString(),
  SPLUNK_REALM: 'us1',
  AWS_LAMBDA_EXEC_WRAPPER: '/opt/nodejs-otel-handler',
  OTEL_SERVICE_NAME: envLambdaName,
  OTEL_RESOURCE_ATTRIBUTES: `deployment.environment=${environment}`,
  SPLUNK_PROFILER_MEMORY_ENABLED: 'false',
  SPLUNK_PROFILER_ENABLED: 'false',
  HTTP_TRACING: 'true',
};
```

Substitute `YOUR_LAMBDA_NAME_PREFIX` and `your/secretsmanager/path`. The `envLambdaName` (`{prefix}-{lambdaName}-{environment}`) becomes `OTEL_SERVICE_NAME` — must be unique per function + environment.

### Step 3 — Wire into NodejsFunction

Add to the `NodejsFunction` props:

```ts
layers: lambdaLayers,
environment: { ...this.envVariables, ...splunkAPMvars }, // splunkAPMvars last so it wins
tracing: lambda.Tracing.ACTIVE,
```

### Step 4 — Attach IAM permissions

After Lambda construction, add:

```ts
this.lambdaFn.role?.addManagedPolicy(
  ManagedPolicy.fromAwsManagedPolicyName('AWSXRayDaemonWriteAccess'),
);
```

Add `secretsmanager:GetSecretValue` access (trailing `*` required — Secrets Manager appends a 6-char random suffix to every secret ARN):

```ts
const stack = Stack.of(this);
new PolicyStatement({
  effect: Effect.ALLOW,
  actions: ['secretsmanager:GetSecretValue'],
  resources: [
    `arn:aws:secretsmanager:${stack.region}:${stack.account}:secret:your/secretsmanager/path*`,
  ],
}),
```

### Step 5 — Ensure the secret exists

The Secrets Manager secret must exist before the CDK stack deploys. If it doesn't exist, use `create-aws-secret.sh` (in `packages/scheduler-api/scripts/` for ACE projects) with the `plaintext` type option.

### Verification — Lambda APM

- [ ] `lambdaLayers` includes the Splunk APM layer ARN
- [ ] `splunkAPMvars` contains all eight variables with correct values
- [ ] `NodejsFunction` has `layers`, `environment` (APM vars spread last), and `tracing: lambda.Tracing.ACTIVE`
- [ ] `AWSXRayDaemonWriteAccess` managed policy is attached to the Lambda role
- [ ] IAM policy permits `secretsmanager:GetSecretValue` on the APM token secret ARN (with trailing `*`)
- [ ] No unsubstituted placeholders remain

---

## Non-Standard Layouts

- **x86_64 Lambdas**: replace `splunk-apm-arm` with `splunk-apm` in the layer name
- **`lambda.Function` instead of `NodejsFunction`**: `layers`, `environment`, and `tracing` props are identical
- **Webpack instead of Vite**: use `HtmlWebpackPlugin` interpolation or a CI `sed` for `%VERSION%`
- **Profilers are disabled by default**: `SPLUNK_PROFILER_ENABLED` and `SPLUNK_PROFILER_MEMORY_ENABLED` are `'false'` — enabling them adds CPU/memory overhead; benchmark before enabling in production
