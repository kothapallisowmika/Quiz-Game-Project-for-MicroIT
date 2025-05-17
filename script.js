const candies = ['🍬', '🍭', '🍫', '🍪', '🍩'];

const allQuestions = {
  "General Knowledge": [
    [
      { question: "What is the capital of Canada?", options: ["Toronto", "Ottawa", "Vancouver"], answer: "Ottawa" },
      { question: "Which year did India gain independence?", options: ["1945", "1947", "1950"], answer: "1947" },
      { question: "Who wrote 'Hamlet'?", options: ["Shakespeare", "Dickens", "Austen"], answer: "Shakespeare" }
    ],
    [
      { question: "Which continent is the Sahara Desert in?", options: ["Asia", "Africa", "Australia"], answer: "Africa" },
      { question: "What is the national bird of USA?", options: ["Eagle", "Falcon", "Owl"], answer: "Eagle" },
      { question: "Which ocean is the largest?", options: ["Atlantic", "Arctic", "Pacific"], answer: "Pacific" }
    ],
    [
      { question: "Who painted the Mona Lisa?", options: ["Michelangelo", "Da Vinci", "Picasso"], answer: "Da Vinci" },
      { question: "Where is Mount Everest?", options: ["India", "China", "Nepal"], answer: "Nepal" },
      { question: "What is the currency of Japan?", options: ["Yuan", "Yen", "Won"], answer: "Yen" }
    ]
  ],
  "Science": [
    [
      { question: "What planet is known for rings?", options: ["Earth", "Mars", "Saturn"], answer: "Saturn" },
      { question: "H2SO4 is:", options: ["Hydrochloric Acid", "Sulfuric Acid", "Acetic Acid"], answer: "Sulfuric Acid" },
      { question: "What does DNA stand for?", options: ["Deoxy Acid", "Nucleic Acid", "Deoxyribonucleic Acid"], answer: "Deoxyribonucleic Acid" }
    ],
    [
      { question: "Newton's 2nd law is?", options: ["F=ma", "E=mc^2", "V=IR"], answer: "F=ma" },
      { question: "Which gas glows in signs?", options: ["Neon", "Helium", "Argon"], answer: "Neon" },
      { question: "What is a proton's charge?", options: ["Neutral", "Negative", "Positive"], answer: "Positive" }
    ],
    [
      { question: "Who proposed evolution?", options: ["Newton", "Darwin", "Tesla"], answer: "Darwin" },
      { question: "Light travels at?", options: ["3x10^8 m/s", "1.5x10^5 m/s", "1x10^6 m/s"], answer: "3x10^8 m/s" },
      { question: "Which vitamin is made in sunlight?", options: ["A", "C", "D"], answer: "D" }
    ]
  ],
  "Math": [
    [
      { question: "√144 = ?", options: ["10", "12", "14"], answer: "12" },
      { question: "LCM of 4 and 6?", options: ["8", "12", "24"], answer: "12" },
      { question: "5² + 12² = ?", options: ["144", "169", "121"], answer: "169" }
    ],
    [
      { question: "What is 7 × 8?", options: ["56", "64", "48"], answer: "56" },
      { question: "π ≈ ?", options: ["3.12", "3.14", "3.16"], answer: "3.14" },
      { question: "Area of circle formula?", options: ["2πr", "πr²", "πd²"], answer: "πr²" }
    ],
    [
      { question: "What is 9³?", options: ["729", "81", "243"], answer: "729" },
      { question: "log(1) = ?", options: ["1", "0", "undefined"], answer: "0" },
      { question: "Derivative of x²?", options: ["2x", "x", "x²"], answer: "2x" }
    ]
  ]
};

let selectedCategory = "";
let selectedLevel = 1;
let currentQuestions = [];
let currentQuestionIndex = 0;
let currentQuestion = null;
let score = 0;
let userMadeMove = false;
let grid = [];

const candyGrid = document.getElementById("candy-grid");
const scoreElement = document.getElementById("score");
const questionText = document.getElementById("question-text");
const optionsContainer = document.getElementById("options-container");
const feedbackDiv = document.getElementById("feedback");
const levelMap = document.getElementById("level-selection");
const categoryMap = document.getElementById("category-selection");
const gameContainer = document.getElementById("game-screen");
const refreshBtn = document.getElementById("refresh-btn");
const backBtn = document.getElementById("back-to-levels");
const questionBox = document.getElementById("question-box");
const celebration = document.getElementById("celebration");

// Initial UI setup
document.querySelectorAll(".category-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    selectedCategory = btn.dataset.category;
    categoryMap.classList.add("hidden");
    levelMap.classList.remove("hidden");
  });
});

document.querySelectorAll(".level-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    selectedLevel = Number(btn.dataset.level);
    startGame();
  });
});

refreshBtn.addEventListener("click", () => {
  refillGrid();
});

backBtn.addEventListener("click", () => {
  resetGame();
});

// Create and fill the candy grid
function createGrid() {
  candyGrid.innerHTML = "";
  grid = [];

  for(let i=0; i<25; i++) {
    const candy = document.createElement("div");
    candy.classList.add("candy");
    candy.setAttribute("draggable", true);
    candy.id = i;
    candy.textContent = candies[Math.floor(Math.random() * candies.length)];
    candyGrid.appendChild(candy);
    grid.push(candy);
  }

  addDragAndDropListeners();
}

// Refill candies (after matches)
function refillGrid() {
  for(let i=0; i<25; i++) {
    if(grid[i].textContent === "") {
      grid[i].textContent = candies[Math.floor(Math.random() * candies.length)];
    }
  }
  // After refill, check for any automatic matches and clear them
  let found = checkAndClearMatches();
  if(found) {
    setTimeout(refillGrid, 300);
  }
}

function addDragAndDropListeners() {
  let draggedCandy = null;
  let draggedIndex = null;

  grid.forEach(candy => {
    candy.addEventListener("dragstart", (e) => {
      draggedCandy = candy;
      draggedIndex = Number(candy.id);
    });

    candy.addEventListener("dragover", (e) => {
      e.preventDefault();
    });

    candy.addEventListener("drop", (e) => {
      e.preventDefault();
      const targetCandy = candy;
      const targetIndex = Number(targetCandy.id);

      // Check if adjacent horizontally or vertically
      if(isAdjacent(draggedIndex, targetIndex)) {
        swapCandies(draggedIndex, targetIndex);
        userMadeMove = true;
        // After swap, check matches triggered by user move
        if(checkAndClearMatches()) {
          // Show question only if a user move caused the match
          if(userMadeMove) {
            showQuestion();
            userMadeMove = false;
          }
          setTimeout(refillGrid, 300);
        } else {
          // No match, revert swap
          swapCandies(draggedIndex, targetIndex);
        }
      }
    });
  });
}

function isAdjacent(index1, index2) {
  // Adjacent if difference is 1 (same row) or 5 (same column)
  return (
    index2 === index1 + 1 && Math.floor(index1 / 5) === Math.floor(index2 / 5) ||
    index2 === index1 - 1 && Math.floor(index1 / 5) === Math.floor(index2 / 5) ||
    index2 === index1 + 5 ||
    index2 === index1 - 5
  );
}

function swapCandies(i1, i2) {
  const temp = grid[i1].textContent;
  grid[i1].textContent = grid[i2].textContent;
  grid[i2].textContent = temp;
}

function checkAndClearMatches() {
  let matchesFound = false;

  // Check horizontal matches
  for(let i=0; i<25; i++) {
    if(i % 5 < 3) { // only check start of triplets horizontally
      let c1 = grid[i].textContent;
      let c2 = grid[i+1].textContent;
      let c3 = grid[i+2].textContent;
      if(c1 !== "" && c1 === c2 && c2 === c3) {
        matchesFound = true;
        grid[i].textContent = "";
        grid[i+1].textContent = "";
        grid[i+2].textContent = "";
      }
    }
  }

  // Check vertical matches
  for(let i=0; i<15; i++) {
    let c1 = grid[i].textContent;
    let c2 = grid[i+5].textContent;
    let c3 = grid[i+10].textContent;
    if(c1 !== "" && c1 === c2 && c2 === c3) {
      matchesFound = true;
      grid[i].textContent = "";
      grid[i+5].textContent = "";
      grid[i+10].textContent = "";
    }
  }

  return matchesFound;
}

function startGame() {
  score = 0;
  scoreElement.textContent = score;
  currentQuestionIndex = 0;
  currentQuestions = allQuestions[selectedCategory][selectedLevel-1];
  currentQuestion = null;

  levelMap.classList.add("hidden");
  gameContainer.classList.remove("hidden");
  celebration.classList.add("hidden");
  questionBox.classList.add("hidden");
  feedbackDiv.textContent = "";

  createGrid();
  refillGrid();
}

function resetGame() {
  gameContainer.classList.add("hidden");
  levelMap.classList.remove("hidden");
  questionBox.classList.add("hidden");
  feedbackDiv.textContent = "";
}

function showQuestion() {
  if(currentQuestionIndex >= currentQuestions.length) {
    // Level completed
    questionBox.classList.add("hidden");
    celebration.classList.remove("hidden");
    return;
  }

  currentQuestion = currentQuestions[currentQuestionIndex];
  questionText.textContent = currentQuestion.question;
  optionsContainer.innerHTML = "";
  feedbackDiv.textContent = "";

  currentQuestion.options.forEach(option => {
    const btn = document.createElement("button");
    btn.textContent = option;
    btn.addEventListener("click", () => checkAnswer(option));
    optionsContainer.appendChild(btn);
  });

  questionBox.classList.remove("hidden");
}

function checkAnswer(answer) {
  // Disable all option buttons once an answer is chosen
  Array.from(optionsContainer.children).forEach(btn => btn.disabled = true);

  if(answer === currentQuestion.answer) {
    score += 10;
    scoreElement.textContent = score;
    feedbackDiv.textContent = "Right! 🎉";
    feedbackDiv.style.color = "green";
  } else {
    feedbackDiv.textContent = `Wrong! ❌ The correct answer is: ${currentQuestion.answer}`;
    feedbackDiv.style.color = "red";
  }

  setTimeout(() => {
    currentQuestionIndex++;
    questionBox.classList.add("hidden");
    feedbackDiv.textContent = "";
    refillGrid();

    if(currentQuestionIndex >= currentQuestions.length) {
      celebration.classList.remove("hidden");
    } else {
      // After short delay, user can continue swapping candies
    }
  }, 1500);
}
