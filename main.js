import { getRandomResult } from "./modules/random.js";
import { playLaunchSound, playLandingSound } from "./modules/sound.js";

const stage = document.querySelector(".coin-stage");
const coin = document.querySelector("#coin");
const button = document.querySelector("#throw-button");
const result = document.querySelector("#result");

const TURN_DURATION = 1250;
const FINAL_ROTATIONS = {
  cara: "0deg",
  cruz: "180deg",
};
const MESSAGES = {
  cara: "¡Ha salido cara!",
  cruz: "¡Ha salido cruz!",
};

function waitForLanding() {
  return new Promise((resolve) => {
    let finished = false;
    let timeoutId;

    const finish = () => {
      if (finished) {
        return;
      }

      finished = true;
      window.clearTimeout(timeoutId);
      coin.removeEventListener("animationend", onAnimationEnd);
      resolve();
    };

    const onAnimationEnd = (event) => {
      if (event.target === coin && event.animationName === "spin") {
        finish();
      }
    };

    coin.addEventListener("animationend", onAnimationEnd);
    timeoutId = window.setTimeout(finish, TURN_DURATION + 200);
  });
}

async function throwCoin() {
  if (button.disabled) {
    return;
  }

  button.disabled = true;
  stage.dataset.state = "idle";
  result.classList.remove("is-visible");
  result.removeAttribute("data-result");
  result.textContent = "";

  const outcome = getRandomResult();
  coin.style.setProperty("--final-rotation", FINAL_ROTATIONS[outcome]);

  playLaunchSound();

  const landing = waitForLanding();
  void stage.offsetWidth;
  stage.dataset.state = "tossing";

  await landing;

  playLandingSound();
  stage.dataset.state = "result";
  result.dataset.result = outcome;
  result.textContent = MESSAGES[outcome];
  result.classList.add("is-visible");
  button.disabled = false;
}

button.addEventListener("click", throwCoin);
