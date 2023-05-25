import * as THREE from "three";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import { Camera } from "./camera.js";
import { Controls } from "./Controls.js";
import { UI } from "./UI.js";
import { EventObject } from "./EventObject.js";

export class Engine {
  constructor() {
    this.scene = new THREE.Scene();
    window.scene = this.scene;
    window.THREE = THREE;
    this.scene.background = new THREE.Color(0xd9dbe8);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(
      document.body.clientWidth,
      document.body.clientHeight
    );
    this.objectsDict = {};
    this.camera = new Camera(this.scene, 16, 9, this.renderer);
    this.controls = new Controls(this, this.camera);
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
    document.addEventListener("contextmenu", (event) => event.preventDefault());
  }

  onWindowResize() {
    this.camera.currentCamera.aspect = window.innerWidth / window.innerHeight;
    this.camera.currentCamera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  loadModel(url, callback) {
    this.gltfLoader.load(
      url,
      (gltf) => {
        this.user_interface.hideLoading();
        this.scene.add(gltf.scene);
        if (callback) callback(gltf.scene);
      },
      (xhr) => {
        // console.log(xhr);
        // console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      (error) => {
        console.error("An error occurred:", error);
      }
    );
  }

  async loadFile(url) {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  }

  libObjectClickHandler(e) {
    document.querySelector(".library-container").classList.remove("active");
    const confirm_button = document.querySelector("#confirm_add");
    const modalDiv = document.querySelector("#object-add-modal");
    MicroModal.show("object-add-modal");
    // const obj = new EventObject(e.dataset.filename, this);
    confirm_button.addEventListener(
      "click",
      () => {
        const obj = new EventObject(
          e.dataset.filename,
          parseInt(document.querySelector("#numofchairs").value),
          this
        );
        MicroModal.close("object-add-modal");
        modalDiv.parentNode.removeChild(modalDiv);
      },
      { once: true }
    );
  }

  StartCollisionDetection(transformControl) {
    var collidingObject = null;

    transformControl.addEventListener("change", () => {
      if (!transformControl.object || !this.objectsDict) return;

      var objects = this.objectsDict;
      var collisionDetected = false;

      var movingObjectBox = new THREE.Box3().setFromObject(
        transformControl.object
      );
      console.log(objects);
      console.log(Object.keys(objects).length);

      for (var i = 0; i < Object.keys(objects).length; i++) {
        const object_key = Object.keys(objects)[i];
        console.log(object_key);
        console.log(objects[object_key]);
        if (objects[object_key].group !== transformControl.object) {
          var objectBox = new THREE.Box3().setFromObject(
            objects[object_key].group
          );

          if (movingObjectBox.intersectsBox(objectBox)) {
            collisionDetected = true;
            collidingObject = objects[object_key].group;
            break;
          }
        }
      }

      if (collisionDetected) {
        // Collision detected. Change all materials of all child objects.
        collidingObject.traverse(function (child) {
          if (child.isMesh && !child.userData.originalMaterial) {
            child.userData.originalMaterial = child.material;
            child.material = new THREE.MeshBasicMaterial({
              color: 0xff0000,
              opacity: 0.5,
              transparent: true,
            }); // Set new material with color red
            transformControl.object.position.set(0, 0, 0);
          }
        });
      } else if (collidingObject) {
        // Collision no longer detected. Restore original material of all child objects.
        collidingObject.traverse(function (child) {
          if (child.isMesh && child.userData.originalMaterial) {
            child.material = child.userData.originalMaterial;
            child.userData.originalMaterial = null;
          }
        });
        collidingObject = null;
      }
    });
  }

  start() {
    this.animate();
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.renderer.render(this.scene, this.camera.currentCamera);
  }
}
