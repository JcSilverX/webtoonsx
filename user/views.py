from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages


# Create your views here.
def login_user(request):
    if request.method == 'POST':
        username = request.POST.get('username-or-email')
        password = request.POST.get('password')

        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            messages.success(request, f'You have successfully signed in as {user.username}.')
            return redirect('home')
        else:
            messages.error(request, 'Incorrect username or password.')
            return redirect('login')
    else:
        return render(request, 'user/auth/sign_in.html', {})


def logout_user(request):
    if request.user.is_authenticated:
        if request.method == 'POST':

            action = request.POST.get('sign-out')
            if action == 'logout':
                logout(request)
                messages.success(request, 'You have been successfully signed out.')
                return redirect('home')
            else:
                messages.error(request, 'An error occured... please try again.')
                return redirect('home')
        else:
            return render(request, 'user/auth/sign_out.html', {})
    else:
        messages.error(request, 'You must be authenticated in order to perform this action.')
        return redirect('home')
