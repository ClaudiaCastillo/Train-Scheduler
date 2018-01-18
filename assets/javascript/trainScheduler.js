// Train Scheduler Javascript

// Initialize Firebase
var config = {
  apiKey: "AIzaSyAgN8Sq1gJhL7zCRCzT0lVJzPgK-kI7qeY",
  authDomain: "trainscheduler-24274.firebaseapp.com",
  databaseURL: "https://trainscheduler-24274.firebaseio.com",
  projectId: "trainscheduler-24274",
  storageBucket: "trainscheduler-24274.appspot.com",
  messagingSenderId: "366929629016"
};
firebase.initializeApp(config);

var trainData = firebase.database();

// Button for adding new trains and populating the Firebase Database with initial data

$("#add-train-btn").on("click", function() {

  // Obtain the Input value from the input form on the DOM
  // first train time (pushed back 10 years to make sure it comes before current time)

  var trainName = $("#train-name").val().trim();
  var destination = $("#train-destination").val().trim();
  var firstTrainUnix = moment($("#first-train").val().trim(), "HH:mm").subtract(10, "years").format("X");
  var frequency = $("#train-frequency").val().trim();

  // Create a local "temporary" object for holding the train data
  var newTrain = {
    name: trainName,
    destination: destination,
    firstTrain: firstTrainUnix,
    frequency: frequency
  };

  // Upload the train data object into the database
  trainData.ref().push(newTrain);

  // Clears all of the input text-boxes on the DOM
  $("#train-name").val("");
  $("#train-destination").val("");
  $("#first-train").val("");
  $("#train-frequency").val("");

  // Determine when the next train arrives.
  return false;
});

// Use Firebase event child-added to obtain a snapshot of train data added
// to the database. Load and generate a row in the html to place on the DOM
// using data from the Database along with computational data.

trainData.ref().on("child_added", function(childSnapshot, prevChildKey) {

  // Load table data values into new variables to use for display on DOM and computation
  var tblTrainName        = childSnapshot.val().name;
  var tblTrainDestination = childSnapshot.val().destination;
  var tblTrainFrequency   = childSnapshot.val().frequency;
  var tblFirstTrain       = childSnapshot.val().firstTrain;

  // -- Calculate the minutes till arrival -- 

  // Find the modulus (or remainder) of
  // difference in minutes between the current time in unix format and the table data first train in unix format 
  // divided by the table data train frequency in minutes 
  var remainderTimeDiff = moment().diff(moment.unix(tblFirstTrain), "minutes") % tblTrainFrequency;

  // Compute the minutes away by subtracting the remainder (of the difference in minutes between the current time
  // in unix format and the table data first train in unix format divided by the table data train frequency in minutes)
  // from the table data train frequency in minutes.
  var computeMinutesAway = tblTrainFrequency - remainderTimeDiff;

  // To calculate the arrival time, add the computeMinutesAway to the currrent time
  var computeNextArrival = moment().add(computeMinutesAway, "m").format("hh:mm A");

  // Add each train's data into the table
  $("#train-table > tbody").append("<tr><td>" + tblTrainName + "</td><td>" + tblTrainDestination + "</td><td>"
  + tblTrainFrequency + "</td><td>" + computeNextArrival + "</td><td>" + computeMinutesAway + "</td></tr>");
});

