import * as THREE from "three";
import { TransformControls } from "three/addons/controls/TransformControls.js";

function findEventGroup(object) {
  let currentObject = object;

  while (currentObject !== null) {
    if (
      currentObject.type === "Group" &&
      currentObject.class === "eventGroup"
    ) {
      return currentObject;
    }

    currentObject = currentObject.parent;
  }

  return null; // Return null if no group with the name "eventGroup" is found
}

export class Controls {
  constructor(engine, camera) {
    this.camera = camera;
    this.engine = engine;
    this.renderer = engine.renderer;
    this.moveMode = true;
    this.selectMode = false;
    this.mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();

    // Create references to the bound functions
    this.boundOnDocumentClick = this.onObjectLeftClick.bind(this);
    this.boundOnObjectRightClick = this.onMouseDown.bind(this);
    this.boundOnMouseMove = this.camera.onMouseMove.bind(this.camera);
    this.boundHandleMouseScroll = this.camera.handleMouseScroll.bind(
      this.camera
    );

    this.highlightMeshes = [];
    this.highlightedObjects = {};

    // Add the event listeners
    this.engine.renderer.domElement.addEventListener(
      "mousedown",
      this.boundOnObjectRightClick
    );
    this.engine.renderer.domElement.addEventListener(
      "mousemove",
      this.boundOnMouseMove
    );
    this.engine.renderer.domElement.addEventListener(
      "wheel",
      this.boundHandleMouseScroll
    );
  }

  removeHighlight(object) {
    if (this.highlightMeshes.includes(object)) {
      // Remove the highlight mesh from the scene
      this.engine.scene.remove(object);
      this.highlightMeshes = this.highlightMeshes.filter(
        (item) => item !== object
      );
      delete this.highlightedObjects[object];
      return true;
    }
    return false;
  }

  addHighlight(object) {
    console.log(object);
    if (this.removeHighlight(object)) return;
    // Calculate the bounding box of the original object
    var boundingBox = new THREE.Box3().setFromObject(object);

    this.transformControls = new TransformControls(
      this.camera.currentCamera,
      this.engine.renderer.domElement
    );
    this.engine.scene.add(this.transformControls);
    this.engine.StartCollisionDetection(this.transformControls);
    this.transformControls.attach(object);
    // Compute the size of the bounding box
    var size = boundingBox.getSize(new THREE.Vector3());

    // Increase the size slightly
    size.x += 0.1; // Adjust these values as needed
    size.y += 0.1;
    size.z += 0.1;

    // Create a new box geometry based on the size
    var geometry = new THREE.BoxGeometry(size.x, size.y, size.z);

    // Create a yellow material
    var material = new THREE.MeshBasicMaterial({
      color: 0xffff00, // Yellow
      wireframe: true,
    });

    // Create a mesh with the geometry and material
    var highlightBox = new THREE.Mesh(geometry, material);

    // Position the highlight box at the same position as the original object
    highlightBox.position.copy(boundingBox.getCenter(new THREE.Vector3()));

    // Add the highlight box to the scene
    this.engine.scene.add(highlightBox);

    // Store the highlighted object and mesh for removal later
    this.highlightedObjects[highlightBox] = object;
    this.highlightMeshes.push(highlightBox);
  }

  onObjectLeftClick(event) {
    event.preventDefault();
    const size = 10;
    document.querySelector("#rotate_button").style.display = "flex";
    // this.engine.scene.add(axisHelper.axisGroup);
    // Calculate normalized device coordinates (NDC) from the mouse position
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Set the raycaster to originate from the camera and pass through the mouse position
    this.raycaster.setFromCamera(this.mouse, this.camera.currentCamera);

    // Check for intersections between the raycaster and the objects in the scene
    const intersects = this.raycaster.intersectObjects(
      this.engine.scene.children,
      true
    );

    if (intersects.length > 0) {
      // An object was clicked
      const clickedObject = findEventGroup(intersects[0].object);
      if (!clickedObject || clickedObject == this.transformControls) return;
      if (this.transformControls) {
        this.engine.scene.remove(this.transformControls);
        this.transformControls.dispose();
      }

      this.transformControls = new TransformControls(
        this.camera.currentCamera,
        this.engine.renderer.domElement
      );
      this.engine.StartCollisionDetection(this.transformControls);
      this.engine.scene.add(this.transformControls);
      this.transformControls.attach(clickedObject);

      // Add a yellow square around the clicked object
      // this.addHighlight(clickedObject);
    }
  }

  onMouseDown(event) {
    if (document.querySelector(".object-context-menu"))
      document
        .querySelector(".object-context-menu")
        .parentNode.removeChild(document.querySelector(".object-context-menu"));
    // Check the button property to determine which button was clicked
    if (event.button === 0) {
      // Left click

      this.camera.onMouseDown(event);
    } else if (event.button === 2) {
      // Right click
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      // Set the raycaster to originate from the camera and pass through the mouse position
      this.raycaster.setFromCamera(this.mouse, this.camera.currentCamera);

      // Check for intersections between the raycaster and the objects in the scene
      const intersects = this.raycaster.intersectObjects(
        this.engine.scene.children,
        true
      );

      if (intersects.length > 0) {
        // An object was clicked
        console.log(intersects[0].object);
        const clickedObject = findEventGroup(intersects[0].object);
        console.log(clickedObject);
        if (!clickedObject) return;
        this.engine.user_interface.createContextMenuAtObjectPosition(
          clickedObject
        );
      }
    }
  }

  enableSelectMode() {
    document.querySelectorAll(".leftsidebar div").forEach(function (div) {
      div.classList.remove("active");
    });
    if (this.transformControls && this.transformControls.mode === "rotate") {
      this.transformControls.mode = "translate";
      this.transformControls.showX = true;
      this.transformControls.showZ = true;
      return;
    }
    document.querySelector("#select_mode").classList.toggle("active");
    this.selectMode = true;
    this.moveMode = false;
    document.querySelector("canvas").style.cursor = "pointer";

    this.engine.renderer.domElement.addEventListener(
      "click",
      this.boundOnDocumentClick
    );
    // Remove the event listeners
    console.log(this.camera);
    this.camera.orbitControls.enabled = false;

    this.engine.renderer.domElement.removeEventListener(
      "mousedown",
      this.boundOnObjectRightClick
    );
    this.engine.renderer.domElement.removeEventListener(
      "mousemove",
      this.boundOnMouseMove
    );
    this.engine.renderer.domElement.removeEventListener(
      "wheel",
      this.boundHandleMouseScroll
    );
  }

  enableMoveMode() {
    document.querySelectorAll(".leftsidebar div").forEach(function (div) {
      div.classList.remove("active");
    });
    document.querySelector("#rotate_button").style.display = "none";
    if (this.transformControls) {
      this.engine.scene.remove(this.transformControls);
      this.transformControls.dispose();
    }
    document.querySelector("#move_mode").classList.toggle("active");
    this.selectMode = true;
    this.moveMode = false;
    this.camera.orbitControls.enabled = true;
    document.querySelector("canvas").style.cursor = "move";
    // Add the event listeners
    this.engine.renderer.domElement.addEventListener(
      "mousedown",
      this.boundOnObjectRightClick
    );
    this.engine.renderer.domElement.addEventListener(
      "mousemove",
      this.boundOnMouseMove
    );
    this.engine.renderer.domElement.addEventListener(
      "wheel",
      this.boundHandleMouseScroll
    );
    // Remove the event listeners
    this.engine.renderer.domElement.removeEventListener(
      "click",
      this.boundOnDocumentClick
    );
  }

  enableRotateMode() {
    document.querySelectorAll(".leftsidebar div").forEach(function (div) {
      div.classList.remove("active");
    });
    if (this.transformControls) {
      this.transformControls.mode = "rotate";
      this.transformControls.showX = false;
      this.transformControls.showZ = false;
      return;
    }
    document.querySelector("#rotate_button").classList.toggle("active");
    this.camera.orbitControls.enabled = false;
    document.querySelector("canvas").style.cursor = "move";
    // Add the event listeners
    // this.engine.renderer.domElement.removeEventListener(
    //   "click",
    //   this.boundOnDocumentClick
    // );
  }
}
