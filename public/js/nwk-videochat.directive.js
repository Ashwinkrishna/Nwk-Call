angular.module('nwk-videochat')
    .controller('mainController', ['$scope',
        function($scope) {
            $scope.showAnswerBtn = false;
        }
    ])
    .directive('nwkVideo', ['$sce', '$timeout',
        function($sce, $timeout) {
            return {
                restrict: 'E',
                templateUrl: 'partials/nwk-videochat.directive.html',
                link: function($scope, e, a) {
                    $scope.roomToLeave = "";
                    $scope.roomToJoin = "";

                    //--------------------------------------------
                    try {
                        // create our webrtc connection
                        var webrtc = new SimpleWebRTC({
                            // the id/element dom element that will hold "our" video
                            localVideoEl: 'localVideo',
                            // the id/element dom element that will hold remote videos
                            remoteVideosEl: '',
                            // immediately ask for camera access
                            autoRequestMedia: true,
                            debug: false,
                            detectSpeakingEvents: true,
                            autoAdjustMic: false
                        });

                        // when it's ready, join if we got a room from the URL
                        webrtc.on('readyToCall', function() {
                            // you can name it anything

                            // join the room
                            $scope.joinRoom = function() {
                                console.log('$scope.roomToJoin:', $scope.roomToJoin);
                                webrtc.joinRoom($scope.roomToJoin);
                            }
                            // leave the room
                            $scope.leaveRoom = function() {
                                console.log('$scope.roomToLeave:', $scope.roomToLeave);
                                webrtc.leaveRoom();
                            }
                        });

                        function showVolume(el, volume) {
                            if (!el) return;
                            if (volume < -45) { // vary between -45 and -20
                                el.style.height = '0px';
                            } else if (volume > -20) {
                                el.style.height = '100%';
                            } else {
                                el.style.height = '' + Math.floor((volume + 100) * 100 / 25 - 220) + '%';
                            }
                        }
                        webrtc.on('channelMessage', function(peer, label, data) {
                            if (data.type == 'volume') {
                                showVolume(document.getElementById('volume_' + peer.id), data.volume);
                            }
                        });
                        // call back when video has to be added 
                        webrtc.on('videoAdded', function(video, peer) {
                            console.log('video added', peer);
                            var remotes = document.getElementById('remotes');
                            if (remotes) {
                                var d = document.createElement('div');
                                d.className = 'videoContainer';
                                d.id = 'container_' + webrtc.getDomId(peer);
                                d.appendChild(video);
                                var vol = document.createElement('div');
                                vol.id = 'volume_' + peer.id;
                                vol.className = 'volume_bar';
                                video.onclick = function() {
                                    video.style.width = video.videoWidth + 'px';
                                    video.style.height = video.videoHeight + 'px';
                                };
                                d.appendChild(vol);
                                remotes.appendChild(d);
                            }
                        });
                        // call back when video has to be removed when leaving a group 
                        webrtc.on('videoRemoved', function(video, peer) {
                            console.log('video removed ', peer);
                            var remotes = document.getElementById('remotes');
                            var el = document.getElementById('container_' + webrtc.getDomId(peer));
                            if (remotes && el) {
                                remotes.removeChild(el);
                            }
                        });
                        // changes in volume controls
                        webrtc.on('volumeChange', function(volume, treshold) {
                            //console.log('own volume', volume);
                            showVolume(document.getElementById('localVolume'), volume);
                        });
                        //ice server fails comes hear 
                        webrtc.on('iceFailed', function(peer) {
                            var connstate = document.querySelector('#container_' + webrtc.getDomId(peer) + ' .connectionstate');
                            console.log('local fail', connstate);
                            if (connstate) {
                                connstate.innerText = 'Connection failed.';
                                fileinput.disabled = 'disabled';
                            }
                        });

                        // remote p2p/ice failure
                        webrtc.on('connectivityError', function(peer) {
                            var connstate = document.querySelector('#container_' + webrtc.getDomId(peer) + ' .connectionstate');
                            console.log('remote fail', connstate);
                            if (connstate) {
                                connstate.innerText = 'Connection failed.';
                                fileinput.disabled = 'disabled';
                            }
                        });

                        //Creating the room
                        $('form').submit(function() {
                            var val = $('#sessionInput').val().toLowerCase().replace(/\s/g, '-').replace(/[^A-Za-z0-9_\-]/g, '');
                            // Create room and call back if fails
                            webrtc.createRoom(val, function(err, name) {
                                console.log(' create room cb', arguments);
                                    console.log(err);
                            });
                            return false;
                        });

                    } catch (e) {
                        console.log("### --- > error in the program", e.message);
                    }
                    //--------------------------------------------

                }

            };
        }
    ])