// класс обработчика окон, все свойства ниже приватные
class WindowManager {
	#allWindows; // все окна
	#countOfWindows; // количество окон
	#idWindow; // зачем я пишу комментарии? и так понятно, что это - айдишник окна
	#dataOfWindow; // данные о текущем окне
	#windowShapeChangeCallback; // свойства для коллбэка изменения формы окна
	#windowChangeCallback; // свойство для коллбэка изменения количества окон

	constructor() {
		let that = this; // ссылка на объект WindowManager для использования внутри обработчиков событий

		// обработчик события изменения данных в локльном хранилище из другого окна
		addEventListener("storage", (event) => {

			// проверка на изменения данных в окнах
			if (event.key == "allWindows") {
				let newWindows = JSON.parse(event.newValue); // получение обновленных данных об окнах
				let isWindowsChanged = that.#didWindowsChange(that.#allWindows, newWindows); // проверка изменения окон

				that.#allWindows = newWindows; // обновляем данные

				// если данные изменились, вызываем коллбэк изменения окон
				if (isWindowsChanged) {
					if (that.#windowChangeCallback) that.#windowChangeCallback();
				}
			}
		});

		// обработчик события о закрытии текущего окна
		window.addEventListener('beforeunload', function (e) {
			let index = that.getWindowIndexFromId(that.#idWindow); // получаем индекс текущего окна в массиве

			// удаляем текущее окно из списка и обновляем данные в localstorage
			that.#allWindows.splice(index, 1);
			that.updateWindowsLocalStorage();
		});
	}

	// метод для проверки изменений в списке окон
	#didWindowsChange(previousWindows, newWindows) {
		if (previousWindows.length != newWindows.length) { // количество поменялось => тру
			return true;
		}
		else {
			let isChanged = false;

			for (let i = 0; i < previousWindows.length; i++) {
				if (previousWindows[i].idWindow != newWindows[i].idWindow) isChanged = true; // id поменялись => тру
			}

			return isChanged;
		}
	}

	// метод инициализации текущего окна
	init(metaData) {
		this.#allWindows = JSON.parse(localStorage.getItem("allWindows")) || []; // получаем данные о всех окнах из localStorage или создаем пустой массив
		this.#countOfWindows = localStorage.getItem("countOfWindows") || 0; // получаем количество окон или ставим 0
		this.#countOfWindows++;

		this.#idWindow = this.#countOfWindows; // ставим id текущего окна
		let shapeOfWindow = this.getWindowShape(); // получаем размеры
		this.#dataOfWindow = { idWindow: this.#idWindow, shape: shapeOfWindow, metaData: metaData }; // создаем объект данных о текущем окне
		this.#allWindows.push(this.#dataOfWindow); // добавляем данные о текущем окне в массив

		localStorage.setItem("countOfWindows", this.#countOfWindows); // обновляем количество окон в localstorage
		this.updateWindowsLocalStorage(); // обновляем данные об окнах
	}

	// метод обновления данных текущего окна
	update() {
		let shapeOfWindow = this.getWindowShape(); // получаем размеры окна

		// проверям на изменение и (не) изменяем
		if (shapeOfWindow.x != this.#dataOfWindow.shape.x ||
			shapeOfWindow.y != this.#dataOfWindow.shape.y ||
			shapeOfWindow.w != this.#dataOfWindow.shape.w ||
			shapeOfWindow.h != this.#dataOfWindow.shape.h) {
			this.#dataOfWindow.shape = shapeOfWindow;

			let index = this.getWindowIndexFromId(this.#idWindow); // получаем индекс
			this.#allWindows[index].shape = shapeOfWindow; // обновляем данные о размерах окна

			if (this.#windowShapeChangeCallback) this.#windowShapeChangeCallback();
			this.updateWindowsLocalStorage();
		}
	}

	// метод получения размеров текущего окна
	getWindowShape() {
		let shapeOfWindow = { x: window.screenLeft, y: window.screenTop, w: window.innerWidth, h: window.innerHeight };
		return shapeOfWindow;
	}

	// метод получения индекса окна по его id
	getWindowIndexFromId(idWindow) {
		let index = -1;

		for (let i = 0; i < this.#allWindows.length; i++) {
			if (this.#allWindows[i].idWindow == idWindow) index = i;
		}

		return index;
	}

	// метод обновления данных об окнах в localstorage
	updateWindowsLocalStorage() {
		localStorage.setItem("allWindows", JSON.stringify(this.#allWindows));
	}

	// метод установки коллбэка изменения формы окон
	setShapeOfWindowChangeCallback(callback) {
		this.#windowShapeChangeCallback = callback;
	}

	// метод установки коллбэка изменения окон
	setWindowChangeCallback(callback) {
		this.#windowChangeCallback = callback;
	}

	// метод получения всех окон
	getWindows() {
		return this.#allWindows;
	}

	// метод получения данных о текущем окне
	getThisWindowData() {
		return this.#dataOfWindow;
	}

	// метод получения идентификатора текущего окна
	getThisWindowID() {
		return this.#idWindow;
	}
}

export default WindowManager;