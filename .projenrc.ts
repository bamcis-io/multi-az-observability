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
  dependabot: false,
  buildWorkflow: false,
  depsUpgrade: false,
  release: false,
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
    'yarn.lock',
    '.cdk.staging',
    'cdk.out',
    '/cdk/bin/',
    '/cdk/obj/',
    '.DS_Store',
    '**/.DS_Store',
    'src/canaries/src/package',
    'src/canaries/src/canary.zip',
    'src/chi-squared/src/package',
    'src/chi-squared/src/scipy',
    'src/chi-squared/src/chi-squared.zip',
    'src/chi-squared/src/scipy-layer.zip',
  ],
  packageName: 'multi-az-observability',
  publishToNuget: {
    dotNetNamespace: 'BAMCISIO.MultiAZObservability',
    packageId: 'BAMCISIO.MultiAZObservability',
  },
  publishToGo: {
    moduleName: 'bamcis.io/constructs',
    packageName: 'multiazobservability',
  },
  publishToPypi: {
    distName: 'bamcis.io.constructs.multi_az_observability',
    module: 'bamcis.io.constructs.multi_az_observability',
  },
  publishToMaven: {
    javaPackage: 'io.bamcis.constructs.multiazobservability',
    mavenGroupId: 'io.bamcis.constructs.multiazobservability',
    mavenArtifactId: 'multiazobservability',
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

project.addTask('awslint', {
  exec: 'awslint',
});

project.tasks.addTask('build-canary-function', {
  steps: [
    {
      exec: 'rm -rf src/canaries/src/package',
    },
    {
      exec: 'mkdir src/canaries/src/package',
    },
    {
      exec: 'mkdir -p lib/canaries/src',
    },
    {
      exec: 'docker run --rm --platform "linux/arm64" --user "0:0" --volume "$PWD/src/canaries/src:/asset-input:delegated" --volume "$PWD/src/canaries/src/package:/asset-output:delegated" --workdir "/asset-input" "public.ecr.aws/sam/build-python3.12" bash -c "pip install --no-cache --requirement requirements.txt --target /asset-output && cp --archive --update index.py /asset-output"',
    },
    {
      exec: 'cd src/canaries/src/package && zip -r ../canary.zip .',
    },
    {
      exec: 'cp src/canaries/src/canary.zip lib/canaries/src/canary.zip',
    },
  ],
});

project.tasks.addTask('build-scipy-layer', {
  steps: [
    {
      exec: 'rm -rf src/chi-squared/src/scipy',
    },
    {
      exec: 'mkdir src/chi-squared/src/scipy',
    },
    {
      exec: 'mkdir -p lib/chi-squared/src',
    },
    {
      exec: 'pip3 install scipy --only-binary=:all: --target src/chi-squared/src/scipy/python/lib/python3.12/site-packages --platform manylinux2014_aarch64',
    },
    {
      exec: 'cd src/chi-squared/src/scipy && zip -r ../scipy-layer.zip .',
    },
    {
      exec: 'cp src/chi-squared/src/scipy-layer.zip lib/chi-squared/src/scipy-layer.zip',
    },
  ],
});

project.tasks.addTask('build-chi-squared-function', {
  steps: [
    {
      exec: 'rm -rf src/chi-squared/src/package',
    },
    {
      exec: 'mkdir src/chi-squared/src/package',
    },
    {
      exec: 'mkdir -p lib/chi-squared/src',
    },
    {
      exec: 'docker run --rm --platform "linux/arm64" --user "0:0" --volume "$PWD/src/chi-squared/src:/asset-input:delegated" --volume "$PWD/src/chi-squared/src/package:/asset-output:delegated" --workdir "/asset-input" "public.ecr.aws/sam/build-python3.12" bash -c "pip install --no-cache --requirement requirements.txt --target /asset-output && cp --archive --update index.py /asset-output"',
    },
    {
      exec: 'cd src/chi-squared/src/package && zip -r ../chi-squared.zip .',
    },
    {
      exec: 'cp src/chi-squared/src/chi-squared.zip lib/chi-squared/src/chi-squared.zip',
    },
  ],
});

project.tasks.addTask('build2', {
  steps: [
    {
      exec: 'export DOCKER_DEFAULT_PLATFORM="linux/arm64"',
    },
    {
      spawn: 'default',
    },
    {
      spawn: 'pre-compile',
    },
    {
      spawn: 'compile',
    },
    {
      spawn: 'build-canary-function',
    },
    {
      spawn: 'build-scipy-layer',
    },
    {
      spawn: 'build-chi-squared-function',
    },
    {
      exec: 'rm -rf lib/azmapper/src',
    },
    {
      exec: 'cp -R src/azmapper/src lib/azmapper',
    },
    {
      spawn: 'post-compile',
    },
    {
      spawn: 'awslint',
    },
    {
      spawn: 'test',
    },
    {
      spawn: 'package',
    },
  ],
});

project.addFields({
  version: '0.0.1-alpha.1',
});

project.synth();