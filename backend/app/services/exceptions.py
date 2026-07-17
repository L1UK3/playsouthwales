class ServiceError(Exception):
    """Base exception for all service-related errors."""

    def __init__(self, message: str = "A service error occurred."):
        super().__init__(message)
        self.message = message


class NotFoundError(ServiceError):
    """Exception raised when a requested resource is not found."""

    def __init__(self, message: str = "Requested resource not found."):
        super().__init__(message)


class ValidationError(ServiceError):
    """Exception raised when input validation fails."""

    def __init__(self, message: str = "Input validation failed."):
        super().__init__(message)
