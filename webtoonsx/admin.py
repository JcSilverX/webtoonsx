from django.contrib import admin
from django.contrib.auth.models import Group

# Register your models here.

# Unregister Groups
admin.site.unregister(Group)
