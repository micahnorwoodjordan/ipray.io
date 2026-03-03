from django.urls import path

from iprayio import views


urlpatterns = [
    path("ping", views.ping, name="ping"),
    path("prayer/create", views.create_prayer_request, name="prayer-create"),
    path("prayer", views.get_prayer_request, name="prayer-get"),
]
