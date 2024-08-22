//go:build no_runtime_type_checking

package multi-az-observability

// Building without runtime type checking enabled, so all the below just return nil

func (i *jsiiProxy_IService) validateAddOperationParameters(operation IOperation) error {
	return nil
}

