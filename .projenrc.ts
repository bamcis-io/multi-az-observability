import { awscdk } from 'projen';
const project = new awscdk.AwsCdkConstructLibrary({
  author: 'Michael Haken',
  authorAddress: 'michael.haken@outlook.com',
  cdkVersion: '2.138.0',
  defaultReleaseBranch: 'main',
  jsiiVersion: '~5.4.0',
  name: 'multi-az-observability',
  license: 'MIT',
  projenrcTs: true,
  repositoryUrl: 'https://github.com/bamcis-io/multi-az-observability',
  description: 'A construct for implementing multi-AZ observability to detect single AZ impairments',
  keywords: [
    'cdk',
    'cloudwatch',
    'observability',
    'monitoring',
    'resilience',
    'multi-AZ',
  ],
  gitignore: [
    '*.d.ts',
    '*.js',
    'node_modules/',
    'lib/',
    'coverage/',
    'test-reports/',
  ],
  packageName: 'multi-az-observability',
  publishToNuget: {
    dotNetNamespace: 'BAMCISIO.MultiAZObservability',
    packageId: 'BAMCISIO.MultiAZObservability',
  },
  jest: true,
  jestOptions: {
    jestConfig: {
      roots: [
        '<rootDir>/test',
      ],
      testMatch: [
        '**/*.test.ts',
      ],
    },
  },
});

project.addScripts({
  build: 'export CDK_DOCKER=build.sh && npx projen build',
});

project.addFields({
  version: '0.1.15',
});
project.synth();