from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    IncomeSource, Income, Goal, Allocation,
    ExpenseCategory, Expense, ExpenseItem
)


class IncomeSourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = IncomeSource
        fields = '__all__'


class IncomeSerializer(serializers.ModelSerializer):
    source_name = serializers.CharField(source='source.name', read_only=True)
    unallocated_amount = serializers.SerializerMethodField()

    class Meta:
        model = Income
        fields = '__all__'

    def get_unallocated_amount(self, obj):
        return obj.unallocated_amount()


class GoalSerializer(serializers.ModelSerializer):
    total_allocated = serializers.SerializerMethodField()
    progress_percent = serializers.SerializerMethodField()

    class Meta:
        model = Goal
        fields = '__all__'

    def get_total_allocated(self, obj):
        return obj.total_allocated()

    def get_progress_percent(self, obj):
        return obj.progress_percent()


class AllocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Allocation
        fields = '__all__'

    def validate(self, data):
        income = data['income']
        amount = data['amount']
        # sum of existing allocations for this income excluding current allocation if updating
        existing_allocations = Allocation.objects.filter(income=income).exclude(pk=self.instance.pk if self.instance else None)
        total_allocated = sum(a.amount for a in existing_allocations)
        if total_allocated + amount > income.amount:
            raise serializers.ValidationError("Allocation exceeds available income amount.")
        return data    


class ExpenseCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpenseCategory
        fields = '__all__'


class ExpenseItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpenseItem
        fields = '__all__'


class ExpenseSerializer(serializers.ModelSerializer):
    items = ExpenseItemSerializer(many=True, read_only=True)

    class Meta:
        model = Expense
        fields = '__all__'
