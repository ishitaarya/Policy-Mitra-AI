class PolicyMitraError(Exception):
    pass


class PDFProcessingError(PolicyMitraError):
    pass


class EmptyDocumentError(PDFProcessingError):
    pass


class CorruptedPDFError(PDFProcessingError):
    pass


class NoExtractableTextError(PDFProcessingError):
    pass


class ModelConfigurationError(PolicyMitraError):
    pass


class PromptConfigurationError(PolicyMitraError):
    pass


class WorkflowError(PolicyMitraError):
    pass