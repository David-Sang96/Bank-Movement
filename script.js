"use strict";

// Data
const account1 = {
  owner: "Jonas Schmedtmann",
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    "2022-11-18T21:31:17.178Z",
    "2022-12-23T07:42:02.383Z",
    "2024-01-28T09:15:04.904Z",
    "2024-04-01T10:17:24.185Z",
    "2024-05-08T14:11:59.604Z",
    "2024-05-09T17:01:17.194Z",
    "2024-05-09T23:36:17.929Z",
    "2024-05-10T10:51:36.790Z",
  ],
  currency: "EUR",
  locale: "pt-PT", // de-DE
};

const account2 = {
  owner: "Jessica Davis",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    "2022-11-01T13:15:33.035Z",
    "2022-11-30T09:48:16.867Z",
    "2022-12-25T06:04:23.907Z",
    "2024-01-25T14:18:46.235Z",
    "2024-05-07T14:43:26.374Z",
    "2024-05-08T16:33:06.386Z",
    "2024-05-10T18:49:59.371Z",
    "2024-05-09T12:01:20.894Z",
  ],
  currency: "USD",
  locale: "en-US",
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnLogOut = document.querySelector(".logout__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

const formatCurrency = (locale, currency, value) => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(value);
};

const formatDate = (date, locale) => {
  const daysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));
  const result = daysPassed(new Date(), date);

  if (result === 0) return "today";
  if (result === 1) return "yesterday";
  if (result <= 10) return `${result} days ago`;
  return new Intl.DateTimeFormat(locale).format(date);
};

// display movements
const displayMovements = (account, sort = false) => {
  containerMovements.innerHTML = "";

  const movs = sort
    ? account.movements.slice().sort((a, b) => a - b)
    : account.movements;
  movs.forEach((mov, i) => {
    const type = mov > 0 ? "deposit" : "withdrawal";

    const date = new Date(account.movementsDates[i]);
    const displayDate = formatDate(date, account.locale);

    const html = `  
    <div class="movements__row">
      <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
    <div class="movements__date">${displayDate}</div>
      <div class="movements__value">${formatCurrency(
        account.locale,
        account.currency,
        mov
      )}</div>
    </div>
  `;
    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
};

// calc balance
const calcDisplayBalance = (account) => {
  account.totalBalance = account.movements.reduce((acc, cur) => acc + cur, 0);
  labelBalance.textContent = formatCurrency(
    account.locale,
    account.currency,
    account.totalBalance
  );
};

// calc summary
const calcDisplaySummary = (account) => {
  const incomes = account.movements
    .filter((mov) => mov > 0)
    .reduce((acc, cur) => acc + cur, 0);
  labelSumIn.textContent = formatCurrency(
    account.locale,
    account.currency,
    incomes
  );

  const out = account.movements
    .filter((mov) => mov < 0)
    .reduce((acc, cur) => acc + cur, 0);
  labelSumOut.textContent = formatCurrency(
    account.locale,
    account.currency,
    out
  );

  const interest = account.movements
    .filter((mov) => mov > 0)
    .map((int) => (int * account.interestRate) / 100)
    .filter((int) => int >= 1)
    .reduce((acc, cur) => acc + cur, 0);
  labelSumInterest.textContent = formatCurrency(
    account.locale,
    account.currency,
    interest
  );
};

// create userName
const createUserNames = (account) => {
  account.forEach((acc) => {
    acc.username = acc.owner
      .split(" ")
      .map((name) => name.at(0).toLocaleLowerCase())
      .join("");
  });
};
createUserNames(accounts);

// logout timer
const logOutTimer = () => {
  const tick = () => {
    const minute = String(Math.trunc(time / 60)).padStart(2, 0);
    const second = String(time % 60).padStart(2, 0);
    labelTimer.textContent = `${minute}:${second}`;
    if (time === 0) {
      clearInterval(timer);
      logOutAccess();
    }
    time--;
  };
  let time = 300;
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

// update Ui
const updateUI = (account) => {
  displayMovements(account);
  calcDisplayBalance(account);
  calcDisplaySummary(account);
};

let currentLoginAccount, timer;

// Login Button
btnLogin.addEventListener("click", (e) => {
  e.preventDefault();

  currentLoginAccount = accounts.find(
    (acc) => acc.username === inputLoginUsername.value.trim()
  );

  if (!currentLoginAccount) {
    inputLoginUsername.value = inputLoginPin.value = "";
    inputLoginPin.blur();
    inputLoginUsername.blur();
    labelWelcome.textContent = "User doesn't exist!";
  }

  if (currentLoginAccount?.pin === +inputLoginPin.value) {
    // display ui and welcome message
    labelWelcome.textContent = `Welcome back, ${
      currentLoginAccount.owner.split(" ")[0]
    }`;
    containerApp.style.opacity = 1;

    // latest balance date

    const options = {
      // timeStyle: "short",
      // dateStyle: "medium",
      hour: "numeric",
      minute: "numeric",
      day: "numeric",
      month: "short",
      year: "numeric",
      weekday: "short",
    };
    // const locale = navigator.language;

    labelDate.textContent = new Intl.DateTimeFormat(
      currentLoginAccount.locale,
      options
    ).format(new Date());

    // clear input fields
    inputLoginUsername.classList.add("hidden");
    inputLoginPin.classList.add("hidden");

    // clear blinking cursor in input
    inputLoginPin.blur();
    inputLoginUsername.blur();
    btnLogin.classList.add("hidden");
    btnLogOut.classList.remove("hidden");

    // timer
    if (timer) clearInterval(timer);
    timer = logOutTimer();

    // update UI
    updateUI(currentLoginAccount);
  }
  inputLoginUsername.value = inputLoginPin.value = "";
});

// logout access
const logOutAccess = () => {
  btnLogin.classList.remove("hidden");
  btnLogOut.classList.add("hidden");
  inputLoginUsername.classList.remove("hidden");
  inputLoginPin.classList.remove("hidden");
  containerApp.style.opacity = 0;
  labelWelcome.textContent = "Log in to get started";
};

// logout button
btnLogOut.addEventListener("click", (e) => {
  e.preventDefault();
  logOutAccess();
});

// transfer button
btnTransfer.addEventListener("click", (e) => {
  e.preventDefault();

  const amount = +inputTransferAmount.value;
  const receiverAccount = accounts.find(
    (acc) => acc.username === inputTransferTo.value.trim()
  );

  if (
    amount > 0 &&
    receiverAccount &&
    amount <= currentLoginAccount.totalBalance &&
    receiverAccount.username !== currentLoginAccount.username
  ) {
    // doing the transfer
    currentLoginAccount.movements.push(-amount);
    receiverAccount.movements.push(amount);

    // add transfer date
    currentLoginAccount.movementsDates.push(new Date().toISOString());
    receiverAccount.movementsDates.push(new Date().toISOString());

    // update UI
    updateUI(currentLoginAccount);

    // reset timer
    clearInterval(timer);
    timer = logOutTimer();
  }
  inputTransferAmount.value = inputTransferTo.value = "";
});

// loan button
btnLoan.addEventListener("click", (e) => {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);
  if (
    amount > 0 &&
    currentLoginAccount.movements.some((mov) => mov >= amount * 0.1)
  ) {
    setTimeout(() => {
      // add loan to movements
      currentLoginAccount.movements.push(amount);

      // add loan date
      currentLoginAccount.movementsDates.push(new Date().toISOString());

      // update UI
      updateUI(currentLoginAccount);

      // reset timer
      clearInterval(timer);
      timer = logOutTimer();
    }, 2500);
  }
  inputLoanAmount.value = "";
});

// sort button
let sorted = false;
btnSort.addEventListener("click", () => {
  displayMovements(currentLoginAccount, !sorted);
  sorted = !sorted;
});

// close button
btnClose.addEventListener("click", (e) => {
  e.preventDefault();

  if (
    inputCloseUsername.value.trim() === currentLoginAccount.username &&
    +inputClosePin.value === currentLoginAccount.pin
  ) {
    const curAccIndex = accounts.findIndex(
      (acc) => acc.username === currentLoginAccount.username
    );
    accounts.splice(curAccIndex, 1);
    logOutAccess();
  }
  inputCloseUsername.value = inputClosePin.value = "";
});
