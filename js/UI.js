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
}
