///|
/// Hydration module for svg_jww viewer
/// Provides client-side hydration for the viewer app using luna framework

///|
/// Hydrate the viewer app with event handlers
/// This function is called by the luna loader to attach event handlers
pub fn hydrate(el : @luna_dom.js_dom.Element, _state : @js.Any, _id : String) -> Unit {
  // Use island-based hydration
  @luna_dom.hydrate_island(el, _state, _id, fn(ctx) {
    // Create signals for toggle states
    let grid_sig = @signal.signal(false)
    let ruler_sig = @signal.signal(false)
    let print_area_sig = @signal.signal(false)

    // Bind actions from DOM (data-action-* attributes)
    ctx.bind_actions(fn(action) {
      match action {
        "toggle_grid" => grid_sig.set(!grid_sig.get())
        "toggle_ruler" => ruler_sig.set(!ruler_sig.get())
        "toggle_print_area" => print_area_sig.set(!print_area_sig.get())
        "zoom_in" => ()
        "zoom_out" => ()
        "fit" => ()
        "reset" => ()
        _ => ()
      }
    })

    // Update UI when signals change
    ctx.on_update(".toggle-grid", fn() {
      if grid_sig.get() { "active" } else { "" }
    })
    ctx.on_update(".toggle-ruler", fn() {
      if ruler_sig.get() { "active" } else { "" }
    })
    ctx.on_update(".toggle-print-area", fn() {
      if print_area_sig.get() { "active" } else { "" }
    })
  })
}

///|
/// Simple hydrate function for direct usage (without island context)
pub fn hydrate_simple(el : @luna_dom.js_dom.Element, _state : @js.Any) -> Unit {
  // Bind actions from DOM using client.bind_actions_from_dom
  @luna_dom.client.bind_actions_from_dom(el, fn(action) {
    // Handle actions
    let _ = action
    // Trigger re-render if needed
    // In a real implementation, this would update the DOM
  })
}
