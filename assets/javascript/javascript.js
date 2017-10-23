var config = {
    apiKey: "AIzaSyA3mwHQnmG8mtyoFAlQWHvbuUYLVASNs6E",
    authDomain: "rock-paper-scissors-ca2af.firebaseapp.com",
    databaseURL: "https://rock-paper-scissors-ca2af.firebaseio.com",
    projectId: "rock-paper-scissors-ca2af",
    storageBucket: "rock-paper-scissors-ca2af.appspot.com",
    messagingSenderId: "113923101424"
  };
firebase.initializeApp(config);
var database = firebase.database();
//GAME OBJECT WITH FUNCTIONS TO CALL THAT ARE RELATED TO THE GAME
var rps = {
  whoseTurn: "",
  oneWins: 0,
  oneLosses: 0,
  twoWins: 0,
  twoLosses: 0,
  ties: 0,
  player2Chosen: false,
  player1Chosen: false,
  firstPlayer: "",
  secondPlayer: "",
  firstChoice: "",
  secondChoice: "",
  //INITIALIZE PLAYERS/////////////////////////////////////////////////////////////////////////////////////////////
  createPlayer: function(name){
    if (!rps.player2Chosen){
      if (rps.player1Chosen){
        database.ref("players/two").set({
          name: name,
          wins: 0,
          losses: 0,
          choice: ""
        });
        rps.player2Chosen = true;
        rps.secondPlayer = name;
        ;
        $("#player2").html(name);
        rps.deployWeapons("2");
        rps.setTurn(1);
      }
      else{
        database.ref("players/one").set({
          name: name,
          wins: 0,
          losses: 0,
          choice: ""
        });
        database.ref("ties").set(rps.ties);
        rps.player1Chosen = true;
        rps.firstPlayer = name;
        $("#player1").html(name);
        rps.deployWeapons("1");
      }
    }
  },
  //SET WHOSE TURN IT IS
  setTurn: function(playerNumber){
    database.ref("turn").set(playerNumber);
    rps.getTurn();
  },
  getTurn: function(){
    database.ref("turn").on("value", function(snapshot){
      rps.whoseTurn = snapshot.val();
    });
  },
  //CHECKS WHOSE TURN IT IS
  deployWeapons: function(playerNumber){
    var playerSpace = $("#player" + playerNumber + "-space");
    playerSpace.empty();
    var weaponsWrapper = $("<div>");
    weaponsWrapper.attr("id", "weaponsDiv" + playerNumber);
    var rock = $("<div>");
    rock.addClass("weapons" + playerNumber);
    rock.attr("id", "rockDiv" + playerNumber)
    rock.html("ROCK")
    var paper = $("<div>");
    paper.addClass("weapons" + playerNumber);
    paper.attr("id", "paperDiv" + playerNumber);
    paper.html("PAPER");
    var scissors = $("<div>");
    scissors.addClass("weapons" + playerNumber);
    scissors.attr("id", "scissorsDiv" + playerNumber);
    scissors.html("SCISSORS");
    var status = $("<div>");
    status.addClass("status" + playerNumber);
    status.attr("id", "statusDiv" + playerNumber);
    status.html("Wins: 0, Losses: 0, Ties: 0");
    weaponsWrapper.append(rock);
    weaponsWrapper.append(paper);
    weaponsWrapper.append(scissors);
    weaponsWrapper.append(status);
    playerSpace.prepend(weaponsWrapper);
  },
  queryChoice: function(choice, playerString){
    database.ref("players/" + playerString + "/choice").set(choice);
  },
  displayChoice: function(choice, playerNumber){
    $("#player" + playerNumber + "-space").html("<h1>" + choice + "</h1>");
  },
  checkAttack: function(){
    database.ref("players").on("value", function(snapshot){
      rps.firstChoice = snapshot.val().one.choice;
      rps.secondChoice = snapshot.val().two.choice;
    });
    console.log("firstChoice: " + rps.firstChoice + " secondChoice: " + rps.secondChoice);
    if((rps.firstChoice === "rock" && rps.secondChoice === "scissors") || 
      (rps.firstChoice === "paper" && rps.secondChoice === "rock") ||
      (rps.firstChoice === "scissors" && rps.secondChoice === "paper")){
      rps.oneWins++;
      rps.twoLosses++;
    }
    else if (rps.firstChoice === rps.secondChoice){
      rps.ties++;
    }
    else{
      rps.twoWins++;
      rps.oneLosses++;
    }
    rps.queryWinsLossesTies();
  },
  displayWinsLossesTies: function(){
    $("#statusDiv1").html("Wins: " + rps.oneWins + " Losses: " + rps.oneLosses + " Ties: " + rps.ties);
    $("#statusDiv2").html("Wins: " + rps.twoWins + " Losses: " + rps.twoLosses + " Ties: " + rps.ties);
  },
  queryWinsLossesTies: function(){
    database.ref("players/one/wins").set(rps.oneWins);
    database.ref("players/two/losses").set(rps.twoLosses);
    database.ref("ties").set(rps.ties);
    database.ref("players/one/losses").set(rps.oneLosses);
    database.ref("players/two/wins").set(rps.twoWins);
  }

};
//MAIN APP CONTENT////////////////////////////////////////////////////////////////////////////////////////////////
$(document).ready(function(){
  $("#begin").on("click", function(){
    var playerName = $("#name").val();
    rps.createPlayer(playerName);
  });
  rps.getTurn();
  var firstChoice;
  var secondChoice;
    rps.whoseTurn = snap.val();
    if (rps.whoseTurn === 1){
      $("#player1-space").on("click", ".weapons1", function(){
        firstChoice = $(this).html().toLowerCase();
        rps.queryChoice(firstChoice, "one");
        rps.displayChoice(firstChoice.toUpperCase(), "1");
        $("#player1-space").off("click", ".weapons1");
        rps.setTurn(2);
      });
    }
    else if (rps.whoseTurn === 2){
      $("#player2-space").on("click", ".weapons2", function(){
        secondChoice = $(this).html().toLowerCase();
        rps.queryChoice(secondChoice, "two");
        $("#player2-space").off("click", ".weapons2");
        rps.deployWeapons("1");
        rps.checkAttack();
        rps.displayWinsLossesTies();
        rps.setTurn(1);
      });
    }
});

