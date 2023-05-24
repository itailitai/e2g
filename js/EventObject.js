import * as THREE from "three";

export class EventObject {
  constructor(obj_filename, num_chairs, engine) {
    this.group = new THREE.Group();
    this.group.name = "eventGroup";
    this.engine = engine;
    this.objectsArray = [];
    this.chairs = num_chairs;
    this.engine.loadModel(
      "../assets/models/objects/" + obj_filename,
      (loadedTable) => {
        // Now you can use the loaded object
        this.group.add(loadedTable);
        this.engine.loadModel(
          "../assets/models/objects/chair.glb",
          (loadedChair) => {
            // Now you can use the loaded object
            if (this.chairs > 0)
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
}
