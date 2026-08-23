from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsRoleAdminOrReadOnly(BasePermission):
    message = "Admin role is required to change campus data."
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        user = request.user
        return bool(user and user.is_authenticated and (user.is_superuser or getattr(getattr(user, "profile", None), "role", None) == "admin"))
