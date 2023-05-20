import * as THREE from "three";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import { Camera } from "./camera.js";
import { UI } from "./UI.js";
export class Engine {
  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xd9dbe8);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(
      document.body.clientWidth,
      document.body.clientHeight
    );
    this.camera = new Camera(this.scene, 16, 9, this.renderer);

    console.log(this.camera);
    document.body.appendChild(this.renderer.domElement);

    this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    this.directionalLight.position.set(0, 1, 0);
    this.scene.add(this.directionalLight);

    this.ambientLight = new THREE.AmbientLight(0x404040);
    this.scene.add(this.ambientLight);

    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath(
      "https://unpkg.com/three@0.152.2/examples/jsm/libs/draco/"
    );
    this.dracoLoader.setDecoderConfig({ type: "js" });

    this.gltfLoader = new GLTFLoader();
    this.gltfLoader.setDRACOLoader(this.dracoLoader);

    // Bind the onWindowResize function to the class instance
    this.onWindowResize = this.onWindowResize.bind(this);
    window.addEventListener("resize", this.onWindowResize, false);

    this.user_interface = new UI(this);
  }

  onWindowResize() {
    this.camera.currentCamera.aspect = window.innerWidth / window.innerHeight;
    this.camera.currentCamera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  loadModel(url) {
    this.gltfLoader.load(
      url,
      (gltf) => {
        this.user_interface.hideLoading();
        this.scene.add(gltf.scene);
      },
      (xhr) => {
        console.log(xhr);
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      (error) => {
        console.error("An error occurred:", error);
      }
    );
  }

  start() {
    this.animate();
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.renderer.render(this.scene, this.camera.currentCamera);
  }
}
