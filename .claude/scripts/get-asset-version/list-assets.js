const args = process.argv.slice(2);

const showHelp = args.includes('--help') || args.includes('-h');

if (showHelp) {
  console.log(`Usage: node list-assets.js [options]

Options:
  --help, -h           Show this help message
  --sort=<mode>, -s    Sort output by [ asset | app ] where app is the default
  --version=<mode>, -v Display asset with version number by [ h | highest | a | all ]  where highest is the default
`);
  process.exit(0);
}

const fs = require('fs');
const readline = require('readline');

const FILE_NAME = 'asset_versions.txt';

const DEFAULT_SORT_MODE = 'app';
const SUPPORTED_SORT_MODES = new Set(['asset', 'ass', 'app']);

const DEFAULT_VERSION_MODE = 'highest';
const SUPPORTED_VERSION_MODES = new Set(['highest', 'h', 'all', 'a']);

const ASSET_REGEX = /([A-Za-z][A-Za-z0-9-]*-[0-9]{1,4}(?:\.[0-9]{1,4}){3})/g;

const APP_SUFFIXES = [
  'Api',
  'App',
  'Gateway',
  'Guidewire',
  'Gw',
  'Huon',
  'Web'
];
const GROUP_PREFIX_REGEX = new RegExp(
  `^(.*?)(?:${APP_SUFFIXES.join('|')})`,
  'i'
);

const compareVersions = (versionA, versionB) => {
  const partsA = versionA.split('.').map(Number);
  const partsB = versionB.split('.').map(Number);

  for (let i = 0; i < 4; i += 1) {
    const diff = (partsA[i] || 0) - (partsB[i] || 0);
    if (diff !== 0) return diff;
  }

  return 0;
};

const getAppKey = assetName => {
  const match = assetName.match(GROUP_PREFIX_REGEX);
  if (match && match[1]) return match[1].replace(/[-_]+$/, '');
  return assetName;
};

const findHighestVersionByAsset = items => {
  const assets = new Map();

  items.forEach(item => {
    const splitIndex = item.lastIndexOf('-');
    if (splitIndex === -1) return;
    const assetName = item.slice(0, splitIndex);
    const version = item.slice(splitIndex + 1);
    const current = assets.get(assetName);

    if (!current || compareVersions(version, current.version) > 0) {
      assets.set(assetName, { version, value: item });
    }
  });

  return Array.from(assets, ([name, value]) => value);
};

const groupByAppName = assets => {
  const apps = new Map();

  const entries = Array.isArray(assets)
    ? assets
        .map(item => {
          const value = typeof item === 'string' ? item : item.value;
          if (!value) return null;
          const splitIndex = value.lastIndexOf('-');
          if (splitIndex === -1) return null;
          return {
            assetName: value.slice(0, splitIndex),
            value
          };
        })
        .filter(Boolean)
    : Array.from(assets.entries()).map(([assetName, data]) => ({
        assetName,
        value: data.value
      }));

  entries
    .sort((a, b) => a.assetName.localeCompare(b.assetName))
    .forEach(({ assetName, value }) => {
      const appKey = getAppKey(assetName);
      if (!apps.has(appKey)) apps.set(appKey, []);
      apps.get(appKey).push({ assetName, value });
    });

  return apps;
};

const displayByAssetNames = assets => {
  Array.from(assets.entries())
    .sort((a, b) => {
      const assetA = typeof a[1] === 'string' ? a[1] : a[1].value;
      const assetB = typeof b[1] === 'string' ? b[1] : b[1].value;
      return assetA.localeCompare(assetB);
    })
    .forEach(([, data]) =>
      console.log(typeof data === 'string' ? data : data.value)
    );
};

const displayByAppNames = apps => {
  Array.from(apps.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([appKey, appItems]) => {
      console.log(`\n${appKey}`);
      appItems
        .slice()
        .sort((a, b) => a.assetName.localeCompare(b.assetName))
        .forEach(({ value }) => console.log(`  ${value}`));
    });
};

const displayAssets = (allAssets, sortMode, showOnlyHighestVersion) => {
  const assets = showOnlyHighestVersion
    ? findHighestVersionByAsset(allAssets)
    : allAssets;

  switch (sortMode) {
    case 'asset':
    case 'ass': {
      const totalAssets = assets.length;
      console.log(`Number of assets: ${totalAssets}`);
      displayByAssetNames(assets);
      break;
    }
    case 'app': {
      const apps = groupByAppName(assets);
      const totalApps = apps.size;
      console.log(`Number of apps: ${totalApps}`);
      displayByAppNames(apps);
      break;
    }
  }
};

const getAsset = line => {
  const s = line.trim();
  const results = s.match(ASSET_REGEX);
  return results ?? [];
};

async function readFile(filePath, sortMode, highestVersionMode) {
  const assets = [];

  const lineHandle = readline.createInterface({
    input: fs.createReadStream(filePath),
    crlfDelay: Infinity
  });

  lineHandle.on('line', line => {
    const matches = getAsset(line);
    if (matches.length > 0) assets.push(...matches);
  });

  await new Promise(resolve => lineHandle.once('close', resolve));

  displayAssets(assets, sortMode, highestVersionMode);
}

const getSortMode = () => {
  const arg1 = args.find(arg => arg.startsWith('--sort=')) || '';
  const value1 = arg1.split('=')[1];

  const arg2 = args.findIndex(arg => arg === '-s');
  const value2 = arg2 !== -1 && args[arg2 + 1] ? args[arg2 + 1] : '';

  const userInput = value1 || value2;

  if (userInput && !SUPPORTED_SORT_MODES.has(userInput)) {
    console.warn(
      `Unsupported sort mode "${userInput}". Falling back to "${DEFAULT_SORT_MODE}".`
    );
  }

  return SUPPORTED_SORT_MODES.has(userInput) ? userInput : DEFAULT_SORT_MODE;
};

const getVersionMode = () => {
  const arg1 = args.find(arg => arg.startsWith('--version=')) || '';
  const value1 = arg1.split('=')[1];

  const arg2 = args.findIndex(arg => arg === '-v');
  const value2 = arg2 !== -1 && args[arg2 + 1] ? args[arg2 + 1] : '';

  const userInput = value1 || value2;
  if (userInput && !SUPPORTED_VERSION_MODES.has(userInput)) {
    console.warn(
      `Unsupported version mode "${userInput}". Falling back to "${DEFAULT_VERSION_MODE}".`
    );
  }

  const mode = SUPPORTED_VERSION_MODES.has(userInput)
    ? userInput
    : DEFAULT_VERSION_MODE;

  return ['h', 'highest'].includes(mode);
};

const sortMode = getSortMode();
const highestVersionMode = getVersionMode();

readFile(FILE_NAME, sortMode, highestVersionMode);
