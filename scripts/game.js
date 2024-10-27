import { words as INITIAL_WORDS } from './words.js';

const $time = document.querySelector('time');
const $paragraph = document.querySelector('p');
const $input = document.querySelector('input');

const $game = document.querySelector('#game');
const $results = document.querySelector('#results');
const $wpm = document.querySelector('#results-wpm');
const $accuracy = document.querySelector('#results-accuracy');
const $button = document.querySelector('#reload-button');

const INITIAL_TIME = 30;

const TEXT = 'i must not fear. fear is the mind-killer. fear is the little-death that brings total obliteration. i will face my fear. i will permit it to pass over me and';

let words = [];
let currentTime = INITIAL_TIME;
let playing;

initGame();
initEvents();

function initGame() {
  $game.style.display = 'flex';
  $results.style.display = 'none';
  $input.value = '';

  playing = false

  words = INITIAL_WORDS.toSorted(() => Math.random() - 0.5).slice(0, 36);
  currentTime = INITIAL_TIME;

  $time.textContent = currentTime;

  $paragraph.innerHTML = words.map((word, index) => {
    const letters = word.split('');

    return `<cus-word>
      ${letters
        .map(letter => `<cus-letter>${letter}</cus-letter>`)
        .join('')
      }
    </cus-word>`;
  }).join('');

  const $firstWord = $paragraph.querySelector('cus-word');
  $firstWord.classList.add('active');
  $firstWord.querySelector('cus-letter').classList.add('active');
}

function initEvents() {
  document.addEventListener('keydown', () => {
    $input.focus();
    if (!playing) {
      playing = true;
      const intervalId = setInterval(() => {
        currentTime--;
        $time.textContent = currentTime;
    
        if (currentTime === 0) {
          clearInterval(intervalId);
          gameOver();
        }
    
      }, 1000);
    }
  });

  $input.addEventListener('keydown', onKeyDown);
  $input.addEventListener('keyup', onKeyUp);
  $button.addEventListener('click', initGame);

}

function onKeyDown(event) {
  const $currentWord = $paragraph.querySelector('cus-word.active');
  const $currentLetter = $currentWord.querySelector('cus-letter.active');

  const { key } = event;
  if (key === ' ') {
    event.preventDefault();
    
    const $nextWord = $currentWord.nextElementSibling;
    const $nextLetter = $nextWord.querySelector('cus-letter');

    $currentWord.classList.remove('active', 'marked');
    $currentLetter.classList.remove('active');

    $nextWord.classList.add('active');
    $nextLetter.classList.add('active');

    $input.value = '';

    const hasMissedLetters = $currentWord
      .querySelectorAll('cus-letter:not(.correct)').length > 0;

    const classToAdd = hasMissedLetters ? 'marked' : 'correct';
    $currentWord.classList.add(classToAdd);
    return;
  }

  if (key === 'Backspace') {
    const $previousWord = $currentWord.previousElementSibling;
    const $previousLetter = $currentLetter.previousElementSibling;

    if (!$previousWord && !$previousLetter) {
      event.preventDefault();
      return;
    };

    const $wordMarked = $paragraph.querySelector('cus-word.marked');
    if ($wordMarked && !$previousLetter) {
      event.preventDefault();
      $previousWord.classList.remove('marked');
      $previousWord.classList.add('active');

      const $leterToGo = $previousWord.querySelector('cus-letter:last-child');

      $currentLetter.classList.remove('active');
      $leterToGo.classList.add('active');

      $input.value = [
        ...$previousWord.querySelectorAll('cus-letter.correct, cus-letter.incorrect')
      ].map($e => {
        return $e.classList.contains('correct') ? $e.innerText : '*';
      }).join('');
    }
  }
}

function onKeyUp() {
  const $currentWord = $paragraph.querySelector('cus-word.active');
  const $currentLetter = $currentWord.querySelector('cus-letter.active');

  const currentWord = $currentWord.innerText.trim();
  $input.maxLength = currentWord.length;
  console.log({ value: $input.value, currentWord });

  const $allLetters = $currentWord.querySelectorAll('cus-letter');

  $allLetters.forEach($letter => $letter.classList.remove('correct', 'incorrect'));

  $input.value.split('').forEach((letter, index) => {
    const $letter = $allLetters[index];
    const letterToCheck = currentWord[index];

    const isCorrect = letter === letterToCheck;

    const letterClass = isCorrect ? 'correct' : 'incorrect';
    $letter.classList.add(letterClass);
  });

  $currentLetter.classList.remove('active', 'is-last');
  const inputLenght = $input.value.length;
  const $nextActiveLetter = $allLetters[inputLenght];

  if ($nextActiveLetter) {
    $nextActiveLetter.classList.add('active');
  } else {
    $currentLetter.classList.add('active', 'is-last');
  }
}

function gameOver() {
  $game.style.display = 'none';
  $results.style.display = 'flex';

  const correctWords = $paragraph.querySelectorAll('cus-word.correct').length;
  const correctLetters = $paragraph.querySelectorAll('cus-letter.correct').length;
  const incorrectLetters = $paragraph.querySelectorAll('cus-letter.incorrect').length;
  const totalLetters = correctLetters + incorrectLetters;

  const accuracy = totalLetters > 0
    ? (correctLetters / totalLetters) * 100
    : 0;

  const wpm = correctWords * 60 / INITIAL_TIME;
  $wpm.textContent = wpm;
  $accuracy.textContent = `${accuracy.toFixed(2)}%`;
}