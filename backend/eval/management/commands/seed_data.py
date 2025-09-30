from django.core.management.base import BaseCommand
from eval.models import Teachers, Students, Text, Assignments, Summaries
from datetime import date, timedelta


class Command(BaseCommand):
    help = 'Seeds the database with test data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding database...')

        # Clear existing data
        Summaries.objects.all().delete()
        Assignments.objects.all().delete()
        Text.objects.all().delete()
        Students.objects.all().delete()
        Teachers.objects.all().delete()

        # Create Teachers
        teacher1 = Teachers.objects.create(firstName='John', lastName='Smith')
        teacher2 = Teachers.objects.create(firstName='Sarah', lastName='Johnson')
        self.stdout.write(self.style.SUCCESS(f'Created {Teachers.objects.count()} teachers'))

        # Create Students
        students_data = [
            ('Alice', 'Williams'),
            ('Bob', 'Brown'),
            ('Charlie', 'Davis'),
            ('Diana', 'Miller'),
            ('Eve', 'Wilson'),
        ]
        students = []
        for first, last in students_data:
            student = Students.objects.create(firstName=first, lastName=last)
            students.append(student)
        self.stdout.write(self.style.SUCCESS(f'Created {Students.objects.count()} students'))

        # Create Texts (Reading materials)
        texts_data = [
            {
                'prompt_id': '39c16e',
                'title': 'Climate Change',
                'text': 'Climate change refers to long-term shifts in temperatures and weather patterns. These shifts may be natural, but since the 1800s, human activities have been the main driver of climate change, primarily due to the burning of fossil fuels like coal, oil, and gas. Burning fossil fuels generates greenhouse gas emissions that act like a blanket wrapped around the Earth, trapping the sun\'s heat and raising temperatures. The consequences of climate change now include, among others, intense droughts, water scarcity, severe fires, rising sea levels, flooding, melting polar ice, catastrophic storms and declining biodiversity.'
            },
            {
                'prompt_id': '3b9047',
                'title': 'Water Cycle',
                'text': 'The water cycle, also known as the hydrologic cycle, describes how water evaporates from the surface of the earth, rises into the atmosphere, cools and condenses into clouds, and falls back to the surface as precipitation. The water that falls to Earth as precipitation either evaporates, is taken up by plants, or becomes runoff. Runoff then flows into streams, rivers, and eventually into the ocean, where the cycle begins again.'
            },
            {
                'prompt_id': '814d6b',
                'title': 'Photosynthesis',
                'text': 'Photosynthesis is the process by which green plants and certain other organisms transform light energy into chemical energy. During photosynthesis in green plants, light energy is captured and used to convert water, carbon dioxide, and minerals into oxygen and energy-rich organic compounds. The process occurs in two main stages: the light-dependent reactions and the light-independent reactions (Calvin cycle).'
            },
            {
                'prompt_id': 'ebad26',
                'title': 'Solar System',
                'text': 'The Solar System consists of the Sun and everything that orbits around it, including eight planets, their moons, dwarf planets, asteroids, and comets. The four inner planets (Mercury, Venus, Earth, and Mars) are rocky and relatively small. The four outer planets (Jupiter, Saturn, Uranus, and Neptune) are much larger and are composed primarily of gases and liquids.'
            },
        ]
        texts = []
        for text_data in texts_data:
            text = Text.objects.create(**text_data)
            texts.append(text)
        self.stdout.write(self.style.SUCCESS(f'Created {Text.objects.count()} texts'))

        # Create Assignments
        assignments_data = [
            {
                'question': 'Write a summary about Climate Change',
                'textTitle': texts[0],
                'deadline': date.today() + timedelta(days=14),
                'createdBy': teacher1
            },
            {
                'question': 'Summarize the Water Cycle',
                'textTitle': texts[1],
                'deadline': date.today() + timedelta(days=21),
                'createdBy': teacher1
            },
            {
                'question': 'Explain Photosynthesis',
                'textTitle': texts[2],
                'deadline': date.today() + timedelta(days=10),
                'createdBy': teacher2
            },
            {
                'question': 'The Solar System Summary',
                'textTitle': texts[3],
                'deadline': date.today() + timedelta(days=30),
                'createdBy': teacher2
            },
        ]
        assignments = []
        for assignment_data in assignments_data:
            assignment = Assignments.objects.create(**assignment_data)
            assignments.append(assignment)
        self.stdout.write(self.style.SUCCESS(f'Created {Assignments.objects.count()} assignments'))

        # Create Summaries (some submitted, some not)
        summaries_data = [
            {
                'question': assignments[0],
                'student': students[0],
                'summary': 'Climate change is caused mainly by human activities that produce greenhouse gases. This leads to global warming and various environmental problems like rising sea levels and extreme weather.',
                'is_submitted': True,
                'content_score': 85.50,
                'wording_score': 78.25,
                'submitted_on': date.today() - timedelta(days=2)
            },
            {
                'question': assignments[0],
                'student': students[1],
                'summary': 'The text discusses how burning fossil fuels causes climate change. Temperature rises affect weather patterns and ecosystems globally.',
                'is_submitted': True,
                'content_score': 72.00,
                'wording_score': 81.50,
                'submitted_on': date.today() - timedelta(days=1)
            },
            {
                'question': assignments[1],
                'student': students[0],
                'summary': 'Water evaporates, forms clouds, and returns as rain. This cycle is continuous and essential for life on Earth.',
                'is_submitted': True,
                'content_score': 88.75,
                'wording_score': 85.00,
                'submitted_on': date.today() - timedelta(days=3)
            },
            {
                'question': assignments[1],
                'student': students[2],
                'summary': 'The water cycle involves evaporation, condensation, and precipitation. Water moves between the atmosphere, land, and oceans in a continuous process.',
                'is_submitted': True,
                'content_score': 91.25,
                'wording_score': 88.50,
                'submitted_on': date.today() - timedelta(days=1)
            },
            {
                'question': assignments[2],
                'student': students[1],
                'summary': '',
                'is_submitted': False,
                'content_score': 0.00,
                'wording_score': 0.00,
                'submitted_on': None
            },
        ]
        for summary_data in summaries_data:
            Summaries.objects.create(**summary_data)
        self.stdout.write(self.style.SUCCESS(f'Created {Summaries.objects.count()} summaries'))

        self.stdout.write(self.style.SUCCESS('Database seeding completed successfully!'))