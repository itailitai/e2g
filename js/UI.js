const createButton = (
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

export class UI {
  constructor(engine) {
    this.engine = engine;
    this.objectLoading = this.createLoadingAnim();
    this.createLeftSidebar();
    this.createRightSidebar();
    this.createTopBar();
    this.createLibraryMenu();
  }

  createLeftSidebar() {
    const sidebar = document.createElement("div");
    sidebar.classList.add("leftsidebar");
    createButton(
      "move_mode",
      "../assets/icons/move_mode.png",
      "Move Mode",
      () => {
        this.engine.controls.enableMoveMode();
      },
      sidebar,
      true
    );
    createButton(
      "select_mode",
      "../assets/icons/select_mode.png",
      "Select Mode",
      () => this.engine.controls.enableSelectMode(),
      sidebar
    );

    createButton(
      "view_3d",
      "../assets/icons/3d_view.png",
      "3D View",
      () => this.engine.camera.set2DMode(false),
      sidebar
    );

    createButton(
      "view_2d",
      "../assets/icons/2d_view.png",
      "2D View",
      () => this.engine.camera.set2DMode(true),
      sidebar
    );

    document.body.appendChild(sidebar);
  }

  createRightSidebar() {
    const sidebar = document.createElement("div");
    sidebar.classList.add("rightsidebar");

    createButton(
      "library_button",
      "../assets/icons/library.png",
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
    const data = await this.engine.loadFile("../assets/objects.json");

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

      img.src = `../assets/objects_pics/${imageName}`;
      div.appendChild(img);

      // Create h4 element
      let h4 = document.createElement("h4");
      h4.textContent = item.guiname;
      div.appendChild(h4);
      div.addEventListener("click", () => {
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
}
