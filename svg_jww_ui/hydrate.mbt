///|
/// Hydration module for svg_jww viewer
/// Provides client-side hydration for the viewer app using luna framework

///|
/// Hydrate the viewer app with event handlers
/// This function is called by the luna loader to attach event handlers
pub fn hydrate(el : @js_core.Any, _state : @js_core.Any, _id : String) -> Unit {
  // Use island-based hydration
  @dom.hydrate_island(el, _state, _id, fn(ctx) {
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
        "print" => ()
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
