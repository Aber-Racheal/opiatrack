from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.db.models import Sum


# 1. INCOME SOURCE (Global or user-created)
class IncomeSource(models.Model):
    name = models.CharField(max_length=100)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)  # null = global
    created_at = models.DateTimeField(auto_now_add=True)
    is_synced = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)
    

    class Meta:
        unique_together = ('name', 'user')

    def __str__(self):
        return self.name


# 2. INCOME
class Income(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    source = models.ForeignKey(IncomeSource, on_delete=models.SET_NULL, null=True)
    description = models.TextField(blank=True)
    date_received = models.DateTimeField()
    is_synced = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    def __str__(self):
        return f"{self.user.username} - UGX {self.amount} on {self.date_received.date()}"

    def unallocated_amount(self):
        total_allocated = Allocation.objects.filter(income=self).aggregate(
            total=models.Sum('amount_allocated')
        )['total'] or 0
        return self.amount - total_allocated


# 3. GOAL (e.g. "Buy Goats")
class Goal(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=100)
    target_amount = models.DecimalField(max_digits=12, decimal_places=2)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_synced = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)


    def __str__(self):
        return f"{self.title} (UGX {self.target_amount})"

    def total_allocated(self):
        """
        Returns total amount allocated to this goal.
        """
        return Allocation.objects.filter(goal=self).aggregate(
            total=Sum('amount_allocated')
        )['total'] or 0

    def progress_percent(self):
        """
        Returns the progress of the goal as a percentage.
        """
        allocated = self.total_allocated()
        if self.target_amount > 0:
            return round((allocated / self.target_amount) * 100, 2)
        return 0.0


# 4. ALLOCATION (Assigns part of income to a goal)
class Allocation(models.Model):
    income = models.ForeignKey(Income, on_delete=models.CASCADE)
    goal = models.ForeignKey(Goal, on_delete=models.CASCADE)
    amount_allocated = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    is_synced = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)


    class Meta:
        unique_together = ('income', 'goal')

    def clean(self):
        total_allocated = Allocation.objects.filter(income=self.income).exclude(pk=self.pk).aggregate(
            total=models.Sum('amount_allocated')
        )['total'] or 0

        if total_allocated + self.amount_allocated > self.income.amount:
            raise ValidationError("You cannot allocate more than the available income amount.")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.amount_allocated} UGX to {self.goal.title}"


# 5. EXPENSE CATEGORY (Clothes, School Fees, etc.)
class ExpenseCategory(models.Model):
    name = models.CharField(max_length=100)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)  # null = global
    created_at = models.DateTimeField(auto_now_add=True)
    is_synced = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)


    class Meta:
        unique_together = ('name', 'user')

    def __str__(self):
        return self.name


# 6. EXPENSE
class Expense(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    category = models.ForeignKey(ExpenseCategory, on_delete=models.SET_NULL, null=True, blank=True)
    description = models.TextField(blank=True)
    date_spent = models.DateTimeField()
    is_synced = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    def __str__(self):
        return f"{self.user.username} - UGX {self.total_amount} on {self.date_spent.date()}"


# 7. EXPENSE ITEM (Breakdown under an expense)
class ExpenseItem(models.Model):
    expense = models.ForeignKey(Expense, on_delete=models.CASCADE, related_name='items')
    name = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    is_synced = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)
    

    def __str__(self):
        return f"{self.name}: UGX {self.amount}"
