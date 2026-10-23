// ---------- 1. DATA (the app's "memory") ----------
const STORAGE_KEY = "flashcards-v2";

// Cards used the first time the app opens
const defaultCards = [
  { id: 1,  question: "What does HTML stand for?", answer: "HyperText Markup Language" },
  { id: 2,  question: "Which language adds interactivity to web pages?", answer: "JavaScript" },
  { id: 3,  question: "What does CSS control?", answer: "The styling and layout of a web page" },
  { id: 4,  question: "Which HTML tag creates a hyperlink?", answer: "The <a> (anchor) tag" },
  { id: 5,  question: "What is the difference between let and const in JavaScript?", answer: "let can be reassigned later, const cannot" },
  { id: 6,  question: "What does the CSS property 'display: flex' do?", answer: "It turns an element into a flexible container that arranges its children in a row or column" },
  { id: 7,  question: "What is an array?", answer: "An ordered list of values, accessed by their index, starting from 0" },
  { id: 8,  question: "What does 'API' stand for?", answer: "Application Programming Interface" },
  { id: 9,  question: "What is the difference between == and === in JavaScript?", answer: "== compares values after type conversion, === compares both value and type" },
  { id: 10, question: "What does the 'git commit' command do?", answer: "It saves a snapshot of your staged changes to the repository history" },
  { id: 11, question: "What is a function?", answer: "A reusable block of code that performs a specific task" },
  { id: 12, question: "What does 'localStorage' do?", answer: "It stores data in the browser so it stays after the page is refreshed or closed" }
];

let cards = loadCards();   // the list of all flashcards
let currentIndex = 0;      // which card we are looking at
let showingAnswer = false; // is the answer visible?
let editingId = null;      // id of the card being edited (null = adding a new one)

// ---------- 2. FIND THE ELEMENTS ----------
const labelEl    = document.getElementById("label");
const textEl     = document.getElementById("text");
const counterEl  = document.getElementById("counter");
const toggleBtn  = document.getElementById("toggle");
const prevBtn    = document.getElementById("prev");
const nextBtn    = document.getElementById("next");
const editBtn    = document.getElementById("edit");
const deleteBtn  = document.getElementById("delete");
const formTitle  = document.getElementById("formTitle");
const questionIn = document.getElementById("question");
const answerIn   = document.getElementById("answer");
const errorEl    = document.getElementById("error");
const saveBtn    = document.getElementById("save");
const cancelBtn  = document.getElementById("cancel");

// ---------- 3. SAVE AND LOAD ----------
function loadCards() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    return JSON.parse(saved);   // turn the saved text back into a list
  }
  return defaultCards;
}

function saveCards() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards)); // list -> text
}

// ---------- 4. SHOW THE CURRENT STATE ON THE PAGE ----------
function render() {
  const hasCards = cards.length > 0;

  if (!hasCards) {
    labelEl.textContent = "";
    textEl.textContent = "No flashcards yet. Add one below!";
    textEl.classList.remove("answer");
    counterEl.textContent = "";
  } else {
    const card = cards[currentIndex];
    if (showingAnswer) {
      labelEl.textContent = "Answer";
      textEl.textContent = card.answer;
      textEl.classList.add("answer");
    } else {
      labelEl.textContent = "Question";
      textEl.textContent = card.question;
      textEl.classList.remove("answer");
    }
    counterEl.textContent = "Card " + (currentIndex + 1) + " of " + cards.length;
  }

  toggleBtn.textContent = showingAnswer ? "Hide Answer" : "Show Answer";

  // Disable buttons that make no sense right now
  toggleBtn.disabled = !hasCards;
  editBtn.disabled   = !hasCards;
  deleteBtn.disabled = !hasCards;
  prevBtn.disabled   = cards.length < 2;
  nextBtn.disabled   = cards.length < 2;
}

// ---------- 5. ACTIONS ----------
function toggleAnswer() {
  showingAnswer = !showingAnswer;   // flips true <-> false
  render();
}

function goToCard(step) {
  // step is +1 (next) or -1 (previous). The % makes it loop around.
  currentIndex = (currentIndex + step + cards.length) % cards.length;
  showingAnswer = false;
  render();
}

function resetForm() {
  editingId = null;
  questionIn.value = "";
  answerIn.value = "";
  errorEl.textContent = "";
  formTitle.textContent = "Add a new flashcard";
  saveBtn.textContent = "Add Card";
  cancelBtn.hidden = true;
}

function saveCard() {
  const question = questionIn.value.trim();
  const answer = answerIn.value.trim();

  if (question === "" || answer === "") {
    errorEl.textContent = "Please fill in both the question and the answer.";
    return;
  }

  if (editingId !== null) {
    // EDIT: find the card and change it
    const card = cards.find(c => c.id === editingId);
    card.question = question;
    card.answer = answer;
  } else {
    // ADD: create a new card and jump to it
    cards.push({ id: Date.now(), question: question, answer: answer });
    currentIndex = cards.length - 1;
  }

  showingAnswer = false;
  saveCards();
  resetForm();
  render();
}

function startEdit() {
  const card = cards[currentIndex];
  editingId = card.id;
  questionIn.value = card.question;
  answerIn.value = card.answer;
  formTitle.textContent = "Edit flashcard";
  saveBtn.textContent = "Save Changes";
  cancelBtn.hidden = false;
  questionIn.focus();
}

function deleteCard() {
  if (!confirm("Delete this flashcard?")) return;

  cards.splice(currentIndex, 1);   // remove 1 card at this position
  if (currentIndex >= cards.length) {
    currentIndex = Math.max(0, cards.length - 1);
  }
  showingAnswer = false;
  saveCards();
  resetForm();
  render();
}

// ---------- 6. CONNECT BUTTONS TO ACTIONS ----------
toggleBtn.addEventListener("click", toggleAnswer);
nextBtn.addEventListener("click", () => goToCard(1));
prevBtn.addEventListener("click", () => goToCard(-1));
saveBtn.addEventListener("click", saveCard);
editBtn.addEventListener("click", startEdit);
cancelBtn.addEventListener("click", resetForm);
deleteBtn.addEventListener("click", deleteCard);

// ---------- 7. START ----------
render();