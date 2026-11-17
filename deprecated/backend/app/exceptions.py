class ServiceError(Exception):
    """Base error class for all backend services."""

    def __init__(self, message: str = "A service error occurred."):
        super().__init__(message)
        self.message = message


class NotFoundError(ServiceError):
    """Raised when the requested resource is missing from the database."""

    def __init__(self, message: str = "Requested resource not found."):
        super().__init__(message)


class ValidationError(ServiceError):
    """Raised when input validation checks fail."""

    def __init__(self, message: str = "Input validation failed."):
        super().__init__(message)
