from rest_framework import serializers
from .models import Text, Summaries, Assignments, Students, Teachers


class TextSerializer(serializers.ModelSerializer):
    class Meta:
        model = Text
        fields = "__all__"


class SummariesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Summaries
        fields = "__all__"

    def validate_summary(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Summary text cannot be empty.")
        return value

    def validate_content_score(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("content_score cannot be negative.")
        return value

    def validate_wording_score(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("wording_score cannot be negative.")
        return value


class AssignmentsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignments
        fields = "__all__"

    def validate_question(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Question cannot be empty.")
        return value


class StudentsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Students
        fields = "__all__"


class TeachersSerializer(serializers.ModelSerializer):
    class Meta:
        model = Teachers
        fields = "__all__"
