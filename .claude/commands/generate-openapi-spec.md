---
name: generate-openapi-spec
description: Generates an OpenAPI 3.0 YAML spec from API Gateway config and Lambda source code, with a live Swagger UI server that hot-reloads when config or handlers change
invocation: /generate-openapi-spec [output-file] [--serve] [--port <n>] [--watch]
---

# Generate OpenAPI Spec Command

Produces a complete OpenAPI 3.0 YAML file by reading API Gateway configuration first, then drilling into Lambda handlers, types, and test fixtures for request/response shapes and example data. The output is Postman-importable and lives in `docs/openapi/` alongside a ready-to-run Swagger UI server script.

The server is **never started automatically** — see the Tips section at the end for how to start, watch, and stop it.

## Arguments

- `output-file` (optional): Path for the generated YAML. Defaults to `docs/openapi/openapi.yaml`. The `docs/openapi/` directory is created if it does not exist.
- `--port <n>` (optional): Port baked into the npm script added to `package.json`. Defaults to `4400`.

## Workflow

### Step 1: Locate API Gateway Configuration

Search the repository for the infrastructure entry points, in priority order:

1. **Serverless Framework**: `serverless.yml` / `serverless.yaml` — read `functions` and `events.http` blocks for paths, methods, authorizers, and CORS settings.
2. **AWS CDK**: Files matching `*stack*.ts`, `*api*.ts`, `cdk.json` — look for `RestApi`, `LambdaRestApi`, `HttpApi`, or `addResource`/`addMethod` calls.
3. **CloudFormation / SAM**: `template.yaml`, `template.json` — read `AWS::ApiGateway::RestApi`, `AWS::ApiGateway::Resource`, `AWS::ApiGateway::Method`, and `AWS::Serverless::Api` resources.
4. **API Gateway export**: Any `api-gateway*.json`, `openapi*.json`, `swagger*.json` already present — use as a starting skeleton and enrich it.
5. **Package scripts**: Check `package.json` for scripts named `deploy`, `generate-api`, or similar that invoke CDK/Serverless — they may point to the real config file.

Print a one-line summary of what was found (e.g. `"Found: serverless.yml with 8 functions"`). If nothing is found, stop and ask the user to point to the infrastructure config.

### Step 2: Build the Route Inventory

From the config discovered in Step 1, extract every route and create an internal inventory table:

| Route | Method | Lambda handler file | Authorizer | CORS |
| ----- | ------ | ------------------- | ---------- | ---- |
| /foo  | POST   | src/foo/handler.ts  | jwtAuth    | true |

- Normalize paths (strip stage prefix if present, e.g. `/dev/foo` → `/foo`).
- Note any shared authorizer or CORS config that applies globally so it only appears once in the spec.
- If the config references a shared `basePath`, record it for the `servers` block.

### Step 3: Analyze Lambda Handlers

For each handler file in the inventory, read it to extract:

**Request shape**

- Input validation — look for Zod schemas, JSON schema, `ajv`, joi, or manual field checks at the top of the handler
- Required vs optional fields
- Path parameters and query string parameters
- Expected headers (`X-Correlation-Id`, `Authorization`, etc.)

**Response shape**

- All `return { statusCode, body }` branches — map each status code to its payload structure
- TypeScript return types or interfaces referenced in the file
- Error codes and messages returned on 4xx/5xx paths

**Types**

- Follow `import` statements to `@lib/types`, shared type files, or local interfaces — read those files for the full schema

Collect all discovered TypeScript interfaces and types into a `#/components/schemas` inventory. Name schemas after their TypeScript type name (e.g. `PolicyResponse`, `ValidationError`).

### Step 4: Mine Tests and Stubs for Examples

Search for sample data to populate `examples` fields in the spec:

1. **Test files** (`*.test.ts`, `*.spec.ts`) — extract `it(...)` blocks that call the handler directly or mock HTTP requests; capture the input payloads and expected response bodies.
2. **Fixture files** (`fixtures/`, `__fixtures__/`, `mocks/`, `stubs/`, `testData/`) — read JSON/TS fixture files and map them to the relevant route by file name or by the handler they are imported into.
3. **MSW / nock / axios-mock-adapter handlers** — if present, extract the request matchers and response bodies.
4. **Postman collections already in the repo** — if a `*.postman_collection.json` exists, extract its example requests and responses.

For each route, attach at least one success example and one error example if available. Label them clearly (`example: SuccessCase`, `example: ValidationError`).

If no examples are found for a route, generate minimal placeholder examples from the type shapes discovered in Step 3 — use realistic-looking values (not `string`, `0`, `true`).

### Step 5: Resolve Auth / Security Schemes

Identify authentication:

- **JWT / Bearer**: look for `Authorization` header checks, ACE Identity references, `verifyToken`, `jwtAuth` authorizer names → emit `bearerAuth` security scheme
- **API Key**: look for `x-api-key` header or query param checks → emit `apiKey` security scheme
- **No auth**: routes with CORS-only or public access → mark with `security: []`

Add the security scheme(s) to `#/components/securitySchemes` and apply the correct scheme to each operation.

### Step 6: Assemble the OpenAPI 3.0 Document

Build the YAML document in this order:

```yaml
openapi: "3.0.3"

info:
  title: <derived from package.json name or repo folder name>
  description: <one-line description from package.json or README first paragraph>
  version: <version from package.json>

servers:
  - url: <base URL from config or a placeholder https://api.example.com>
    description: Production
  - url: <dev/local URL if discoverable>
    description: Development

tags:
  - name: <group name>
    description: <short description>

paths:
  /route:
    method:
      tags: [<group>]
      summary: <derived from handler file name or function name>
      operationId: <camelCase unique ID>
      security:
        - bearerAuth: []
      parameters: [...]
      requestBody: ...
      responses:
        "200":
          description: Success
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/SomeType"
              examples:
                SuccessCase:
                  value: { ... }

components:
  securitySchemes: ...
  schemas:
    SomeType:
      type: object
      properties: ...
      required: [...]
```

Rules:

- Every route gets a unique `operationId` (camelCase, e.g. `postFlowDirectorV2`).
- All shared schemas go in `components/schemas` and are referenced with `$ref` — no inline duplication.
- Use `nullable: true` for optional fields that may be `null`, not `required` omission alone.
- Enum values go in `enum:` arrays, not free-text descriptions.
- Include `X-Correlation-Id` as a parameter on every route that logs it.
- Tag routes by their functional area (e.g. `Flow`, `FinanceCompany`, `Address`) derived from the Lambda function name or file path.

### Step 7: Validate the Document

Run a three-pass validation before writing the file.

#### Pass 0 — YAML parse check

Before any structural validation, verify that the assembled YAML is syntactically valid by parsing it with Node's `js-yaml` (locate it under the project's `node_modules/js-yaml`):

```js
const yaml = require("<project-root>/node_modules/js-yaml/index.js");
try {
  yaml.load(specString);
} catch (e) {
  // report line, column, and message; fix before proceeding
}
```

Common causes of YAML parse errors in OpenAPI specs:

- **Unquoted colons in description strings** — any description containing `: ` (colon-space) must be wrapped in double quotes or use a block scalar (`|` or `>`). Example: `description: "Pass as Authorization: Bearer <token>"` not `description: Pass as Authorization: Bearer <token>`.
- **Special characters** (`#`, `{`, `}`, `[`, `]`, `*`, `&`, `!`, `|`, `>`) unquoted in scalar values.
- **Inconsistent indentation** — mixing tabs and spaces, or misaligned list items under a mapping.

If the parse fails, fix every reported error and re-run the parse check before proceeding to Pass 1. Do not write the file until Pass 0 succeeds.

#### Pass 1 — Structural checks

- Every `$ref` resolves to a defined schema in `components/schemas`.
- Every `operationId` is unique across the document.
- Every path parameter in the route (e.g. `{id}`) has a corresponding entry in `parameters`.
- No route is missing a `responses` block.
- The `info.version` is present and non-empty.

#### Pass 2 — Header completeness (re-read each Lambda handler)

For every route in the spec, re-read its Lambda handler file and scan for every header the code actually reads or requires. Cross-check each discovered header against the route's `parameters` array in the spec. Add any that are missing.

Look for headers in:

- `event.headers['<name>']` or `event.headers["<name>"]` access
- Destructured header reads: `const { 'x-correlation-id': correlationId } = event.headers`
- Middleware that extracts headers (e.g. `getCorrelationId(event)`, `extractToken(event)`)
- `req.headers`, `request.headers`, or any wrapper that reads from the headers object
- Response headers set via `headers: { '<name>': value }` — these belong in the relevant response objects, not parameters

For each discovered header, determine:

- **`in: header`** — all request headers
- **`required: true/false`** — required if the handler throws/returns 400 when it is absent; optional otherwise
- **`schema.type`** — typically `string`; use `format: uuid` for correlation/request IDs, `format: jwt` description for Authorization

Common headers such as `Authorization`, `X-Correlation-Id`, `X-Request-Id`, and `Content-Type` may appear in some routes — but treat the Lambda source as the single source of truth. Only include a header if the handler actually reads or enforces it. Do not assume any header is universal.

After reconciling, update the spec in-place with the corrected `parameters` arrays.

Report any headers that were added or changed:

```
Header validation — changes made:
  POST /flow-director-v2   added: X-Correlation-Id (optional)
  POST /initial-data       added: X-Request-Id (optional)
  GET  /finance-company-list  no changes
  ...
```

If no changes were needed, print: `Header validation — all headers already correct.`

Report any validation issues found and fix them before writing.

### Step 8: Write the Output Files

Create `docs/openapi/` if it does not exist. Write:

1. **`docs/openapi/openapi.yaml`** — the complete validated spec.
2. **`docs/openapi/server.mjs`** — a zero-dependency Node.js Swagger UI server (write only if it does not already exist, or if the user asked to regenerate it). Use the template below exactly:

```js
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SPEC_FILE = path.resolve(__dirname, "openapi.yaml");
const PORT = Number(process.env.PORT ?? process.argv[2] ?? 4400);
const CDN = "https://unpkg.com/swagger-ui-dist@5";

const server = http.createServer((req, res) => {
  if (req.url === "/openapi.yaml") {
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    res.end(fs.readFileSync(SPEC_FILE, "utf8"));
  } else if (req.url === "/sse") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    const send = () => res.write("data: reload\n\n");
    fs.watch(SPEC_FILE, send);
    req.on("close", () => {});
  } else {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(`<!DOCTYPE html>
<html>
<head>
  <title>API Docs</title>
  <link rel="stylesheet" href="${CDN}/swagger-ui.css">
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="${CDN}/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({
      url: '/openapi.yaml',
      dom_id: '#swagger-ui',
      presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset]
    })
    const es = new EventSource('/sse')
    es.onmessage = () => location.reload()
  </script>
</body>
</html>`);
  }
});

server.listen(PORT, () => {
  console.log(`Swagger UI  →  http://localhost:${PORT}`);
  console.log(`Spec file   →  ${SPEC_FILE}`);
  console.log("Press Ctrl+C to stop.");
});
```

3. **`package.json` scripts** — add (or update) these two entries in the root `package.json` `scripts` block. If `package.json` does not exist at the repo root, skip this step and note it in the summary.

```json
"docs:api": "node docs/openapi/server.mjs",
"docs:api:watch": "npx -y swagger-ui-watcher docs/openapi/openapi.yaml --port 4400"
```

If a custom `--port` was passed, substitute that value in place of `4400` in both scripts.

**Do NOT start the server.** Just write the files and scripts.

Then print a summary:

```
✓ docs/openapi/openapi.yaml written
  Routes: 8
  Schemas: 12
  Examples: 21 (6 routes have no examples — placeholders used)
  Auth: bearerAuth (JWT)

✓ docs/openapi/server.mjs written
✓ package.json — added scripts: docs:api, docs:api:watch

Import into Postman:
  File → Import → select docs/openapi/openapi.yaml

Run /generate-readme (or /generate-readme --update) to include this spec in the repository README.

See the Tips section below for how to start and stop the Swagger UI server.
```

If any routes had no example data, list them by name so the user knows where to add real examples later.

## Usage Examples

```bash
# Generate spec (default output: docs/openapi/openapi.yaml)
/generate-openapi-spec

# Custom output path
/generate-openapi-spec docs/api/openapi.yaml

# Custom port baked into the npm scripts
/generate-openapi-spec --port 8080
```

## Notes

- All steps are read-only analysis and file generation. The server is never started automatically.
- All generated files live in `docs/openapi/` — commit both `openapi.yaml` and `server.mjs` to the repo.
- If the repo uses a monorepo layout (Lerna, Nx, Turborepo), scope the analysis to the package containing the API Gateway config. Ask the user which package if ambiguous.
- If multiple API Gateways are found (e.g. one per service), generate one spec per gateway and name them accordingly (e.g. `openapi-auth.yaml`, `openapi-policy.yaml`), and add a separate `docs:api:<name>` script for each.
- The generated spec targets **OpenAPI 3.0.3** for maximum Postman compatibility. Do not use OpenAPI 3.1 features.
- The Swagger UI server is for local development only — it is not a deployed service and should not be proxied.

## Tips

### Start the server

```bash
yarn docs:api
# or
npm run docs:api
# or directly
node docs/openapi/server.mjs
```

Open **http://localhost:4400** in your browser. The page auto-reloads whenever `openapi.yaml` changes on disk.

### Change the port

```bash
PORT=8080 yarn docs:api
# or
node docs/openapi/server.mjs 8080
```

### Watch mode (auto-regenerate spec on handler/config changes)

`docs:api:watch` uses `swagger-ui-watcher` which both regenerates the spec and live-reloads the browser:

```bash
yarn docs:api:watch
```

This requires `npx` (bundled with Node). No install needed — `npx -y` downloads it on first run.

### Stop the server

Press **Ctrl+C** in the terminal where the server is running.

If you started it in the background, find and kill the process:

```bash
lsof -ti :4400 | xargs kill
```
