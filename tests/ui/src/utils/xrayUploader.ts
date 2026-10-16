import axios from 'axios';
import fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import FormData from 'form-data';

dotenv.config({ path: `env-files/.env.${process.env.TEST_ENV || 'uat'}` });

async function getXrayToken(): Promise<string> {
    const clientId = process.env.XRAY_CLIENT_ID;
    const clientSecret = process.env.XRAY_CLIENT_SECRET;

    if (!clientId || !clientSecret) throw new Error('XRAY_CLIENT_ID or XRAY_CLIENT_SECRET missing');

    const response = await axios.post(
        'https://xray.cloud.getxray.app/api/v2/authenticate',
        { client_id: clientId, client_secret: clientSecret }
    );
    return response.data;
}

function extractTestExecKey(responseData: any): string | null {
    if (!responseData) return null;
    // Common shapes returned by Xray import
    if (typeof responseData === 'string') return responseData;
    if (responseData.testExecIssueKey) return responseData.testExecIssueKey;
    if (responseData.testExecIssue && responseData.testExecIssue.key) return responseData.testExecIssue.key;
    if (responseData.testExecIssue && responseData.testExecIssueKey) return responseData.testExecIssueKey;
    if (responseData.key) return responseData.key;
    // sometimes payload is nested
    if (responseData.data && responseData.data.testExecIssue && responseData.data.testExecIssue.key) return responseData.data.testExecIssue.key;
    return null;
}

async function uploadAttachmentsToJira(issueKey: string) {
    const jiraBase = process.env.JIRA_BASE_URL; // e.g. https://your-domain.atlassian.net
    const jiraEmail = process.env.JIRA_EMAIL;
    const jiraApiToken = process.env.JIRA_API_TOKEN;

    if (!jiraBase || !jiraEmail || !jiraApiToken) {
        console.warn('JIRA credentials missing; skipping attachment upload. Set JIRA_BASE_URL, JIRA_EMAIL, and JIRA_API_TOKEN.');
        return;
    }

    const artifactsDir = path.resolve('./test-results');
    if (!fs.existsSync(artifactsDir)) {
        console.warn('Artifacts directory does not exist, skipping attachments.');
        return;
    }

    const files = fs.readdirSync(artifactsDir)
        .filter(f => /\.(png|jpg|jpeg|zip|trace|har)$/i.test(f))
        .map(f => path.join(artifactsDir, f));

    if (files.length === 0) {
        console.log('No artifact files found to upload.');
        return;
    }

    const form = new FormData();
    for (const filePath of files) {
        form.append('file', fs.createReadStream(filePath));
    }

    const auth = Buffer.from(`${jiraEmail}:${jiraApiToken}`).toString('base64');
    const attachUrl = `${jiraBase.replace(/\/$/, '')}/rest/api/3/issue/${issueKey}/attachments`;

    try {
        const uploadRes = await axios.post(attachUrl, form, {
            headers: {
                Authorization: `Basic ${auth}`,
                'X-Atlassian-Token': 'no-check',
                ...form.getHeaders(),
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
        });
        console.log(`Uploaded ${files.length} attachments to ${issueKey}. Status: ${uploadRes.status}`);
    } catch (err: any) {
        console.error('Failed to upload attachments to Jira:', err?.response?.data || err.message || err);
    }
}

async function uploadResults() {
    const xmlPath = path.resolve('./test-results/xray-results.xml');
    if (!fs.existsSync(xmlPath)) {
        throw new Error(`JUnit XML not found at ${xmlPath}`);
    }
    const xmlData = fs.readFileSync(xmlPath, 'utf-8');

    const token = await getXrayToken();
    const projectKey = process.env.XRAY_PROJECT_KEY || 'ISS';

    const url = `https://xray.cloud.getxray.app/api/v2/import/execution/junit?projectKey=${projectKey}`;

    const response = await axios.post(url, xmlData, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'text/xml',
        },
    });

    console.log('Xray import response:', response.data);

    const execKey = extractTestExecKey(response.data) || extractTestExecKey(response.data[0]);
    if (!execKey) {
        console.warn('Could not determine Test Execution key from Xray response; skipping attachments.');
        return;
    }

    console.log('Detected Test Execution key:', execKey);
    await uploadAttachmentsToJira(execKey);
}

uploadResults().catch(err => {
    console.error('Xray upload failed:', err?.message || err);
    process.exit(1);
});
