'use strict';

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
                    $scope.statusMsg = 'Loading..',
                    $scope.id = '',
                    $scope.localStream = '',
                    $scope.isDisabled = false,
                    $scope.callInProgress = false;
                    $scope.showAnswerBtn = false;
                    $scope.showEndBtn = false;

                    setTimeout(function() {
                        $scope.statusMsg = 'Contacting Peer Server...';
                    }, 0);

                    // Request video stream
                    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;

                    // New peer connection with our server
                    try {
                        function RandomGen(){
                            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
                        }

                        function id(){
                            return (RandomGen() + RandomGen() + RandomGen());
                        }
                        var peerId = id();
                        console.log("Peer -- >", peerId);
                        var peer = new Peer(peerId, {
                            host: '184.73.254.59',
                            port: 9000
                        });

                    } catch (e) {
                        console.log("Something went wrong creating peer");
                    }
                    //  check for peer connection created
                    if (peer === null || peer === undefined) {
                        console.log("Peer connection is undefined");
                    }
                    //peer connection opened
                    try{
                    peer.on('open', function(id) {
                        if (id === null || id === undefined)
                            console.log("Id of the peer was undefined")
                        $scope.id = id;
                        $scope.statusMsg = 'Connected to Peer Server...';
                        $scope.statusMsg = 'Streaming local video...';
                    });
                    }catch(e){
                        console.log("Peer was not defined call the peer server to fer id ...");
                    }

                    // Listen to incoming calls
                    peer.on('call', function(call) {
                        // ask the user if he wants to answer the call
                        console.log("inside call show the answer button");
                        $scope.showAnswerBtn = true;
                        $timeout(function() {
                            $scope.showAnswerBtn = true;
                        }, 0);
                        $scope.answer = function() {
                            if (call) {
                                initSelfVideo(function() {
                                    call.answer($scope.localStream);
                                    $scope.showAnswerBtn = false;
                                    handleCall(call);
                                });
                            } else {
                                console.log(" ---- > in peer.on(call) Call was undefined...");
                            }
                        }

                        $scope.reject = function() {
                            $scope.showAnswerBtn = false;
                            call.close();
                        }
                    });

                    // Error Handling in peerJS
                    peer.on('error', function(err) {
                        $scope.error = err;
                    });

                    // Start the call with the other persons peer id
                    $scope.startCall = function($event) {
                        if ($event.which === 13) {
                            $scope.isDisabled = true;
                            initSelfVideo(function() {
                                handleCall(peer.call($scope.peerId, $scope.localStream));
                            });
                        }
                    };

                    // End the call 
                    $scope.endCall = function() {
                        $scope.callInProgress.close(); // closing the call
                        $scope.callInProgress = false;
                        $scope.localVdoURL = null;
                        $scope.peerVdoURL = null;
                        $scope.showEndBtn = false; // reseting the buttons
                    };

                    // getUserMedia
                    function initSelfVideo(cb) {
                        navigator.getUserMedia({
                            audio: true, // constraints for the call
                            video: false
                        }, function(stream) {
                            $scope.localStream = stream; // sucess call back
                            $scope.localVdoURL = $sce.trustAsResourceUrl(URL.createObjectURL(stream));
                            console.log("get user media allocatig local resource");
                            cb();
                        }, function() {
                            $scope.error = 'Unable to access your camera, Please try again';
                        });
                    }

                    function handleCall(call) {
                        if ($scope.callInProgress) {
                            $scope.callInProgres$scope.close();
                            $scope.showEndBtn = false;
                        }
                        console.log("handleCall", call);
                        call.on('stream', function(peerStream) {
                            console.log("Update peerStreamOn Stream add ");
                            $scope.peerVdoURL = $sce.trustAsResourceUrl(URL.createObjectURL(peerStream));
                            $scope.$apply();
                        });
                        $scope.callInProgress = call;
                        $scope.showEndBtn = true;
                        console.log("handler Call in progression");
                    }
                    
                }
            };
        }
    ])