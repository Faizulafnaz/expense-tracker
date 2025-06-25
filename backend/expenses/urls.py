from django.urls import path
from .views import ExpenseListCreateView, ExpenseDetailView, ExpenseSummaryView, LoginView, LogoutView

urlpatterns = [
    path('', ExpenseListCreateView.as_view(), name='expense-list-create'),
    path('<int:pk>/', ExpenseDetailView.as_view(), name='expense-detail'),
    path('summary/', ExpenseSummaryView.as_view(), name='expense-summary'),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
]
