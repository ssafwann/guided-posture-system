let video;
let poseNet;

function setup() {
  createCanvas(660, 480);
  video = createCapture(VIDEO);
  video.hide();
  poseNet = ml5.poseNet(video, modelLoaded);

  // gets skeleton
  poseNet.on("pose", gotPoses);
}

// callback function
let pose;

function gotPoses(poses) {
  console.log(poses);

  // can use confidence score here
  if (poses.length > 0) {
    pose = poses[0].pose;
  }
}

function modelLoaded() {
  console.log("poseNet ready");
}

function draw() {
  image(video, 0, 0);

  // display pose (just an example)
  if (pose) {
    fill(255, 0, 0);
    ellipse(pose.nose.x, pose.nose.y, 16);
    ellipse(pose.leftEye.x, pose.leftEye.y, 16);
    ellipse(pose.rightEye.x, pose.rightEye.y, 16);
    ellipse(pose.leftShoulder.x, pose.leftShoulder.y, 16);
    ellipse(pose.rightShoulder.x, pose.rightShoulder.y, 16);
  }
}
