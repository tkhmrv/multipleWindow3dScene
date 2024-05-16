class Particle {
    constructor(position, color) {
        this.position = position; // начальная позиция частицы
        this.color = color; // цвет частицы
        this.velocity = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, 0); // начальная скорость движения частицы
    }

    // метод для обновления положения частицы
    update() {
        this.position.add(this.velocity); // обновляем положение частицы с учетом скорости
    }
}

export default Particle;
