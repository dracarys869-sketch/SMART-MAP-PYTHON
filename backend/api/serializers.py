from rest_framework import serializers
from .models import Location, Program

class LocationSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    class Meta:
        model = Location
        fields = ("id", "name", "latitude", "longitude", "type", "description", "image", "image_url")
        read_only_fields = ("image",)
    def get_image_url(self, obj):
        if not obj.image:
            return None
        request = self.context.get("request")
        return request.build_absolute_uri(obj.image.url) if request else obj.image.url

class ProgramSerializer(serializers.ModelSerializer):
    location_details = LocationSerializer(source="location", read_only=True)
    image_url = serializers.SerializerMethodField()
    class Meta:
        model = Program
        fields = ("id", "name", "college", "location", "location_details", "description", "subtitle", "learning_format", "duration", "program_type", "image", "image_url", "career_outcomes", "slug")
        read_only_fields = ("image",)
    def get_image_url(self, obj):
        if not obj.image:
            return None
        request = self.context.get("request")
        return request.build_absolute_uri(obj.image.url) if request else obj.image.url
