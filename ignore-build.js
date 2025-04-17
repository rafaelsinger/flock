const branch = process.env.VERCEL_GIT_BRANCH;
const environment = process.env.VERCEL_ENV; // "production", "preview", "development"

// skip if not production or not staging
if (environment !== 'production' || (environment === 'preview' && branch !== 'staging')) {
  console.log(`🛑 Ignoring build: branch is "${branch}" and not "staging"`);
  process.exit(0); // skip the build
}

console.log(`✅ Proceeding with build on branch "${branch}" in "${environment}" environment`);
process.exit(1); // continue with build
