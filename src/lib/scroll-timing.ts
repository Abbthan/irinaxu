// One shared multiplier keeps every scroll-linked part of the prologue in
// sync. Dividing the original distances by 1.5 makes the choreography
// advance 50% faster for the same physical wheel/trackpad movement.
export const SCROLL_SPEED_MULTIPLIER = 1.5;

export const SCENE_SCROLL_VH = 320 / SCROLL_SPEED_MULTIPLIER;
// A sticky track always includes one non-scrolling viewport. Scale only its
// 470vh scrollable portion, then add that fixed viewport back; otherwise the
// wheat curtain would enter too early relative to the accelerated scene.
export const SCENE_TRACK_VH = 100 + (570 - 100) / SCROLL_SPEED_MULTIPLIER;
export const SCENE_CURTAIN_OVERLAP_VH = 252.4 / SCROLL_SPEED_MULTIPLIER;
export const TITLE_TRANSITION_VH = 16 / SCROLL_SPEED_MULTIPLIER;
