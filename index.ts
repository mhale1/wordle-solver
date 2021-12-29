import _ from "lodash";
import fs from "fs";
import words from "./dictionary";

enum PatternValue {
  WrongLetter,
  WrongLocation,
  Correct
}

function response(word: string, guess: string): PatternValue[] {
  const pat = Array<PatternValue>(5).fill(PatternValue.WrongLetter);
  const counts: Record<string, number> = _.countBy(word);

  for (let i = 0; i < 5; i++) {
    if (word[i] === guess[i]) {
      pat[i] = PatternValue.Correct;
      counts[word[i]]--;
    }
  }

  for (let i = 0; i < 5; i++) {
    if (pat[i] !== PatternValue.Correct) {
      if ((counts[guess[i]] ?? 0) > 0) {
        pat[i] = PatternValue.WrongLocation;
        counts[guess[i]]--;
      }
    }
  }

  return pat;
}

function possibleMatch(
  word: string,
  guess: string,
  pattern: PatternValue[]
): boolean {
  let counts = _.countBy(word);

  for (let i = 0; i < 5; i++) {
    if (pattern[i] === PatternValue.Correct) {
      if (guess[i] === word[i]) {
        counts[guess[i]]--;
      } else {
        return false;
      }
    }
  }

  for (let i = 0; i < 5; i++) {
    if (pattern[i] === PatternValue.WrongLocation) {
      if (guess[i] === word[i] || (counts[guess[i]] ?? 0) === 0) {
        return false;
      } else {
        counts[guess[i]]--;
      }
    } else if (pattern[i] === PatternValue.WrongLetter) {
      if ((counts[guess[i]] ?? 0) > 0) {
        return false;
      }
    }
  }

  return true;
}

function remainingWords(
  guess: string,
  word: string,
  words: string[]
): string[] {
  const pat = response(word, guess);
  return words.filter((w) => possibleMatch(w, guess, pat));
}

const res: [string, number][] = [];
let i = 0;

for (const w of words) {
  i++;
  console.log(i);
  const avgRemaining = _.meanBy(
    words,
    (w2) => remainingWords(w, w2, words).length
  );
  res.push([w, avgRemaining]);
  console.log([w, avgRemaining]);
  fs.writeFileSync("result.json", JSON.stringify(res));
}
