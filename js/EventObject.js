import * as THREE from "three";
function generateRandomString() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
export class EventObject {
  constructor(obj_filename, num_chairs, engine) {
    this.filename = obj_filename;
    this.group = new THREE.Group();
    this.group.name = obj_filename.slice(0, -4) + generateRandomString();
    this.group.class = "eventGroup";
    this.engine = engine;
    this.objectsArray = [];
    this.chairs = num_chairs;
    this.loadObjects(obj_filename, num_chairs);
    this.loadedTable;
    this.loadedChair;
  }

  loadObjects(obj_filename, num_chairs) {
    this.engine.objectsDict[this.group.name] = this;
    this.engine.loadModel(
      "assets/models/objects/" + obj_filename,
      (loadedTable) => {
        // Now you can use the loaded object
        this.loadedTable = loadedTable;
        this.group.add(loadedTable);
        this.engine.loadModel(
          "assets/models/objects/chair.glb",
          (loadedChair) => {
            this.loadedChair = loadedChair;
            // Now you can use the loaded object
            if (this.chairs >= 0)
              this.arrangeChairsAroundTable(
                loadedTable,
                loadedChair,
                num_chairs ? num_chairs : 0,
                0.1,
                this.engine.scene,
                this.group
              );
            else this.engine.scene.remove(loadedChair);
          }
        );
      }
    );
  }

  createObjectEditWindow() {
    document.body.appendChild(
      this.engine.user_interface.createModalContent(
        "עריכת שולחן",
        "בחר מספר כיסאות",
        "edit-modal"
      )
    );
    this.objectEditWindowHandler();
  }

  objectEditWindowHandler() {
    const confirm_button = document.querySelector("#confirm_add");
    const modalDiv = document.querySelector("#edit-modal");
    this.generatePreview(this.loadedTable, this.loadedChair, 0)
      .then((dataUrl) => {
        var img;
        // Create an img element
        if (!document.querySelector("#previewImage")) {
          img = document.createElement("img");
          img.id = "previewImage";
          img.style.width = "80%";
        } else {
          img = document.querySelector("#previewImage");
        }

        // Set the data URL as the source of the img
        img.src = dataUrl;

        // Append the img to the body of the document
        document
          .querySelector("#edit-modal .modal__container")
          .appendChild(img);
      })
      .catch((error) => {
        // Handle any errors that occurred while loading the model or generating the preview
        console.error("Error generating preview:", error);
      });
    MicroModal.show("edit-modal");
    // const obj = new EventObject(e.dataset.filename, this);
    document.querySelector("#numofchairs").addEventListener("change", () => {
      this.generatePreview(
        this.loadedTable,
        this.loadedChair,
        document.querySelector("#numofchairs").value
      )
        .then((dataUrl) => {
          document.querySelector("#previewImage").src = dataUrl;
        })
        .catch((error) => {
          // Handle any errors that occurred while loading the model or generating the preview
          console.error("Error generating preview:", error);
        });
    });
    confirm_button.addEventListener("click", () => {
      document
        .querySelector(".object-context-menu")
        .parentNode.removeChild(document.querySelector(".object-context-menu"));
      this.chairs = document.querySelector("#numofchairs").value;
      const init_pos = this.group.position;
      const init_rot = this.group.rotation;

      this.reset();

      this.loadObjects(this.filename, parseInt(this.chairs));
      console.log(init_pos.x, init_pos.y, init_pos.z);
      console.log(init_rot.x, init_rot.y, init_rot.z);
      this.group.position.set(init_pos.x, init_pos.y, init_pos.z);
      this.group.rotation.set(init_rot.x, init_rot.y, init_rot.z);
      MicroModal.close("edit-modal");
      modalDiv.parentNode.removeChild(modalDiv);
    });
  }

  arrangeChairsAroundTable = (
    table,
    chair,
    numChairs,
    margin = 0.1,
    scene = this.engine.scene,
    group
  ) => {
    if (!group) {
      console.log("test");
      group = new THREE.Group();
      group.add(table);
    }
    // Calculate table and chair dimensions
    let tableBox = new THREE.Box3().setFromObject(table);
    let chairBox = new THREE.Box3().setFromObject(chair);
    let tableSize = tableBox.getSize(new THREE.Vector3());
    let chairSize = chairBox.getSize(new THREE.Vector3());

    // Calculate space available on each side, then determine maximum chairs that can be placed
    let chairsPerSide = [
      Math.floor((tableSize.x - margin) / (chairSize.x + margin)),
      Math.floor((tableSize.z - margin) / (chairSize.z + margin)),
    ];

    // let chairsPerSide = [
    //   Math.ceil((tableSize.x - margin) / (chairSize.x + margin)),
    //   Math.ceil((tableSize.z - margin) / (chairSize.z + margin)),
    // ];

    let totalSpaces = 2 * (chairsPerSide[0] + chairsPerSide[1]);

    if (totalSpaces < numChairs) {
      scene.remove(chair);
      scene.remove(table);
      Swal.fire({
        title: "Error!",
        text: "Not enough space to place all chairs!",
        icon: "error",
        confirmButtonText: "Oops!",
      });

      return;
    }

    // Distribute chairs among the sides
    let remainingChairs = numChairs;
    let sideChairs = [0, 0, 0, 0];
    while (remainingChairs > 0) {
      for (let i = 0; i < 4 && remainingChairs > 0; i++) {
        if (i % 2 === 0 && sideChairs[i] < chairsPerSide[0]) {
          sideChairs[i]++;
          remainingChairs--;
        } else if (i % 2 === 1 && sideChairs[i] < chairsPerSide[1]) {
          sideChairs[i]++;
          remainingChairs--;
        }
      }
    }

    // Orientation for chairs on each side
    let orientations = [0, -Math.PI / 2, Math.PI, Math.PI / 2];
    // Position and orientation offsets
    let positions = [
      new THREE.Vector3(0, 0, -tableSize.z / 2 - chairSize.z / 2 - margin),
      new THREE.Vector3(tableSize.x / 2 + chairSize.x / 2 + margin, 0, 0),
      new THREE.Vector3(0, 0, tableSize.z / 2 + chairSize.z / 2 + margin),
      new THREE.Vector3(-tableSize.x / 2 - chairSize.x / 2 - margin, 0, 0),
    ];

    // Create chairs and position them around the table
    for (let side = 0; side < 4; side++) {
      for (let i = 0; i < sideChairs[side]; i++) {
        let newChair = chair.clone();
        newChair.position.copy(table.position);
        newChair.position.add(positions[side]);
        if (side % 2 == 0) {
          // North or South side
          newChair.position.x +=
            (i - sideChairs[side] / 2 + 0.5) * (chairSize.x + margin);
        } else {
          // East or West side
          newChair.position.z +=
            (i - sideChairs[side] / 2 + 0.5) * (chairSize.z + margin);
        }
        newChair.rotation.y = orientations[side]; // Make the chair face the table
        console.log("added chair");
        group.add(newChair);
      }
    }
    console.log(group);
    scene.add(group);
    scene.remove(chair);
  };

  // Function to generate a preview jpg
  generatePreview(table, chair, num_chairs, width = 800, height = 600) {
    console.log("generating, num of chairs: " + num_chairs);
    return new Promise((resolve, reject) => {
      // Create a WebGL renderer
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      renderer.setSize(width, height);

      // Create a perspective camera
      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.z = 3; // Move the camera back so we can view the model
      camera.position.y = 3;
      camera.lookAt(0, 0, 0);

      // Create a scene and add the model
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xaaaaaa);

      // Add some basic lighting
      scene.add(new THREE.AmbientLight(0x666666));
      const light = new THREE.DirectionalLight(0xffffff, 1);
      light.position.set(1, 1, 1);
      scene.add(light);
      this.arrangeChairsAroundTable(table, chair, num_chairs, 0.1, scene);

      // Render the scene
      renderer.render(scene, camera);

      // Convert the rendering to a JPEG data URL
      const dataUrl = renderer.domElement.toDataURL("image/jpeg", 0.85);
      console.log(dataUrl);
      // Resolve the promise with the data URL
      resolve(dataUrl);
    });
  }

  duplicate() {
    if (document.querySelector(".object-context-menu"))
      document
        .querySelector(".object-context-menu")
        .parentNode.removeChild(document.querySelector(".object-context-menu"));
    new EventObject(this.filename, this.chairs, this.engine);
  }
  destroy() {
    if (document.querySelector(".object-context-menu"))
      document
        .querySelector(".object-context-menu")
        .parentNode.removeChild(document.querySelector(".object-context-menu"));
    this.engine.scene.remove(this.group);
    delete this.engine.objectsDict[this.group.name];
    this.filename = null;
    this.group = null;
    this.engine = null;
    this.objectsArray = null;
    this.chairs = null;
    // If loadObjects is creating new objects, you might need to ensure they are also destroyed
    // but it's hard to say without seeing that code
  }

  reset() {
    this.engine.scene.remove(this.group);
    this.engine.scene.remove(this.chair);
    this.engine.scene.remove(this.table);
    delete this.engine.objectsDict[this.group.name];
    const oldname = this.group.name;
    this.group = new THREE.Group();
    this.group.name = oldname;
    this.group.class = "eventGroup";
  }
}
