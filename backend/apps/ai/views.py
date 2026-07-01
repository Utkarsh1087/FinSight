from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .service import query_ai_assistant, get_financial_context
from apps.audit.utils import record_audit_log

class AIAssistantQueryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        prompt = request.data.get("prompt", "").strip()
        entity_type = request.data.get("entity_type")
        entity_id = request.data.get("entity_id")

        if not prompt and not entity_type:
            return Response({"error": "Prompt or entity context is required."}, status=status.HTTP_400_BAD_REQUEST)

        response_data = query_ai_assistant(prompt=prompt, entity_type=entity_type, entity_id=entity_id)

        record_audit_log(
            user=request.user,
            action="AI_QUERY",
            entity_type="AIAssistant",
            entity_id="",
            details=f"AI query: '{prompt[:100]}...'"
        )

        return Response(response_data)


class AIAssistantContextSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(get_financial_context())
