const ATTACK_VALUE = 10;
const STRONG_ATTACK_VALUE = 17;
const MONSTER_ATTACK_VALUE = 14;
const HEAL_VALUE = 15;

const MODE_ATTACK = "ATTACK";
const MODE_STRONG_ATTACK = "STRONG_ATTACK"; //vytvorenim globalnich prom. predchazim tomu, ze bych ve funkci attackMonster udelala typo :')

//event logs
const LOG_EVENT_PLAYER_ATTACK = "PLAYER_ATTACK";
const LOG_EVENT_PLAYER_STRONG_ATTACK = "STRONG_PLAYER_ATTACK";
const LOG_EVENT_MONSTER_ATTACK = "MONSTER_ATTACK";
const LOG_EVENT_HEAL = "HEAL";
const LOG_EVENT_BONUS_LIFE = "BONUS_LIFE";
const LOG_EVENT_GAME_OVER = "GAME_OVER";

function getMaxLife(){
  const enteredValue = prompt("Maximum life for you and the monster?", "100");
  const parsedValue = parseInt(enteredValue);
  if (isNaN(parsedValue) || parsedValue <= 0) {
    throw {message: "Invalid user input!"};
  }
  return parsedValue;
}

let chosenMaxLife;
let iteration = 0;

try {
  chosenMaxLife = getMaxLife();
} catch(error) {
  console.log(error);
  chosenMaxLife = 100;
  alert("You entered something wrong, default value of 100 was used.");
} 

let currentMonsterHealth = chosenMaxLife;
let currentPlayerHealth = chosenMaxLife;
let hasBonusLife = true;
let battleLog = [];
let lastLoggedEntry;

adjustHealthBars(chosenMaxLife);

attackBtn.addEventListener("click", attackHandler);
strongAttackBtn.addEventListener("click", strongAttackHandler);
healBtn.addEventListener("click", healPlayerHandler);
logBtn.addEventListener("click", printLogHandler);
backdrop.addEventListener("click", backdropHandler);
closeLogBtn.addEventListener("click", closeLogBtnHandler);
restartBtn.addEventListener("click", restartBtnHandler);

//handlers

function attackHandler() {
  attackMonster(MODE_ATTACK);
}

function strongAttackHandler() {
  attackMonster(MODE_STRONG_ATTACK);
}

function healPlayerHandler() {
  let healValue;
  if (currentPlayerHealth >= chosenMaxLife - HEAL_VALUE) {
    alert("You can't heal to more than your max initial health.");
    healValue = chosenMaxLife - currentPlayerHealth;
  } else {
    healValue = HEAL_VALUE;
  }
  increasePlayerHealth(healValue);
  currentPlayerHealth += healValue;
  checkHealthColor(playerHealthBar);
  writeToLog(
    LOG_EVENT_HEAL,
    healValue,
    currentMonsterHealth,
    currentPlayerHealth
  );
  endRound();
}

function printLogHandler() {
  toggleBackdrop();
  toggleLogModal();
  
  for (const battle of battleLog){
      const logTurnContent = document.createElement("div");
      logTurnContent.innerHTML = `
        <h4>Turn #${iteration + 1}</h4>
        ${logContent(battleLog[iteration])}
        `;
      modalLogContent.appendChild(logTurnContent);
      modalLogContent.scrollTop =  modalLogContent.scrollHeight;
      iteration++;
  }
}

function backdropHandler(){
  toggleBackdrop();
  toggleLogModal();
}

function closeLogBtnHandler(){
  toggleBackdrop();
  toggleLogModal();
}

function restartBtnHandler(){
  resetGame(chosenMaxLife);
  checkHealthColor(playerHealthBar);
  checkHealthColor(monsterHealthBar)``
}

//functions

function endRound() {
  const initialPlayerHealth = currentPlayerHealth;
  const damagePlayer = dealPlayerDamage(MONSTER_ATTACK_VALUE);
  currentPlayerHealth -= damagePlayer;
  checkHealthColor(playerHealthBar);
  writeToLog(
    LOG_EVENT_MONSTER_ATTACK,
    damagePlayer,
    currentMonsterHealth,
    currentPlayerHealth
  );

  if (currentPlayerHealth <= 0 && hasBonusLife) {
    hasBonusLife = false;
    removeBonusLife();
    currentPlayerHealth = initialPlayerHealth;
    setPlayerHealth(initialPlayerHealth);
    alert("Bonus life used!");
    writeToLog(
      LOG_EVENT_BONUS_LIFE,
      damagePlayer,
      currentMonsterHealth,
      currentPlayerHealth
    );
  }

  if (currentMonsterHealth <= 0 && currentPlayerHealth > 0) {
    alert("You won!");
    writeToLog(
      LOG_EVENT_GAME_OVER,
      "PLAYER WON",
      currentMonsterHealth,
      currentPlayerHealth
    );
    printLogHandler();
  } else if (currentPlayerHealth <= 0 && currentMonsterHealth > 0) {
    alert("You lost!");
    writeToLog(
      LOG_EVENT_GAME_OVER,
      "MONSTER WON",
      currentMonsterHealth,
      currentPlayerHealth
    );
    printLogHandler();
  } else if (currentPlayerHealth <= 0 && currentMonsterHealth <= 0) {
    writeToLog(
      LOG_EVENT_GAME_OVER,
      "DRAW",
      currentMonsterHealth,
      currentPlayerHealth
    );
    printLogHandler();
  }

  if (currentMonsterHealth <= 0 || currentPlayerHealth <= 0) {
    reset();
  }
}

function attackMonster(mode) {
    const maxDamage = mode === MODE_ATTACK ? ATTACK_VALUE : STRONG_ATTACK_VALUE;
    const logEvent =
        mode === MODE_ATTACK
        ? LOG_EVENT_PLAYER_ATTACK
        : LOG_EVENT_PLAYER_STRONG_ATTACK;
  
    const damage = dealMonsterDamage(maxDamage);
    currentMonsterHealth -= damage;
    writeToLog(logEvent, damage, currentMonsterHealth, currentPlayerHealth);
    checkHealthColor(monsterHealthBar);
    endRound();
}

function reset() {
  currentMonsterHealth = chosenMaxLife;
  currentPlayerHealth = chosenMaxLife;
  resetGame(chosenMaxLife);
  checkHealthColor(monsterHealthBar);
  checkHealthColor(playerHealthBar);
  hasBonusLife = true;
  addBonusLife();
}

function writeToLog(event, value, monsterHealth, playerHealth) {
  const logEntry = {
    event: event,
    value: value,
    finalMonsterHealth: monsterHealth,
    finalPlayerHealth: playerHealth,
  };

  switch (event) {
    case LOG_EVENT_PLAYER_ATTACK:
      logEntry.target = "MONSTER";
      logEntry.initiator = "PLAYER";
      break;
    case LOG_EVENT_PLAYER_STRONG_ATTACK:
      logEntry.target = "MONSTER";
      logEntry.initiator = "PLAYER";
      break;
    case LOG_EVENT_MONSTER_ATTACK:
      logEntry.target = "PLAYER";
      logEntry.initiator = "MONSTER";
      break;
    case LOG_EVENT_HEAL:
      logEntry.target = "PLAYER";
      logEntry.initiator = "PLAYER";
      break;
    case LOG_EVENT_BONUS_LIFE:
      logEntry.target = "PLAYER";
      logEntry.initiator = "PLAYER";
      break;
    case LOG_EVENT_GAME_OVER:
      break;
  }

  battleLog.push(logEntry);
}

function logContent(contentInputEntry){
  let mode = "";
  
  switch(contentInputEntry.event){
    case LOG_EVENT_PLAYER_ATTACK:
    case LOG_EVENT_MONSTER_ATTACK:
      mode = "basic attack";
      break;
    case LOG_EVENT_PLAYER_STRONG_ATTACK:
      mode = "ultimate";
      break;
    default:
      mode="";
  }
  
  let fullLogText = "";

  switch(contentInputEntry.event){
    case LOG_EVENT_PLAYER_ATTACK:
    case LOG_EVENT_PLAYER_STRONG_ATTACK:
    case LOG_EVENT_MONSTER_ATTACK:
      fullLogText = `${contentInputEntry.initiator} attacked ${contentInputEntry.target} with ${mode}! <br>
      Damage dealt: ${contentInputEntry.value.toFixed(2)}! <br>
      Player health: ${contentInputEntry.finalPlayerHealth.toFixed(2)} <br>
      Monster healh: ${contentInputEntry.finalMonsterHealth.toFixed(2)}`;
      break;
    case LOG_EVENT_HEAL:
      fullLogText = `${contentInputEntry.initiator} healed ${contentInputEntry.target} with heal! <br>
      Player health: ${contentInputEntry.finalPlayerHealth.toFixed(2)} <br>
      Monster healh: ${contentInputEntry.finalMonsterHealth.toFixed(2)}`;
      break;
    case LOG_EVENT_BONUS_LIFE:
      fullLogText = `${contentInputEntry.initiator} revived ${contentInputEntry.target}! <br>
      Player health: ${contentInputEntry.finalPlayerHealth.toFixed(2)} <br>
      Monster healh: ${contentInputEntry.finalMonsterHealth.toFixed(2)}`;
      break;
    case LOG_EVENT_GAME_OVER:
      switch(contentInputEntry.value){
        case "PLAYER WON":
          fullLogText = "You excelled in an outstanding fight! Bravo!";
          break;
        case "MONSTER WON":
          fullLogText = "Oh no... you snatched defeat from the jaws of victory. Better luck next time!";
          break;
        case "DRAW":
          fullLogText = "Deadlock!";
        break;
      }
      break;
  }

  console.log(fullLogText);
  return fullLogText;
}

function checkHealthColor(healthBar){
  if(healthBar.value < (chosenMaxLife * 0.25)){
    healthBar.style.setProperty('--color1', '#ff1100ff');
    healthBar.style.setProperty('--color2', '#ed6850ff');
    console.log(healthBar.value , "Color changed")
  } else if (healthBar.value < (chosenMaxLife * 0.5)){
    healthBar.style.setProperty('--color1', '#ffa200ff');
    healthBar.style.setProperty('--color2', '#edc650ff');
  } else {
    healthBar.style.setProperty('--color1', '#2af527');
    healthBar.style.setProperty('--color2', '#8fffda');
  }
}

function toggleBackdrop(){
    backdrop.classList.toggle("visible");
}

function toggleLogModal(){
    const logModal = document.getElementById("log-modal");
    logModal.classList.toggle("visible");
}

