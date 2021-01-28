
// // Dynamic Adapt v.1
// HTML data-da="where(uniq class name),position(digi),when(breakpoint)"
// e.x. data-da="item,2,992"
// Andrikanych Yevhen 2020
// https://www.youtube.com/c/freelancerlifestyle

"use strict";

(function () {
	let originalPositions = [];
	let daElements = document.querySelectorAll('[data-da]');
	let daElementsArray = [];
	let daMatchMedia = [];
	//Заполняем массивы
	if (daElements.length > 0) {
		let number = 0;
		for (let index = 0; index < daElements.length; index++) {
			const daElement = daElements[index];
			const daMove = daElement.getAttribute('data-da');
			if (daMove != '') {
				const daArray = daMove.split(',');
				const daPlace = daArray[1] ? daArray[1].trim() : 'last';
				const daBreakpoint = daArray[2] ? daArray[2].trim() : '767';
				const daType = daArray[3] === 'min' ? daArray[3].trim() : 'max';
				const daDestination = document.querySelector('.' + daArray[0].trim())
				if (daArray.length > 0 && daDestination) {
					daElement.setAttribute('data-da-index', number);
					//Заполняем массив первоначальных позиций
					originalPositions[number] = {
						"parent": daElement.parentNode,
						"index": indexInParent(daElement)
					};
					//Заполняем массив элементов 
					daElementsArray[number] = {
						"element": daElement,
						"destination": document.querySelector('.' + daArray[0].trim()),
						"place": daPlace,
						"breakpoint": daBreakpoint,
						"type": daType
					}
					number++;
				}
			}
		}
		dynamicAdaptSort(daElementsArray);

		//Создаем события в точке брейкпоинта
		for (let index = 0; index < daElementsArray.length; index++) {
			const el = daElementsArray[index];
			const daBreakpoint = el.breakpoint;
			const daType = el.type;

			daMatchMedia.push(window.matchMedia("(" + daType + "-width: " + daBreakpoint + "px)"));
			daMatchMedia[index].addListener(dynamicAdapt);
		}
	}
	//Основная функция
	function dynamicAdapt(e) {
		for (let index = 0; index < daElementsArray.length; index++) {
			const el = daElementsArray[index];
			const daElement = el.element;
			const daDestination = el.destination;
			const daPlace = el.place;
			const daBreakpoint = el.breakpoint;
			const daClassname = "_dynamic_adapt_" + daBreakpoint;

			if (daMatchMedia[index].matches) {
				//Перебрасываем элементы
				if (!daElement.classList.contains(daClassname)) {
					let actualIndex = indexOfElements(daDestination)[daPlace];
					if (daPlace === 'first') {
						actualIndex = indexOfElements(daDestination)[0];
					} else if (daPlace === 'last') {
						actualIndex = indexOfElements(daDestination)[indexOfElements(daDestination).length];
					}
					daDestination.insertBefore(daElement, daDestination.children[actualIndex]);
					daElement.classList.add(daClassname);
				}
			} else {
				//Возвращаем на место
				if (daElement.classList.contains(daClassname)) {
					dynamicAdaptBack(daElement);
					daElement.classList.remove(daClassname);
				}
			}
		}
		//customAdapt();
	}

	//Вызов основной функции
	dynamicAdapt();

	//Функция возврата на место
	function dynamicAdaptBack(el) {
		const daIndex = el.getAttribute('data-da-index');
		const originalPlace = originalPositions[daIndex];
		const parentPlace = originalPlace['parent'];
		const indexPlace = originalPlace['index'];
		const actualIndex = indexOfElements(parentPlace, true)[indexPlace];
		parentPlace.insertBefore(el, parentPlace.children[actualIndex]);
	}
	//Функция получения индекса внутри родителя
	function indexInParent(el) {
		var children = Array.prototype.slice.call(el.parentNode.children);
		return children.indexOf(el);
	}
	//Функция получения массива индексов элементов внутри родителя 
	function indexOfElements(parent, back) {
		const children = parent.children;
		const childrenArray = [];
		for (let i = 0; i < children.length; i++) {
			const childrenElement = children[i];
			if (back) {
				childrenArray.push(i);
			} else {
				//Исключая перенесенный элемент
				if (childrenElement.getAttribute('data-da') == null) {
					childrenArray.push(i);
				}
			}
		}
		return childrenArray;
	}
	//Сортировка объекта
	function dynamicAdaptSort(arr) {
		arr.sort(function (a, b) {
			if (a.breakpoint > b.breakpoint) { return -1 } else { return 1 }
		});
		arr.sort(function (a, b) {
			if (a.place > b.place) { return 1 } else { return -1 }
		});
	}
	//Дополнительные сценарии адаптации
	function customAdapt() {
		//const viewport_width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
	}
}());
"use strict"

document.addEventListener('DOMContentLoaded', function () {
	const form = document.getElementById('form');
	form.addEventListener('submit', formSend);

	async function formSend(e) {
		e.preventDefault();

		let error = formValidate(form);

		let formData = new FormData(form);


		if (error === 0) {
			form.classList.add('_sending');
			let response = await fetch('sendmail.php', {
				method: 'POST',
				body: formData
			});
			if (response.ok) {
				let result = await response.json();
				alert(result.message);
				formPreview.innerHTML = '';
				form.reset();
				form.classList.remove('_sending');
			} else {
				alert("Ошибка");
				form.classList.remove('_sending');
			}
		} else {
			alert('Заполните обязательные поля');
		}

	}


	function formValidate(form) {
		let error = 0;
		let formReq = document.querySelectorAll('._req');

		for (let index = 0; index < formReq.length; index++) {
			const input = formReq[index];
			formRemoveError(input);

			if (input.classList.contains('_email')) {
				if (emailTest(input)) {
					formAddError(input);
					error++;
				}
			} else if (input.getAttribute("type") === "checkbox" && input.checked === false) {
				formAddError(input);
				error++;
			} else {
				if (input.value === '') {
					formAddError(input);
					error++;
				}
			}
		}
		return error;
	}
	function formAddError(input) {
		input.parentElement.classList.add('_error');
		input.classList.add('_error');
	}
	function formRemoveError(input) {
		input.parentElement.classList.remove('_error');
		input.classList.remove('_error');
	}








});
const popupLinks = document.querySelectorAll('.popup-link');
const body = document.querySelector('body');
const lockPadding = document.querySelectorAll(".lock-padding");

let unlock = true;

const timeout = 800;

if (popupLinks.length > 0) {
	for (let index = 0; index < popupLinks.length; index++) {
		const popupLink = popupLinks[index];
		popupLink.addEventListener("click", function (e) {
			const popupName = popupLink.getAttribute('href').replace('#', '');
			const curentPopup = document.getElementById(popupName);
			popupOpen(curentPopup);
			e.preventDefault();
		});
	}
}
const popupCloseIcon = document.querySelectorAll('.close-popup');
if (popupCloseIcon.length > 0) {
	for (let index = 0; index < popupCloseIcon.length; index++) {
		const el = popupCloseIcon[index];
		el.addEventListener('click', function (e) {
			popupClose(el.closest('.popup'));
			e.preventDefault();
		});
	}
}

function popupOpen(curentPopup) {
	if (curentPopup && unlock) {
		const popupActive = document.querySelector('.popup.open');
		if (popupActive) {
			popupClose(popupActive, false);
		} else {
			bodyLock();
		}
		curentPopup.classList.add('open');
		curentPopup.addEventListener("click", function (e) {
			if (!e.target.closest('.popup__content')) {
				popupClose(e.target.closest('.popup'));
			}
		});
	}
}

function popupClose(popupActive, doUnlock = true) {
	if (unlock) {
		popupActive.classList.remove('open');
		if (doUnlock) {
			bodyUnLock();
		}
	}
}

function bodyLock() {
	const lockPaddingValue = window.innerWidth - document.querySelector('.wrapper').offsetWidth + 'px';

	if (lockPadding.length > 0) {
		for (let index = 0; index < lockPadding.length; index++) {
			const el = lockPadding[index];
			el.style.paddingRight = lockPaddingValue;
		}
	}
	body.style.paddingRight = lockPaddingValue;
	body.classList.add('lock');

	unlock = false;
	setTimeout(function () {
		unlock = true;
	}, timeout);
}

function bodyUnLock() {
	setTimeout(function () {
		if (lockPadding.length > 0) {
			for (let index = 0; index < lockPadding.length; index++) {
				const el = lockPadding[index];
				el.style.paddingRight = '0px';
			}
		}
		body.style.paddingRight = '0px';
		body.classList.remove('lock');
	}, timeout);

	unlock = false;
	setTimeout(function () {
		unlock = true;
	}, timeout);
}

document.addEventListener('keydown', function (e) {
	if (e.which === 27) {
		const popupActive = document.querySelector('.popup.open');
		popupClose(popupActive);
	}
});

(function () {
	// проверяем поддержку
	if (!Element.prototype.closest) {
		// реализуем
		Element.prototype.closest = function (css) {
			var node = this;
			while (node) {
				if (node.matches(css)) return node;
				else node = node.parentElement;
			}
			return null;
		};
	}
})();
(function () {
	// проверяем поддержку
	if (!Element.prototype.matches) {
		// определяем свойство
		Element.prototype.matches = Element.prototype.matchesSelector ||
			Element.prototype.webkitMatchesSelector ||
			Element.prototype.mozMatchesSelector ||
			Element.prototype.msMatchesSelector;
	}
})();


//////SLIDER///////////////

var swiper = new Swiper('.rev__slider', {
	slidesPerView: 1,
	slidesPerGroup: 1,
	spaceBetween: 100,

	speed: 1000,
	navigation: {
		nextEl: '.rev__slider-next',
		prevEl: '.rev__slider-prev',
	},
	breakpoints: {

		768: {
			slidesPerView: 2,

			spaceBetween: 70,
			slidesPerGroup: 1,
		},

	}

});


var rellax = new Rellax('.rose');


const anchors = document.querySelectorAll('a.scroll-to')

for (let anchor of anchors) {
	anchor.addEventListener('click', function (e) {
		e.preventDefault()

		const blockID = anchor.getAttribute('href')

		document.querySelector(blockID).scrollIntoView({
			behavior: 'smooth',
			block: 'start'
		})
	})
}

//////SLIDER///////////////

let header = gsap.timeline({
	scrollTrigger: {
		trigger: ".header",   // pin the trigger element while active
		start: "top center",

	}
});
if (window.innerWidth > 737) {

	header

		.from(".header__time", { duration: 0.7, ease: "power4.out", opacity: 0, x: -100 }, "+=0.5")
		.from(".header__title", { duration: 0.7, ease: "power4.out", opacity: 0, x: -100 }, "-=0.4")
		.from(".header__text", { duration: 0.7, ease: "power4.out", opacity: 0, x: -100 }, "-=0.4")
		.from(".header__btn", { duration: 0.7, ease: "power4.out", opacity: 0, x: -100 }, "-=0.4")

} else {
	header

		.from(".header__time", { duration: 0.8, ease: "power4.out", opacity: 0, y: 50 }, "+=0.2")
		.from(".header__title", { duration: 0.8, ease: "power4.out", opacity: 0, y: 50 }, "-=0.4")
		.from(".header__text", { duration: 0.8, ease: "power4.out", opacity: 0, y: 50 }, "-=0.4")
		.from(".header__btn", { duration: 0.8, ease: "power4.out", opacity: 0, y: 50 }, "-=0.4")

}

let know = gsap.timeline({
	scrollTrigger: {
		trigger: ".know",   // pin the trigger element while active
		start: "top center",


	}
});
if (window.innerWidth > 737) {

	know
		.from(".know__img", { duration: 1.2, ease: "power4.out", opacity: 0, x: -100 }, "+=0.2")
		.from(".know__title", { duration: 0.7, ease: "power4.out", opacity: 0, x: -100 }, "-=0.6")
		.from(".know__text-item", { duration: 0.8, ease: "power4.out", opacity: 0, x: -100, stagger: .3 }, "-=0.4")


} else {
	know

		.from(".know__title", { duration: 0.7, ease: "power4.out", opacity: 0, y: 50 }, "+=0.2")
		.from(".know__img", { duration: 1, ease: "power4.out", opacity: 0, y: 50 }, "-=0.4")
		.from(".know__text-item", { duration: 0.8, ease: "power4.out", opacity: 0, y: 50, stagger: .3 }, "-=0.6")

}



let cases = gsap.timeline({
	scrollTrigger: {
		trigger: ".cases",   // pin the trigger element while active
		start: "top center",


	}
});
if (window.innerWidth > 737) {

	cases
		.from(".cases__title", { duration: 0.8, ease: "power4.out", opacity: 0, x: -100 }, "+=0.2")
		.from(".cases__img", { duration: 1, ease: "power4.out", opacity: 0, x: -100 }, "-=0.6")
		.from(".cases__text-item", { duration: 0.8, ease: "power4.out", opacity: 0, x: -100, stagger: .3 }, "-=0.4")


} else {
	cases
		.from(".cases__title", { duration: 1.2, ease: "power4.out", opacity: 0, y: 50 }, "+=0.2")
		.from(".cases__img", { duration: 0.7, ease: "power4.out", opacity: 0, y: 50 }, "-=0.6")
		.from(".cases__text-item", { duration: 0.8, ease: "power4.out", opacity: 0, y: 50, stagger: .3 }, "-=0.4")

}



let speakers = gsap.timeline({
	scrollTrigger: {
		trigger: ".speakers",   // pin the trigger element while active
		start: "top center",


	}
});
if (window.innerWidth > 737) {

	speakers
		.from(".speakers__title", { duration: 0.8, ease: "power4.out", opacity: 0, x: -100 }, "+=0.2")
		.from(".speakers__img", { duration: 1, ease: "power4.out", opacity: 0, x: -100, stagger: .3 }, "-=0.6")
		.from(".speakers__text-item", { duration: 0.8, ease: "power4.out", opacity: 0, x: -100, stagger: .3 }, "-=0.4")


} else {
	speakers
		.from(".speakers__title", { duration: 0.8, ease: "power4.out", opacity: 0, y: 50 }, "+=0.2")
		.from(".speakers__img", { duration: 1, ease: "power4.out", opacity: 0, y: 50, stagger: .3 }, "-=0.6")
		.from(".speakers__text-item", { duration: 0.8, ease: "power4.out", opacity: 0, y: 50, stagger: .3 }, "-=0.4")

}



let date = gsap.timeline({
	scrollTrigger: {
		trigger: ".date",   // pin the trigger element while active
		start: "top center",


	}
});
if (window.innerWidth > 737) {

	date

		.from(".date__title", { duration: 1, ease: "power4.out", opacity: 0, x: -100 }, "+=0.2")
		.from(".date__time", { duration: 0.8, ease: "power4.out", opacity: 0, x: -100 }, "-=0.6")
		.from(".date__text", { duration: 0.8, ease: "power4.out", opacity: 0, x: -100, stagger: .3 }, "-=0.4")
		.from(".date__btn", { duration: 0.8, ease: "power4.out", opacity: 0, x: -100 }, "-=0.4")


} else {
	date
		.from(".date__title", { duration: 1, ease: "power4.out", opacity: 0, y: 50 }, "+=0.2")
		.from(".date__time", { duration: 0.8, ease: "power4.out", opacity: 0, y: 50 }, "-=0.6")
		.from(".date__img", { duration: 0.8, ease: "power4.out", opacity: 0, y: 50 }, "-=0.6")
		.from(".date__text", { duration: 0.8, ease: "power4.out", opacity: 0, y: 50, stagger: .3 }, "-=0.4")
		.from(".date__btn", { duration: 0.8, ease: "power4.out", opacity: 0, y: 50 }, "-=0.4")
}




