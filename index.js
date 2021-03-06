const GAME_STATE = {
	FirstCardAwaits: 'FirstCardAwaits',
	SecondCardAwaits: 'SecondCardAwaits',
	CardsMatchFailed: 'CardsMatchFailed',
	CardsMatched: 'CardsMatched',
	GameFinished: 'GameFinished',
};

const Symbols = [
	'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png',
	'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png',
	'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png',
	'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png',
];

const view = {
	getCardContent(index) {
		const number = this.transformNumber((index % 13) + 1);
		const symbol = Symbols[Math.floor(index / 13)];
		return `            
            <p>${number}</p>
                <img
                    src=${symbol}
                />
            <p>${number}</p>`;
	},
	getCardElement(index) {
		return `<div class="card back" data-index=${index}></div>`;
	},
	transformNumber(number) {
		switch (number) {
			case 1:
				return 'A';
			case 11:
				return 'J';
			case 12:
				return 'Q';
			case 13:
				return 'K';
			default:
				return number;
		}
	},
	displayCards(indexes) {
		const rootElement = document.querySelector('.cards');
		rootElement.innerHTML = indexes
			.map(index => {
				return this.getCardElement(index);
			})
			.join('');
	},
	flipCards(...cards) {
		cards.forEach(card => {
			if (card.classList.contains('back')) {
				// flip to front
				card.classList.remove('back');
				card.innerHTML = this.getCardContent(Number(card.dataset.index));
			} else {
				// flip to back
				card.classList.add('back');
				card.innerHTML = null;
			}
		});
	},
	pairCards(...cards) {
		cards.forEach(card => {
			card.classList.add('paired');
		});
	},
	renderScore(score) {
		document.querySelector('#score').textContent = `Score: ${score}`;
	},
	renderTimes(triedTimes) {
		document.querySelector('#tried-times').textContent = `You have tried: ${triedTimes} times`;
	},
	showWrongAnimation(...cards) {
		cards.forEach(card => {
			card.classList.add('wrong');
			card.addEventListener(
				'animationend',
				() => {
					card.classList.remove('wrong');
				},
				{ once: true }
			);
		});
	},
	showFinishedAnimation(triedTimes) {
		const div = document.createElement('div');
		div.classList.add('finished');
		div.innerHTML = `
			<h2>Complete!</h2>
			<p>Score: 260</p>
			<p>You have tried: ${triedTimes} times</p>
		`;
		document.querySelector('body').appendChild(div);
	},
};

const ultility = {
	getRandomNumberArray(count) {
		const number = [...Array(count).keys()];
		for (let index = number.length - 1; index > 0; index--) {
			const randomIndex = Math.floor(Math.random() * (index + 1));
			[number[index], number[randomIndex]] = [number[randomIndex], number[index]];
		}
		return number;
	},
};

const model = {
	revealedCards: [],
	score: 0,
	triedTimes: 0,
	isRevealedCardsMatched() {
		return (
			Number(this.revealedCards[0].dataset.index) % 13 ===
			Number(this.revealedCards[1].dataset.index) % 13
		);
	},
};

const controller = {
	currentState: GAME_STATE.FirstCardAwaits,
	generateCards() {
		view.displayCards(ultility.getRandomNumberArray(52));
	},
	dispatchCardAction(card) {
		// if card has already been opened
		if (!card.classList.contains('back')) {
			return;
		}
		switch (this.currentState) {
			case GAME_STATE.FirstCardAwaits:
				view.flipCards(card);
				model.revealedCards.push(card);
				this.currentState = GAME_STATE.SecondCardAwaits;
				break;
			case GAME_STATE.SecondCardAwaits:
				view.renderTimes(++model.triedTimes);
				view.flipCards(card);
				model.revealedCards.push(card);
				if (model.isRevealedCardsMatched()) {
					// if match
					view.renderScore((model.score += 10));
					this.currentState = GAME_STATE.CardsMatched;
					view.pairCards(...model.revealedCards);
					model.revealedCards = [];
					if (model.score === 260) {
						view.showFinishedAnimation(model.triedTimes);
						this.currentState = GAME_STATE.GameFinished;
						return;
					} else {
						this.currentState = GAME_STATE.FirstCardAwaits;
					}
				} else {
					// if not match
					this.currentState = GAME_STATE.CardsMatchFailed;
					view.showWrongAnimation(...model.revealedCards);
					setTimeout(this.resetCards, 1500);
				}
				break;
		}
		console.log(model.score, model.triedTimes);
	},
	resetCards() {
		view.flipCards(...model.revealedCards);
		model.revealedCards = [];
		controller.currentState = GAME_STATE.FirstCardAwaits;
	},
};

controller.generateCards();

document.querySelectorAll('.card').forEach(card => {
	card.addEventListener('click', e => {
		controller.dispatchCardAction(card);
	});
});

// temp note
// if call 'this' inside setTimeout in object
// In a function, this refers to the global object.
// In arrow function, it refers to the surrounding object
