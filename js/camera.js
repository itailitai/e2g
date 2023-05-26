import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import * as THREE from "three";

export class Camera {
  constructor(scene, width, height, renderer) {
    this.scene = scene;
    this.width = width;
    this.height = height;
    this.enableMouseDrag = true; // Flag to enable/disable mouse drag

    // Create a 2D orthographic camera
    this.camera2D = new THREE.OrthographicCamera(
      width / -2,
      width / 2,
      height / 2,
      height / -2,
      1,
      1000
    );
    this.camera2D.position.set(0, 10, 0);
    this.camera2D.rotation.x = -Math.PI / 2;
    this.camera2D.lookAt(0, 0, 0);
    this.initial2drot = this.camera2D.rotation;

    // Create a 3D perspective camera
    this.camera3D = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera3D.position.set(0, 10, 10);
    this.camera3D.lookAt(0, 0, 0);
    this.updateAspectRatio(width, height);
    this.orbitControls3D = new OrbitControls(
      this.camera3D,
      renderer.domElement
    );
    this.orbitControls2D = new OrbitControls(
      this.camera2D,
      renderer.domElement
    );

    this.orbitControls2D.enabled = true;
    this.orbitControls2D.enableRotate = false;
    this.orbitControls2D.enableZoom = true;
    this.orbitControls2D.minPolarAngle = -Math.PI; // Minimum angle (90 degrees)
    this.orbitControls2D.maxPolarAngle = -Math.PI; // Maximum angle (90 degrees)
    this.orbitControls2D.target.set(0, 0, 0);
    this.orbitControls2D.update();
    this.orbitControls2D.touches.ONE = THREE.TOUCH.PAN;
    this.orbitControls2D.touches.TWO = THREE.TOUCH.DOLLY_ROTATE;
    this.orbitControls2D.mouseButtons = {
      LEFT: THREE.MOUSE.PAN,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.ROTATE,
    };
    this.orbitControls3D.update();
    this.orbitControls2D.update();

    // Initialize the current camera as the 2D camera
    this.currentCamera = this.camera2D;
    this.is2DMode = true;
    this.mouseDragStart = new THREE.Vector2(); // Mouse drag start position
    this.cameraDragStart = new THREE.Vector3(); // Camera drag start position

    // Add the cameras to the scene
    this.scene.add(this.camera2D);
    this.scene.add(this.camera3D);
  }

  getCurrentOrbitControls() {
    if (this.currentCamera == this.camera2D) return this.orbitControls2D;
    else return this.orbitControls3D;
  }

  initCurrentOrbitControls() {
    if (this.currentCamera == this.camera2D) {
      // this.camera2D.position.set(0, 10, 0);
      this.camera2D.lookAt(0, 0, 0);
      this.orbitControls2D.enabled = true;
      this.orbitControls2D.enableRotate = false;
      this.orbitControls2D.enableZoom = true;
      this.orbitControls2D.minPolarAngle = -Math.PI; // Minimum angle (90 degrees)
      this.orbitControls2D.maxPolarAngle = -Math.PI; // Maximum angle (90 degrees)
      this.orbitControls2D.target.set(0, 0, 0);
      this.orbitControls2D.update();
    } else {
      this.orbitControls3D.enabled = true;
      this.orbitControls3D.update();
    }
  }

  // handleMouseScroll(event) {
  //   // Get the change in wheel position
  //   const delta = Math.sign(event.deltaY);

  //   // Adjust the camera's zoom level based on the scroll direction
  //   if (delta > 0) {
  //     // Zoom out
  //     this.currentCamera.zoom += 0.1;
  //   } else if (delta < 0) {
  //     // Zoom in
  //     this.currentCamera.zoom -= 0.1;
  //   }

  //   // Restrict the zoom level within a certain range
  //   this.currentCamera.zoom = Math.max(this.currentCamera.zoom, 0.2);
  //   this.currentCamera.zoom = Math.min(this.currentCamera.zoom, 2);

  //   // Update the camera's zoom and aspect ratio
  //   this.currentCamera.updateProjectionMatrix();
  // }

  // onMouseDown(event) {
  //   if (!this.enableMouseDrag) return;

  //   // Store the mouse drag start position and camera position
  //   this.mouseDragStart.set(event.clientX, event.clientY);
  //   this.cameraDragStart.copy(this.currentCamera.position);
  // }

  // onMouseMove(event) {
  //   if (!this.enableMouseDrag) return;

  //   if (event.buttons === 1) {
  //     // Check if the left mouse button is pressed
  //     const deltaX = event.clientX - this.mouseDragStart.x;
  //     const deltaY = event.clientY - this.mouseDragStart.y;

  //     // Calculate the camera's new position based on mouse movement
  //     const newCameraPosition = new THREE.Vector3()
  //       .copy(this.cameraDragStart)
  //       .add(new THREE.Vector3(deltaX / 100, 0, deltaY / 100));

  //     this.currentCamera.position.copy(newCameraPosition);
  //   }
  // }

  onMouseUp() {
    if (!this.enableMouseDrag) return;

    // Reset the mouse drag start position and camera drag start position
    this.mouseDragStart.set(0, 0);
    this.cameraDragStart.set(0, 0, 0);
  }

  set2DMode(enable2D) {
    if (enable2D && !this.is2DMode) {
      // Switch to 2D mode
      this.initCurrentOrbitControls();

      this.enableMouseDrag = true;

      this.currentCamera = this.camera2D;

      this.is2DMode = true;
    } else if (!enable2D && this.is2DMode) {
      // Switch to 3D mode
      this.camera3D.position.set(0, 10, 10);
      this.camera3D.lookAt(0, 0, 0);

      this.currentCamera = this.camera3D;

      this.is2DMode = false;
      this.enableMouseDrag = false;
    }
  }

  updateAspectRatio(width, height) {
    this.width = width;
    this.height = height;

    // Update the aspect ratio of both cameras
    Object.assign(this.camera2D, {
      left: width / -120,
      right: width / 120,
      top: height / 120,
      bottom: height / -120,
    });
    this.camera2D.updateProjectionMatrix();

    this.camera3D.aspect = width / height;
    this.camera3D.updateProjectionMatrix();
  }
}
