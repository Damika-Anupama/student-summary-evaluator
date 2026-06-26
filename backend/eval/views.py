from .models import Text, Summaries, Assignments, Students, Teachers
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from backend.model import get_content_and_wording
from .serializers import (
    TextSerializer,
    SummariesSerializer,
    AssignmentsSerializer,
    StudentsSerializer,
    TeachersSerializer,
)


class TextView(viewsets.ModelViewSet):
    queryset = Text.objects.all().order_by("pk")
    serializer_class = TextSerializer


class SummariesView(viewsets.ModelViewSet):
    queryset = Summaries.objects.all().order_by("pk")
    serializer_class = SummariesSerializer


class AssignmentsView(viewsets.ModelViewSet):
    queryset = Assignments.objects.all().order_by("pk")
    serializer_class = AssignmentsSerializer


class StudentsView(viewsets.ModelViewSet):
    queryset = Students.objects.all().order_by("pk")
    serializer_class = StudentsSerializer


class TeachersView(viewsets.ModelViewSet):
    queryset = Teachers.objects.all().order_by("pk")
    serializer_class = TeachersSerializer


class SummaryView(APIView):
    """Evaluate a student summary against a source passage.

    Stateless and concurrency-safe: all inputs are per-request locals (no module
    globals), the payload is validated, and the prompt id is resolved from the
    database rather than a hard-coded mapping.
    """

    def post(self, request, format=None):
        summary = request.data.get("summary")
        text_id = request.data.get("text")

        if not summary or not str(summary).strip():
            return Response(
                {"detail": "A non-empty 'summary' is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if text_id is None:
            return Response(
                {"detail": "A 'text' id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Resolve the prompt id from the DB (no client-trusted hard-coded dict).
        text = Text.objects.filter(pk=text_id).first()
        if text is None:
            return Response(
                {"detail": f"No source text found for id {text_id!r}."},
                status=status.HTTP_404_NOT_FOUND,
            )
        if not text.prompt_id:
            return Response(
                {"detail": "The selected source text has no associated prompt id."},
                status=status.HTTP_409_CONFLICT,
            )

        try:
            content_value, wording_value = get_content_and_wording(
                text.prompt_id, text_id, summary
            )
        except Exception:  # pragma: no cover - model/runtime failures
            return Response(
                {"detail": "Evaluation failed. Please try again later."},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return Response(
            {"content": content_value, "wording": wording_value},
            status=status.HTTP_200_OK,
        )
