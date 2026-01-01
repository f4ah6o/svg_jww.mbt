///|
/// Menu Items - Toolbar menu item definitions

///|
/// Get toolbar menu items
pub fn toolbar_items(scale_percent : Int) -> Array[MenuItem] {
  [
    display(id="logo", label="JWW Viewer"),
    separator(),
    button(id="zoom_in", label="Zoom In", tooltip="Zoom In (Ctrl+)"),
    button(id="zoom_out", label="Zoom Out", tooltip="Zoom Out (Ctrl-)"),
    button(id="fit", label="Fit", tooltip="Fit to View (Ctrl+F)"),
    button(id="reset", label="Reset", tooltip="Reset View (Ctrl+R)"),
    spacer(),
    display(id="scale", label="Scale: " + scale_percent.to_string() + "%"),
  ]
}
