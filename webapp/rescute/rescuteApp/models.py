from __future__ import unicode_literals

from django.db import models

# Create your models here.

REPORT_STATUS = (
    (0, 'Unresolved'),
    (1, 'Rescue in Progress'),
    (2, 'Rescued'),
    (3, 'Adopted'),
)

class Category(models.Model):
    animal_type = models.CharField(max_length=200)

    def __unicode__(self):
        return self.animal_type

    
class Report(models.Model):
	animal_type = models.ForeignKey(Category)
	latitude = models.CharField(max_length=10)
	longitude = models.CharField(max_length=10)
	mobile_number = models.CharField(max_length=10)
	report_date = models.DateTimeField(auto_now_add=True)
	image_path = models.CharField(max_length=200)
	status = models.IntegerField(choices=REPORT_STATUS, default=0 )
	location = models.CharField(max_length=300, default="Boulder")
