from rest_framework import generics
from .serializers import UserRegisterSerializer
from rest_framework.permissions import AllowAny

class UserRegisterView(generics.CreateAPIView):
    serializer_class = UserRegisterSerializer
    permission_classes = [AllowAny]
