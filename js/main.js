// import { OrbitControls } from "three/addons/controls/OrbitControls.js";
// Import necessary modules
import { Engine } from "./Engine.js";

const engine = new Engine();
engine.loadModel("./assets/models/hall.glb");
engine.start();
