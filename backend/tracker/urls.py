from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *
from . import views

router = DefaultRouter()
router.register(r'income-sources', IncomeSourceViewSet)
router.register(r'incomes', IncomeViewSet)
router.register(r'goals', GoalViewSet)
router.register(r'allocations', AllocationViewSet)
router.register(r'expense-categories', ExpenseCategoryViewSet)
router.register(r'expenses', ExpenseViewSet)
router.register(r'expense-items', ExpenseItemViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('sync/', views.sync_data, name='sync-data'),
]
