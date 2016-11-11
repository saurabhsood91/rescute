/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    baseUrl: 'http://10.0.0.228:8000',
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },

    baseHTML: $('#content').html(),

    takePicture: function() {
        if(navigator.camera) {
            navigator.camera.getPicture($.proxy(this.onSuccess, this), this.onFail, { quality: 25,
                destinationType: Camera.DestinationType.DATA_URL
            });
        }
    },

    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        $('#btn-report-lost').click($.proxy(this.takePicture, this));
    },

    onSuccess: function(data) {
        // Clear everything
        var self = this;
        var content = $('#content');
        content.empty();

        var img = $('<img />', {
            'id': 'img-captured-photo',
            'src': "data:image/jpeg;base64," + data
        });

        var btnRetake = $('<button />', {
            'id': 'btn-retake',
            'class': 'btn btn-primary form-control'
        }).html('Retake Photo');

        btnRetake.click($.proxy(this.takePicture, this));

        var btnContinue = $('<button />', {
            'id': 'btn-continue',
            'class': 'btn btn-primary form-control'
        }).html('Continue');

        btnContinue.click(function(){
            // var self = this;
            var url = self.baseUrl + '/uploadImage/';
            $.post(url, {
                imageData: data,
                // onSuccess: function(d) {
                //     console.log(baseUrl + d);
                // },
                onFailure: function(err) {
                    console.log(err);
                }
            }).done(function(d) {
                // console.log(baseUrl + d);
                self._showSummary(d);
            });
        });

        var imgContainer = $('<div />', {
             'class': 'img-container'
        });

        var mainContainer = $('<div />');

        imgContainer.append(img);
        mainContainer.append(imgContainer);
        mainContainer.append(btnRetake);
        mainContainer.append(btnContinue);
        content.append(mainContainer);
    },

    _showSummary: function(d) {
        var self = this;
        var baseUrl = self.baseUrl;
        var content = $('#content');

        // Show the image
        var imageURL = baseUrl + d;
        var img = $('<img />', {
            'src': imageURL,
            'id': 'img-summary'
        });
        var imgContainer = $('<div />', {
            'class': 'img-summary-container'
        });
        imgContainer.append(img);

        // Categories
        var categoriesText = $('<p/>').html('Select a type of animal');
        var categoriesDiv = $('<div />');
        var ul = $('<ul />');
        categoriesDiv.append(categoriesText);
        categoriesDiv.append(categoriesDiv);
        var categoriesUrl = baseUrl + '/getCategories/';
        $.getJSON(categoriesUrl).done(function(categories) {
            categories.forEach(function(category) {
                var categoryInputElement = $('<input />', {
                    'type': 'radio',
                    'class': 'radio-category',
                    'name': 'categories'
                }).val(category);
                var categoryTextElement = $('<span />').html(category);
                categoriesDiv.append(categoryInputElement);
                categoriesDiv.append(categoryTextElement);
                categoriesDiv.append('<br />')
            });
        });

        // Input to show the mobile number
        var mobileNumberContainer = $('<div />');
        var mobileNumberText = $('<p />').html('Enter Mobile Number');
        var mobileNumberInput = $('<input />', {
              'type': 'number',
              'class': 'form-control',
              'id': 'txtMobileNumber'
        });
        mobileNumberContainer.append(mobileNumberText);
        mobileNumberContainer.append(mobileNumberInput);

        // Geolocation container
        var geolocationContainer = $('<div />');
        var geolocationText = $('<p />');
        var latitudeText = $('<p/>').html('Latitude');
        var longitudeText = $('<p />').html('Longitude');
        var latitude = $('<p/>', {
            'id': 'geolocation-latitude'
        });
        var longitude = $('<p/>', {
            'id': 'geolocation-longitude'
        });
        geolocationContainer.append(geolocationText);
        geolocationContainer.append(latitudeText);
        geolocationContainer.append(latitude);
        geolocationContainer.append(longitudeText);
        geolocationContainer.append(longitude);

        // Get and set the geolocation
        navigator.geolocation.getCurrentPosition(function(position) {
            latitude.html(position.coords.latitude);
            longitude.html(position.coords.longitude);
        }, function(err) {
            console.log(err);
        });

        // Buttons
        var reportButton = $('<button />', {
            'type': 'button',
            'class': 'btn btn-primary form-control'
        }).html('Report');

        reportButton.click(function() {
            var selectedCategory = $('.radio-category:checked').val();
            var latitude = $('#geolocation-latitude').html();
            var longitude = $('#geolocation-longitude').html();
            var mobilePhoneNumber = $('#txtMobileNumber').val();

            var data = {
                animalType: selectedCategory,
                latitude: latitude,
                longitude: longitude,
                mobileNumber: mobilePhoneNumber,
                imagePath: imageURL
            };

            // Make AJAX call
            var addReportURL = baseUrl + '/postReport/';
            $.post(addReportURL, data).done(function(d) {
                // console.log(d);
                alert('Successfully Reported animal');
                $('#content').empty().html(self.baseHTML);
            });
        });

        var cancelButton = $('<button />', {
            'type': 'button',
            'class': 'btn btn-danger form-control'
        }).html('Cancel');

        var btnContainer = $('<div />');
        btnContainer.append(reportButton);
        btnContainer.append(cancelButton);

        // Combine the entire container
        content.empty();
        content.append(imgContainer);
        content.append(categoriesDiv);
        content.append(mobileNumberContainer);
        content.append(geolocationContainer);
        content.append(btnContainer);
    },

    onFail: function(err) {
        console.log(err);
    },

    onDeviceReady: function() {
        // app.receivedEvent('deviceready');
    },
};

app.initialize();
