# -*- coding: utf-8 -*-
# Generated by Django 1.10.1 on 2016-11-14 00:36
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('rescuteApp', '0002_auto_20161110_1838'),
    ]

    operations = [
        migrations.AddField(
            model_name='report',
            name='location',
            field=models.CharField(default='Boulder', max_length=300),
        ),
    ]