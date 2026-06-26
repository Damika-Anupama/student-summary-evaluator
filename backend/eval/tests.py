"""Tests for the eval app: model labels, serializer validation, and the
hardened SummaryView (validation, DB-resolved prompt, no global state)."""
from decimal import Decimal
from unittest import mock

from django.test import TestCase
from rest_framework.test import APIClient

from .models import Teachers, Students, Text, Assignments, Summaries
from .serializers import SummariesSerializer


class ModelStrTests(TestCase):
    def test_human_friendly_labels(self):
        t = Teachers.objects.create(firstName="Ada", lastName="Lovelace")
        s = Students.objects.create(firstName="Alan", lastName="Turing")
        txt = Text.objects.create(prompt_id="abc123", title="Passage 1", text="...")
        self.assertEqual(str(t), "Ada Lovelace")
        self.assertEqual(str(s), "Alan Turing")
        self.assertEqual(str(txt), "Passage 1")


class SerializerValidationTests(TestCase):
    def test_empty_summary_rejected(self):
        ser = SummariesSerializer(data={"summary": "   ", "is_submitted": False})
        self.assertFalse(ser.is_valid())
        self.assertIn("summary", ser.errors)

    def test_negative_score_rejected(self):
        ser = SummariesSerializer(
            data={"summary": "ok", "content_score": Decimal("-1.0")}
        )
        self.assertFalse(ser.is_valid())
        self.assertIn("content_score", ser.errors)


class SummaryViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.teacher = Teachers.objects.create(firstName="T", lastName="One")
        self.text = Text.objects.create(
            prompt_id="prompt-xyz", title="Source", text="Source passage."
        )

    def test_missing_summary_returns_400(self):
        resp = self.client.post(
            "/api/summaryview/", {"text": self.text.pk}, format="json"
        )
        self.assertEqual(resp.status_code, 400)

    def test_unknown_text_returns_404(self):
        resp = self.client.post(
            "/api/summaryview/",
            {"summary": "a real summary", "text": 999999},
            format="json",
        )
        self.assertEqual(resp.status_code, 404)

    @mock.patch("eval.views.get_content_and_wording", return_value=(0.8, 0.7))
    def test_valid_request_resolves_prompt_from_db(self, mocked):
        resp = self.client.post(
            "/api/summaryview/",
            {"summary": "a real summary", "text": self.text.pk},
            format="json",
        )
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data, {"content": 0.8, "wording": 0.7})
        # prompt id is taken from the DB row, not a hard-coded dict
        mocked.assert_called_once_with("prompt-xyz", self.text.pk, "a real summary")
