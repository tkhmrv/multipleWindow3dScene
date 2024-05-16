class ObjectManager {
    constructor() {
        // инициализация объекта
    }

    createTorusKnot(i) {

        const radius = 100;
        const tube = 30;
        const tubularSegments = 64;
        const radialSegments = 40;
        const p = 2;
        const q = 3;

        const material = new THREE.MeshNormalMaterial({ depthTest: true, depthWrite: true, wireframe: true, fog: false });
        const geometry = new THREE.TorusKnotGeometry(radius, tube, tubularSegments, radialSegments, p, q);
        const torusKnot = new THREE.Mesh(geometry, material);

        return torusKnot;
    }
}

export default ObjectManager;
