/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk');


const LaunchHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    return request.type === 'LaunchRequest'
    ||(request.type === 'IntentRequest' 
    && request.intent.name === 'AMAZON.YesIntent' && attributes.gameover);
  },
  handle(handlerInput) {
    //Get request obj
    const request = handlerInput.requestEnvelope.request;
    //Get Session attributes
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    var speechOutput = "";
    var repromptText = "";
    speechOutput="Hello! Welcome to the Memory Game! this game needs two players to play. <amazon:effect name=\"whispered\">two players to play, it's a bit tricky right?</amazon:effect> oh, never mind. Do you need tutorial?";  
    //Reset Session attributes
    handlerInput.attributesManager.setSessionAttributes({});
    attributes.state = "tutorial";
    handlerInput.attributesManager.setSessionAttributes(attributes);
    repromptText = RepromptText(attributes);
    
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(repromptText)
      .getResponse();
  },
};

const NameHandler = {
  canHandle(handlerInput) {
    //Get Session attributes
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
        && (request.intent.name === 'NameIntent') 
        && (typeof attributes.playerOne === 'undefined' 
        || typeof attributes.playerTwo ==='undefined');
  },
  handle(handlerInput) {
    //Get request obj
    const request = handlerInput.requestEnvelope.request;
    //Get Session attributes
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    attributes.state = "naming";
    var speechOutput="";
    var repromptText="";
    //Check it is the name of the player one
    if(typeof attributes.playerOne === 'undefined'){
      attributes.playerOne = request.intent.slots.name.value;
      speechOutput = "Thank you, "+attributes.playerOne+"! and player two! what's your name? ";
      repromptText ="Hey? Player two? I'm talking to you!! what is your name?"
    }
    // else if(typeof attributes.playerOne !== 'undefined' && typeof attributes.playerTwo !=='undefined' &&){
    //   speechOutput ="I didn't ask that. please go ahead! ";
    //   speechOutput += attributes.turn+"! please choose your " + attributes.boxTurn + " box!";
    // }
    else{
      attributes.playerTwo = request.intent.slots.name.value;
      speechOutput = "Thank you too, "+attributes.playerTwo+"! Let's play the game!! How many pair of animals do you want to play with? you can choose from 3 to 12. ";
      attributes.state = "leveling";
    }
    
    //Save Session attributes
    handlerInput.attributesManager.setSessionAttributes(attributes);
 
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(repromptText)
      .getResponse();
  },
};

const InitiateGame = function(attributes){
  
  //turn tells who's turn it is
  attributes.turn = attributes.playerOne;
  //boxChoose tells it is about to choose first box or second box.
  attributes.boxTurn = "first";
  //animal array
  const animals = [
    {
      name: "dog",
      resource: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/Animals/dog.mp3' />",
      revealed: false
    },{
      name: "cat",
      resource: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/Animals/cat.mp3' />",
      revealed: false
    },{
      name: "chicken",
      resource: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/Animals/chicken.mp3' />",
      revealed: false
    },{
      name: "cow",
      resource: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/Animals/cow.mp3' />",
      revealed: false
    },{
      name: "turkey",
      resource: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/Animals/turkey.mp3' />",
      revealed: false
    },{
      name: "frog",
      resource: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/Animals/frog.mp3' />",
      revealed: false
    },{
      name: "goat",
      resource: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/Animals/goat.mp3' />",
      revealed: false
    },{
      name: "goose",
      resource: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/Animals/goose.mp3' />",
      revealed: false
    },{
      name: "horse",
      resource: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/Animals/horse.mp3' />",
      revealed: false
    },{
      name: "pig",
      resource: "<audio src=\"s3://alexa-hackathon-memory-game-assets/sounds/Animals/PigGruntSqueal_S08AN.300.wav\" />",
      revealed: false
    },{
      name: "sheep",
      resource: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/Animals/sheep.mp3' />",
      revealed: false
    },{
      name: "elephant",
      resource: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/Animals/elephant.mp3' />",
      revealed: false
    }
  ];
  // attributes.boxRevealed = [false,false,false,false,false,false,false,false,false,false];
  // attributes.boxes = ["spade ace","heart ace","clover ace","diamond ace","spade two","spade ace","heart ace","clover ace","diamond ace","spade two"];
  attributes.boxes = animals.sort((a,b) => 0.5 - Math.random());
  attributes.boxes = attributes.boxes.slice(0,attributes.numOfanimals);
  attributes.boxes = attributes.boxes.concat(attributes.boxes);
  //shuffle boxes
  attributes.boxes = attributes.boxes.sort((a,b) => 0.5 - Math.random());
  attributes.firstBox = 0;
  attributes.secondBox = 0;
  attributes.scoreOne = 0;
  attributes.scoreTwo = 0;
  attributes.gameover = false;
  attributes.winScore = parseInt(attributes.numOfanimals/2)+1;
};

const RepromptText = function(attributes){
  var text = "";
  if(attributes.state === "tutorial"){
    text = "Do you need tutorial?";
  }else if(typeof attributes.playerOne === 'undefined'){
    text = "player one! what's your name? ";
  }else if(typeof attributes.playerTwo ==='undefined'){
    text = "player two! what's your name? "
  }else if(attributes.state === "leveling"){
    text = "How many pair of animals do you want to play with? ";
  }else{
    text = attributes.turn+", please choose the "+attributes.boxTurn+" box!";
  }
  return text;
};

const GameOverPrompt = function(attributes){
  return "Game is over. The winner is " + attributes.turn +". Do you want to play again? Please say yes or no.";
};

const BoxHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
        && request.intent.name === 'BoxIntent';
  },
  handle(handlerInput) {
    //Get Session attributes
    const request = handlerInput.requestEnvelope.request;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    var speechOutput="";
    var repromptText="";
    var userInput = request.intent.slots.boxNumber.value;
    var choosedIndex = userInput-1;
    if(attributes.state === "leveling"){
      if(userInput<=12 && userInput>=3){
        speechOutput = "Alright! let's start with " + userInput 
        +" pairs of animals! Our adorable animals are hidden in " 
        + userInput*2 + " boxes. please choose the box between one and "+userInput*2+". ";
        
        attributes.state = "in game";
        attributes.numOfanimals = userInput;
        InitiateGame(attributes);  
      }else{
        speechOutput = "Choose from 3 to 12. "+RepromptText(attributes);
      }
      
    }else{
      //if the game is not over, keep going
      if(!attributes.gameover){
        if(userInput>=1&&userInput<=attributes.numOfanimals*2){
          //if the choosed box is already selected
          if(attributes.boxTurn==="second" && (attributes.firstBox === choosedIndex)){
            speechOutput = "You already choose that box as the first box! Choose another box. ";
          }
          //if the choosed box is already revealed
          else if(attributes.boxes[choosedIndex].revealed){
            speechOutput = "the choosed box already revealed! Choose another box. ";
          }else{
            //Check the box turn
            if(attributes.boxTurn === "first"){
              attributes.firstBox = choosedIndex;
              speechOutput = attributes.boxes[choosedIndex].resource+" ";
              //it is about to second turn to choose a box
              attributes.boxTurn = "second";
            }else{
              attributes.secondBox = choosedIndex;
              speechOutput = attributes.boxes[choosedIndex].resource+" ";
              //Check selected boxes are the same ==> get score and keep the turn
              if(attributes.boxes[attributes.firstBox].name === attributes.boxes[attributes.secondBox].name){
                speechOutput += "Good work! you revealed same boxes!";
                //reveal the same boxes
                attributes.boxes[attributes.firstBox].revealed = true;
                attributes.boxes[attributes.secondBox].revealed = true;
                //Give one score
                attributes.turn === attributes.playerOne?attributes.scoreOne++:attributes.scoreTwo++;
                //Tell score if not game over
                speechOutput += attributes.gameover?"":" now the score is, "+attributes.scoreOne+" to "+attributes.scoreTwo+"! ";
                //Check turn player win the game
                attributes.gameover = (attributes.scoreOne>=attributes.winScore||attributes.scoreTwo>=attributes.winScore)? true : false;
                //quit the skill if game is over
                speechOutput += attributes.gameover? "Congratulations! " + attributes.turn
                +" is the winner!! Do you want to play again? Please say yes or no. ":"";
                //Game over if one player won the game
                speechOutput += attributes.gameover?"": attributes.turn+"'s turn is keep going!";
              }else{
                speechOutput += "Uh-oh, you revealed different boxes. ";
                //Change the player turn
                attributes.turn = attributes.turn===attributes.playerOne?attributes.playerTwo:attributes.playerOne;
                speechOutput += "now, it's "+attributes.turn+"'s turn! ";
              }//Check selected boxes are the same End 
              //Change the box turn
              attributes.boxTurn ="first";
            }//Check the box turn End
          }//Check box revealed End
        }else{//Check user input
          speechOutput = "Choose from 1 to "+ attributes.numOfanimals*2 +". "+RepromptText(attributes);
        }  
        speechOutput += attributes.gameover? "" : RepromptText(attributes);
        repromptText = attributes.gameover? "" : RepromptText(attributes);
      }else{// Check Game over End
        speechOutput = GameOverPrompt(attributes);
      }
    }
      
      
    //Save Session attributes
    handlerInput.attributesManager.setSessionAttributes(attributes);
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(repromptText)
      .getResponse();
  },
};

const ScoreHandler = {
  canHandle(handlerInput) {
    //Get request obj
    const request = handlerInput.requestEnvelope.request;
    //Get Session attributes
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    return request.type === 'IntentRequest' 
    && request.intent.name === 'ScoreIntent';
  },
  handle(handlerInput) {
    //Get Session attributes
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    var speechOutput = "";
    if(typeof attributes.playerOne !== 'undefined' &&typeof attributes.playerTwo !=='undefined'){
      speechOutput = "the score for "+attributes.playerOne+" is, "+attributes.scoreOne+". and the score for "+attributes.playerTwo+" is, "+attributes.scoreTwo+". Win score is "+attributes.winScore+". good luck! ";
    }else{
      speechOutput = "You don't even start the game yet! ";
    }
    return handlerInput.responseBuilder
      .speak(speechOutput+RepromptText(attributes))
      .reprompt(RepromptText(attributes))
      .getResponse();
  },
};

const RevealedHandler = {
  canHandle(handlerInput) {
    //Get request obj
    const request = handlerInput.requestEnvelope.request;
    //Get Session attributes
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    return request.type === 'IntentRequest' 
    && request.intent.name === 'RevealedIntent';
  },
  handle(handlerInput) {
    //Get Session attributes
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    var speechOutput = "";
    if(typeof attributes.playerOne !== 'undefined' &&typeof attributes.playerTwo !=='undefined'){
      
      var revealed = [];
      for (var i = 0; i < attributes.boxes.length; i++)
      {
        speechOutput += attributes.boxes[i].revealed?revealed.push(i+1):"";
      }
      if(revealed.length > 0){
        speechOutput = "boxes revealed are. ";
        revealed.forEach(function(item){speechOutput+= item + ". ";});
      }else{
        speechOutput = "there is no box revealed. ";
      }
    }else{
      speechOutput = "You don't even start the game yet! ";
    }
    return handlerInput.responseBuilder
      .speak(speechOutput+RepromptText(attributes))
      .reprompt(RepromptText(attributes))
      .getResponse();
  },
};



const YesHandler = {
  canHandle(handlerInput) {
    //Get request obj
    const request = handlerInput.requestEnvelope.request;
    //Get Session attributes
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    return request.type === 'IntentRequest' 
    && request.intent.name === 'AMAZON.YesIntent'
    && attributes.state !== "tutorial"
    && (typeof attributes.gameover ==='undefined'
    ||(typeof attributes.gameover !=='undefined'
    &&!attributes.gameover));
  },
  handle(handlerInput) {
    //Get Session attributes
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    return handlerInput.responseBuilder
      .speak('Yes for what? '+RepromptText(attributes))
      .reprompt(RepromptText(attributes))
      .getResponse();
  },
};

const NoHandler = {
  canHandle(handlerInput) {
    //Get request obj
    const request = handlerInput.requestEnvelope.request;
    //Get Session attributes
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    return request.type === 'IntentRequest'  
    && (request.intent.name === 'AMAZON.NoIntent' 
    && (attributes.state === "tutorial" //Check the state is tutorial
    ||(typeof attributes.gameover ==='undefined' //Check the game is over
    ||(typeof attributes.gameover !=='undefined'
    &&!attributes.gameover))));
  },
  handle(handlerInput) {
    //Get Session attributes
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    var speechOutput = "";
    var repromptText = "";
    
    if(attributes.state === "tutorial"){
      attributes.state = "naming";
      speechOutput = RepromptText(attributes);
      repromptText = RepromptText(attributes);
    }else{
      speechOutput = 'No for what? '+RepromptText(attributes);
      repromptText = RepromptText(attributes);
    }
    
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(repromptText)
      .getResponse();
  },
};

const HelpHandler = {
  canHandle(handlerInput) {
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.HelpIntent' || request.intent.name === "AMAZON.YesIntent" && attributes.state === "tutorial");
  },
  handle(handlerInput) {
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    var speechOutput = "this game needs two players to play. there are pairs of animals in boxes! if the two boxes you choose are the same, then it will be revealed and you will get one score and your turn is keep going. if not, it will be revealed back and the turn will be passed to the next player. Someone who gets higher score will be the winner. to check the score, say score. to check revealed boxes, say revealed. " + RepromptText(attributes); 
    var repromptText = RepromptText(attributes);
    if(attributes.state === "tutorial"){
      speechOutput += " again?";
      repromptText += " again?";
    }
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(repromptText)
      .getResponse();
  },
};

const ExitHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.CancelIntent'
        || request.intent.name === 'AMAZON.StopIntent' 
        || (request.intent.name === 'AMAZON.NoIntent' && attributes.gameover));
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(STOP_MESSAGE)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    var speechOutput = "Oh, right, so you are not gonna follow my instruction..well..you know what? in the avengers end game, the iron man will... do you feel like to follow my instructions now?";
    var repromptText = RepromptText(attributes);
    speechOutput += RepromptText(attributes);
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(repromptText)
      .getResponse();
  },
};

const STOP_MESSAGE = 'See you next time!';


const skillBuilder = Alexa.SkillBuilders.standard();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchHandler,
    NameHandler,
    YesHandler,
    NoHandler,
    RevealedHandler,
    ScoreHandler,
    BoxHandler,
    HelpHandler,
    ExitHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
