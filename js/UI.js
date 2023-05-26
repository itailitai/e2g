import * as THREE from "three";

function addLongPressListener(element, callback, duration = 500) {
  let pressTimer;

  element.addEventListener(
    "touchstart",
    (event) => {
      // Start the timer
      pressTimer = setTimeout(() => {
        // Trigger the long press event here
        callback(event.touches[0]);
      }, duration);
    },
    false
  );

  element.addEventListener(
    "touchend",
    () => {
      // Stop the timer
      clearTimeout(pressTimer);
    },
    false
  );

  element.addEventListener(
    "touchmove",
    () => {
      // Stop the timer in case of a movement
      clearTimeout(pressTimer);
    },
    false
  );
}

export class UI {
  constructor(engine) {
    this.engine = engine;
    this.objectLoading = this.createLoadingAnim();
    this.createLeftSidebar();
    this.createRightSidebar();
    this.createTopBar();
    this.createLibraryMenu();
    addLongPressListener(
      this.engine.renderer.domElement,
      this.engine.controls.onMouseDown,
      300
    );
  }

  createButton = (
    id,
    imgSrc,
    tooltipContent,
    clickHandler,
    sidebar,
    active = false
  ) => {
    const button = document.createElement("div");
    button.id = id;
    button.classList.add("button");
    if (sidebar.classList.contains("rightsidebar")) {
      button.classList.add("dark");
    }

    const img = document.createElement("img");
    img.src = imgSrc;
    button.appendChild(img);
    if (active) button.classList.add("active");
    sidebar.appendChild(button);

    button.addEventListener("click", clickHandler);
    tippy(button, {
      content: tooltipContent,
      arrow: true,
      placement: "right",
    });
  };

  createLeftSidebar() {
    const sidebar = document.createElement("div");
    sidebar.className = "leftsidebar";
    const object_control_div = document.createElement("div");
    object_control_div.className = "object_control_section";
    sidebar.appendChild(object_control_div);
    this.createButton(
      "rotate_button",
      "assets/icons/rotate.png",
      "Rotate Object",
      () => {
        this.engine.controls.enableRotateMode();
      },
      object_control_div
    );
    this.createButton(
      "move_mode",
      "assets/icons/move_mode.png",
      "Move Object",
      () => {
        this.engine.controls.enableMoveMode();
      },
      sidebar,
      true
    );
    this.createButton(
      "select_mode",
      "assets/icons/select_mode.png",
      "Select Mode",
      () => this.engine.controls.enableSelectMode(),
      object_control_div
    );

    this.createButton(
      "view_3d",
      "assets/icons/3d_view.png",
      "3D View",
      () => this.engine.camera.set2DMode(false),
      sidebar
    );

    this.createButton(
      "view_2d",
      "assets/icons/2d_view.png",
      "2D View",
      () => this.engine.camera.set2DMode(true),
      sidebar
    );

    document.body.appendChild(sidebar);
  }

  createRightSidebar() {
    const sidebar = document.createElement("div");
    sidebar.classList.add("rightsidebar");

    this.createButton(
      "library_button",
      "assets/icons/library.png",
      "Library",
      () => {
        document.querySelector(".library-container").classList.toggle("active");
      },
      sidebar
    );
    document.body.appendChild(sidebar);
  }

  createTopBar() {
    const topBar = document.createElement("div");
    topBar.classList.add("topbar");
    // Customize top bar style and content as needed
    // Example: topBar.textContent = 'Top Bar Content';

    document.body.appendChild(topBar);
  }

  createLoadingAnim() {
    const loading = document.createElement("span");
    loading.className = "loader";
    document.body.append(loading);
    return loading;
  }

  hideLoading() {
    this.objectLoading.style.display = "none";
  }

  async createLibObjects(container) {
    const data = await this.engine.loadFile("assets/objects.json");

    data.forEach((item) => {
      // Create div element
      let div = document.createElement("div");
      div.className = "lib-object";
      // Add data-filename attribute
      div.setAttribute("data-filename", item.filename);

      // Create img element
      let img = document.createElement("img");

      // Assume filename is in format 'object.gbl'
      // So we change it to 'object.png'
      let imageName = item.filename.split(".").slice(0, -1).join(".") + ".png";

      img.src = `assets/objects_pics/${imageName}`;
      div.appendChild(img);

      // Create h4 element
      let h4 = document.createElement("h4");
      h4.textContent = item.guiname;
      div.appendChild(h4);
      div.addEventListener("click", () => {
        document.body.appendChild(
          this.createModalContent("הוספת שולחן", "בחר מספר כיסאות")
        );
        this.engine.libObjectClickHandler(div);
      });
      // Append the div to the body or other container
      container.appendChild(div);
    });
  }

  createLibraryMenu() {
    const container = document.createElement("div");
    container.className = "library-container";
    const lib_info = document.createElement("div");
    lib_info.className = "lib-info";
    const title = document.createElement("h3");
    title.innerHTML = "ספריה";
    const lib_objects_container = document.createElement("div");
    lib_objects_container.className = "lib-objects-container";
    lib_info.appendChild(title);
    container.appendChild(lib_info);
    container.appendChild(lib_objects_container);
    this.createLibObjects(lib_objects_container);
    document.body.append(container);
  }

  createContextMenuAtObjectPosition(object) {
    var camera = this.engine.camera.currentCamera;
    var renderer = this.engine.renderer;

    var vector = new THREE.Vector3();

    // translate object position to vector
    vector.setFromMatrixPosition(object.matrixWorld);

    // project vector to camera
    vector.project(camera);
    console.log(vector);
    // translate to normalized device coordinates
    vector.x = Math.round(((vector.x + 1) * renderer.domElement.width) / 2);
    vector.y = Math.round(((-vector.y + 1) * renderer.domElement.height) / 2);

    // create div
    var div = document.createElement("div");
    div.style.position = "absolute";
    div.style.top = vector.y + "px";
    div.style.left = vector.x + "px";
    div.style.width = "auto";
    div.style.minHeight = "100px";
    div.className = "object-context-menu";
    console.log("INFO:");
    console.log(this.engine.objectsDict);
    console.log(object.name);
    console.log(this.engine.objectsDict[object.name]);
    addContextMenuButton(
      "replace_obj_btn",
      "החלף אובייקט",
      this.engine.objectsDict[object.name],
      "edit"
    );
    addContextMenuButton(
      "edit_obj_btn",
      "ערוך אובייקט",
      this.engine.objectsDict[object.name],
      "edit"
    );
    addContextMenuButton(
      "copy_obj_btn",
      "העתק אובייקט",
      this.engine.objectsDict[object.name],
      "duplicate"
    );
    addContextMenuButton(
      "delete_obj_btn",
      "מחיקת אובייקט",
      this.engine.objectsDict[object.name],
      "remove"
    );

    document.body.appendChild(div);

    function addContextMenuButton(btn_id, btn_txt, object, operation) {
      document.querySelector(".library-container").classList.remove("active");
      var button = document.createElement("div");
      button.id = btn_id;
      button.innerHTML = btn_txt;
      switch (operation) {
        case "edit":
          button.addEventListener(
            "click",
            (e) => {
              object.createObjectEditWindow();
            },
            { once: true }
          );
          break;

        case "duplicate":
          button.addEventListener(
            "click",
            (e) => {
              object.duplicate();
            },
            { once: true }
          );
          break;
        case "remove":
          button.addEventListener(
            "click",
            (e) => {
              Swal.fire({
                title: "Confirmation",
                text: "Are you sure you want to delete this item?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, delete it!",
                cancelButtonText: "Cancel",
                allowOutsideClick: false,
              }).then((result) => {
                if (result.isConfirmed) {
                  // The user confirmed the deletion, perform the delete operation here
                  object.destroy();
                  Swal.fire(
                    "Deleted!",
                    "The item has been deleted.",
                    "success"
                  );
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                  // The user canceled the deletion
                  if (document.querySelector(".object-context-menu"))
                    document
                      .querySelector(".object-context-menu")
                      .parentNode.removeChild(
                        document.querySelector(".object-context-menu")
                      );
                }
              });
            },
            { once: true }
          );

        default:
          break;
      }

      div.appendChild(button);
    }
  }

  createModalContent(title, content, id = "object-add-modal") {
    const modalDiv = document.createElement("div");
    modalDiv.className = "modal micromodal-slide";
    modalDiv.id = id;
    modalDiv.setAttribute("aria-hidden", "true");

    const overlayDiv = document.createElement("div");
    overlayDiv.className = "modal__overlay";
    overlayDiv.setAttribute("tabindex", "-1");
    // overlayDiv.setAttribute("data-micromodal-close", "");

    const containerDiv = document.createElement("div");
    containerDiv.className = "modal__container";
    containerDiv.setAttribute("role", "dialog");
    containerDiv.setAttribute("aria-modal", "true");
    containerDiv.setAttribute("aria-labelledby", "object-add-modal-title");

    const headerDiv = document.createElement("header");
    headerDiv.className = "modal__header";

    const titleH2 = document.createElement("h2");
    titleH2.className = "modal__title";
    titleH2.id = "object-add-modal-title";
    titleH2.textContent = title;

    const closeButton = document.createElement("button");
    closeButton.className = "modal__close";
    closeButton.setAttribute("aria-label", "Close modal");
    closeButton.setAttribute("data-micromodal-close", "");
    closeButton.onclick = () => {
      modalDiv.parentNode.removeChild(modalDiv);
    };
    const mainDiv = document.createElement("main");
    mainDiv.className = "modal__content";
    mainDiv.id = "object-add-modal-content";

    const paragraph = document.createElement("p");
    paragraph.textContent = content;

    const input = document.createElement("input");
    input.type = "number";
    input.id = "numofchairs";
    input.value = "0";
    input.setAttribute("min", "0");

    const footerDiv = document.createElement("footer");
    footerDiv.className = "modal__footer";

    const addButton = document.createElement("button");
    addButton.id = "confirm_add";
    addButton.className = "modal__btn modal__btn-primary";
    addButton.textContent = "הוסף";

    const cancelButton = document.createElement("button");
    cancelButton.className = "modal__btn";
    cancelButton.setAttribute("data-micromodal-close", "");
    cancelButton.setAttribute("aria-label", "Close this dialog window");
    cancelButton.textContent = "ביטול";
    cancelButton.onclick = () => {
      modalDiv.parentNode.removeChild(modalDiv);
    };

    // Build the HTML structure
    headerDiv.appendChild(titleH2);
    headerDiv.appendChild(closeButton);

    mainDiv.appendChild(paragraph);
    mainDiv.appendChild(input);

    footerDiv.appendChild(addButton);
    footerDiv.appendChild(cancelButton);

    containerDiv.appendChild(headerDiv);
    containerDiv.appendChild(mainDiv);
    containerDiv.appendChild(footerDiv);

    overlayDiv.appendChild(containerDiv);

    modalDiv.appendChild(overlayDiv);

    return modalDiv;
  }
}
