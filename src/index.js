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
    var speechOutput = "";
    var repromptText = "";
    speechOutput="Hello! Welcome to the Memory Game! this game needs two players to play. <amazon:effect name=\"whispered\">two players to play, it's a bit tricky right?</amazon:effect> oh, never mind. player one! what's your name?";  
    repromptText = "Player one! is anybody there? what is your name?";
    
    //Save Session attributes
    handlerInput.attributesManager.setSessionAttributes({});
    
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(repromptText)
      .getResponse();
  },
};

const NameHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
        && request.intent.name === 'NameIntent';
  },
  handle(handlerInput) {
    //Get request obj
    const request = handlerInput.requestEnvelope.request;
    //Get Session attributes
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    var speechOutput="";
    var repromptText="";
    //Check it is the name of the player one
    if(typeof attributes.playerOne === 'undefined'){
      attributes.playerOne = request.intent.slots.name.value;
      speechOutput = "Thank you, "+attributes.playerOne+"! and player two! what's your name? ";
      repromptText ="Hey? Player two? I'm talking to you!! what is your name?"
    }else if(typeof attributes.playerOne !== 'undefined' && typeof attributes.playerTwo !=='undefined'){
      speechOutput ="I didn't ask that. please go ahead! ";
      speechOutput += attributes.turn+"! please choose your " + attributes.cardTurn + " card!";
    }else{
      attributes.playerTwo = request.intent.slots.name.value;
      speechOutput = "Thank you too, "+attributes.playerTwo+"! Let's play the game!! there are 5 pairs of poker card you can flip! if the two cards you choose are the same, then it will be fliped and you will get one score and your turn is keep going. if not, it will be fliped back and the turn will be passed to the next player. Someone who get 3 score first will be the winner. to check the score, you would say score. to check which cards are revealed, you would say revealed or fliped. ";
      speechOutput +=attributes.playerOne+"! please choose your first card! you can choose a card from one to ten!";
      InitiateGame(attributes);
      repromptText = "Hey!"+attributes.playerOne+"! choose your first card! from one to ten!";
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
  //cardChoose tells it is about to choose first card or second card.
  attributes.cardTurn = "first";
  attributes.cardFliped = [false,false,false,false,false,false,false,false,false,false];
  attributes.cards = ["spade ace","heart ace","clover ace","diamond ace","spade two","spade ace","heart ace","clover ace","diamond ace","spade two"];
  //shuffle cards
  attributes.cards = attributes.cards.sort((a,b) => 0.5 - Math.random());
  attributes.fisrtCard = 0;
  attributes.secondCard = 0;
  attributes.scoreOne = 0;
  attributes.scoreTwo = 0;
  attributes.gameover = false;
};

const RepromptTurn = function(attributes){
  var text = "";
  if(typeof attributes.playerOne === 'undefined'){
    text = "player one! what's your name?";
  }else{
    text = typeof attributes.playerTwo ==='undefined'? "player two! what's your name?":attributes.turn+", please choose the "+attributes.cardTurn+" card!";
  }
  return text;
};

const GameOverPrompt = function(attributes){
  return "Game is over. The winner is " + attributes.turn +". Do you want to play again? Please say yes or no.";
};

const CardHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
        && request.intent.name === 'CardIntent';
  },
  handle(handlerInput) {
    //Get Session attributes
    const request = handlerInput.requestEnvelope.request;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    var speechOutput="";
    var repromptText="";
    var userInput = request.intent.slots.cardNumber.value;
    var choosedIndex = userInput-1;
    //if the game is not over, keep going
    if(!attributes.gameover){
      //if the choosed card is already selected
      if(attributes.cardTurn==="second" && (attributes.fisrtCard === choosedIndex)){
        speechOutput = "You already choose that card as the first card! Choose another card. ";
      }
      //if the choosed card is already fliped
      else if(attributes.cardFliped[choosedIndex]){
        speechOutput = "the choosed card already fliped! Choose another card. ";
      }else{
        //Check the card turn
        if(attributes.cardTurn === "first"){
          attributes.fisrtCard = choosedIndex;
          speechOutput = "The card number "+userInput+" is " + attributes.cards[attributes.fisrtCard] +". ";
          //it is about to second turn to choose a card
          attributes.cardTurn = "second";
        }else{
          attributes.secondCard = choosedIndex;
          speechOutput = "The card number "+userInput+" is " + attributes.cards[attributes.secondCard] +". ";
          //Check selected cards are the same ==> get score and keep the turn
          if(attributes.cards[attributes.fisrtCard] === attributes.cards[attributes.secondCard]){
            speechOutput += "Good work! you fliped same cards!";
            //flip the same cards
            attributes.cardFliped[attributes.fisrtCard] = true;
            attributes.cardFliped[attributes.secondCard] = true;
            //Give one score
            attributes.turn === attributes.playerOne?attributes.scoreOne++:attributes.scoreTwo++;
            //Tell score if not game over
            speechOutput += attributes.gameover?"":" now the score is "+attributes.scoreOne+" to "+attributes.scoreTwo+"! ";
            //Check turn player win the game
            attributes.gameover = (attributes.scoreOne>=3||attributes.scoreTwo>=3)? true : false;
            //quit the skill if game is over
            speechOutput += attributes.gameover? "Congratulations! " + attributes.turn
            +" is the winner!! Do you want to play again? Please say yes or no. ":"";
            //Game over if one player won the game
            speechOutput += attributes.gameover?"": attributes.turn+"'s turn is keep going!";
          }else{
            speechOutput += "Uh-oh, you fliped different cards. ";
            //Change the player turn
            attributes.turn = attributes.turn===attributes.playerOne?attributes.playerTwo:attributes.playerOne;
            speechOutput += "now, it's "+attributes.turn+"'s turn!";
          }//Check selected cards are the same End 
          //Change the card turn
          attributes.cardTurn ="first";
        }//Check the card turn End
      }//Check card fliped End
      
      speechOutput +=attributes.gameover? "" : RepromptTurn(attributes);
      repromptText = attributes.gameover? "" : RepromptTurn(attributes);
    }else{// Check Game over End
      speechOutput = GameOverPrompt(attributes);
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
      speechOutput = "the score is "+attributes.scoreOne+" to "+attributes.scoreTwo+". ";
    }else{
      speechOutput = "You don't even start the game yet! ";
    }
    return handlerInput.responseBuilder
      .speak(speechOutput+RepromptTurn(attributes))
      .reprompt(RepromptTurn(attributes))
      .getResponse();
  },
};

const FlipedHandler = {
  canHandle(handlerInput) {
    //Get request obj
    const request = handlerInput.requestEnvelope.request;
    //Get Session attributes
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    return request.type === 'IntentRequest' 
    && request.intent.name === 'FlipedIntent';
  },
  handle(handlerInput) {
    //Get Session attributes
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    var speechOutput = "";
    if(typeof attributes.playerOne !== 'undefined' &&typeof attributes.playerTwo !=='undefined'){
      
      var fliped = [];
      for (var i = 0; i < attributes.cardFliped.length; i++)
      {
        speechOutput += attributes.cardFliped[i]?fliped.push(i+1):"";
      }
      if(fliped.length > 0){
        speechOutput = "cards fliped are. ";
        fliped.forEach(function(item){speechOutput+= item + ". ";});
      }else{
        speechOutput = "there is no card fliped. ";
      }
    }else{
      speechOutput = "You don't even start the game yet! ";
    }
    return handlerInput.responseBuilder
      .speak(speechOutput+RepromptTurn(attributes))
      .reprompt(RepromptTurn(attributes))
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
    && (typeof attributes.gameover ==='undefined'
    ||(typeof attributes.gameover !=='undefined'
    &&!attributes.gameover));
  },
  handle(handlerInput) {
    //Get Session attributes
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    return handlerInput.responseBuilder
      .speak('Yes for what? '+RepromptTurn(attributes))
      .reprompt(RepromptTurn(attributes))
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
    && request.intent.name === 'AMAZON.NoIntent' 
    && (typeof attributes.gameover ==='undefined'
    ||(typeof attributes.gameover !=='undefined'
    &&!attributes.gameover));
  },
  handle(handlerInput) {
    //Get Session attributes
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    return handlerInput.responseBuilder
      .speak('No for what? '+RepromptTurn(attributes))
      .reprompt(RepromptTurn(attributes))
      .getResponse();
  },
};

const HelpHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const helpMessage = "this game needs two players to play. there are 5 pairs of poker card you can flip! if the two cards you choose are the same, then it will be fliped and you will get one score and your turn is keep going. if not, it will be fliped back and the turn will be passed to the next player. Someone who get 3 score first will be the winner. to check the score, you would say score. to check which cards are revealed, you would say revealed or fliped. " + RepromptTurn(attributes); 
    
    return handlerInput.responseBuilder
      .speak(helpMessage)
      .reprompt(RepromptTurn(attributes))
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
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, an error occurred.')
      .reprompt('Sorry, an error occurred.')
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
    FlipedHandler,
    ScoreHandler,
    CardHandler,
    HelpHandler,
    ExitHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
