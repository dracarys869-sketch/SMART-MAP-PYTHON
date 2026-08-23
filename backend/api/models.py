from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils.text import slugify


class Profile(models.Model):
    class Role(models.TextChoices):
        USER = "user", "User"
        ADMIN = "admin", "Admin"

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile")
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.USER)


class Location(models.Model):
    class Type(models.TextChoices):
        COLLEGE = "college", "College"
        LANDMARK = "landmark", "Landmark"
        GATE = "gate", "Gate"

    name = models.CharField(max_length=255, unique=True)
    latitude = models.DecimalField(max_digits=10, decimal_places=7, validators=[MinValueValidator(-90), MaxValueValidator(90)])
    longitude = models.DecimalField(max_digits=10, decimal_places=7, validators=[MinValueValidator(-180), MaxValueValidator(180)])
    type = models.CharField(max_length=20, choices=Type.choices, default=Type.LANDMARK)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to="locations/", blank=True, null=True)

    def __str__(self):
        return self.name


class Program(models.Model):
    name = models.CharField(max_length=255)
    college = models.CharField(max_length=255)
    location = models.ForeignKey(Location, on_delete=models.PROTECT, related_name="programs")
    description = models.TextField(blank=True)
    subtitle = models.TextField(blank=True)
    learning_format = models.CharField(max_length=255, blank=True)
    duration = models.CharField(max_length=100, default="4 Years")
    program_type = models.CharField(max_length=100, default="On-campus")
    image = models.ImageField(upload_to="programs/", blank=True, null=True)
    career_outcomes = models.JSONField(default=list, blank=True)
    slug = models.SlugField(max_length=255, unique=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name
