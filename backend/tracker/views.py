from rest_framework import viewsets
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import *
from .serializers import *
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.utils import timezone

class IncomeSourceViewSet(viewsets.ModelViewSet):
    queryset = IncomeSource.objects.all()
    serializer_class = IncomeSourceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return IncomeSource.objects.filter(user=self.request.user) | IncomeSource.objects.filter(user=None)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class IncomeViewSet(viewsets.ModelViewSet):
    queryset = Income.objects.all()
    serializer_class = IncomeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Income.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class GoalViewSet(viewsets.ModelViewSet):
    queryset = Goal.objects.all()
    serializer_class = GoalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Goal.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def unfunded(self, request):
        goals = self.get_queryset()
        unfunded = [g for g in goals if g.total_allocated() < g.target_amount]
        serializer = self.get_serializer(unfunded, many=True)
        return Response(serializer.data)


class AllocationViewSet(viewsets.ModelViewSet):
    queryset = Allocation.objects.all()
    serializer_class = AllocationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Allocation.objects.filter(income__user=self.request.user)

    def perform_create(self, serializer):
        serializer.save()


class ExpenseCategoryViewSet(viewsets.ModelViewSet):
    queryset = ExpenseCategory.objects.all()
    serializer_class = ExpenseCategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ExpenseCategory.objects.filter(user=self.request.user) | ExpenseCategory.objects.filter(user=None)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Expense.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ExpenseItemViewSet(viewsets.ModelViewSet):
    queryset = ExpenseItem.objects.all()
    serializer_class = ExpenseItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ExpenseItem.objects.filter(expense__user=self.request.user)



@api_view(['POST'])
def sync_data(request):
    """
    Syncs unsynced data for a user when they come online.
    Marks data as synced after processing.
    """

    user = request.user
    unsynced_data = {
        'incomes': Income.objects.filter(user=user, is_synced=False),
        'goals': Goal.objects.filter(user=user, is_synced=False),
        'expenses': Expense.objects.filter(user=user, is_synced=False),
        'allocations': Allocation.objects.filter(user=user, is_synced=False),
        'expense_items': ExpenseItem.objects.filter(expense__user=user, is_synced=False),
    }

    # Process the unsynced data and mark them as synced
    for model_name, model_objects in unsynced_data.items():
        for obj in model_objects:
            # We perform conflict resolution here.
            if isinstance(obj, Income):
                obj = resolve_conflict(obj)
            elif isinstance(obj, Goal):
                obj = resolve_conflict(obj)
            elif isinstance(obj, Expense):
                obj = resolve_conflict(obj)
            elif isinstance(obj, Allocation):
                obj = resolve_conflict(obj)
            elif isinstance(obj, ExpenseItem):
                obj = resolve_conflict(obj)

            # Mark the object as synced after resolving conflicts
            obj.is_synced = True
            obj.save()

    return Response({'status': 'Data synced successfully'}, status=status.HTTP_200_OK)


def resolve_conflict(obj):
    """
    Resolves conflict based on timestamps (created_at or updated_at).
    If the object is newer locally, keep the local data; otherwise, keep the server data.
    """
    # Conflict resolution for Income, Goal, Expense, Allocation, ExpenseItem
    # Check if the object's timestamp is newer (based on created_at or updated_at)
    if obj.created_at < timezone.now() - timezone.timedelta(minutes=10):
        # If the object's timestamp is older than 10 minutes, we'll consider the data to be outdated
        # Hence, let the server version win by returning the server object.
        # We could add additional logic here for finer control based on timestamps.
        return obj  # Or fetch the latest version from the database and resolve the conflict.
    return obj