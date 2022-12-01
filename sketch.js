let video;
let poseNet;
let pose;
let skeleton;

let neuralNetwork;

let exerciseTime = 25;
let countdownTime = 5;

let countdownComplete = false;
let addRep = false;

let totalReps = 0;
let finalReps = 0;

let currentPose = "rest";
let firstTimeRun = true;
let stopExercising = false;

function setup() {
  var canvas = createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.hide();

  // Move the canvas so it’s inside the <div id="container">.
  canvas.parent("middle-right");

  // load posenet
  poseNet = ml5.poseNet(video, poseNetLoaded);
  poseNet.on("pose", gotPoses);

  startCountdown();
}

function startCountdown() {
  setInterval(function () {
    if (countdownTime <= 0) {
      countdownTime = "";
      loadNetwork();
      countdownComplete = true;
    } else {
      --countdownTime;
    }
    document.getElementById("middle-right-timer").innerHTML = countdownTime;
  }, 2000);
}

function loadNetwork() {
  let options = {
    inputs: 34,
    outputs: 2,
    task: "classification",
  };
  neuralNetwork = ml5.neuralNetwork(options);

  const modelDetails = {
    model: "model/model.json",
    metadata: "model/model_meta.json",
    weights: "model/model.weights.bin",
  };
  neuralNetwork.load(modelDetails, modelLoaded);
}

function poseNetLoaded() {
  console.log("poseNet ready");
}

function modelLoaded() {
  console.log("model trained, pose classification can start");
  classifyPose();
}

function classifyPose() {
  if (pose) {
    let inputs = [];

    for (let i = 0; i < pose.keypoints.length; i++) {
      let x = pose.keypoints[i].position.x;
      let y = pose.keypoints[i].position.y;
      inputs.push(x);
      inputs.push(y);
    }

    // ! goResult
    neuralNetwork.classify(inputs, gotResult);
  } else {
    setTimeout(classifyPose, 100);
  }
}

function gotResult(err, results) {
  if (err) {
    console.log(err);
    return;
  }

  if (results[0].confidence >= 0.75) {
    // check if count rep
    if (!firstTimeRun) {
      if (currentPose == results[0].label) {
        currentPose = results[1].label;
        ++totalReps;

        if (stopExercising == false) {
          document.getElementById("top-bar-completed--text").innerHTML =
            totalReps;
        } else {
          document.getElementById("top-bar-completed--text").innerHTML =
            finalReps;
        }
      }
    } else {
      firstTimeRun = false;
      currentPose = "squat";
    }

    if (currentPose == "squat") {
      document.getElementById("middle-pose-image").src = "poses/squat.svg";
    } else if (currentPose == "handsBehindNeck") {
      document.getElementById("middle-pose-image").src =
        "poses/handsBehindNeck.svg";
    }
  }

  console.log(results);
  classifyPose();
}

function gotPoses(poses) {
  if (poses.length > 0) {
    pose = poses[0].pose;
    skeleton = poses[0].skeleton;
  }
}

function draw() {
  push();
  translate(video.width, 0);
  scale(-1, 1);
  image(video, 0, 0, video.width, video.height);

  // ! draw pose and skeleton
  drawPose();

  //  ! timer
  if (countdownComplete && Math.round(exerciseTime) > 0) {
    exerciseTime = exerciseTime - 1 / 60;

    if (Math.round(exerciseTime) >= 10) {
      document.getElementById("top-bar-time--text").innerHTML =
        Math.round(exerciseTime);
    } else {
      document.getElementById("top-bar-time--text").innerHTML =
        "0" + Math.round(exerciseTime);
    }
  }

  if (Math.round(exerciseTime) <= 0) {
    noLoop();
    stopExercising = true;
    finalReps = totalReps;
    document.getElementById("completion__message--text").innerHTML = finalReps;
    document.getElementById("completion").style.display = "block";
    document.getElementById("black_overlay").style.display = "block";
  }
}

function drawPose() {
  if (pose) {
    for (let i = 0; i < skeleton.length; i++) {
      let pointA = skeleton[i][0];
      let pointB = skeleton[i][1];

      strokeWeight(3);
      stroke("white");
      line(
        pointA.position.x,
        pointA.position.y,
        pointB.position.x,
        pointB.position.y
      );
    }

    // draw ellipse on keypoints
    for (let i = 0; i < pose.keypoints.length; i++) {
      if (i > 4) {
        let x = pose.keypoints[i].position.x;
        let y = pose.keypoints[i].position.y;
        stroke("white");
        strokeWeight(2);
        fill("red");
        ellipse(x, y, 16, 16);
      }
    }
  }
  pop();
}
