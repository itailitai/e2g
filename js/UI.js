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
    const view_3d = document.createElement("div");
    const img_3d = document.createElement("img");
    img_3d.src = "assets/icons/3d_view.png";
    view_3d.appendChild(img_3d);
    view_3d.classList.add("button");
    view_3d.id = "view_3d";
    const view_2d = document.createElement("div");
    view_2d.id = "view_2d";
    view_2d.classList.add("button");
    const img_2d = document.createElement("img");
    img_2d.src = "assets/icons/2d_view.png";
    view_2d.appendChild(img_2d);
    sidebar.classList.add("leftsidebar");
    // Customize sidebar style and content as needed
    // Example: sidebar.textContent = 'Sidebar Content';
    sidebar.appendChild(view_3d);
    sidebar.appendChild(view_2d);
    document.body.appendChild(sidebar);

    view_3d.addEventListener("click", () => {
      this.engine.camera.set2DMode(false);
    });
    view_2d.addEventListener("click", () => {
      this.engine.camera.set2DMode(true);
    });
    tippy(view_2d, {
      content: "2D View",
      arrow: true,
      placement: "right",
    });
    tippy(view_3d, {
      content: "3D View",
      arrow: true,
      placement: "right",
    });
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
