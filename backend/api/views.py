from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Location, Program
from .permissions import IsRoleAdminOrReadOnly
from .serializers import LocationSerializer, ProgramSerializer

def user_payload(user):
    profile = getattr(user, "profile", None)
    return {"id": user.id, "username": user.username, "role": "admin" if user.is_superuser or getattr(profile, "role", "user") == "admin" else "user"}

class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all().order_by("name")
    serializer_class = LocationSerializer
    permission_classes = [IsRoleAdminOrReadOnly]
    def destroy(self, request, *args, **kwargs):
        from django.db.models.deletion import ProtectedError
        instance = self.get_object()
        try:
            instance.delete()
        except ProtectedError:
            return Response({"detail": "This location is used by a program and cannot be deleted."}, status=status.HTTP_409_CONFLICT)
        return Response(status=status.HTTP_204_NO_CONTENT)
    @action(detail=True, methods=["post"], parser_classes=[MultiPartParser, FormParser], url_path="image")
    def image(self, request, pk=None):
        upload = request.FILES.get("image")
        if not upload: return Response({"image": ["An image file is required."]}, status=status.HTTP_400_BAD_REQUEST)
        if not (upload.content_type or "").startswith("image/"): return Response({"image": ["Upload a valid image file."]}, status=status.HTTP_400_BAD_REQUEST)
        location = self.get_object(); location.image = upload; location.save(update_fields=["image"])
        return Response(LocationSerializer(location, context={"request": request}).data)

class ProgramViewSet(viewsets.ModelViewSet):
    serializer_class = ProgramSerializer
    permission_classes = [IsRoleAdminOrReadOnly]
    queryset = Program.objects.select_related("location").all().order_by("name")
    def get_queryset(self):
        qs = super().get_queryset()
        search, college = self.request.query_params.get("search", "").strip(), self.request.query_params.get("college", "").strip()
        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(college__icontains=search) | Q(location__name__icontains=search))
        if college and college.lower() != "all": qs = qs.filter(college__iexact=college)
        return qs
    def get_object(self):
        lookup = {"pk": self.kwargs["pk"]} if self.action in {"partial_update", "update", "destroy", "image"} else {"slug": self.kwargs["slug"]}
        return get_object_or_404(self.get_queryset(), **lookup)
    @action(detail=True, methods=["post"], parser_classes=[MultiPartParser, FormParser], url_path="image")
    def image(self, request, pk=None):
        upload = request.FILES.get("image")
        if not upload: return Response({"image": ["An image file is required."]}, status=status.HTTP_400_BAD_REQUEST)
        if not (upload.content_type or "").startswith("image/"): return Response({"image": ["Upload a valid image file."]}, status=status.HTTP_400_BAD_REQUEST)
        program = self.get_object(); program.image = upload; program.save(update_fields=["image"])
        return Response(ProgramSerializer(program, context={"request": request}).data)

class LoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        from django.contrib.auth import authenticate
        user = authenticate(request, username=request.data.get("username"), password=request.data.get("password"))
        if not user: return Response({"detail": "Invalid username or password."}, status=status.HTTP_401_UNAUTHORIZED)
        refresh = RefreshToken.for_user(user)
        return Response({"access": str(refresh.access_token), "refresh": str(refresh), "user": user_payload(user)})

class LogoutView(APIView):
    def post(self, request):
        refresh = request.data.get("refresh")
        if refresh:
            try: RefreshToken(refresh).blacklist()
            except Exception: pass
        return Response({"detail": "Logged out."})
