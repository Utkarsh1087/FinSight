class AuditLogMiddleware:
    """
    Middleware to attach request context for auditing where applicable.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        return response
