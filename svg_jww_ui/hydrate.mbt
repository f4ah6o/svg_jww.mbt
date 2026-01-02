///|
/// Hydration module for svg_jww viewer
/// Provides client-side hydration for the viewer app using luna framework

///|
/// Parse boolean from JS object state
extern "js" fn js_get_bool(state : @js.Any, key : String) -> Bool =
  #|(s, k) => s && typeof s[k] == "boolean" ? s[k] : false

///|
/// Parse int from JS object state
extern "js" fn js_get_int(state : @js.Any, key : String) -> Int =
  #|(s, k) => s && typeof s[k] == "number" ? s[k] : 0

///|
/// Parse float from JS object state
extern "js" fn js_get_float(state : @js.Any, key : String) -> Double =
  #|(s, k) => s && typeof s[k] == "number" ? s[k] : 0.0

///|
/// Parse string from JS object state
extern "js" fn js_get_string(state : @js.Any, key : String) -> String =
  #|(s, k) => s && typeof s[k] == "string" ? s[k] : ""

///|
/// Hydrate the viewer app with event handlers
/// This function is called by the luna loader to attach event handlers
pub fn hydrate(el : @luna_dom.js_dom.Element, _state : @js.Any, _id : String) -> Unit {
  // Use island-based hydration
  @luna_dom.hydrate_island(el, _state, _id, fn(ctx) {
    // Create signals for toggle states
    let grid_sig = ctx.signal_bool("show_grid", false)
    let ruler_sig = ctx.signal_bool("show_ruler", false)
    let print_area_sig = ctx.signal_bool("show_print_area", false)

    // Bind actions from DOM (data-action-* attributes)
    ctx.bind_actions(fn(action) {
      match action {
        "toggle_grid" => grid_sig.update(fn(v) { !v })
        "toggle_ruler" => ruler_sig.update(fn(v) { !v })
        "toggle_print_area" => print_area_sig.update(fn(v) { !v })
        "zoom_in" => ()
        "zoom_out" => ()
        "fit" => ()
        "reset" => ()
        _ => ()
      }
    })

    // Update UI when signals change
    // Note: The actual DOM manipulation happens through the hydration system
  })
}

///|
/// Simple hydrate function for direct usage (without island context)
pub fn hydrate_simple(el : @luna_dom.js_dom.Element, state : @js.Any) -> Unit {
  // Parse initial state
  let show_grid = js_get_bool(state, "show_grid")
  let show_ruler = js_get_bool(state, "show_ruler")
  let show_print_area = js_get_bool(state, "show_print_area")

  // Create a simple reactive state
  let grid = { value: show_grid }
  let ruler = { value: show_ruler }
  let print_area = { value: show_print_area }

  // Bind actions from DOM
  @luna_dom.client.bind_actions_from_dom(el, fn(action) {
    match action {
      "toggle_grid" => grid.value = !grid.value
      "toggle_ruler" => ruler.value = !ruler.value
      "toggle_print_area" => print_area.value = !print_area.value
      _ => ()
    }
    // Trigger re-render if needed
    // In a real implementation, this would update the DOM
  })
}
