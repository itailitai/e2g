import * as THREE from "three";
function generateRandomString(length) {
  let result = "";
  let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
export class EventObject {
  constructor(obj_filename, num_chairs, engine) {
    this.filename = obj_filename;
    this.group = new THREE.Group();
    this.group.name = obj_filename.slice(0, -4) + generateRandomString(6);
    this.group.class = "eventGroup";
    this.engine = engine;
    this.objectsArray = [];
    this.chairs = num_chairs;
    this.loadObjects(obj_filename, num_chairs);
  }

  loadObjects(obj_filename, num_chairs) {
    this.engine.objectsDict[this.group.name] = this;
    this.engine.loadModel(
      "assets/models/objects/" + obj_filename,
      (loadedTable) => {
        // Now you can use the loaded object
        this.group.add(loadedTable);
        this.engine.loadModel(
          "assets/models/objects/chair.glb",
          (loadedChair) => {
            // Now you can use the loaded object
            if (this.chairs >= 0)
              this.arrangeChairsAroundTable(
                loadedTable,
                loadedChair,
                num_chairs ? num_chairs : 0
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
    MicroModal.show("edit-modal");
    // const obj = new EventObject(e.dataset.filename, this);
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
  arrangeChairsAroundTable(table, chair, numChairs, margin = 0.1) {
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
      this.engine.scene.remove(chair);
      this.engine.scene.remove(table);
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
        this.group.add(newChair);
      }
    }
    this.engine.scene.add(this.group);
    this.engine.scene.remove(chair);
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
    this.group = new THREE.Group();
    this.group.name = this.filename.slice(0, -4);
    this.group.class = "eventGroup";
  }
}
