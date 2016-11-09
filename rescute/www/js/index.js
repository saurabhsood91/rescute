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
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },

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
        // console.log(data);
        // Clear everything
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
            var baseUrl = 'http://10.0.0.228:80';
            var url = baseUrl + '/uploadImage/';
            $.post(url, {
                imageData: data,
                // onSuccess: function(d) {
                //     console.log(baseUrl + d);
                // },
                onFailure: function(err) {
                    console.log(err);
                }
            }).done(function(d) {
                console.log(baseUrl + d);
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

    onFail: function(err) {
        console.log(err);
    },

    onDeviceReady: function() {
        // app.receivedEvent('deviceready');
    },
};

app.initialize();
