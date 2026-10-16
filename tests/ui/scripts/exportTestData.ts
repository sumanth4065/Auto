/**
 * Prints shell `export` lines sourced from the qa-automation-common test data.
 *
 * Usage (behind-login only needs the username from the artifact):
 *   eval "$(npx tsx scripts/exportTestData.ts CA HUON)"
 *
 * Point at a locally downloaded artifact with COMMON_DATA_DIR:
 *   COMMON_DATA_DIR=~/Downloads/test-data_082426 npx tsx scripts/exportTestData.ts CA HUON
 */
import { getCommonTestData } from "../utilities/CommonTestData";

const state = process.argv[2] || process.env.STATE_INPUT;
const policyType = process.argv[3] || process.env.POLICY_TYPE || "HUON";

const data = getCommonTestData(state, policyType);

if (!data) {
	console.error(
		`No test data found for state="${state}" policyType="${policyType}". ` +
			`Check COMMON_DATA_DIR and that the state exists in the artifact.`,
	);
	process.exit(1);
}

// Behind-login flow only consumes the username from the artifact.
console.log(`export TEST_USERNAME=${data.username}`);
