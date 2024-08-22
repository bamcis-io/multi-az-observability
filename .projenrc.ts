import { awscdk, JsonPatch } from "projen";
import { UpgradeDependenciesSchedule } from "projen/lib/javascript";

const project = new awscdk.AwsCdkConstructLibrary({
  author: "Michael Haken",
  authorAddress: "michael.haken@outlook.com",
  cdkVersion: "2.138.0",
  defaultReleaseBranch: "main",
  jsiiVersion: "~5.4.0",
  name: "multi-az-observability",
  license: "MIT",
  prettier: true,
  prerelease: "alpha",
  projenrcTs: true,
  repositoryUrl: "https://github.com/bamcis-io/multi-az-observability",
  description:
    "A construct for implementing multi-AZ observability to detect single AZ impairments",
  dependabot: false,
  buildWorkflow: true,
  depsUpgrade: true,
  release: true,
  npmProvenance: false,
  releaseToNpm: true,
  majorVersion: 0,
  depsUpgradeOptions: {
    workflowOptions: {
      labels: ["auto-approve", "auto-merge"],
      schedule: UpgradeDependenciesSchedule.WEEKLY,
    },
  },
  workflowNodeVersion: "20",
  workflowRunsOn: [
    "codebuild-Arm64GithubRunner-${{ github.run_id }}-${{ github.run_attempt }}",
  ],
  keywords: [
    "cdk",
    "aws-cdk",
    "cloudwatch",
    "observability",
    "monitoring",
    "resilience",
    "multi-az",
  ],
  gitignore: [
    "*.d.ts",
    "*.js",
    "node_modules/",
    "lib/",
    "coverage/",
    "test-reports/",
    "yarn.lock",
    ".cdk.staging",
    "cdk.out",
    "/cdk/bin/",
    "/cdk/obj/",
    ".DS_Store",
    "**/.DS_Store",
    "src/canaries/src/package",
    "src/canaries/src/canary.zip",
    "src/outlier-detection/src/scipy",
    "src/outlier-detection/src/outlier-detection.zip",
    "src/outlier-detection/src/scipy-layer.zip",
    "src/monitoring",
    "tsconfig.tsbuildinfo",
    "package-lock.json",
    ".jsii",
    "tsconfig.json",
  ],
  packageName: "multi-az-observability",
  publishToNuget: {
    dotNetNamespace: "io.bamcis.cdk.MultiAZObservability",
    packageId: "io.bamcis.cdk.MultiAZObservability",
  },
  publishToGo: {
    moduleName: "github.com/bamcis-io/multi-az-observability-go",
    packageName: "multi-az-observability",
    githubRepo: "github.com/bamcis-io/multi-az-observability-go",
  },
  publishToPypi: {
    distName: "multi_az_observability",
    module: "multi_az_observability",
  },
  /*publishToMaven: {
    javaPackage: 'io.bamcis.cdk.multiazobservability',
    mavenGroupId: 'io.bamcis.cdk.multiazobservability',
    mavenArtifactId: 'multiazobservability',
  },*/
  jest: true,
  jestOptions: {
    jestConfig: {
      roots: ["<rootDir>/test"],
      testMatch: ["**/*.test.ts"],
    },
  },
});

project.tasks.addTask("build-monitoring-layer", {
  steps: [
    {
      exec: "rm -rf src/monitoring/src/monitoring",
    },
    {
      exec: "rm -f src/monitoring/src/monitoring-layer.zip",
    },
    {
      exec: "mkdir -p src/monitoring/src/monitoring",
    },
    {
      exec: "mkdir -p lib/monitoring/src",
    },
    {
      exec: "pip3 install aws-embedded-metrics aws-xray-sdk --only-binary=:all: --target src/monitoring/src/monitoring/python/lib/python3.12/site-packages --platform manylinux2014_aarch64",
    },
    {
      exec: "cd src/monitoring/src/monitoring && zip -r ../monitoring-layer.zip .",
    },
    {
      exec: "cp src/monitoring/src/monitoring-layer.zip lib/monitoring/src/monitoring-layer.zip",
    },
  ],
});

project.tasks.addTask("build-canary-function", {
  steps: [
    {
      exec: "rm -rf src/canaries/src/package",
    },
    {
      exec: "rm -rf lib/canaries/src",
    },
    {
      exec: "rm -f src/canaries/src/canaries.zip",
    },
    {
      exec: "mkdir -p src/canaries/src/package",
    },
    {
      exec: "mkdir -p lib/canaries/src",
    },
    {
      exec: 'docker run --rm --platform "linux/arm64" --user "0:0" --volume "$PWD/src/canaries/src:/asset-input:delegated" --volume "$PWD/src/canaries/src/package:/asset-output:delegated" --workdir "/asset-input" "public.ecr.aws/sam/build-python3.12" bash -c "pip install --no-cache --requirement requirements.txt --target /asset-output && cp --archive --update index.py /asset-output"',
    },
    {
      exec: "cd src/canaries/src/package && zip -r ../canary.zip .",
    },
    {
      exec: "cp src/canaries/src/canary.zip lib/canaries/src/canary.zip",
    },
  ],
});

project.tasks.addTask("build-scipy-layer", {
  steps: [
    {
      exec: "rm -rf src/outlier-detection/src/scipy",
    },
    {
      exec: "rm -f src/outlier-detection/src/scipy-layer.zip",
    },
    {
      exec: "mkdir src/outlier-detection/src/scipy",
    },
    {
      exec: "mkdir -p lib/outlier-detection/src",
    },
    {
      exec: "pip3 install scipy --only-binary=:all: --target src/outlier-detection/src/scipy/python/lib/python3.12/site-packages --platform manylinux2014_aarch64",
    },
    {
      exec: "cd src/outlier-detection/src/scipy && zip -r ../scipy-layer.zip .",
    },
    {
      exec: "cp src/outlier-detection/src/scipy-layer.zip lib/outlier-detection/src/scipy-layer.zip",
    },
  ],
});

project.tasks.addTask("build-outlier-detection-function", {
  steps: [
    {
      exec: "mkdir -p lib/outlier-detection/src",
    },
    {
      exec: "rm -f src/outlier-detection/src/outlier-detection.zip",
    },
    {
      exec: "zip src/outlier-detection/src/outlier-detection.zip src/outlier-detection/src/index.py",
    },
    {
      exec: "cp src/outlier-detection/src/outlier-detection.zip lib/outlier-detection/src/outlier-detection.zip",
    },
  ],
});

const buildAssets = project.tasks.addTask("build-assets", {
  steps: [
    {
      exec: 'export DOCKER_DEFAULT_PLATFORM="linux/arm64"',
    },
    {
      spawn: "build-canary-function",
    },
    {
      spawn: "build-outlier-detection-function",
    },
    {
      spawn: "build-scipy-layer",
    },
    {
      spawn: "build-monitoring-layer",
    },
    {
      exec: "rm -rf lib/azmapper/src",
    },
    {
      exec: "cp -R src/azmapper/src lib/azmapper",
    },
  ],
});

project.tasks.tryFind("compile")?.spawn(buildAssets);
project.tasks.tryFind("post-compile")?.exec("npx awslint");

// tsconfig.json gets the exclude list updated and isn't tracked
project.tasks.tryFind("release")?.updateStep(4, {
  exec: "git diff --ignore-space-at-eol --exit-code ':!tsconfig.json' ':!.projenrc.ts' | tee",
});

/*project.addFields({
  version: '0.0.1-alpha.1',
});*/

project.github
  ?.tryFindWorkflow("release")
  ?.file?.patch(JsonPatch.remove("/jobs/release_pypi/steps/1"));
project.synth();
