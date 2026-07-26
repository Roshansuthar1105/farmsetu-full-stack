import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  NgZone,
  HostListener,
  Input,
} from '@angular/core';
import * as THREE from 'three';

// ────────────────────────────────────────────────────────────
// GLSL: Simplex 3D Noise (Ashima Arts / Stefan Gustavson, MIT)
// ────────────────────────────────────────────────────────────
const SIMPLEX_NOISE_GLSL = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 10.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g  = step(x0.yzx, x0.xyz);
  vec3 l  = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.5 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 105.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
`;

// ────────────────────────────────────────────────────────────
// Terrain Shaders
// ────────────────────────────────────────────────────────────
const TERRAIN_VERTEX = /* glsl */ `
uniform float uTime;

varying float vElevation;
varying vec2  vUv;
varying vec2  vLocalPos;

${SIMPLEX_NOISE_GLSL}

void main() {
  vUv       = uv;
  vLocalPos = position.xy;

  vec3 pos = position;

  // Layered noise → organic rolling hills
  float e  = snoise(vec3(pos.x * 0.055, pos.y * 0.055, uTime * 0.10)) * 2.8;
  e       += snoise(vec3(pos.x * 0.11 + 5.0, pos.y * 0.09 + 3.0, uTime * 0.07)) * 1.4;
  e       += snoise(vec3(pos.x * 0.22 + 10.0, pos.y * 0.18 + 7.0, uTime * 0.04)) * 0.6;

  pos.z      = e;
  vElevation = e;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

const TERRAIN_FRAGMENT = /* glsl */ `
varying float vElevation;
varying vec2  vUv;
varying vec2  vLocalPos;

uniform float uTime;
uniform float uOpacity;

void main() {
  // ── Grid Lines ──
  float gridFreq  = 0.35;
  float lineWidth = 0.022;

  float gx = abs(fract(vLocalPos.x * gridFreq + 0.5) - 0.5);
  float gy = abs(fract(vLocalPos.y * gridFreq + 0.5) - 0.5);
  float gridLine = min(gx, gy);
  float grid = 1.0 - smoothstep(0.0, lineWidth, gridLine);

  // Major grid (every 5th line) — slightly thicker
  float majorFreq = gridFreq * 0.2;
  float mgx = abs(fract(vLocalPos.x * majorFreq + 0.5) - 0.5);
  float mgy = abs(fract(vLocalPos.y * majorFreq + 0.5) - 0.5);
  float majorLine = min(mgx, mgy);
  float major = 1.0 - smoothstep(0.0, lineWidth * 1.6, majorLine);
  grid = max(grid, major);

  // ── Elevation Color ──
  float normElev = clamp((vElevation + 3.5) / 7.0, 0.0, 1.0);

  vec3 deepGreen = vec3(0.02, 0.09, 0.06);
  vec3 emerald   = vec3(0.13, 0.77, 0.37);
  vec3 teal      = vec3(0.10, 0.58, 0.52);
  vec3 amber     = vec3(0.96, 0.72, 0.14);

  vec3 baseColor = mix(deepGreen, teal, normElev * 0.5);
  vec3 gridColor = mix(teal, emerald, normElev);

  // Amber highlights on peaks
  float amberMix = smoothstep(0.62, 0.85, normElev) * 0.35;
  gridColor = mix(gridColor, amber, amberMix);

  // Soft glow halo around grid lines
  float gridGlow  = 1.0 - smoothstep(0.0, lineWidth * 5.0, gridLine);
  vec3  glowColor = gridColor * 0.3;

  vec3 finalColor = baseColor * 0.08 + gridColor * grid + glowColor * gridGlow * 0.18;

  // ── Edge Fade (elliptical) ──
  vec2  centered = vUv - 0.5;
  float edgeDist = length(centered * vec2(1.5, 1.25));
  float edgeFade = 1.0 - smoothstep(0.30, 0.52, edgeDist);

  // Subtle scan pulse for "alive" feel
  float scan = sin(vLocalPos.y * 1.5 + uTime * 0.35) * 0.04 + 0.96;

  float alpha = (0.03 + grid * 0.48 + gridGlow * 0.07) * edgeFade * scan * uOpacity;

  gl_FragColor = vec4(finalColor, alpha);
}
`;

// ────────────────────────────────────────────────────────────
// Accent Particle Shaders (circular glow, NOT squares)
// ────────────────────────────────────────────────────────────
const PARTICLE_VERTEX = /* glsl */ `
attribute float aSize;
attribute vec3  aColor;

varying vec3 vColor;

void main() {
  vColor = aColor;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = aSize * (180.0 / -mvPosition.z);
  gl_Position  = projectionMatrix * mvPosition;
}
`;

const PARTICLE_FRAGMENT = /* glsl */ `
varying vec3 vColor;

void main() {
  float dist = length(gl_PointCoord - vec2(0.5));
  if (dist > 0.5) discard;

  float glow = 1.0 - smoothstep(0.0, 0.5, dist);
  glow = pow(glow, 1.8);

  gl_FragColor = vec4(vColor * 1.2, glow * 0.6);
}
`;

// ════════════════════════════════════════════════════════════
// Component
// ════════════════════════════════════════════════════════════

/**
 * 3D organic farmland terrain background for the Landing Page hero.
 *
 * Features:
 * - Rolling terrain mesh with simplex-noise vertex displacement
 * - Glowing emerald/teal grid lines with amber peak accents
 * - Circular glowing accent particles drifting upward
 * - Mouse/touch parallax camera interaction
 * - Smooth elliptical edge fade to transparent
 * - Adaptive quality for mobile devices
 */
@Component({
  selector: 'fs-hero-particles',
  standalone: true,
  template: `
    <div #container class="hero-particles-container">
      <canvas #heroCanvas></canvas>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 0;
      }
      .hero-particles-container {
        position: absolute;
        inset: 0;
        overflow: hidden;
      }
      .hero-particles-container canvas {
        display: block;
        width: 100%;
        height: 100%;
      }
    `,
  ],
})
export class HeroParticlesComponent implements AfterViewInit, OnDestroy {
  @ViewChild('heroCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('container', { static: true }) containerRef!: ElementRef<HTMLDivElement>;

  /** Whether the dark theme is active */
  @Input() darkMode = false;

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private clock = new THREE.Clock();
  private animationId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private destroyed = false;

  // Terrain
  private terrainMesh!: THREE.Mesh;
  private terrainUniforms!: Record<string, THREE.IUniform>;

  // Accent particles
  private particlesMesh!: THREE.Points;
  private particleCount = 0;
  private particlePositions!: Float32Array;
  private particleVelocities!: Float32Array;

  // Mouse / touch parallax
  private mouseX = 0;
  private mouseY = 0;
  private targetMouseX = 0;
  private targetMouseY = 0;

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      this.init();
      this.animate();
    });
  }

  ngOnDestroy(): void {
    this.destroyed = true;

    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.forceContextLoss();
    }
    if (this.scene) {
      this.scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Points) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else if (obj.material) {
            (obj.material as THREE.Material).dispose();
          }
        }
      });
      this.scene.clear();
    }
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    const { width, height } = this.getSize();
    if (width === 0 || height === 0) return;
    this.targetMouseX = (event.clientX / width - 0.5) * 2;
    this.targetMouseY = (event.clientY / height - 0.5) * 2;
  }

  @HostListener('window:touchmove', ['$event'])
  onTouchMove(event: TouchEvent): void {
    if (event.touches.length === 0) return;
    const { width, height } = this.getSize();
    if (width === 0 || height === 0) return;
    this.targetMouseX = (event.touches[0].clientX / width - 0.5) * 2;
    this.targetMouseY = (event.touches[0].clientY / height - 0.5) * 2;
  }

  // ── Initialisation ──────────────────────────────────────

  private init(): void {
    const canvas = this.canvasRef.nativeElement;
    const { width, height } = this.getSize();
    const isMobile = width < 768;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !isMobile,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(width, height, false);
    this.renderer.setClearColor(0x000000, 0);

    // Scene
    this.scene = new THREE.Scene();

    // Camera — positioned above, angled down to view rolling terrain
    this.camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 200);
    this.camera.position.set(0, 18, 28);
    this.camera.lookAt(0, -2, -5);

    this.createTerrain(isMobile);
    this.createAccentParticles(isMobile);

    // Resize observer
    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(this.containerRef.nativeElement);
  }

  // ── Terrain Mesh ────────────────────────────────────────

  private createTerrain(isMobile: boolean): void {
    const segX = isMobile ? 50 : 100;
    const segY = isMobile ? 30 : 60;
    const geometry = new THREE.PlaneGeometry(80, 55, segX, segY);

    this.terrainUniforms = {
      uTime: { value: 0 },
      uOpacity: { value: 1.0 },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader: TERRAIN_VERTEX,
      fragmentShader: TERRAIN_FRAGMENT,
      uniforms: this.terrainUniforms,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    this.terrainMesh = new THREE.Mesh(geometry, material);
    // Rotate plane from X-Y to X-Z (lies flat, faces upward)
    this.terrainMesh.rotation.x = -Math.PI / 2;
    this.terrainMesh.position.y = -3;
    this.scene.add(this.terrainMesh);
  }

  // ── Accent Particles (circular glow orbs) ───────────────

  private createAccentParticles(isMobile: boolean): void {
    this.particleCount = isMobile ? 15 : 30;
    const count = this.particleCount;

    this.particlePositions = new Float32Array(count * 3);
    this.particleVelocities = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Spread across terrain footprint in world space
      this.particlePositions[i3] = (Math.random() - 0.5) * 60; // X
      this.particlePositions[i3 + 1] = Math.random() * 8 - 1; // Y (above terrain)
      this.particlePositions[i3 + 2] = (Math.random() - 0.5) * 40; // Z

      // Gentle upward drift
      this.particleVelocities[i3] = (Math.random() - 0.5) * 0.008;
      this.particleVelocities[i3 + 1] = Math.random() * 0.015 + 0.005;
      this.particleVelocities[i3 + 2] = (Math.random() - 0.5) * 0.006;

      // Colour palette: emerald / teal / amber
      const roll = Math.random();
      if (roll < 0.5) {
        // Emerald
        colors[i3] = 0.13;
        colors[i3 + 1] = 0.77;
        colors[i3 + 2] = 0.37;
      } else if (roll < 0.8) {
        // Teal
        colors[i3] = 0.10;
        colors[i3 + 1] = 0.58;
        colors[i3 + 2] = 0.52;
      } else {
        // Amber
        colors[i3] = 0.96;
        colors[i3 + 1] = 0.72;
        colors[i3 + 2] = 0.14;
      }

      sizes[i] = Math.random() * 3 + 1.5;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(this.particlePositions, 3));
    geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.ShaderMaterial({
      vertexShader: PARTICLE_VERTEX,
      fragmentShader: PARTICLE_FRAGMENT,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.particlesMesh = new THREE.Points(geometry, material);
    this.scene.add(this.particlesMesh);
  }

  // ── Animation Loop ──────────────────────────────────────

  private animate(): void {
    if (this.destroyed) return;
    this.animationId = requestAnimationFrame(() => this.animate());

    const elapsed = this.clock.getElapsedTime();

    // Drive terrain undulation
    this.terrainUniforms['uTime'].value = elapsed;

    // Smooth mouse follow
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.04;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.04;

    // Camera parallax
    this.camera.position.x += (this.mouseX * 3 - this.camera.position.x) * 0.02;
    this.camera.position.y += (18 - this.mouseY * 2 - this.camera.position.y) * 0.02;
    this.camera.lookAt(0, -2, -5);

    // Update particles
    this.updateParticles(elapsed);

    this.renderer.render(this.scene, this.camera);
  }

  private updateParticles(elapsed: number): void {
    const count = this.particleCount;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Velocity + organic sine drift
      this.particlePositions[i3] +=
        this.particleVelocities[i3] + Math.sin(elapsed * 0.3 + i * 1.7) * 0.003;
      this.particlePositions[i3 + 1] += this.particleVelocities[i3 + 1];
      this.particlePositions[i3 + 2] +=
        this.particleVelocities[i3 + 2] + Math.cos(elapsed * 0.2 + i * 2.3) * 0.002;

      // Reset when too high → respawn near terrain surface
      if (this.particlePositions[i3 + 1] > 12) {
        this.particlePositions[i3] = (Math.random() - 0.5) * 60;
        this.particlePositions[i3 + 1] = -1 + Math.random() * 2;
        this.particlePositions[i3 + 2] = (Math.random() - 0.5) * 40;
      }

      // Soft X / Z boundary wrapping
      if (Math.abs(this.particlePositions[i3]) > 35) {
        this.particlePositions[i3] *= -0.8;
      }
      if (Math.abs(this.particlePositions[i3 + 2]) > 25) {
        this.particlePositions[i3 + 2] *= -0.8;
      }
    }

    (this.particlesMesh.geometry.getAttribute('position') as THREE.BufferAttribute).needsUpdate =
      true;
  }

  // ── Resize ──────────────────────────────────────────────

  private handleResize(): void {
    if (this.destroyed) return;
    const { width, height } = this.getSize();
    if (width === 0 || height === 0) return;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  private getSize(): { width: number; height: number } {
    const el = this.containerRef.nativeElement;
    return { width: el.clientWidth, height: el.clientHeight };
  }
}
