from django.urls import path, include
from rest_framework import routers

from .views import (
    SummariesView,
    TextView,
    SummaryView,
    AssignmentsView,
    StudentsView,
    TeachersView,
)

# App-level router so eval routes are owned and reversible here, then included
# from the project urls.py (clearer separation of concerns).
router = routers.DefaultRouter()
router.register(r"text", TextView, basename="text")
router.register(r"summaries", SummariesView, basename="summaries")
router.register(r"assignments", AssignmentsView, basename="assignments")
router.register(r"students", StudentsView, basename="students")
router.register(r"teachers", TeachersView, basename="teachers")

urlpatterns = [
    path("", include(router.urls)),
    path("summaryview/", SummaryView.as_view(), name="summary"),
]
