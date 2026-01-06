///|
test "debug overlay helpers render groups" {
  let bounds : Bounds = { min_x: 0.0, min_y: 0.0, max_x: 100.0, max_y: 50.0 }
  let padding = 20.0
  let opts = RenderOptions::with_bounds(
    bounds.max_x - bounds.min_x + padding * 2.0,
    bounds.max_y - bounds.min_y + padding * 2.0,
    bounds.max_y,
    padding,
  )
  let bounds_svg = render_debug_bounds(bounds, opts)
  let axes_svg = render_debug_axes(bounds, opts, padding)
  inspect(to_string(bounds_svg).contains("jww-debug-bounds"), content="true")
  inspect(to_string(axes_svg).contains("jww-debug-axes"), content="true")
}
