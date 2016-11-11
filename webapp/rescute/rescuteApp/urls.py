from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^uploadImage/', views.uploadImage, name='uploadImage'),
    url(r'^getCategories/', views.getCategories, name='getCategories'),
    url(r'^postReport/', views.postReport, name='postReport'),
]
