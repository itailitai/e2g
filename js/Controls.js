import * as THREE from "three";

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
    this.boundOnDocumentClick = this.onDocumentClick.bind(this);
    this.boundOnMouseDown = this.camera.onMouseDown.bind(this.camera);
    this.boundOnMouseMove = this.camera.onMouseMove.bind(this.camera);
    this.boundHandleMouseScroll = this.camera.handleMouseScroll.bind(
      this.camera
    );

    this.highlightMeshes = [];
    this.highlightedObjects = {};
    // Add the event listeners
    document.addEventListener("mousedown", this.boundOnMouseDown);
    document.addEventListener("mousemove", this.boundOnMouseMove);
    document.addEventListener("wheel", this.boundHandleMouseScroll);
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

  onDocumentClick(event) {
    event.preventDefault();

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
      const clickedObject = intersects[0].object;

      // Add a yellow square around the clicked object
      this.addHighlight(clickedObject);
    }
  }

  enableSelectMode() {
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
    document.removeEventListener("mousedown", this.boundOnMouseDown);
    document.removeEventListener("mousemove", this.boundOnMouseMove);
    document.removeEventListener("wheel", this.boundHandleMouseScroll);
  }

  enableMoveMode() {
    this.selectMode = true;
    this.moveMode = false;
    this.camera.orbitControls.enabled = true;
    document.querySelector("canvas").style.cursor = "move";
    // Add the event listeners
    document.addEventListener("mousedown", this.boundOnMouseDown);
    document.addEventListener("mousemove", this.boundOnMouseMove);
    document.addEventListener("wheel", this.boundHandleMouseScroll);
    // Remove the event listeners
    this.engine.renderer.domElement.removeEventListener(
      "click",
      this.boundOnDocumentClick
    );
  }
}
