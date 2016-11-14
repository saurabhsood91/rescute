from django.shortcuts import render,redirect
from django.http import HttpResponse,JsonResponse
from django.views.decorators.csrf import csrf_exempt
import hashlib # For SHA-256 Encoding
import base64
from base64 import b64decode
import json
import os
from rescute.settings import MEDIA_ROOT
from models import Category, Report
# Create your views here.
import uuid
import json
import urllib2

def get_hash(image):
    # m = hashlib.sha256()
    # m.update(image)
    # sha = m.digest()
    # res = base64.b64encode(sha)
    return uuid.uuid4().hex


def index(request):
    return HttpResponse("Hello")

def getCategories(request):
    animal_list = []
    for categoryObject in Category.objects.all():
        animal_list.append( categoryObject.animal_type )
    resp = json.dumps(sorted(animal_list))
    return HttpResponse(resp)

@csrf_exempt
def postReport(request):
    if request.method == 'POST':
        print request.POST
        print request.POST.get('animalType')
        categoryObject = Category.objects.get(animal_type = request.POST.get('animalType'))
        latitude = request.POST.get('latitude')
        longitude = request.POST.get('longitude')
        mobile_number = request.POST.get('mobileNumber')
        image_path = request.POST.get('imagePath')
        webUrl = ("http://maps.googleapis.com/maps/api/geocode/json?latlng=%s,%s"%(latitude,longitude))
        urlstream = urllib2.urlopen(webUrl)
        data = json.loads(urlstream.read())
        location = data['results'][0]["formatted_address"]
        reportObject = Report(
            animal_type_id = categoryObject.id,
            latitude = latitude,
            longitude = longitude,
            mobile_number = mobile_number,
            image_path = image_path,
            location = location
        )
        reportObject.save()
    return HttpResponse( reportObject.id )
    

@csrf_exempt
def uploadImage(request):
    if request.method == 'POST':
        image_data = request.POST['imageData']
    # return HttpResponse("Hello")
    #     image_data = request.form.get('imageData', '')
    if not image_data:
        raise InvalidUploadRequestException(message='Please pass base64 encoded data', status_code=500)

    try:
        print image_data
        decoded_image = b64decode(image_data)
    except TypeError as e:
        msg = json.dumps({
            'message': e
        })
        response = Response(msg, status=500, mimetype='application/json')
        return response

    # should have decoded base64 image
    # remove the existing image
    image_name_saved = get_hash(image_data)
    img_rel_path = os.path.join(MEDIA_ROOT, image_name_saved+'.jpg')
    if os.path.exists(img_rel_path):
        os.path.remove(img_rel_path)

    try:
        # create a new file with the image as content
        with open(img_rel_path, 'w') as image_file:
            image_file.write(decoded_image)
    except Exception as e:
        print e
        msg = json.dumps({
            'message': e
        })
        response = Response(msg, status=500, mimetype='application/json')
        return response

    # # sure to be free of exceptions
    # return blank
    
    return HttpResponse('/media/' + image_name_saved + ".jpg")
