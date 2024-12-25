import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { CiRedo, CiSettings, CiCircleQuestion } from "react-icons/ci";
import { FaBackspace } from "react-icons/fa";

const WORD_LIST_DATA = "./assets/allowed_guesses.txt";

const COLORS = {
  GREEN: "green",
  YELLOW: "yellow",
  GREY: "grey",
};

function Header({ isDisabled }) {
  return (
    <header className="border-b-2 p-3 border-grey flex items-center bg-black">
      <h1 className="text-2xl font-bold text-white" aria-label="Wordle Clone">
        Wordle Clone
      </h1>
      <nav className="ml-auto flex space-x-6 text-white text-3xl">
        <button
          aria-label="Restart Game"
          disabled={isDisabled}
          className={isDisabled ? "opacity-50 cursor-not-allowed" : ""}
          onClick={() => window.location.reload(false)}
        >
          <CiRedo />
        </button>
        <button aria-label="Settings">
          <CiSettings />
        </button>
        <button aria-label="Help">
          <CiCircleQuestion />
        </button>
      </nav>
    </header>
  );
}

function Grid({ text, guesses, feedback, activeRowIndex }) {
  return (
    <div className="flex justify-center items-center">
      <div className="flex flex-col align-middle text-center p-1">
        {[...Array(6)].map((_, rowIndex) => (
          <Row
            key={rowIndex}
            text={rowIndex === activeRowIndex ? text : guesses[rowIndex] || ""}
            feedback={feedback[rowIndex] || []}
            isActive={rowIndex === activeRowIndex}
          />
        ))}
      </div>
    </div>
  );
}

function Row({ text, feedback, isActive }) {
  const borderClass =
    "w-14 aspect-square border-2 text-center flex items-center justify-center";

  return (
    <div className="flex justify-center border-grey align-middle text-center p-1 space-x-1">
      {[...Array(5)].map((_, index) => (
        <div
          key={index}
          className={`${borderClass} 
            ${
              isActive && text.length === index ? "border-gray" : "border-grey"
            } 
            ${feedback[index] === COLORS.GREEN ? "bg-green" : ""}
            ${feedback[index] === COLORS.YELLOW ? "bg-yellow" : ""}
            ${feedback[index] === COLORS.GREY ? "bg-grey" : ""}`}
        >
          <h1 className="text-white text-3xl font-bold">{text[index] || ""}</h1>
        </div>
      ))}
    </div>
  );
}

function Keyboard({ handleKeyDown, keyboardFeedback }) {
  const rows = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Enter", "Z", "X", "C", "V", "B", "N", "M", "Backspace"],
  ];

  return (
    <div className="flex flex-col items-center justify-center mt-2 text-white">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex mb-2">
          {row.map((key) => (
            <button
              key={key}
              className={`px-2 py-2 mx-1 text-lg rounded-md cursor-pointer
                ${keyboardFeedback[key] === COLORS.GREEN ? "bg-green" : ""}
                ${keyboardFeedback[key] === COLORS.YELLOW ? "bg-yellow" : ""}
                ${keyboardFeedback[key] === COLORS.GREY ? "bg-grey" : ""}
                ${
                  key === "Enter" || key === "Backspace" ? "bg-gray" : "bg-gray"
                }`}
              onClick={() => handleKeyDown(key)}
              aria-label={key === "Backspace" ? "Delete" : key}
            >
              {key === "Backspace" ? <FaBackspace className="text-2xl" /> : key}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

function App() {
  const [wordList, setWordList] = useState(null);
  const [secretWord, setSecretWord] = useState("");
  const [guesses, setGuesses] = useState(Array(6).fill(""));
  const [feedback, setFeedback] = useState(Array(6).fill(null));
  const [text, setText] = useState("");
  const [activeRowIndex, setActiveRowIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [isFading, setIsFading] = useState(false);
  const [gameStatus, setGameStatus] = useState(null);
  const [keyboardFeedback, setKeyboardFeedback] = useState({});

  const showError = (message) => {
    setErrorMessage(message);
    setIsFading(false);

    setTimeout(() => {
      setIsFading(true);
      setTimeout(() => setErrorMessage(""), 500);
    }, 1000);
  };

  const generateFeedback = (guess, secret) => {
    guess = guess.toUpperCase();
    secret = secret.toUpperCase();

    const feedback = Array(5).fill(COLORS.GREY);
    const secretCounts = {};

    for (const letter of secret) {
      secretCounts[letter] = (secretCounts[letter] || 0) + 1;
    }

    for (let i = 0; i < 5; i++) {
      if (guess[i] === secret[i]) {
        feedback[i] = COLORS.GREEN;
        secretCounts[guess[i]] -= 1;
      }
    }

    for (let i = 0; i < 5; i++) {
      if (feedback[i] === COLORS.GREY && secretCounts[guess[i]] > 0) {
        feedback[i] = COLORS.YELLOW;
        secretCounts[guess[i]] -= 1;
      }
    }

    return feedback;
  };

  const handleKeyPress = (key) => {
    if (gameStatus) return;

    if (key === "Backspace") {
      setText((prev) => prev.slice(0, -1));
    } else if (key === "Enter") {
      if (text.length < 5) {
        showError("Not enough letters");
        return;
      }

      if (!wordList.includes(text.toUpperCase())) {
        showError("Not in word list");
        return;
      }

      const newGuesses = [...guesses];
      const newFeedback = [...feedback];

      newGuesses[activeRowIndex] = text.toUpperCase();
      newFeedback[activeRowIndex] = generateFeedback(text, secretWord);

      setGuesses(newGuesses);
      setFeedback(newFeedback);

      setKeyboardFeedback((prev) => {
        const updatedFeedback = { ...prev };
        newFeedback[activeRowIndex].forEach((status, index) => {
          const letter = text[index];
          if (status === COLORS.GREEN || status === COLORS.YELLOW) {
            updatedFeedback[letter] = status;
          } else if (status === COLORS.GREY && !updatedFeedback[letter]) {
            updatedFeedback[letter] = COLORS.GREY;
          }
        });
        return updatedFeedback;
      });

      if (newFeedback[activeRowIndex].every((f) => f === COLORS.GREEN)) {
        setGameStatus("win");
      } else if (activeRowIndex === 5) {
        setGameStatus("lose");
      }

      setText("");
      setActiveRowIndex((prev) => prev + 1);
    } else if (text.length < 5 && /^[A-Za-z]$/.test(key)) {
      setText((prev) => prev + key.toUpperCase());
    }
  };

  useEffect(() => {
    fetch(WORD_LIST_DATA)
      .then((response) => response.text())
      .then((text) => {
        const wordArray = text
          .split("\n")
          .map((word) => word.trim().toUpperCase());
        setWordList(wordArray);
      })
      .catch((error) => {
        console.error("Error loading data: ", error);
        showError("Failed to load word list.");
      });
  }, []);

  useEffect(() => {
    if (wordList) {
      setSecretWord(wordList[Math.floor(Math.random() * wordList.length)]);
    }
  }, [wordList]);

  const handleKeyDown = (e) => {
    handleKeyPress(e.key);
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  });

  return (
    <>
      <Header isDisabled={!wordList} />
      <Grid
        text={text}
        guesses={guesses}
        feedback={feedback}
        activeRowIndex={activeRowIndex}
      />
      <Keyboard
        handleKeyDown={handleKeyPress}
        keyboardFeedback={keyboardFeedback}
      />
      {errorMessage && (
        <div
          className={`absolute top-2 left-1/2 transform -translate-x-1/2 font-bold bg-white text-black px-4 py-2 rounded-md transition-opacity duration-500 ${
            isFading ? "opacity-0" : "opacity-100"
          }`}
        >
          {errorMessage}
        </div>
      )}
      {gameStatus === "win" && (
        <div className="absolute top-1 left-1/2 transform -translate-x-1/2 font-bold text-2xl text-white px-4 py-2 rounded-md">
          Congratulations!
        </div>
      )}
      {gameStatus === "lose" && (
        <div className="absolute top-1 left-1/2 transform -translate-x-1/2 font-bold text-2xl text-white px-4 py-2 rounded-md">
          Game Over! The word was {secretWord}.
        </div>
      )}
    </>
  );
}

Header.propTypes = {
  onRefresh: PropTypes.func.isRequired,
  isDisabled: PropTypes.bool.isRequired,
};

Grid.propTypes = {
  text: PropTypes.string.isRequired,
  guesses: PropTypes.arrayOf(PropTypes.string).isRequired,
  feedback: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)).isRequired,
  activeRowIndex: PropTypes.number.isRequired,
};

Row.propTypes = {
  text: PropTypes.string.isRequired,
  feedback: PropTypes.arrayOf(PropTypes.string).isRequired,
  isActive: PropTypes.bool.isRequired,
};

Keyboard.propTypes = {
  handleKeyDown: PropTypes.func.isRequired,
  keyboardFeedback: PropTypes.objectOf(
    PropTypes.oneOf([COLORS.GREEN, COLORS.YELLOW, COLORS.GREY])
  ).isRequired,
};

export default App;
