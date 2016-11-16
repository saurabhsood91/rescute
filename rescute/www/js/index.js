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
    baseUrl: 'http://10.0.0.46:8000',
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

    findNearby: function() {
        var self = this;
        var content = $('#content');
        content.empty();

        var grid = $('<div/>');

        // get all the reports
        var url = self.baseUrl + '/getReports/';
        $.getJSON(url).done(function(reports) {
            reports.forEach(function(report, index) {
                var img = $('<img />', {
                    'src': self.baseUrl + report.image_path,
                    'class': 'img-grid'
                });

                var animalType = $('<p/>').html(report.animal_type);
                if(index % 2 == 0) {
                    // create a row
                    var row = $('<div />', {
                        'class': 'row'
                    });

                    var reportContainer = $('<div />', {
                        'class': 'col-xs-5 col-xs-offset-1'
                    });

                    reportContainer.click(function() {
                        self.showAnimalDetails(report);
                    });

                    reportContainer.append(img);
                    reportContainer.append(animalType);
                    row.append(reportContainer);
                    grid.append(row);
                } else {
                    // Get the last row
                    var rows = $('.row');
                    var row = $(rows[rows.length - 1]);

                    var reportContainer = $('<div />', {
                        'class': 'col-xs-5 col-md-offset-1'
                    });

                    reportContainer.click(function() {
                        self.showAnimalDetails(report);
                    });

                    reportContainer.append(img);
                    reportContainer.append(animalType);
                    row.append(reportContainer);
                }
            });
        });

        // Filters
        var filterRow = $('<div/>', {
            'class': 'row filters'
        });

        var outerDiv = $('<div/>', {
            'class': 'outer-div col-xs-4'
        });

        var form = $('<form/>', {
            'class': 'form-search form-inline'
        });
        var input = $('<input/>', {
            'class': 'form-control search-query',
            'type': 'text',
            'placeholder': 'Search...'
        });

        var filterDropdown = $('<div/>', {
            'class': 'dropdown col-xs-4'
        });
        var button = $('<button/>', {
            'class': 'btn btn-default dropdown-toggle form-control',
            'id': 'btn-sort',
            'type': 'button',
            'data-toggle': 'dropdown',
            'aria-haspopup': 'true',
            'aria-expanded': 'true'
        });
        var sortSpan = $('<span/>', {
            'class': 'glyphicon glyphicon-sort'
        }).html('&nbsp;Sort');
        button.append(sortSpan);

        var ul = $('<ul class="dropdown-menu" aria-labelledby="btn-sort"><li><a href="#">Animal Type</a></li><li><a href="#">Location</a></li><li><a href="#">Status</a></li></ul>');

        filterDropdown.append(button);
        filterDropdown.append(ul);


        // Filter
        var filterDiv = $('<div/>', {
            class: 'col-xs-4'
        });
        var filterButton = $('<button/>', {
            'class': 'btn btn-default form-control'
        });

        var spanFilter = $('<span/>', {
            'class': 'glyphicon glyphicon-filter'
        }).html('&nbsp;Filter');
        filterButton.append(spanFilter);
        filterDiv.append(filterButton);

        form.append(input);
        outerDiv.append(form);
        filterRow.append(outerDiv);
        filterRow.append(filterDropdown);
        filterRow.append(filterDiv);

        content.append(filterRow);
        content.append(grid);
    },

    showAnimalDetails: function(report) {
        var content = $('#content');
        content.empty();

        var container = $('<div/>');

        var img = $('<img/>', {
            src: this.baseUrl + report.image_path,
            id: 'img-summary'
        });

        var imgContainer = $('<div/>');
        var animalType = $('<p/>').html('Animal Type: ' + report.animal_type);
        var latitude = $('<p/>').html('Latitude: ' + report.latitude);
        var longitude = $('<p/>').html('Longitude: ' + report.longitude);

        var gmapsString = "geo:" + report.latitude + ',' + report.longitude;
        var gmaps = $('<a class="btn btn-primary" href="' + gmapsString + '">Navigate</a>');

        imgContainer.append(img);
        container.append(imgContainer);
        container.append(animalType);
        container.append(latitude);
        container.append(longitude);
        container.append(gmaps);
        content.append(container);
    },

    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        $('#btn-report-lost').click($.proxy(this.takePicture, this));
        $('#btn-find-nearby').click($.proxy(this.findNearby, this));
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
                onFailure: function(err) {
                    console.log(err);
                }
            }).done(function(d) {
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
                imagePath: d
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
