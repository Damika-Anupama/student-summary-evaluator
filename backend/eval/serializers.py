from rest_framework import serializers
from .models import Text, Summaries, Assignments, Students, Teachers


class TextSerializer(serializers.ModelSerializer):
    class Meta:
        model = Text
        fields = '__all__'

class SummariesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Summaries
        fields = '__all__'

class AssignmentsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignments
        fields = '__all__'

class StudentsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Students
        fields = '__all__'

class TeachersSerializer(serializers.ModelSerializer):
    class Meta:
        model = Teachers
        fields = '__all__'