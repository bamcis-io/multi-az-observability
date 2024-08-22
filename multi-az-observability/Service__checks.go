//go:build !no_runtime_type_checking

package multi-az-observability

import (
	"fmt"

	_jsii_ "github.com/aws/jsii-runtime-go/runtime"
)

func (s *jsiiProxy_Service) validateAddOperationParameters(operation IOperation) error {
	if operation == nil {
		return fmt.Errorf("parameter operation is required, but nil was provided")
	}

	return nil
}

func validateNewServiceParameters(props *ServiceProps) error {
	if props == nil {
		return fmt.Errorf("parameter props is required, but nil was provided")
	}
	if err := _jsii_.ValidateStruct(props, func() string { return "parameter props" }); err != nil {
		return err
	}

	return nil
}

