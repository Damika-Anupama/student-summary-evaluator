from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("eval", "0005_text_prompt_id"),
    ]

    operations = [
        migrations.AlterField(
            model_name="summaries",
            name="question",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="summaries",
                to="eval.assignments",
            ),
        ),
        migrations.AlterField(
            model_name="summaries",
            name="student",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="summaries",
                to="eval.students",
            ),
        ),
        migrations.AlterField(
            model_name="summaries",
            name="submitted_on",
            field=models.DateField(blank=True, null=True),
        ),
    ]
