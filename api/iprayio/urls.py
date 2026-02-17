from django.urls import path

from iprayio import views


urlpatterns = [
    path("ping", views.ping, name="ping"),
    path("prayers/create", views.create_prayer_request, name="prayer-create"),
    path("prayer/<uuid:pk>/complete", views.complete_prayer_request, name="prayer-complete"),
    path("prayer", views.get_prayer_request, name="prayer-get"),
]
