// This script sets up HTTPS for the application using the ASP.NET Core HTTPS certificate
//ng serve --port 4433 --open false & wait-on http://localhost:4433/assets/federation.manifest.json && node aspnetcore-https - npm start
// This script sets up HTTPS for the application using the ASP.NET Core HTTPS certificate
const fs = require('fs');
const spawn = require('child_process').spawn;
const path = require('path');
const browserSync = require('browser-sync').create();
const { createProxyMiddleware } = require('http-proxy-middleware');

const baseFolder =
    process.env.APPDATA !== undefined && process.env.APPDATA !== ''
        ? `${process.env.APPDATA}/ASP.NET/https`
        : `${process.env.HOME}/.aspnet/https`;

const certificateArg = process.argv.map(arg => arg.match(/--name=(?<value>.+)/i)).filter(Boolean)[0];
const certificateName = certificateArg ? certificateArg.groups.value : process.env.npm_package_name;

if (!certificateName) {
    console.error('Invalid certificate name. Run this script in the context of an npm/yarn script or pass --name=<<app>> explicitly.')
    process.exit(-1);
}

const certFilePath = path.join(baseFolder, `${certificateName}.pem`);
const keyFilePath = path.join(baseFolder, `${certificateName}.key`);

if (!fs.existsSync(certFilePath) || !fs.existsSync(keyFilePath)) {
    spawn('dotnet', [
        'dev-certs',
        'https',
        '--export-path',
        certFilePath,
        '--format',
        'Pem',
        '--no-password',
    ], { stdio: 'inherit', })
        .on('exit', (code) => {
          if (code == 0) {
            startHttpsProxy();
          }
        });

    return;
}

// startHttpsProxy();

// function startHttpsProxy() {
//     const apiProxy = createProxyMiddleware({
//         target: 'https://localhost:44333',
//         pathFilters: ['/api/**', '/old/**'],
//         changeOrigin: true,
//         ws: true,
//         ssl: {
//             keyFilePath: keyFilePath,
//             certFilePath: certFilePath
//         }
//     });

//     browserSync.init({
//         https: {
//             cert: certFilePath,
//             key: keyFilePath
//         },
//         proxy: {
//             target: 'http://localhost:4433',
//             ws: true,
//             middleware: [apiProxy]
//         },
//         port: 44332,
//         socket: {
//             port: 44330
//         }
//     });
// }
