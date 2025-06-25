from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Expense(models.Model):
    CATEGORY_CHOICES = [
        ('food', 'Food'),
        ('travel', 'Travel'),
        ('utilities', 'Utilities'),
        ('misc', 'Miscellaneous'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    date = models.DateField()
    notes = models.TextField(blank=True, null=True)

    
    def __str__(self):
        return f"{self.title} - {self.amount}"