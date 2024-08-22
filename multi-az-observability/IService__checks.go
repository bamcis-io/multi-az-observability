//go:build !no_runtime_type_checking

package multi-az-observability

import (
	"fmt"
)

func (i *jsiiProxy_IService) validateAddOperationParameters(operation IOperation) error {
	if operation == nil {
		return fmt.Errorf("parameter operation is required, but nil was provided")
	}

	return nil
}

