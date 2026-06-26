from django.contrib import admin
from django.urls import path, include

# Routing now lives in the eval app (eval/urls.py) and is included under /api/
# for clear separation of concerns and reversibility.
urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("eval.urls")),
]
