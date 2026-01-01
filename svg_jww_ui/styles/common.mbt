///|
/// Common Styles - Shared UI styling using Luna CSS Utilities

///|
/// Panel container style
pub fn panel_container() -> String {
  @css.styles([
    ("border", "1px solid #ccc"),
    ("border-radius", "4px"),
    ("overflow", "hidden"),
  ])
}

///|
/// Panel header style
pub fn panel_header() -> String {
  @css.styles([
    ("padding", "8px 12px"),
    ("background", "#f5f5f5"),
    ("border-bottom", "1px solid #ccc"),
    ("font-weight", "bold"),
    ("font-size", "14px"),
  ])
}

///|
/// Panel content style
pub fn panel_content() -> String {
  @css.styles([
    ("padding", "0"),
  ])
}

///|
/// Panel footer style
pub fn panel_footer() -> String {
  @css.styles([
    ("padding", "6px 12px"),
    ("background", "#f5f5f5"),
    ("border-top", "1px solid #ccc"),
    ("font-size", "12px"),
    ("color", "#666"),
  ])
}

///|
/// Button base style
pub fn button() -> String {
  @css.styles([
    ("padding", "4px 8px"),
    ("border", "1px solid #ccc"),
    ("background", "white"),
    ("cursor", "pointer"),
    ("border-radius", "3px"),
  ])
}

///|
/// Icon button style (square)
pub fn icon_button() -> String {
  @css.styles([
    ("width", "20px"),
    ("height", "20px"),
    ("border", "none"),
    ("background", "transparent"),
    ("cursor", "pointer"),
    ("font-size", "14px"),
  ])
}

///|
/// Toolbar style
pub fn toolbar() -> String {
  @css.styles([
    ("display", "flex"),
    ("align-items", "center"),
    ("gap", "8px"),
    ("padding", "8px 12px"),
    ("background", "#f5f5f5"),
    ("border-bottom", "1px solid #ccc"),
  ])
}

///|
/// Toolbar title style
pub fn toolbar_title() -> String {
  @css.styles([
    ("font-weight", "bold"),
    ("font-size", "16px"),
  ])
}

///|
/// Separator style
pub fn separator() -> String {
  @css.styles([
    ("color", "#999"),
  ])
}

///|
/// Info text style
pub fn info_text() -> String {
  @css.styles([
    ("font-size", "12px"),
    ("color", "#666"),
  ])
}

///|
/// Spacer style (flex: 1)
pub fn spacer() -> String {
  @css.styles([
    ("flex", "1"),
  ])
}

///|
/// Layer item style
pub fn layer_item() -> String {
  @css.styles([
    ("display", "flex"),
    ("align-items", "center"),
    ("gap", "8px"),
    ("padding", "4px 8px"),
    ("cursor", "pointer"),
  ])
}

///|
/// Layer name style
pub fn layer_name() -> String {
  @css.styles([
    ("flex", "1"),
    ("font-size", "13px"),
  ])
}

///|
/// Layer list style
pub fn layer_list() -> String {
  @css.styles([
    ("max-height", "300px"),
    ("overflow-y", "auto"),
  ])
}
