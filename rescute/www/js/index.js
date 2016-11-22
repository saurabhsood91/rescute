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
                destinationType: Camera.DestinationType.DATA_URL,
                correctOrientation: true
            });
        }
    },

    showFilters: function() {
        $('#modal-filters').modal('show');
    },

    removeBackFindNearby: function() {
        $('#content').html(this.currentScreenHTML);
        this.bindEvents();
        // document.removeEventListener('backbutton', this.removeBackFindNearby);
        $(document).off('backbutton');
    },

    currentScreenHTML: null,

    findNearby: function() {
        var self = this;
        var content = $('#content');
        this.currentScreenHTML = content.html();

        // document.addEventListener('backbutton', $.proxy(this.removeBackFindNearby, this));
        $(document).on('backbutton', $.proxy(this.removeBackFindNearby, this));

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
                        'class': 'col-xs-5'
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
                        'class': 'col-xs-5 col-xs-offset-1'
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

        filterButton.click($.proxy(self.showFilters, self));

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

    removeBackShowAnimalDetails: function() {
        $(document).off('backbutton');
        this.findNearby();
    },

    showAnimalDetails: function(report) {
        var content = $('#content');

        var previousScreenContent = content.html();
        $(document).on('backbutton', $.proxy(this.removeBackShowAnimalDetails, this));

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

        var gmapsString = "http://maps.google.com/maps?daddr=" + report.latitude + ',' + report.longitude;
        var gmaps = $('<a class="btn btn-primary" href="' + gmapsString + '">Navigate</a>');

        gmaps.click(function() {
            var rescuedButtonRow = $('<div/>', {
                'class': 'row rescued-button-row'
            });
            var btnRescued = $('<button/>', {
                'class': 'btn btn-success col-xs-4 col-xs-offset-1'
            }).html('Rescued');

            btnRescued.click(function() {
                alert('You have marked the animal as rescued!');
            });

            var btnNotRescued = $('<button/>', {
                'class': 'btn btn-danger col-xs-4 col-xs-offset-1'
            }).html('Not Rescued');

            btnNotRescued.click(function() {
                alert('You have marked the animal as not rescued!');
            });
            rescuedButtonRow.append(btnNotRescued);
            rescuedButtonRow.append(btnRescued);
            container.append(rescuedButtonRow);
        });

        imgContainer.append(img);
        container.append(imgContainer);
        container.append(animalType);
        container.append(latitude);
        container.append(longitude);
        container.append(gmaps);
        content.append(container);
    },

    bindEvents: function() {
        document.addEventListener('deviceready', $.proxy(this.onDeviceReady, this), false);
        $('#btn-report-lost').click($.proxy(this.takePicture, this));
        $('#btn-find-nearby').click($.proxy(this.findNearby, this));
    },

    removeBackCamera: function() {
        $(document).off('backbutton');
        $('#content').html(this.currentScreenHTML);
        this.bindEvents();
    },

    onSuccess: function(data) {
        // Clear everything
        var self = this;
        var content = $('#content');
        var previousScreenContent = content.html();
        this.currentScreenHTML = previousScreenContent;
        $(document).on('backbutton', $.proxy(this.removeBackCamera, this));

        content.empty();

        var img = $('<img />', {
            'id': 'img-captured-photo',
            'src': "data:image/jpeg;base64," + data
        });

        var btnRetake = $('<button />', {
            'id': 'btn-retake',
            'class': 'btn btn-primary col-xs-4 col-xs-offset-1'
        }).html('Retake Photo');

        btnRetake.click($.proxy(this.takePicture, this));

        var imgLocation = $('<img/>', {
            'src': 'https://www.mapquestapi.com/staticmap/v4/getmap?key=UShjaMayAC4UkuBJ5nu5rqFuraxzEOQU&size=' + $(document).width() + ',200&type=map&imagetype=jpg&zoom=15&scalebar=false&traffic=false&center=' + self.latitude + ',' + self.longitude + '&xis=https://s.aolcdn.com/os/mapquest/yogi/icons/poi-active.png,1,c,40.015831,-105.27927&ellipse=fill:0x70ff0000|color:0xff0000|width:2|40.00,-105.25,40.04,-105.30',
            'class': 'img-location'
        });

        var buttonRow = $('<div/>', {
            'class': 'row button-row'
        });

        var btnContinue = $('<button />', {
            'id': 'btn-continue',
            'class': 'btn btn-primary col-xs-4 col-xs-offset-2'
        }).html('Continue');

        buttonRow.append(btnRetake);
        buttonRow.append(btnContinue);

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
        mainContainer.append(imgLocation);
        // mainContainer.append(retakeRow);
        mainContainer.append(buttonRow);
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
        var categoriesText = $('<label/>', {
            'for': 'categories',
            'style': 'width: 100%; margin-top: 10px;'
        }).html('Select a type of animal');
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
        var mobileNumberText = $('<label />', {
            'for': 'txtMobileNumber'
        }).html('Enter Mobile Number');
        var mobileNumberInput = $('<input />', {
              'type': 'number',
              'class': 'form-control',
              'id': 'txtMobileNumber'
        });
        mobileNumberContainer.append(mobileNumberText);
        mobileNumberContainer.append(mobileNumberInput);


        // Additional Comments
       var additionalCommentsContainer = $('<div />');
       var additionalCommentsText = $('<label />', {
           'for': 'txtAdditionalComments'
       }).html('Additonal Comments');
       var additionalCommentsInput = $('<textarea />',{
           // 'type': 'textarea',
           'class': 'form-control',
           'id': 'txtAdditionalComments'
       });
       additionalCommentsContainer.append(additionalCommentsText);
       additionalCommentsContainer.append(additionalCommentsInput);

        // Geolocation container
        var geolocationContainer = $('<div />');
        var geolocationText = $('<p />');
        var latitudeText = $('<label/>', {
            'for': 'latitude'
        }).html('Latitude');
        var longitudeText = $('<label />', {
            'for': 'longitude'
        }).html('Longitude');
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
        var buttonRow = $('<div/>', {
            'class': 'row',
            'id': 'report-row'
        });
        var reportButton = $('<button />', {
            'type': 'button',
            'class': 'btn btn-primary col-xs-4 col-xs-offset-1'
        }).html('Report');

        reportButton.click(function() {
            var selectedCategory = $('.radio-category:checked').val();
            var latitude = $('#geolocation-latitude').html();
            var longitude = $('#geolocation-longitude').html();
            var mobilePhoneNumber = $('#txtMobileNumber').val();
            var additionalComment = $('#txtAdditionalComments').val();

            var data = {
                animalType: selectedCategory,
                latitude: latitude,
                longitude: longitude,
                mobileNumber: mobilePhoneNumber,
                imagePath: d,
                additionalComments: additionalComment
            };

            // Make AJAX call
            var addReportURL = baseUrl + '/postReport/';
            $.post(addReportURL, data).done(function(d) {
                // console.log(d);
                alert('Successfully Reported animal');
                $('#content').empty().html(self.baseHTML);
                self.bindEvents();
            });
        });

        var cancelButton = $('<button />', {
            'type': 'button',
            'class': 'btn btn-danger col-xs-4 col-xs-offset-1'
        }).html('Cancel');
        buttonRow.append(cancelButton);
        buttonRow.append(reportButton);

        var btnContainer = $('<div />');
        btnContainer.append(buttonRow);
        // btnContainer.append(cancelRow);

        // Combine the entire container
        content.empty();
        content.append(imgContainer);
        content.append(categoriesDiv);
        content.append(mobileNumberContainer);
        content.append(additionalCommentsContainer);
        content.append(geolocationContainer);
        content.append(btnContainer);
    },

    onFail: function(err) {
        console.log(err);
    },

    latitude: null,
    longitude: null,

    onDeviceReady: function() {
        var self = this;
        // app.receivedEvent('deviceready');
        navigator.geolocation.getCurrentPosition(function(position) {
            // latitude.html(position.coords.latitude);
            // longitude.html(position.coords.longitude);
            self.latitude = position.coords.latitude;
            self.longitude = position.coords.longitude;
        }, function(err) {
            console.log(err);
        });
    },
};

app.initialize();
