const branch = process.env.VERCEL_GIT_COMMIT_REF;
const environment = process.env.VERCEL_ENV;

// Only build if it's production OR if it's preview and the branch is staging
if (environment === 'production' || (environment === 'preview' && branch === 'staging')) {
  console.log(`✅ Proceeding with build on branch "${branch}" in "${environment}" environment`);
  process.exit(1); // continue with build
}

console.log(`🛑 Ignoring build: branch is "${branch}" in "${environment}" environment`);
process.exit(0); // skip the build
