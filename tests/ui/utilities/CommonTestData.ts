import * as fs from "fs";
import * as path from "path";

export interface CommonPolicyRecord {
	clubCode: string;
	username: string;
	zipCode: string;
	clubRegion: string;
	firstName: string;
	lastName: string;
	productId: string;
	policyType: string;
	subType: string;
	currentStatus?: { status?: string; inRenewal?: boolean };
}

export interface SelectedTestData {
	username: string;
	policynumber: string;
	clubCode: string;
	clubRegion: string;
	firstName: string;
	lastName: string;
	zipcode: string;
}

// Maps the workflow state code to the AAA club code used in the common test data.
const STATE_TO_CLUBCODE: Record<string, string> = {
	CA: "004",
	TX: "252",
	NM: "601",
	NNE: "036",
	TW: "258",
	HI: "018",
	ACMO: "065",
	EC: "215",
	AL: "001",
};

// Maps the workflow state code to the clubRegion label in the common test data.
const STATE_TO_CLUBREGION: Record<string, string> = {
	CA: "California",
	TX: "Texas",
	NM: "New Mexico",
	HI: "Hawaii",
	EC: "Pennsylvania",
	AL: "Alabama",
};

// Maps the workflow policy type to the source JSON file in the products folder.
const POLICY_TYPE_TO_FILE: Record<string, string> = {
	HUON: "autoHuon.json",
	GW: "autoGw.json",
};

// Root where the qa-automation-common artifact is downloaded by the workflow.
// Can be overridden locally with COMMON_DATA_DIR (e.g. the downloaded folder).
const COMMON_DATA_ROOT = process.env.COMMON_DATA_DIR
	? path.resolve(process.env.COMMON_DATA_DIR)
	: path.resolve(__dirname, "..", "testdata", "common");

// The artifact may extract into a dated subfolder, so search recursively.
function findJsonFile(root: string, fileName: string): string | undefined {
	if (!fs.existsSync(root)) return undefined;
	const stack = [root];
	while (stack.length) {
		const dir = stack.pop() as string;
		let entries: fs.Dirent[];
		try {
			entries = fs.readdirSync(dir, { withFileTypes: true });
		} catch {
			continue;
		}
		for (const entry of entries) {
			const full = path.join(dir, entry.name);
			if (entry.isDirectory()) {
				stack.push(full);
			} else if (entry.isFile() && entry.name === fileName) {
				return full;
			}
		}
	}
	return undefined;
}

export function getCommonTestData(
	state?: string,
	policyType?: string,
	region = "A1",
): SelectedTestData | undefined {
	if (!state || !policyType) return undefined;

	const fileName = POLICY_TYPE_TO_FILE[policyType.toUpperCase()];
	const clubCode = STATE_TO_CLUBCODE[state.toUpperCase()];
	if (!fileName || !clubCode) return undefined;

	// Reuse the selection for the whole run so beforeAll and the test body
	// (and workers that re-import this config) use the same user.
	const cacheKey = `__COMMON_TD_${clubCode}_${region}_${policyType.toUpperCase()}`;
	if (process.env[cacheKey]) {
		try {
			return JSON.parse(process.env[cacheKey] as string) as SelectedTestData;
		} catch {
			// fall through and re-select
		}
	}

	const filePath = findJsonFile(COMMON_DATA_ROOT, fileName);
	if (!filePath) {
		console.warn(
			`[CommonTestData] Test data '${fileName}' not found in ${COMMON_DATA_ROOT}; using fallback data.`,
		);
		return undefined;
	}
	const artifactId = filePath.match(/test-data[_-]?\d+/i)?.[0] ?? filePath;
	console.log(`[CommonTestData] Source artifact: ${artifactId}`);

	let records: CommonPolicyRecord[];
	try {
		records = JSON.parse(fs.readFileSync(filePath, "utf-8"));
	} catch {
		return undefined;
	}

	// Filter by clubRegion (e.g. "California") when known, otherwise by club code.
	const regionName = STATE_TO_CLUBREGION[state.toUpperCase()];
	const inForceForClub = records.filter(
		(r) => r.clubCode === clubCode && r.currentStatus?.status === "In Force",
	);
	// Prefer records matching the clubRegion, but fall back if none match.
	const regionFiltered = regionName
		? inForceForClub.filter((r) => r.clubRegion === regionName)
		: inForceForClub;
	const regionPool = regionFiltered.length > 0 ? regionFiltered : inForceForClub;
	// Only real MyAccount logins for the region, e.g. 004_A1_<digits>@aaa.com.
	const loginPattern = new RegExp(`^${clubCode}_${region}_\\d+@aaa\\.com$`, "i");
	const candidates = regionPool.filter((r) => loginPattern.test(r.username));

	const pool = candidates.length > 0 ? candidates : regionPool;
	if (pool.length === 0) return undefined;

	// Pick a random record so each run uses different test data.
	const match = pool[Math.floor(Math.random() * pool.length)];

	const selected: SelectedTestData = {
		username: match.username,
		policynumber: match.productId,
		clubCode: match.clubCode,
		clubRegion: match.clubRegion,
		firstName: match.firstName,
		lastName: match.lastName,
		zipcode: match.zipCode,
	};

	process.env[cacheKey] = JSON.stringify(selected);
	console.log(
		`[CommonTestData] ${policyType.toUpperCase()} ${region} ${selected.clubRegion}: ` +
			`${selected.username} (policy ${selected.policynumber})`,
	);
	return selected;
}

// Returns all valid login candidates for the state/policy type, shuffled, so a
// caller can try them in order and pick the first that actually works.
export function getCommonTestDataCandidates(
	state?: string,
	policyType?: string,
	region = "A1",
): SelectedTestData[] {
	if (!state || !policyType) return [];

	const fileName = POLICY_TYPE_TO_FILE[policyType.toUpperCase()];
	const clubCode = STATE_TO_CLUBCODE[state.toUpperCase()];
	if (!fileName || !clubCode) return [];

	const filePath = findJsonFile(COMMON_DATA_ROOT, fileName);
	if (!filePath) {
		console.warn(
			`[CommonTestData] Test data '${fileName}' not found in ${COMMON_DATA_ROOT}; using fallback data.`,
		);
		return [];
	}

	// Surface which artifact the data came from (e.g. test-data_091626).
	const artifactId = filePath.match(/test-data[_-]?\d+/i)?.[0] ?? filePath;
	console.log(`[CommonTestData] Source artifact: ${artifactId}`);

	let records: CommonPolicyRecord[];
	try {
		records = JSON.parse(fs.readFileSync(filePath, "utf-8"));
	} catch {
		return [];
	}

	const regionName = STATE_TO_CLUBREGION[state.toUpperCase()];
	const inForceForClub = records.filter(
		(r) => r.clubCode === clubCode && r.currentStatus?.status === "In Force",
	);
	const regionFiltered = regionName
		? inForceForClub.filter((r) => r.clubRegion === regionName)
		: inForceForClub;
	const regionPool = regionFiltered.length > 0 ? regionFiltered : inForceForClub;
	const loginPattern = new RegExp(`^${clubCode}_${region}_\\d+@aaa\\.com$`, "i");
	const candidates = regionPool.filter((r) => loginPattern.test(r.username));
	const pool = candidates.length > 0 ? candidates : regionPool;

	// De-duplicate by username, then shuffle for variety across runs.
	const seen = new Set<string>();
	const unique = pool.filter((r) => {
		if (seen.has(r.username)) return false;
		seen.add(r.username);
		return true;
	});
	for (let i = unique.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[unique[i], unique[j]] = [unique[j], unique[i]];
	}

	return unique.map((m) => ({
		username: m.username,
		policynumber: m.productId,
		clubCode: m.clubCode,
		clubRegion: m.clubRegion,
		firstName: m.firstName,
		lastName: m.lastName,
		zipcode: m.zipCode,
	}));
}
