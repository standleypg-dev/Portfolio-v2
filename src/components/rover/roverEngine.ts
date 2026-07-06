// Pure, framework-free moon-rover toy: terrain shape, rover kinematics,
// dust particles, and canvas draw routines. All units are CSS pixels;
// callers pre-scale the context for devicePixelRatio.

export type Terrain = {
  width: number;
  height: number;
  stripTop: number;
  stripHeight: number;
  heightAt: (x: number) => number;
  slopeAt: (x: number) => number;
};

export type RoverLevel = 0 | 1 | 2 | 3 | 4;

export type RoverState = {
  x: number;
  vx: number;
  y: number;
  vy: number;
  onGround: boolean;
  tilt: number;
  squash: number;
  facing: 1 | -1;
  dustTimer: number;
  thrusting: boolean;
  downThrusting: boolean;
  level: RoverLevel;
  // Set true when the rover is spawned above the canvas so the CEILING
  // clamp doesn't snap it back into view before it can fall in. Cleared
  // on the first ground contact; the ceiling behaves normally afterward.
  spawnFall: boolean;
};

export type RoverInput = {
  left: boolean;
  right: boolean;
  thrust: boolean;
  // Downward thrust — only respected at level 4 (Nova). Held ArrowDown
  // still gets preventDefault'd at every level so the page can't scroll.
  down: boolean;
};

export type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  kind: "dust" | "exhaust";
};

export type RoverPalette = {
  terrain: string;
  rim: string;
  speckle: string;
  body: string;
  accent: string;
  wheel: string;
  dust: string;
  exhaust: string;
  headlight: string | null;
};

const TAU = Math.PI * 2;

const ACCEL = 560;
const FRICTION = 2.8;
// Rolling resistance while coasting is much lower, so the rover glides and
// rolls downhill into dips instead of stopping dead on an incline.
const ROLL_FRICTION = 0.8;
const AIR_FRICTION = 1.1;
const FLAT_GRADE = 0.06;
const MAX_V = 220;
// Lunar gravity: floaty ascents and descents, with slow bouncy landings.
const FLY_GRAVITY = 60;
const FALL_GRAVITY = 87;
const THRUST = FALL_GRAVITY * 1.5;
const MAX_VY = 260;
const CEILING = 24;
const BOUNCE_RESTITUTION = 0.5;
const BOUNCE_MIN_IMPACT = 50;
const DUST_GRAVITY = 220;
const MAX_PARTICLES = 60;

export const WHEEL_BASE = 26;
export const WHEEL_RADIUS = 5;
export const RIDE_HEIGHT = 13;

// Temporary-booster multipliers unlocked by shattering stars — kept gentle
// (peak 1.5x) so the rover never rockets so fast the eye can't follow.
const LEVEL_MULT: Array<{
  accel: number;
  thrust: number;
  maxV: number;
  maxVy: number;
}> = [
  { accel: 1.0, thrust: 1.0, maxV: 1.0, maxVy: 1.0 },
  { accel: 1.12, thrust: 1.1, maxV: 1.1, maxVy: 1.05 },
  { accel: 1.24, thrust: 1.2, maxV: 1.2, maxVy: 1.1 },
  { accel: 1.36, thrust: 1.3, maxV: 1.3, maxVy: 1.15 },
  { accel: 1.5, thrust: 1.4, maxV: 1.4, maxVy: 1.2 },
];

// Fixed phases and crater placements keep the terrain deterministic; the
// integer sine frequencies make it tile seamlessly so the rover can wrap.
const CRATERS = [
  { c: 0.22, depth: 0.10, w: 0.020 },
  { c: 0.55, depth: 0.15, w: 0.028 },
  { c: 0.80, depth: 0.08, w: 0.016 },
];

// The terrain occupies a strip at the bottom of the (full-hero) canvas so
// the rover has the whole hero to fly around in.
export function createTerrain(
  width: number,
  height: number,
  stripHeight: number,
): Terrain {
  const stripTop = height - stripHeight;
  const baseY = stripTop + stripHeight * 0.55;
  const amplitude = stripHeight * 0.16;

  const heightAt = (x: number) => {
    const u = (((x % width) + width) % width) / width;
    const bumps =
      0.5 * Math.sin(TAU * 3 * u + 1.7) +
      0.3 * Math.sin(TAU * 7 * u + 4.2) +
      0.2 * Math.sin(TAU * 13 * u + 2.9);
    let y = baseY + bumps * amplitude;
    for (const crater of CRATERS) {
      const du = u - crater.c;
      y +=
        crater.depth * stripHeight *
        Math.exp(-(du * du) / (crater.w * crater.w));
    }
    return y;
  };

  const slopeAt = (x: number) => (heightAt(x + 3) - heightAt(x - 3)) / 6;

  return { width, height, stripTop, stripHeight, heightAt, slopeAt };
}

export function createRoverState(
  terrain: Terrain,
  spawn: "ground" | "sky" = "ground",
): RoverState {
  const x = terrain.width * 0.3;
  const airborne = spawn === "sky";
  return {
    x,
    vx: 0,
    y: airborne ? -20 : terrain.heightAt(x) - RIDE_HEIGHT,
    vy: 0,
    onGround: !airborne,
    tilt: 0,
    squash: 0,
    facing: 1,
    dustTimer: 0,
    thrusting: false,
    downThrusting: false,
    level: 0,
    spawnFall: airborne,
  };
}

function spawnParticle(
  particles: Particle[],
  x: number,
  y: number,
  vx: number,
  vy: number,
  kind: "dust" | "exhaust",
) {
  if (particles.length >= MAX_PARTICLES) return;
  const maxLife =
    kind === "exhaust" ? 0.3 + Math.random() * 0.25 : 0.45 + Math.random() * 0.4;
  particles.push({
    x,
    y,
    vx,
    vy,
    life: maxLife,
    maxLife,
    size: 1 + Math.random() * 1.6,
    kind,
  });
}

function burst(
  particles: Particle[],
  x: number,
  y: number,
  count: number,
  spread: number,
) {
  for (let i = 0; i < count; i++) {
    spawnParticle(
      particles,
      x + (Math.random() - 0.5) * 8,
      y - Math.random() * 3,
      (Math.random() - 0.5) * spread,
      -(20 + Math.random() * 70),
      "dust",
    );
  }
}

// Advances the rover one frame: drives on the ground, and holding thrust
// rockets it into the air; letting go coasts it back down to a landing.
export function stepRover(
  state: RoverState,
  input: RoverInput,
  terrain: Terrain,
  particles: Particle[],
  dt: number,
) {
  const mult = LEVEL_MULT[state.level] ?? LEVEL_MULT[0];
  const accel = ACCEL * mult.accel;
  const thrust = THRUST * mult.thrust;
  const maxV = MAX_V * mult.maxV;
  const maxVy = MAX_VY * mult.maxVy;

  if (input.left) {
    state.vx -= accel * dt;
    state.facing = -1;
  }
  if (input.right) {
    state.vx += accel * dt;
    state.facing = 1;
  }

  // Gravity pulls the rover along the grade it stands on, so it rolls
  // downhill and comes to rest at the bottom of dips, not mid-slope.
  const grade = state.onGround ? terrain.slopeAt(state.x) : 0;
  if (state.onGround) {
    state.vx += (grade / Math.hypot(1, grade)) * FALL_GRAVITY * dt;
  }

  const driving = input.left || input.right;
  const friction =
    state.onGround && !input.thrust
      ? driving
        ? FRICTION
        : ROLL_FRICTION
      : AIR_FRICTION;
  state.vx *= Math.exp(-friction * dt);
  state.vx = Math.max(-maxV, Math.min(maxV, state.vx));
  if (Math.abs(state.vx) < 0.5 && !driving && Math.abs(grade) < FLAT_GRADE) {
    state.vx = 0;
  }

  state.x = ((state.x + state.vx * dt) % terrain.width + terrain.width) %
    terrain.width;

  const rearY = terrain.heightAt(state.x - WHEEL_BASE / 2);
  const frontY = terrain.heightAt(state.x + WHEEL_BASE / 2);
  const groundY = (rearY + frontY) / 2 - RIDE_HEIGHT;
  const targetTilt = Math.atan2(frontY - rearY, WHEEL_BASE);

  // Down thrust is a Nova-only trick; up thrust always wins if both keys
  // are held so the rover never fights itself in mid-air.
  const downActive =
    input.down && state.level === 4 && !input.thrust && !state.onGround;
  state.thrusting = input.thrust;
  state.downThrusting = downActive;

  if (input.thrust) {
    if (state.onGround) {
      // Liftoff: kick up a bit of dust.
      state.onGround = false;
      state.dustTimer = 0;
      burst(particles, state.x, state.y + RIDE_HEIGHT, 4, 60);
    }
    state.vy -= thrust * dt;

    // Exhaust puffs streaming out below the rocket flame.
    state.dustTimer -= dt;
    while (state.dustTimer < 0) {
      state.dustTimer += 1 / 40;
      spawnParticle(
        particles,
        state.x + (Math.random() - 0.5) * 6,
        state.y + 10,
        -state.vx * 0.15 + (Math.random() - 0.5) * 50,
        90 + Math.random() * 80,
        "exhaust",
      );
    }
  } else if (downActive) {
    // Gentle downward burn: half-strength jet with exhaust venting *up*
    // from the top of the rover.
    state.vy += thrust * 0.55 * dt;
    state.dustTimer -= dt;
    while (state.dustTimer < 0) {
      state.dustTimer += 1 / 40;
      spawnParticle(
        particles,
        state.x + (Math.random() - 0.5) * 5,
        state.y - 14,
        -state.vx * 0.15 + (Math.random() - 0.5) * 40,
        -(70 + Math.random() * 50),
        "exhaust",
      );
    }
  }

  if (state.onGround) {
    state.y = groundY;
    state.tilt += (targetTilt - state.tilt) * Math.min(1, 12 * dt);

    // Rolling dust kicked up behind the wheels.
    if (Math.abs(state.vx) > 50) {
      const rate = 12 + (Math.abs(state.vx) / maxV) * 24;
      state.dustTimer -= dt;
      while (state.dustTimer < 0) {
        state.dustTimer += 1 / rate;
        spawnParticle(
          particles,
          state.x - state.facing * WHEEL_BASE * 0.5,
          state.y + RIDE_HEIGHT - 2,
          -state.facing * (25 + Math.random() * 45),
          -(15 + Math.random() * 55),
          "dust",
        );
      }
    } else {
      state.dustTimer = 0;
    }
  } else {
    state.vy += (input.thrust ? FLY_GRAVITY : FALL_GRAVITY) * dt;
    state.vy = Math.max(-maxVy, Math.min(maxVy, state.vy));
    state.y += state.vy * dt;

    // Ceiling clamp is disabled during the intro spawn-fall so the rover
    // can genuinely drop in from off-screen; it re-arms on first landing.
    if (!state.spawnFall && state.y < CEILING) {
      state.y = CEILING;
      state.vy = Math.max(state.vy, 0);
    }
    if (state.vy > 0 && state.y >= groundY) {
      state.y = groundY;
      const impact = state.vy;
      state.squash = Math.min(1, impact / 250);
      state.spawnFall = false;
      if (impact > BOUNCE_MIN_IMPACT && !input.thrust) {
        // Low gravity: a hard landing rebounds a few decaying bounces.
        state.vy = -impact * BOUNCE_RESTITUTION;
        burst(particles, state.x, state.y + RIDE_HEIGHT, 4, 90);
      } else {
        state.vy = 0;
        state.onGround = true;
        if (impact > 100) {
          burst(particles, state.x, state.y + RIDE_HEIGHT, 6, 100);
        }
      }
    } else {
      // Lean into the direction of travel while airborne.
      const lean = Math.max(-1, Math.min(1, state.vx / maxV)) * 0.22;
      state.tilt += (lean - state.tilt) * Math.min(1, 5 * dt);
    }
  }

  state.squash = Math.max(0, state.squash - 6 * dt);
}

export function stepParticles(particles: Particle[], dt: number) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.life -= dt;
    if (p.life <= 0) {
      particles.splice(i, 1);
      continue;
    }
    p.vy += DUST_GRAVITY * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
  }
}

export function isRoverIdle(
  state: RoverState,
  input: RoverInput,
  particles: Particle[],
) {
  return (
    !input.left &&
    !input.right &&
    !input.thrust &&
    !input.down &&
    !state.thrusting &&
    !state.downThrusting &&
    state.onGround &&
    state.vx === 0 &&
    state.squash === 0 &&
    particles.length === 0
  );
}

// Renders the terrain silhouette (with rim light and speckles) into a
// strip-sized offscreen buffer (coordinates relative to stripTop), blitted
// at the bottom of the main canvas every frame.
export function drawTerrain(
  ctx: CanvasRenderingContext2D,
  terrain: Terrain,
  palette: RoverPalette,
) {
  const { width, stripTop, stripHeight } = terrain;
  const surfaceAt = (x: number) => terrain.heightAt(x) - stripTop;
  ctx.clearRect(0, 0, width, stripHeight);

  ctx.beginPath();
  ctx.moveTo(0, surfaceAt(0));
  for (let x = 2; x <= width; x += 2) {
    ctx.lineTo(x, surfaceAt(x));
  }
  ctx.lineTo(width, stripHeight);
  ctx.lineTo(0, stripHeight);
  ctx.closePath();
  ctx.fillStyle = palette.terrain;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(0, surfaceAt(0));
  for (let x = 2; x <= width; x += 2) {
    ctx.lineTo(x, surfaceAt(x));
  }
  ctx.strokeStyle = palette.rim;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Sparse speckles below the surface for a dusty regolith feel;
  // seeded LCG keeps them stable across redraws.
  let seed = 42;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0xffffffff;
  };
  ctx.fillStyle = palette.speckle;
  const speckles = Math.floor(width / 18);
  for (let i = 0; i < speckles; i++) {
    const x = rand() * width;
    const surface = surfaceAt(x);
    const y = surface + 4 + rand() * (stripHeight - surface - 6);
    if (y >= stripHeight) continue;
    const r = 0.6 + rand() * 1;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
  }
}

export function drawParticles(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  palette: RoverPalette,
) {
  ctx.save();
  for (const p of particles) {
    ctx.fillStyle = p.kind === "exhaust" ? palette.exhaust : palette.dust;
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife) * 0.8;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

function drawRoverBody(
  ctx: CanvasRenderingContext2D,
  state: RoverState,
  palette: RoverPalette,
) {
  ctx.save();
  ctx.translate(state.x, state.y);
  ctx.rotate(state.tilt);
  ctx.scale(
    (1 + 0.2 * state.squash) * state.facing,
    1 - 0.25 * state.squash,
  );

  const level = state.level;
  const now = performance.now();

  // Level 4 halo: soft aurora sitting *behind* everything else, so the body
  // sits inside a warm glow rather than obscuring the pulse.
  if (level === 4) {
    const pulse = 0.55 + 0.45 * Math.sin(now * 0.006);
    const halo = ctx.createRadialGradient(0, -3, 3, 0, -3, 30);
    halo.addColorStop(0, `rgba(251,191,36,${0.5 * pulse})`);
    halo.addColorStop(0.55, `rgba(59,130,246,${0.25 * pulse})`);
    halo.addColorStop(1, "rgba(59,130,246,0)");
    ctx.fillStyle = halo;
    ctx.fillRect(-34, -34, 68, 46);
  }

  // Rocket flame under the body while thrusting: a flickering gradient
  // teardrop, drawn first so the body and wheels sit on top of it. Higher
  // levels stretch it a little longer and tint it a hair brighter.
  if (state.thrusting) {
    const boost = 1 + level * 0.12;
    const len = (12 + Math.random() * 6) * boost;
    const flame = ctx.createLinearGradient(0, 5, 0, 5 + len);
    const outer = level >= 3 ? "rgba(56,189,248,0.7)" : "rgba(251,146,60,0.8)";
    flame.addColorStop(0, "rgba(254,243,199,0.95)");
    flame.addColorStop(0.45, outer);
    flame.addColorStop(1, "rgba(251,146,60,0)");
    ctx.fillStyle = flame;
    ctx.beginPath();
    ctx.moveTo(-4, 5);
    ctx.quadraticCurveTo(-3, 5 + len * 0.6, 0, 5 + len);
    ctx.quadraticCurveTo(3, 5 + len * 0.6, 4, 5);
    ctx.closePath();
    ctx.fill();
  }

  // Nova-only downward jet: a smaller upward-shooting flame from the top.
  if (state.downThrusting) {
    const len = 8 + Math.random() * 4;
    const jet = ctx.createLinearGradient(0, -20, 0, -20 - len);
    jet.addColorStop(0, "rgba(254,243,199,0.9)");
    jet.addColorStop(0.5, "rgba(251,146,60,0.65)");
    jet.addColorStop(1, "rgba(251,146,60,0)");
    ctx.fillStyle = jet;
    ctx.beginPath();
    ctx.moveTo(-3, -20);
    ctx.quadraticCurveTo(0, -20 - len * 0.6, 0, -20 - len);
    ctx.quadraticCurveTo(0, -20 - len * 0.6, 3, -20);
    ctx.closePath();
    ctx.fill();
  }

  if (palette.headlight) {
    const beam = ctx.createRadialGradient(16, -2, 1, 16, -2, 36);
    beam.addColorStop(0, palette.headlight);
    beam.addColorStop(1, "rgba(191,219,254,0)");
    ctx.fillStyle = beam;
    ctx.beginPath();
    ctx.moveTo(15, -3);
    ctx.lineTo(48, -12);
    ctx.lineTo(48, 8);
    ctx.closePath();
    ctx.fill();
  }

  // Vanguard side fins — wide little triangles that peek out past the body.
  if (level >= 3) {
    ctx.fillStyle = palette.body;
    ctx.beginPath();
    ctx.moveTo(-16, -6);
    ctx.lineTo(-22, -3);
    ctx.lineTo(-16, -1);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(16, -6);
    ctx.lineTo(22, -3);
    ctx.lineTo(16, -1);
    ctx.closePath();
    ctx.fill();
  }

  const wheelY = RIDE_HEIGHT - WHEEL_RADIUS;
  const wheelAngle = (state.x / WHEEL_RADIUS) * state.facing;

  // Struts
  ctx.strokeStyle = palette.wheel;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-WHEEL_BASE / 2, wheelY);
  ctx.lineTo(-8, 2);
  ctx.moveTo(WHEEL_BASE / 2, wheelY);
  ctx.lineTo(8, 2);
  ctx.stroke();

  // Wheels with a rotating spoke for motion feel
  for (const wx of [-WHEEL_BASE / 2, WHEEL_BASE / 2]) {
    ctx.fillStyle = palette.wheel;
    ctx.beginPath();
    ctx.arc(wx, wheelY, WHEEL_RADIUS, 0, TAU);
    ctx.fill();
    // Ranger onward gains a bright rim highlight.
    if (level >= 2) {
      ctx.strokeStyle = "rgba(251,191,36,0.6)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(wx, wheelY, WHEEL_RADIUS + 0.4, 0, TAU);
      ctx.stroke();
    }
    ctx.strokeStyle = palette.body;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(wx, wheelY);
    ctx.lineTo(
      wx + Math.cos(wheelAngle) * (WHEEL_RADIUS - 1.5),
      wheelY + Math.sin(wheelAngle) * (WHEEL_RADIUS - 1.5),
    );
    ctx.stroke();
  }

  // Body
  ctx.fillStyle = palette.body;
  ctx.beginPath();
  ctx.roundRect(-16, -8, 32, 12, 4);
  ctx.fill();

  // Nova racing stripe pulsing across the hull.
  if (level === 4) {
    const stripePulse = 0.55 + 0.45 * Math.sin(now * 0.006 + 1.2);
    ctx.fillStyle = `rgba(56,189,248,${stripePulse})`;
    ctx.fillRect(-14, -5, 28, 1.4);
  }

  // Solar panel
  ctx.fillStyle = palette.accent;
  ctx.beginPath();
  ctx.roundRect(-11, -12, 15, 4, 1.5);
  ctx.fill();

  // Ranger onward: a second stacked solar panel above the first.
  if (level >= 2) {
    ctx.fillStyle = palette.accent;
    ctx.globalAlpha = 0.75;
    ctx.beginPath();
    ctx.roundRect(-9, -17, 12, 3, 1.2);
    ctx.fill();
    ctx.globalAlpha = 1;
    // Amber forward headlamp — a tiny always-on bulb.
    ctx.fillStyle = "rgba(254,240,138,0.9)";
    ctx.beginPath();
    ctx.arc(15, -4, 1.4, 0, TAU);
    ctx.fill();
  }

  // Vanguard radar dish tucked behind the mast.
  if (level >= 3) {
    ctx.fillStyle = palette.body;
    ctx.beginPath();
    ctx.arc(-9, -13, 2.6, Math.PI, TAU);
    ctx.fill();
    ctx.strokeStyle = palette.accent;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-9, -13);
    ctx.lineTo(-9, -17);
    ctx.stroke();
  }

  // Camera mast
  ctx.strokeStyle = palette.body;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(8, -8);
  ctx.lineTo(8, -16);
  ctx.stroke();
  ctx.fillStyle = palette.body;
  ctx.beginPath();
  ctx.roundRect(5, -20, 7, 5, 1.5);
  ctx.fill();
  ctx.fillStyle = palette.accent;
  ctx.fillRect(10, -19, 1.6, 3);

  // Scout blinking green nav LED on top of the mast.
  if (level >= 1) {
    const blink = 0.55 + 0.45 * Math.sin(now * 0.008);
    ctx.fillStyle = `rgba(74,222,128,${blink})`;
    ctx.beginPath();
    ctx.arc(8, -22, 1.4, 0, TAU);
    ctx.fill();
  }

  ctx.restore();
}

// Draws the rover, duplicating it across the seam when it straddles the
// wrap-around edge so it never pops.
export function drawRover(
  ctx: CanvasRenderingContext2D,
  state: RoverState,
  terrain: Terrain,
  palette: RoverPalette,
) {
  drawRoverBody(ctx, state, palette);
  const margin = 50;
  if (state.x < margin) {
    const shifted = { ...state, x: state.x + terrain.width };
    drawRoverBody(ctx, shifted, palette);
  } else if (state.x > terrain.width - margin) {
    const shifted = { ...state, x: state.x - terrain.width };
    drawRoverBody(ctx, shifted, palette);
  }
}
