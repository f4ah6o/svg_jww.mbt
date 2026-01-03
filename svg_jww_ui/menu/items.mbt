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

///|
/// Get toolbar menu items with toggles (includes grid, ruler, print area)
pub fn toolbar_items_with_toggles(
  scale_percent : Int,
  show_grid : Bool,
  show_ruler : Bool,
  show_print_area : Bool,
) -> Array[MenuItem] {
  [
    display(id="logo", label="JWW Viewer"),
    separator(),
    button(id="zoom_in", label="Zoom In", tooltip="Zoom In (Ctrl+)"),
    button(id="zoom_out", label="Zoom Out", tooltip="Zoom Out (Ctrl-)"),
    button(id="fit", label="Fit", tooltip="Fit to View (Ctrl+F)"),
    button(id="reset", label="Reset", tooltip="Reset View (Ctrl+R)"),
    spacer(),
    toggle(
      id="toggle_grid",
      label="Grid",
      active=show_grid,
      tooltip="Toggle Grid Display",
    ),
    toggle(
      id="toggle_ruler",
      label="Ruler",
      active=show_ruler,
      tooltip="Toggle Ruler Display",
    ),
    toggle(
      id="toggle_print_area",
      label="Print Area",
      active=show_print_area,
      tooltip="Toggle Print Area Display",
    ),
    button(id="print", label="Print", tooltip="Print (Ctrl+P)"),
    spacer(),
    display(id="scale", label="Scale: " + scale_percent.to_string() + "%"),
  ]
}
