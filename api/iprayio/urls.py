from django.urls import path

from .views import PrayerCreateView, PrayerFulfillView, PingView


urlpatterns = [
    path("ping", PingView.as_view(), name="ping"),
    path("prayers/create", PrayerCreateView.as_view(), name="prayer-create"),
    path("prayers/<uuid:pk>/fulfill", PrayerFulfillView.as_view(), name="prayer-fulfill"),
]
