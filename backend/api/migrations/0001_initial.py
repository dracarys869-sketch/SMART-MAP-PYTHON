import django.core.validators
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models

class Migration(migrations.Migration):
    initial = True
    dependencies = [migrations.swappable_dependency(settings.AUTH_USER_MODEL)]
    operations = [
        migrations.CreateModel(name="Location", fields=[("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")), ("name", models.CharField(max_length=255, unique=True)), ("latitude", models.DecimalField(decimal_places=7, max_digits=10, validators=[django.core.validators.MinValueValidator(-90), django.core.validators.MaxValueValidator(90)])), ("longitude", models.DecimalField(decimal_places=7, max_digits=10, validators=[django.core.validators.MinValueValidator(-180), django.core.validators.MaxValueValidator(180)])), ("type", models.CharField(choices=[("college", "College"), ("landmark", "Landmark"), ("gate", "Gate")], default="landmark", max_length=20)), ("description", models.TextField(blank=True))]),
        migrations.CreateModel(name="Profile", fields=[("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")), ("role", models.CharField(choices=[("user", "User"), ("admin", "Admin")], default="user", max_length=10)), ("user", models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name="profile", to=settings.AUTH_USER_MODEL))]),
        migrations.CreateModel(name="Program", fields=[("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")), ("name", models.CharField(max_length=255)), ("college", models.CharField(max_length=255)), ("description", models.TextField(blank=True)), ("subtitle", models.TextField(blank=True)), ("learning_format", models.CharField(blank=True, max_length=255)), ("duration", models.CharField(default="4 Years", max_length=100)), ("program_type", models.CharField(default="On-campus", max_length=100)), ("image", models.ImageField(blank=True, null=True, upload_to="images-programs/")), ("career_outcomes", models.JSONField(blank=True, default=list)), ("slug", models.SlugField(max_length=255, unique=True)), ("location", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="programs", to="api.location"))]),
    ]
