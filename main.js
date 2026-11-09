/*
 * Transparent — Windows 11 translucency for Obsidian.
 * Obsidian's built-in "Translucent window" setting is macOS-only; this applies
 * a native Windows 11 backdrop (acrylic / mica / tabbed) to the window instead.
 * Plain CommonJS, no build step.
 */
const { Plugin, PluginSettingTab, Setting, Notice } = require("obsidian");

const DEFAULTS = {
  material: "acrylic", // acrylic | mica | tabbed
  tint: 0.35,          // opacity of the dark layer behind the panes (0 = clear, 1 = solid)
};

module.exports = class TransparentPlugin extends Plugin {
  async onload() {
    this.settings = Object.assign({}, DEFAULTS, await this.loadData());
    this.addSettingTab(new TransparentSettingTab(this.app, this));
    this.addCommand({
      id: "toggle",
      name: "Toggle translucency",
      callback: () => (this.active ? this.disable() : this.enable()),
    });
    this.app.workspace.onLayoutReady(() => this.enable());
  }

  onunload() {
    this.disable();
  }

  get win() {
    // Obsidian exposes the current BrowserWindow (via @electron/remote) as a global.
    return window.electronWindow;
  }

  enable() {
    if (process.platform !== "win32") {
      new Notice("Transparent: only works on Windows. On macOS use Obsidian's own Translucent window setting.");
      return;
    }
    const win = this.win;
    if (!win || typeof win.setBackgroundMaterial !== "function") {
      new Notice("Transparent: this Obsidian/Electron version can't set a window backdrop.");
      return;
    }
    try {
      win.setBackgroundColor("#00000000");
      win.setBackgroundMaterial(this.settings.material);
      document.body.addClass("is-translucent", "transparent-on");
      this.applyTint();
      this.active = true;
    } catch (e) {
      console.error("Transparent: failed to enable", e);
      new Notice("Transparent: failed to enable — see the developer console.");
    }
  }

  disable() {
    const win = this.win;
    try {
      if (win && typeof win.setBackgroundMaterial === "function") {
        win.setBackgroundMaterial("none");
        win.setBackgroundColor("#1e1e1e");
      }
    } catch (e) {
      console.error("Transparent: failed to disable", e);
    }
    document.body.removeClass("is-translucent", "transparent-on");
    document.body.style.removeProperty("--transparent-tint");
    this.active = false;
  }

  applyTint() {
    document.body.style.setProperty("--transparent-tint", String(this.settings.tint));
  }

  async save() {
    await this.saveData(this.settings);
  }
};

class TransparentSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName("Backdrop material")
      .setDesc("Acrylic is blurry and see-through. Mica tints with your wallpaper colour. Tabbed is a stronger Mica.")
      .addDropdown((d) =>
        d
          .addOptions({ acrylic: "Acrylic", mica: "Mica", tabbed: "Tabbed" })
          .setValue(this.plugin.settings.material)
          .onChange(async (v) => {
            this.plugin.settings.material = v;
            await this.plugin.save();
            if (this.plugin.active) this.plugin.enable();
          })
      );

    new Setting(containerEl)
      .setName("Background tint")
      .setDesc("How dark the layer behind the panes is. Your theme or snippet controls the panes themselves.")
      .addSlider((s) =>
        s
          .setLimits(0, 1, 0.05)
          .setValue(this.plugin.settings.tint)
          .setDynamicTooltip()
          .onChange(async (v) => {
            this.plugin.settings.tint = v;
            this.plugin.applyTint();
            await this.plugin.save();
          })
      );
  }
}
