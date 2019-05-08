'use strict';
(function() {
	// Использумые элементы для игры
	var cards;//массив карточек
	var emojis;// массив сторон с эмодзиями
	var clock; // таймер-элемени
	var modal;// всплывающее окно
	var modalTextWin; // элемент с заголовком о победе
 	var modalButtonWin;// победная кнопка перезапуска игры
 	var modalTextLose; // элемент с заголовком о победе
 	var modalButtonLose;// победная кнопка перезапуска игры

	var countClick; // количество кликов по картам
	var gameTime; // время игры в виде строки
	var previousOpenCard; // предыдущая открытая сторона(эмодзи)
	var currentOpenCard;// текущая откртая сторона(эмодзи)

	// Вход в игру	
	window.playGame = function(){
		clearGlobalVars();
		getGameElements();
		writeStartTime();
		clearCards();
		makeRandomGame();
		listenClick();
	}	
	// Очищение переменных перед запуском
	function clearGlobalVars(){
		countClick = 0;
		gameTime = '01:00';
		previousOpenCard = null;
		currentOpenCard = null;
	}
	// Получение элементов DOM для последующих манипуляций
	function getGameElements(){
		cards = Array.from(document.querySelectorAll('.card'));
		emojis = Array.from(document.querySelectorAll('.emoji'));
		clock = document.querySelector('.clock');
		modal = document.querySelector('.modal');
		modalTextWin = document.getElementById('win');
		modalButtonWin = document.getElementById('button_win');
		modalTextLose = document.getElementById('lose');
		modalButtonLose = document.getElementById('button_lose');
	}

	// Запись времени
	function writeStartTime(){
		clock.innerHTML = gameTime;
	}

	// Функция перемещивающая массив эмодзи-классов и добавляющая классы карточкам
	function makeRandomGame(){

		var randomEmojis = ['dog','dog','frog','frog','crab','crab','squirrel','squirrel','cow','cow','rabbit','rabbit'];

		shuffle(randomEmojis);
		addEmojis(randomEmojis);	
	}

	//Обрабочик клика. Используем делегирование(ловим события на самом верхнем элементе(bubbling)) и вызываем нужный обрабочик в зависимости от типа элемента
	function listenClick(){	
		document.addEventListener('click',function(event){
			// Запускаем таймер при первом клике по карте
			

			//Получаем инициатора(карта или кнопка) события и запускаем нужный обрабочик 
			var elem = event.target;
			if(isContainsElementClass(elem,'back')){
				if(!countClick){
					startTimer();
					countClick++;
				}			
				cardsHandler(elem);
			}
			if(isContainsElementClass(elem,'button')){
				modalButtonHandler(elem);
			}
			
		});
	}

 	//Запуск счетчика
 	function startTimer(){
 		// Получаем стартовое время в счетчик
 		writeStartTime();
 		var minutes = parseInt(gameTime.split(':')[0]);
 		var seconds = parseInt(gameTime.split(':')[1]);
 		var time = 60*minutes + seconds;

 		// Асинхронно запускаем функцию каждую секунду, которая
 		// 1) открывает модальное окно выигрыша и останавливаем таймер, если все карты отгаданы
 		// 2) уменьшает текущее время и записывает его  на страницу
 		// 3) если время истекло то выбрасываем модальное окно проигрыша и обнуляем таймер
 		var timerId = setInterval(function() {


 			if(isAllCardsGuess())
 			{
 				openModalWindow('win');
 				clearInterval(timerId);
 			}

 			time--;
 			reloadTimer(time);

 			if (!time){
 				openModalWindow('lose');
 				clearInterval(timerId);
 			}

 		}, 1000);
 		return timerId;
 	}
 	//Открывает модальное окно(параметы - тип текста и кнопки)
 	function openModalWindow(text,button){
 		removeElementClass(modal,'hide');
 		addElementClass(modal,'view');
 		if(text == 'win'){
 			removeElementClass(modalTextLose,'view');
 			addElementClass(modalTextWin,'view');
 			removeElementClass(modalButtonLose,'view_inline');
 			addElementClass(modalButtonWin,'view_inline');
 		};
 		if(text == 'lose'){
 			removeElementClass(modalTextWin,'view');
 			addElementClass(modalTextLose,'view');
 			removeElementClass(modalButtonWin,'view_inline');
 			addElementClass(modalButtonLose,'view_inline');
 		};
 	}
 	// Запись времени в таймер
 	function reloadTimer(time){
 		var minutes = Math.floor(time/60);
 		var seconds = time % 60;
 		clock.innerHTML = lpad(minutes,'2')+":"+lpad(seconds,'2');
 	}
 	// Обрабочтик клика по карте
 	function cardsHandler(element){
 		var cardElement = element.parentNode;
		addElementClass(cardElement,'anim');
		// Логика игры(проверка предыдущих открытых карт)
		if(previousOpenCard){
			if(currentOpenCard){
				if(isContainsElementClass(currentOpenCard,'not_guess') ){
					closeCards(currentOpenCard,previousOpenCard);
				}
				currentOpenCard = null;
				previousOpenCard = getEmojiElement(cardElement);
			}
			else
			{
				currentOpenCard = getEmojiElement(cardElement);
				if(isEqualCards(previousOpenCard,currentOpenCard)){
					fillColorCards(previousOpenCard,currentOpenCard,'guess');
				}
				else{
					fillColorCards(previousOpenCard,currentOpenCard,'not_guess');
				}
			}
		}
		else{
			previousOpenCard = getEmojiElement(cardElement);
		}
	}

	//Обработчик клика кнопки модального окна
	// 5) Закрываем окно
	// 1) Очищаем и закрываем карту
	// 2) Очищаем глобальную видимость для старта новой игры
	// 3) Записываем время в таймер по умолчанию
	// 4) Генерируем новую раскладку карт
	// 5) Закрываем окно
	function modalButtonHandler(){
		HideModalWindow();
		clearCards();
		clearGlobalVars();
		writeStartTime();
		makeRandomGame();
	}

	//Закрытие модального окна
	function HideModalWindow()
	{
		removeElementClass(modal,'view');
		addElementClass(modal,'hide');
	}

	// Проверка того что все карты угаданы
	function isAllCardsGuess(){

		if(cards.every(function(element){
			return isContainsElementClass(element,'anim');
		})){
			if(emojis.every(function(elem){
				return isContainsElementClass(elem,'guess');		
			})){
				return true;
			}
		}

		return false;
	}

	// Закрываем карты и очищаем 
	function clearCards(){
		//Закрываем карты
		cards.forEach(function(element){
			removeElementClass(element,'anim');
		});
		//Очищаем признаки у эмодзи
		emojis.forEach(function(element){
			element.className = 'emoji';
		});
	}


	// Добавление эмодзи карточкам
	function addEmojis(randomEmojis){
		emojis.forEach(function(element,index) {
			addElementClass(element,randomEmojis[index]);
		});
	}

	// Получение эмодзи для карты
	function getEmojiElement(element){
		return element.querySelector('.emoji');
	}
	// Проверяем одинаковые ли открытые карты(достаточно сравнить 2 класс у обоих элементов на равенство)
	function isEqualCards(card1, card2){
		return (card1.className === card2.className);
	}

	// Добавление класса 2 элментам(для зеленого цвета угадывания)
	function fillColorCards(card1,card2,cssClass){
		
		addElementClass(card1,cssClass);
		addElementClass(card2,cssClass);
		
	}

	// Добавление класса элементу
	function addElementClass(element,cssClass){
		element.classList.add(cssClass);
	}
	// Удаление класса у элемента
	function removeElementClass(element,cssClass){
		element.classList.remove(cssClass);
	}
	// Проверка того что класс принадлежит элементу
	function isContainsElementClass(element,cssClass){
		return element.classList.contains(cssClass);
	}
	// Закрытие карты
	function closeCards(element1,element2){
		var card1 = element1.parentNode;
		var card2 = element2.parentNode;
		removeElementClass(element1,element1.classList[2]);
		removeElementClass(element2,element2.classList[2]);
		removeElementClass(card1,'anim');
		removeElementClass(card2,'anim');
	}

	// Дописывание нулей для строки времени
	function lpad (str, max) {
		str = str.toString();
		return str.length < max ? lpad("0" + str, max) : str;
	}

		// Перемешивание массива случайным способом
		function shuffle(a) {
			var j, x, i;
			for (i = a.length - 1; i > 0; i--) {
				j = Math.floor(Math.random() * (i + 1));
				x = a[i];
				a[i] = a[j];
				a[j] = x;a
			}
			return a;
		}

	}());