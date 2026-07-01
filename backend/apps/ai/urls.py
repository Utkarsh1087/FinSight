from django.urls import path
from .views import AIAssistantQueryView, AIAssistantContextSummaryView

urlpatterns = [
    path("query/", AIAssistantQueryView.as_view(), name="ai-assistant-query"),
    path("context/", AIAssistantContextSummaryView.as_view(), name="ai-assistant-context"),
]
