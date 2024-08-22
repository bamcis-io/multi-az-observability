//go:build no_runtime_type_checking

package multi-az-observability

// Building without runtime type checking enabled, so all the below just return nil

func (s *jsiiProxy_Service) validateAddOperationParameters(operation IOperation) error {
	return nil
}

func validateNewServiceParameters(props *ServiceProps) error {
	return nil
}

