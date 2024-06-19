# multi-az-observability

## TODO

- Add testing

## problems worth noting

- Named Java package with hyphens, which broke java file syntax and spewed tons of errors
- Typescript class and interfaces that were being exported were importing other classes/interfaces
from the main file, which caused an error that something couldn't be imported from outside a module
when trying to use the construct from .NET
- Building CDK constructs that produce reusable CFN templates, for example, for use in workshop studio,
need to specific assets bucket and prefix in the default sythensizer as a variable and then pass parameters from parent to nested stack with the variable name
- Packaging content synth'd by CDK for use in a CI/CD pipeline
- Using typescript property naming for interfaces/classes that need to be converted to a json string (like an insight rule body)
- Testing new local builds of nuget packages for .net without having to increment the version each test by deleting 
existing content from the nuget package cache
- Trouble using AWS::LanguageExtensions to use intrinsic functions with Fn::GetAtt, instead used the last letter of the az 
name as the attribute to reference which worked
- Starting with projen and understanding how it manages a project and how to build your own test
- Copying files over for bundled lambda functions in the projen definition
- Building arm64 Lambda functions locally for packaging and setting default platform via environment variable
- Finding first parent stack of a construct to be able to add CfnParameters to it or tranforms
- Understanding how props and constructs are intended to be built and reconciling required other non-construct classes that other languages would need to use to define things like a Service and Operation.
- Focusing too much on how logic would be translated into other languages, not realizing the typescript implementation still
runs in the background and the language specific results are just shims to calling the original code
- Packaging Lambda functions with external dependencies, build the function/zip as part of the build and package the zip with the construct instead of defining bundling options