from django.db import models


# Create your models here.
class Teachers(models.Model):
    firstName = models.CharField(max_length=20)
    lastName = models.CharField(max_length=20)

    def __str__(self):
        return f"{self.firstName} {self.lastName}".strip()


class Students(models.Model):
    firstName = models.CharField(max_length=20)
    lastName = models.CharField(max_length=20)

    def __str__(self):
        return f"{self.firstName} {self.lastName}".strip()


class Text(models.Model):
    prompt_id = models.CharField(max_length=10, null=True, blank=True)
    title = models.CharField(max_length=20)
    text = models.TextField()

    def __str__(self):
        return self.title


class Assignments(models.Model):
    question = models.CharField(max_length=50)
    textTitle = models.ForeignKey(Text, on_delete=models.CASCADE)
    deadline = models.DateField(null=True)
    createdBy = models.ForeignKey(Teachers, on_delete=models.CASCADE)

    def __str__(self):
        return self.question


class Summaries(models.Model):
    question = models.ForeignKey(
        Assignments, on_delete=models.CASCADE, related_name="summaries"
    )
    student = models.ForeignKey(
        Students, on_delete=models.CASCADE, related_name="summaries"
    )
    summary = models.TextField()
    is_submitted = models.BooleanField(default=False)
    content_score = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    wording_score = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    submitted_on = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"Summary #{self.pk} by {self.student} for {self.question}"
