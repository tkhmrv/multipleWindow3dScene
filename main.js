import WindowManager from './WindowManager.js'
import ObjectManager from './ObjectManager.js';

let objectManager = new ObjectManager();

// инициализация переменных для работы с three.js
let camera, scene, renderer, world, windowManager;
//let near, far; // границы отсечения (используются, если не закомментированы)
let pixelResolution = window.devicePixelRatio ? window.devicePixelRatio : 1; // получение разрешения экрана в пикселях
let torusKnots = []; // массив для хранения торов
let sceneOffsetTarget = { x: 0, y: 0 }; // смещение сцены пользователем
let sceneOffsetActual = { x: 0, y: 0 }; // нынешнее смещение сцены
let isWindowInitialized = false;

// установка даты и времени, чтобы все окна работали одновременно
let currentDate = new Date();
currentDate.setHours(0);
currentDate.setMinutes(0);
currentDate.setSeconds(0);
currentDate.setMilliseconds(0);
currentDate = currentDate.getTime(); // преобразование в миллисекунды

// получаем время в секундах с начала дня
function getTime() {
	return (new Date().getTime() - currentDate) / 1000.0;
}

// Обработка параметра URL - если в url будет clear, то локальное хранилище очищается
if (new URLSearchParams(window.location.search).get("clear")) {
	localStorage.clear();
}
else {
	// код для того, чтобы избежать предварительной загрузки содержимого страницы некоторыми браузерами до перехода по url
	document.addEventListener("visibilitychange", () => {
		if (document.visibilityState != 'hidden' && !isWindowInitialized) {
			init();
		}
	});

	window.onload = () => {
		if (document.visibilityState != 'hidden') {
			init();
		}
	};

	// тут инициализируем
	function init() {
		isWindowInitialized = true;

		// тут добавлен небольшой таймаут, потому что иначе window.offsetX ругается на "неправильные значения"
		setTimeout(() => {
			setupScene(); // установка сцены
			setupWindowManager(); // инициализация менеджера окон
			resize(); // изменение размеров окна
			updateWindowShape(false); // обновление формы окна
			render(); // рендеринг сцены
			window.addEventListener('resize', resize); // обработчик изменения размеров окна
		}, 500)
	}

	// тут настраиваем сцену
	function setupScene() {
		camera = new THREE.OrthographicCamera(0, 0, window.innerWidth, window.innerHeight, -10000, 10000); // создание ортографической камеры

		camera.position.z = 2.5; // позиция камеры
		//near = camera.position.z - .5; // ближняя граница отсечения
		//far = camera.position.z + 0.5; // дальняя граница

		scene = new THREE.Scene(); // создание сцены
		scene.fog = new THREE.Fog(0x3f7b9d); // добавление тумана

		const light = new THREE.AmbientLight(0x000550);
		scene.add(light);

		scene.background = new THREE.Color(0x006057); // установка фона
		scene.add(camera); // добавления камеры

		renderer = new THREE.WebGLRenderer({ antialias: true, depthBuffer: true }); // создание рендера
		renderer.setPixelRatio(pixelResolution); // установка пискельного отношения

		world = new THREE.Object3D(); // создание объекта
		scene.add(world); // добавления объекта на сцену

		renderer.autoClear = false;
		renderer.setClearColor(0x000000, 0.0);
		//renderer.domElement.setAttribute("id", "scene"); // установка id для dom элемента
		document.getElementById('canvas').appendChild(renderer.domElement);
		document.body.appendChild(renderer.domElement); // добавление рендера в dom дерево
	}

	// тут настраиваем менеджер окон
	function setupWindowManager() {
		windowManager = new WindowManager(); // создание экземпляра
		windowManager.setShapeOfWindowChangeCallback(updateWindowShape); // коллбэк обновления формы окна
		windowManager.setWindowChangeCallback(updateNumberOftorusKnots); // коллбэк добавления/убавления окон

		// здесь у нас метаданные
		let metaData = { foo: "bar" };

		// инициализация метаданных
		windowManager.init(metaData);

		//windowManager.clearAllWindows(); // очистка массива со всеми окнами

		// обновление количества торов
		updateNumberOftorusKnots();
	}

	// обновление числа торов
	function updateNumberOftorusKnots() {
		let windows = windowManager.getWindows(); // получение списка окон

		// удаление всех торов
		torusKnots.forEach(torusKnot => world.remove(torusKnot));
		torusKnots = [];

		// создание новых торов по актуальному количеству окон
		for (let i = 0; i < windows.length; i++) {
			let window = windows[i];

			let torusKnot = objectManager.createTorusKnot()

			torusKnot.position.x = window.shape.x + (window.shape.w * .5);
			torusKnot.position.y = window.shape.y + (window.shape.h * .5);

			world.add(torusKnot);
			torusKnots.push(torusKnot);
		}
	}

	// обновление формы окна
	function updateWindowShape(easing = true) {

		// сохраняем фактический оффсет окна в прокси, который обновляется в функции рендеринга
		sceneOffsetTarget = { x: -window.screenX, y: -window.screenY };
		if (!easing) sceneOffsetActual = sceneOffsetTarget;
	}

	// рендеринг сцены
	function render() {
		let currentDate = getTime();

		windowManager.update(); // обновление состояния окон

		// расчет новой позиции на основе разницы между текущим и новым смещением с коэффициентом затухания (для создания плавности)
		let smoothIndex = .05;
		sceneOffsetActual.x = sceneOffsetActual.x + ((sceneOffsetTarget.x - sceneOffsetActual.x) * smoothIndex);
		sceneOffsetActual.y = sceneOffsetActual.y + ((sceneOffsetTarget.y - sceneOffsetActual.y) * smoothIndex);

		// установка позиции мира в смещение
		world.position.x = sceneOffsetActual.x;
		world.position.y = sceneOffsetActual.y;

		let windows = windowManager.getWindows(); // получение списка окон

		// проходим по всем торам и обновляем их позицию на основе актульной позиции окон
		for (let i = 0; i < torusKnots.length; i++) {
			let torusKnot = torusKnots[i];
			let window = windows[i];
			let _currentDate = currentDate + i * .5;

			let posTarget = { x: window.shape.x + (window.shape.w * .5), y: window.shape.y + (window.shape.h * .5) }

			torusKnot.position.x += (posTarget.x - torusKnot.position.x) * smoothIndex;
			torusKnot.position.y += (posTarget.y - torusKnot.position.y) * smoothIndex;
			torusKnot.rotation.x = _currentDate * .5;
			torusKnot.rotation.y = _currentDate * .3;
		};

		renderer.render(scene, camera);
		requestAnimationFrame(render);
	}

	// изменяем рендерер, чтобы он помещался в окно
	function resize() {
		let width = window.innerWidth;
		let height = window.innerHeight

		camera = new THREE.OrthographicCamera(0, width, 0, height, -10000, 10000);
		camera.updateProjectionMatrix();
		renderer.setSize(width, height);
	}
}