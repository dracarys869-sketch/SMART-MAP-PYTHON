from django.contrib import admin
from .models import Location, Program, Profile
admin.site.register((Location, Program, Profile))

# Register your models here.
