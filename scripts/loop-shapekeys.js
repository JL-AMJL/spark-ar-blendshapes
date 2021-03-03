const Animation = require('Animation');
const Scene = require('Scene');
const D= require('Diagnostics');
const Reactive = require('Reactive');
const TouchGestures = require('TouchGestures');


(async function () {
  // Enables async/await in JS [part 1]

  // Access scene objects
  const loadAssets = await Promise.all(
    [
    Scene.root.findFirst("Hoverball.001"),
    Scene.root.findFirst("planeTracker0"),
    Scene.root.findFirst("placer")
    ]
  ).then(function(assets){
    const hoverBall = assets[0];
    const planeTracker = assets[1];
    const placer = assets[2];
    const hoverBallShapes = hoverBall.getBlendShapes();
    
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
    //Rotation
    TouchGestures.onRotate().subscribeWithSnapshot({
      'lastRotationY' : placerTransform.rotationY,
    }, function(gesture, snapshot){
      const correctRotation = gesture.rotation.mul(-1);
      placerTransform.rotationY = correctRotation.add(snapshot.lastRotationY);
    });
  });

})(); // Enables async/await in JS [part 2]
