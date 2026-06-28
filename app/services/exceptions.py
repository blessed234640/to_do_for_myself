class DomainError(Exception):
    pass


class PastReminderError(DomainError):
    pass

class TaskNotFoundError(DomainError):
    pass