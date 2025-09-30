from django.shortcuts import render
from django.http import JsonResponse
from .models import Text, Summaries, Assignments, Students, Teachers
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from backend.model import get_content_and_wording


# from rest_framework.response import Response
# from rest_framework.decorators import api_view
from .serializers import TextSerializer, SummariesSerializer, AssignmentsSerializer, StudentsSerializer, TeachersSerializer

# Build paths inside the project like this: BASE_DIR / 'subdir'.

# Create your views here.


class TextView(viewsets.ModelViewSet):
    queryset = Text.objects.all()
    serializer_class = TextSerializer


class SummariesView(viewsets.ModelViewSet):
    queryset = Summaries.objects.all()
    serializer_class = SummariesSerializer


class AssignmentsView(viewsets.ModelViewSet):
    queryset = Assignments.objects.all()
    serializer_class = AssignmentsSerializer


class StudentsView(viewsets.ModelViewSet):
    queryset = Students.objects.all()
    serializer_class = StudentsSerializer


class TeachersView(viewsets.ModelViewSet):
    queryset = Teachers.objects.all()
    serializer_class = TeachersSerializer


input_summary = ""
text_id = None

id_dict = {
    "1": "ebad26",
    "2": "3b9047",
    "3": "ebad26",
}


class SummaryView(APIView):
    def post(self, request, format=None):
        global input_summary, text_id
        input_summary = request.data.get("summary")
        text_id = request.data.get("text")
        # prompt_id = Text.objects.filter(pk=text_id).first().prompt_id
        prompt_id = id_dict[request.data.get("prompt_id")]
        student_id = request.data.get("text")
        # input_summary = 'They would rub it up with soda to make the smell go away and it wouldnt be a bad smell. Some of the meat would be tossed on the floor where there was sawdust spit of the workers and they would make the meat all over again with the things in it.'
        content_value, wording_value = get_content_and_wording(
            prompt_id, student_id, input_summary
        )
        evaluation_values = [content_value, wording_value]
        return Response(evaluation_values, status=status.HTTP_200_OK)

    def get(self, request, format=None):
        global input_summary
        # prompt_id = Text.objects.filter(pk=text_id).first().prompt_id
        prompt_id = "39c16e"

        # input_summary = 'They would rub it up with soda to make the smell go away and it wouldnt be a bad smell. Some of the meat would be tossed on the floor where there was sawdust spit of the workers and they would make the meat all over again with the things in it.'

        return Response("", status=status.HTTP_200_OK)


# def home_view(request):
#     context = {}
#     texts = Text.objects.all()
#     return render(request, 'index.html')

# @api_view(['GET'])
# def showText(request, pk):

#     texts = Text.objects.all()
#     serilizer = TextSerializer(texts, many=)
#     return Response(serilizer.data)

# @api_view(['POST'])
# def addSummary(request):
#     serilizer = SummariesSerializer(data=request.data)

#     if serilizer.is_valid():
#         serilizer.save()

#     return Response(serilizer.data)
