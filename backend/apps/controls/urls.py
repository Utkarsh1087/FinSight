from django.urls import path
from .views import (
    ControlRuleListCreateView,
    ControlRuleToggleView,
    ControlViolationListView,
    ControlViolationResolveView,
)

urlpatterns = [
    path("rules/", ControlRuleListCreateView.as_view(), name="control-rule-list-create"),
    path("rules/<int:pk>/toggle/", ControlRuleToggleView.as_view(), name="control-rule-toggle"),
    path("violations/", ControlViolationListView.as_view(), name="control-violation-list"),
    path("violations/<int:pk>/resolve/", ControlViolationResolveView.as_view(), name="control-violation-resolve"),
]
