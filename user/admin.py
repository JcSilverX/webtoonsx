from django.contrib import admin
from django.contrib.auth.models import User

from .models import Profile


# Register your models here.
# Mix Profile info into User info
class ProfileInline(admin.StackedInline):
    model = Profile


# Extend User Model
class UserAdmin(admin.ModelAdmin):
    model = User
    # Just display username fields on admin page
    fields = ['username']
    inlines = [ProfileInline]


# Unregister initial User
admin.site.unregister(User)

# Register User
admin.site.register(User, UserAdmin)
