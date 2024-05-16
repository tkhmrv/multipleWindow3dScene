class ObjectManager {
    constructor() {
        // инициализация объекта
    }

    createTorusKnot(i) {

        // параметры создаваемого тора
        const radius = 100;
        const tube = 30;
        const tubularSegments = 64;
        const radialSegments = 40;
        const p = 2;
        const q = 3;


        const material = new THREE.MeshNormalMaterial({ depthTest: true, depthWrite: true, wireframe: true, fog: false }); // создание материала тора
        const geometry = new THREE.TorusKnotGeometry(radius, tube, tubularSegments, radialSegments, p, q); // создание самого тора
        const torusKnot = new THREE.Mesh(geometry, material); // объединение в обект Mesh для записи в массив

        return torusKnot;
    }
}

export default ObjectManager;
