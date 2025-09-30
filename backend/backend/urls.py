from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from eval.views import SummariesView, TextView, SummaryView, AssignmentsView, StudentsView, TeachersView

route = routers.DefaultRouter()
route.register("text", TextView, basename="textview")
route.register("summaries", SummariesView, basename="summariesview")
route.register("assignments", AssignmentsView, basename="assignmentsview")
route.register("students", StudentsView, basename="studentsview")
route.register("teachers", TeachersView, basename="teachersview")

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('eval.urls')),
    path('api/', include(route.urls)),
    path('api/summaryview/', SummaryView.as_view(), name='summary'),]
