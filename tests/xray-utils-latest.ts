import fs from 'fs';
import { createRequire } from 'module';
import * as path from 'path';
const requireFromCwd = createRequire(path.join(process.cwd(), 'package.json')) as (id: string) => any;

function unwrapDefaultExport(moduleValue: any): any {
  let current = moduleValue;
  while (
    current &&
    typeof current === 'object' &&
    'default' in current &&
    current.default !== current
  ) {
    current = current.default;
  }
  return current;
}

const axiosModule = requireFromCwd('axios') as any;
const axios = unwrapDefaultExport(axiosModule);
const formDataModule = requireFromCwd('form-data') as any;
const FormData = unwrapDefaultExport(formDataModule);
const dotenvModule = requireFromCwd('dotenv') as any;
const dotenv = unwrapDefaultExport(dotenvModule);
const archiverModule = requireFromCwd('archiver') as any;
const archiver = unwrapDefaultExport(archiverModule);

function createZipArchiveInstance(): any {
  if (typeof archiver === 'function') {
    return archiver('zip', { zlib: { level: 9 } });
  }

  if (archiver && typeof archiver.ZipArchive === 'function') {
    return new archiver.ZipArchive({ zlib: { level: 9 } });
  }

  throw new Error('archiver module did not resolve to a supported archive factory');
}

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

function getJiraApiBase(): string {
  return (process.env.JIRA_BASE_URL || '').replace(/\/$/, '').replace(/\/jira$/, '');
}

async function getXrayToken(): Promise<string> {
  const clientId = process.env.XRAY_CLIENT_ID;
  const clientSecret = process.env.XRAY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('XRAY_CLIENT_ID or XRAY_CLIENT_SECRET missing');
  }

  const response = await axios.post('https://xray.cloud.getxray.app/api/v2/authenticate', {
    client_id: clientId,
    client_secret: clientSecret,
  });
  return response.data;
}

function extractTestExecKey(responseData: any): string | null {
  if (!responseData) return null;
  if (typeof responseData === 'string') return responseData;
  if (responseData.testExecIssueKey) return responseData.testExecIssueKey;
  if (responseData.testExecIssue && responseData.testExecIssue.key) return responseData.testExecIssue.key;
  if (responseData.testExecIssue && responseData.testExecIssueKey) return responseData.testExecIssueKey;
  if (responseData.key) return responseData.key;
  if (responseData.data && responseData.data.testExecIssue && responseData.data.testExecIssue.key) {
    return responseData.data.testExecIssue.key;
  }
  return null;
}

type TestRunStats = {
  total: number;
  failed: number;
  skipped: number;
  passed: number;
};

function toTitleCase(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function getProductFlowName(): string {
  const configuredName = (process.env.XRAY_SUMMARY_PRODUCT || process.env.XRAY_SUMMARY_APP || '').trim();
  if (configuredName) {
    return configuredName;
  }

  const ignoredSegments = new Set(['ui', 'api', 'ada', 'tests', 'test', 'snippets']);
  const segments = process.cwd().replace(/\\/g, '/').split('/').filter(Boolean);
  const candidate = [...segments]
    .reverse()
    .find((segment) => !ignoredSegments.has(segment.toLowerCase()));

  if (!candidate) {
    return 'Test Run';
  }

  return toTitleCase(candidate.replace(/[-_]+/g, ' '));
}

function parseNumericAttribute(tag: string, attributeName: string): number {
  const match = tag.match(new RegExp(`${attributeName}="(\\d+)"`, 'i'));
  return match ? Number.parseInt(match[1], 10) : 0;
}

function parseJUnitStats(xmlData: string): TestRunStats {
  const suiteTags = xmlData.match(/<testsuite\b[^>]*>/gi) || [];
  if (suiteTags.length === 0) {
    return { total: 0, failed: 0, skipped: 0, passed: 0 };
  }

  let total = 0;
  let failed = 0;
  let skipped = 0;

  for (const suiteTag of suiteTags) {
    total += parseNumericAttribute(suiteTag, 'tests');
    failed += parseNumericAttribute(suiteTag, 'failures');
    failed += parseNumericAttribute(suiteTag, 'errors');
    skipped += parseNumericAttribute(suiteTag, 'skipped');
  }

  const passed = Math.max(total - failed - skipped, 0);
  return { total, failed, skipped, passed };
}

function shouldIncludeDescription(): boolean {
  const raw = (process.env.XRAY_INCLUDE_DESCRIPTION || '').trim().toLowerCase();
  return raw === 'true' || raw === '1' || raw === 'yes';
}

function getPacificTimestamp(): string {
  const now = new Date();
  return `${now.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'America/Los_Angeles',
  })} PST`;
}

function buildExecutionSummary(stats: TestRunStats): string {
  const cwd = process.cwd().replace(/\\/g, '/');
  const testType = cwd.endsWith('/ui') ? 'UI' : cwd.endsWith('/api') ? 'API' : cwd.endsWith('/ada') ? 'ADA' : 'Test';
  const product = getProductFlowName();
  const env = (process.env.TEST_ENV || 'UAT').toUpperCase();
  const timestamp = getPacificTimestamp();

  const totalDisplay = stats.total > 0 ? stats.total : 0;
  const resultSnapshot = `${stats.passed}/${totalDisplay} passed, ${stats.failed} failed, ${stats.skipped} skipped`;

  return `${product} | ${testType} | ${env} | ${resultSnapshot} | ${timestamp}`;
}

function buildExecutionDescription(stats: TestRunStats): string {
  const cwd = process.cwd().replace(/\\/g, '/');
  const testType = cwd.endsWith('/ui') ? 'UI' : cwd.endsWith('/api') ? 'API' : cwd.endsWith('/ada') ? 'ADA' : 'Test';
  const product = getProductFlowName();
  const env = (process.env.TEST_ENV || 'UAT').toUpperCase();
  const timestamp = getPacificTimestamp();
  return [
    `Product/Flow: ${product}`,
    `Test Type: ${testType}`,
    `Environment: ${env}`,
    `Result Snapshot: ${stats.passed}/${stats.total} passed, ${stats.failed} failed, ${stats.skipped} skipped`,
    `Generated At: ${timestamp}`,
  ].join('\n');
}

function zipDirectory(sourceDir: string, outPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outPath);
    const archive = createZipArchiveInstance();

    output.on('close', resolve);
    archive.on('error', reject);

    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize();
  });
}

function getJiraAuth(): string {
  const email = process.env.JIRA_EMAIL || '';
  const apiToken = process.env.JIRA_API_TOKEN || '';

  if (!email || !apiToken) {
    throw new Error('JIRA_EMAIL or JIRA_API_TOKEN missing');
  }

  return Buffer.from(`${email}:${apiToken}`).toString('base64');
}

function getJiraLabels(): string[] {
  const rawLabels = process.env.JIRA_LABELS || 'QA_Only,Test_Only';
  return rawLabels
    .split(',')
    .map((label) => label.trim())
    .filter(Boolean);
}

async function uploadAttachmentsToJira(execKey: string) {
  const htmlReportsDir = path.resolve('./htmlreports');

  if (!fs.existsSync(htmlReportsDir)) {
    console.warn('htmlreports directory does not exist; skipping html report attachment.');
    return;
  }

  const zipPath = path.resolve('./test-results/htmlreports.zip');
  const testResultsDir = path.dirname(zipPath);
  if (!fs.existsSync(testResultsDir)) {
    fs.mkdirSync(testResultsDir, { recursive: true });
  }

  await zipDirectory(htmlReportsDir, zipPath);

  const jiraBase = getJiraApiBase();
  if (!jiraBase) {
    console.warn('JIRA_BASE_URL missing; skipping attachment upload.');
    return;
  }

  let auth: string;
  try {
    auth = getJiraAuth();
  } catch (err: any) {
    console.warn(`Jira credentials missing; skipping attachment upload. ${err?.message || ''}`.trim());
    return;
  }

  const url = `${jiraBase}/rest/api/2/issue/${execKey}/attachments`;
  const form = new FormData();
  form.append('file', fs.createReadStream(zipPath), 'htmlreports.zip');

  await axios.post(url, form, {
    headers: {
      Authorization: `Basic ${auth}`,
      'X-Atlassian-Token': 'no-check',
      ...form.getHeaders(),
    },
  });

  console.log(`Attached htmlreports.zip to ${execKey}`);
}

async function addLabels(execKey: string) {
  const jiraBase = getJiraApiBase();
  const labels = getJiraLabels();

  if (!jiraBase) {
    console.warn('JIRA_BASE_URL missing; skipping label update.');
    return;
  }
  if (labels.length === 0) {
    console.warn('No JIRA_LABELS provided; skipping label update.');
    return;
  }

  let auth: string;
  try {
    auth = getJiraAuth();
  } catch (err: any) {
    console.warn(`Jira credentials missing; skipping label update. ${err?.message || ''}`.trim());
    return;
  }

  await axios.put(
    `${jiraBase}/rest/api/2/issue/${execKey}`,
    { update: { labels: labels.map((label) => ({ add: label })) } },
    {
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    },
  );

  console.log(`Applied labels to ${execKey}: ${labels.join(', ')}`);
}

async function transitionToCompleted(execKey: string) {
  const jiraBase = getJiraApiBase();
  if (!jiraBase) {
    console.warn('JIRA_BASE_URL missing; skipping transition updates.');
    return;
  }

  let auth: string;
  try {
    auth = getJiraAuth();
  } catch (err: any) {
    console.warn(`Jira credentials missing; skipping transition updates. ${err?.message || ''}`.trim());
    return;
  }

  const headers = {
    Authorization: `Basic ${auth}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  const getTransitions = async () => {
    const response = await axios.get(`${jiraBase}/rest/api/2/issue/${execKey}/transitions`, { headers });
    const transitions = response.data?.transitions;
    if (!Array.isArray(transitions)) {
      return [];
    }
    return transitions;
  };

  const applyTransitionByName = async (targetName: string): Promise<boolean> => {
    const transitions = await getTransitions();
    if (transitions.length === 0) {
      console.warn(`No transitions available for ${execKey}; cannot move to ${targetName}.`);
      return false;
    }

    const normalizedTarget = targetName.toUpperCase();
    const transition = transitions.find(
      (item: any) => item.name?.toUpperCase() === normalizedTarget || item.to?.name?.toUpperCase() === normalizedTarget,
    );

    if (!transition) {
      return false;
    }

    await axios.post(
      `${jiraBase}/rest/api/2/issue/${execKey}/transitions`,
      { transition: { id: transition.id } },
      { headers },
    );
    return true;
  };

  const getCurrentStatus = async (): Promise<string | null> => {
    try {
      const issue = await axios.get(`${jiraBase}/rest/api/2/issue/${execKey}?fields=status`, { headers });
      return issue.data?.fields?.status?.name || null;
    } catch {
      return null;
    }
  };

  const completedStatusName = (process.env.JIRA_COMPLETED_STATUS || 'COMPLETED').trim();
  const configuredPath = (process.env.JIRA_TRANSITION_PATH || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  // If workflow needs intermediate steps, users can define JIRA_TRANSITION_PATH.
  if (configuredPath.length > 0) {
    for (const stepName of configuredPath) {
      const moved = await applyTransitionByName(stepName);
      if (!moved) {
        console.warn(`Transition ${stepName} not available for ${execKey}; stopping transition flow.`);
        return;
      }
    }
  } else {
    // Default behavior: attempt direct transition to completed-like status.
    const moved = await applyTransitionByName(completedStatusName);
    if (!moved) {
      console.warn(
        `Could not find transition to ${completedStatusName} for ${execKey}. Set JIRA_TRANSITION_PATH for workflow-specific steps.`,
      );
      return;
    }
  }

  const finalStatus = await getCurrentStatus();
  if (finalStatus?.toUpperCase() === completedStatusName.toUpperCase()) {
    console.log(`Transitioned ${execKey} to ${finalStatus}`);
  } else {
    console.warn(
      `Transition attempts completed for ${execKey}, but final status is ${finalStatus || 'unknown'} (expected ${completedStatusName}).`,
    );
  }
}

async function uploadResults() {
  const xmlPath = path.resolve('./test-results/xray-results.xml');
  if (!fs.existsSync(xmlPath)) {
    throw new Error(`JUnit XML not found at ${xmlPath}`);
  }

  const xmlData = fs.readFileSync(xmlPath, 'utf-8');
  const runStats = parseJUnitStats(xmlData);
  const token = await getXrayToken();
  const projectKey = (process.env.XRAY_PROJECT_KEY || '').trim();
  if (!projectKey) {
    throw new Error('XRAY_PROJECT_KEY missing');
  }

  const info: Record<string, any> = {
    fields: {
      project: { key: projectKey },
      summary: buildExecutionSummary(runStats),
      issuetype: { name: 'Test Execution' },
    },
  };

  if (shouldIncludeDescription()) {
    info.fields.description = buildExecutionDescription(runStats);
  }

  if (process.env.TEST_ENV) {
    info.testEnvironments = [process.env.TEST_ENV.toUpperCase()];
  }
  if (process.env.XRAY_PARENT_KEY) {
    info.fields.parent = { key: process.env.XRAY_PARENT_KEY };
  }

  const form = new FormData();
  form.append('results', xmlData, { filename: 'xray-results.xml', contentType: 'text/xml' });
  form.append('info', JSON.stringify(info), { filename: 'info.json', contentType: 'application/json' });

  console.log('Uploading to Xray with info:', JSON.stringify(info, null, 2));

  const response = await axios.post('https://xray.cloud.getxray.app/api/v2/import/execution/junit/multipart', form, {
    headers: {
      Authorization: `Bearer ${token}`,
      ...form.getHeaders(),
    },
  });

  const execKey = extractTestExecKey(response.data) || extractTestExecKey(response.data?.[0]);
  if (!execKey) {
    console.warn('Could not determine Test Execution key from Xray response.');
    return;
  }

  console.log('Test Execution:', execKey);

  const runBestEffort = async (stepName: string, action: () => Promise<void>) => {
    try {
      await action();
    } catch (err: any) {
      console.warn(`${stepName} failed; continuing. ${err?.message || err}`);
    }
  };

  await runBestEffort('Label update', () => addLabels(execKey));
  await runBestEffort('HTML report attachment upload', () => uploadAttachmentsToJira(execKey));
  await runBestEffort('Jira transition update', () => transitionToCompleted(execKey));
}

uploadResults().catch((err) => {
  console.error('Xray upload failed:', err?.message || err);
  if (err?.response) {
    console.error('Response status:', err.response.status);
    console.error('Response data:', JSON.stringify(err.response.data, null, 2));
  }
  process.exit(1);
});
