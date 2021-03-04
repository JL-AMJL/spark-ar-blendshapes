const Animation = require('Animation');
const Scene = require('Scene');
const D= require('Diagnostics');
const Reactive = require('Reactive');
const TouchGestures = require('TouchGestures');
const Audio = require("Audio");


(async function () {
  // Enables async/await in JS [part 1]

  // Access scene objects
  const loadAssets = await Promise.all(
    [
    Scene.root.findFirst("Hoverball.001"),
    Scene.root.findFirst("planeTracker0"),
    Scene.root.findFirst("placer"),
    Audio.getAudioPlaybackController("audioPlaybackController0")
    ]
  ).then(function(assets){
    const hoverBall = assets[0];
    const planeTracker = assets[1];
    const placer = assets[2];
    const playbackController = assets[3];
    const hoverBallShapes = hoverBall.getBlendShapes();

    /**AUDIOCONTROLLER */
    //Set play- and loop parameters for audio playback controller
    playbackController.setPlaying(true);
    playbackController.setLooping(true);

    //==================================================
    //Start and stop the audio by tapping on the screen
    //==================================================
    
    //Create boolean to detect if the audio is playing
    let isAudioPlaying = true;
    D.watch('Boolean - ', isAudioPlaying);
    D.watch('playing - ', playbackController.playing);

    //subscribe to tap gestures on the screen
    TouchGestures.onTap().subscribe(function() {
      //switch the boolean controlling audio playback
      isAudioPlaying = !isAudioPlaying;
      //start or stop the audio depending on the state of the boolean
      playbackController.setPlaying(isAudioPlaying);
    });
    
    //Set time driver parameters
    const timeDriverParameters = {
      durationMilliseconds: 10000,
      loopCount: Infinity,
      mirror: false
    }

    //Construct and start Animation
    const timeDriver = Animation.timeDriver(timeDriverParameters);
    timeDriver.start();
    const frameSampler = Animation.samplers.frame(240,0);
    const frameAnimation = Animation.animate(timeDriver, frameSampler);
    const currentFrame = frameAnimation;

    //Subscribe Shapefunction to Animation
    currentFrame.monitor().subscribe(function(event) {
      hoverBallShapes._value[event.oldValue].weight = Reactive.val(0);
      hoverBallShapes._value[event.newValue].weight = Reactive.val(1);
    });

    /**INTERACTIVITY */
    //Position
    TouchGestures.onPan().subscribe(function(gesture){
      planeTracker.trackPoint(gesture.location, gesture.state);
    });
    //Scale
    const placerTransform = placer.transform;
    TouchGestures.onPinch().subscribeWithSnapshot({
      'lastScaleX' : placerTransform.scaleX,
      'lastScaleY' : placerTransform.scaleY,
      'lastScaleZ' : placerTransform.scaleZ
    }, function(gesture, snapshot){
      placerTransform.scaleX = gesture.scale.mul(snapshot.lastScaleX);
      placerTransform.scaleY = gesture.scale.mul(snapshot.lastScaleY);
      placerTransform.scaleZ = gesture.scale.mul(snapshot.lastScaleZ);
    });
  });
})(); // Enables async/await in JS [part 2]
