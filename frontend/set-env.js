const fs = require('fs');
const path = require('path');

console.log("Inside set env");
// 1. Read .env file if it exists and load variables into process.env
const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split(/\r?\n/).forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#') && trimmedLine.includes('=')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      const value = valueParts.join('=').trim().replace(/^['"]|['"]$/g, ''); // strip quotes
      process.env[key.trim()] = value;
    }
  });
}

// 2. Define the paths to your environment files
const devTargetPath = path.resolve(__dirname, 'src/environments/environment.ts');
const prodTargetPath = path.resolve(__dirname, 'src/environments/environment.prod.ts');

// 3. Write environment config content
const devEnvConfig = `export const environment = {
  production: false,
  apiUrl: '${process.env.API_URL || "http://localhost:8080"}',
  wsUrl: '${process.env.WS_URL || "http://localhost:8080"}'
};
`;

const prodEnvConfig = `export const environment = {
  production: true,
  apiUrl: '${process.env.API_URL || "https://farmsetu-2-0.onrender.com"}',
  wsUrl: '${process.env.WS_URL || "https://farmsetu-2-0.onrender.com"}'
};
`;

// 4. Write to files
fs.writeFileSync(devTargetPath, devEnvConfig);
fs.writeFileSync(prodTargetPath, prodEnvConfig);

console.log('Angular environment files generated successfully!');
