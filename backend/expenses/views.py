from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import Expense
from .serializers import ExpenseSerializer
from django.shortcuts import get_object_or_404
from django.db.models import Sum
from django.contrib.auth import authenticate, login, logout


class LoginView(APIView):
    authentication_classes = [] 
    permission_classes = [] 

    def post(self, request):
        print('hi')
        username = request.data.get("username")
        password = request.data.get("password")
        print(username, password)
        user = authenticate(request, username=username, password=password)
        if user is not None:
            
            login(request, user)  # sets session
            return Response({"message": "Logged in successfully", 'username':user.username, "is_staff":user.is_staff })
        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)


# List + Create
class ExpenseListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        expenses = Expense.objects.all()
        if not request.user.is_staff:
            expenses = expenses.filter(user=request.user)

        category = request.GET.get('category')
        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date')
        user = request.GET.get('user')

        if category:
            expenses = expenses.filter(category=category)
        if start_date and end_date:
            expenses = expenses.filter(date__range=[start_date, end_date])
        if user and request.user.is_staff:
            expenses = expenses.filter(user__id=user)

        serializer = ExpenseSerializer(expenses, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ExpenseSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        print(serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Detail View

class ExpenseDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, pk, user):
        expense = get_object_or_404(Expense, pk=pk)
        if not user.is_staff and expense.user != user:
            return None
        return expense

    def get(self, request, pk):

        expense = self.get_object(pk, request.user)
        if not expense:
            return Response({"detail": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        serializer = ExpenseSerializer(expense)
        return Response(serializer.data)

    def put(self, request, pk):
        expense = self.get_object(pk, request.user)
        if not expense:
            return Response({"detail": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        serializer = ExpenseSerializer(expense, data=request.data)
        if serializer.is_valid():
            serializer.save(user=expense.user)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        expense = self.get_object(pk, request.user)
        if not expense:
            return Response({"detail": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        expense.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# Summary
class ExpenseSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.is_staff:
            queryset = Expense.objects.all()
        else:
            queryset = Expense.objects.filter(user=request.user)

        summary = queryset.values('category').annotate(total=Sum('amount'))
        return Response(summary)
