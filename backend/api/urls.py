from django.urls import path
from .views import LocationViewSet, ProgramViewSet, LoginView, LogoutView
urlpatterns = [
    path("auth/login/", LoginView.as_view()), path("auth/logout/", LogoutView.as_view()),
    path("locations/", LocationViewSet.as_view({"get":"list", "post":"create"})),
    path("locations/<int:pk>/image/", LocationViewSet.as_view({"post":"image"})),
    path("locations/<int:pk>/", LocationViewSet.as_view({"patch":"partial_update", "delete":"destroy"})),
    path("programs/", ProgramViewSet.as_view({"get":"list", "post":"create"})),
    path("programs/<int:pk>/image/", ProgramViewSet.as_view({"post":"image"})), path("programs/<int:pk>/", ProgramViewSet.as_view({"patch":"partial_update", "delete":"destroy"})),
    path("programs/<slug:slug>/", ProgramViewSet.as_view({"get":"retrieve"})),
]
