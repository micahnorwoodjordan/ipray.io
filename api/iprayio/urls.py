from django.urls import path

from .views import PrayerCreateView, PrayerFulfillView


urlpatterns = [
    path("prayers/create", PrayerCreateView.as_view(), name="prayer-create"),
    path("prayers/<uuid:pk>/fulfill", PrayerFulfillView.as_view(), name="prayer-fulfill"),
]
