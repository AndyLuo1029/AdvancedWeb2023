class FrontSight {
    constructor(THREE){
        const frontSightGeometry = new THREE.CircleGeometry(0.002);
        const frontSightRingGeometry = new THREE.RingGeometry(0.005, 0.007, 32);
        const frontSightMaterial = new THREE.MeshBasicMaterial({color: 0x1aff00});
        const frontSight = new THREE.Mesh(frontSightGeometry, frontSightMaterial);
        const frontSightRing = new THREE.Mesh(frontSightRingGeometry, frontSightMaterial);
        frontSight.position.set(0, 0, -1);
        frontSightRing.position.set(0, 0, -1);
        this.frontSight = frontSight;
        this.frontSightRing = frontSightRing;
    }
}

export { FrontSight };