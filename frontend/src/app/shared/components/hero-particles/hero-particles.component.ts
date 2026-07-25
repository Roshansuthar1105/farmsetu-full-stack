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

/**
 * 3D floating organic particle ecosystem for the Landing Page hero.
 *
 * Features:
 * - Soft glowing particles floating with organic sine-wave motion
 * - Connecting lines between nearby particles (constellation effect)
 * - Mouse/touch parallax interaction
 * - Adaptive quality for mobile devices
 * - Fully transparent background to overlay behind hero text
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

  // Particle system
  private particlesMesh!: THREE.Points;
  private particleCount = 0;
  private particlePositions!: Float32Array;
  private particleVelocities!: Float32Array;
  private particleSizes!: Float32Array;

  // Connection lines
  private linesMesh!: THREE.LineSegments;
  private linesGeometry!: THREE.BufferGeometry;
  private maxConnections = 0;

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
        if (obj instanceof THREE.Points || obj instanceof THREE.LineSegments) {
          obj.geometry?.dispose();
          if (obj.material instanceof THREE.Material) {
            obj.material.dispose();
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
    // Normalize to -1 to 1
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

  private init(): void {
    const canvas = this.canvasRef.nativeElement;
    const { width, height } = this.getSize();
    const isMobile = width < 768;

    // Adaptive quality
    this.particleCount = isMobile ? 40 : 80;
    this.maxConnections = isMobile ? 60 : 150;

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

    // Camera
    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    this.camera.position.z = 30;

    // Create particles
    this.createParticles();

    // Create connection lines
    this.createLines();

    // Resize observer
    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(this.containerRef.nativeElement);
  }

  private createParticles(): void {
    const count = this.particleCount;
    this.particlePositions = new Float32Array(count * 3);
    this.particleVelocities = new Float32Array(count * 3);
    this.particleSizes = new Float32Array(count);
    const colors = new Float32Array(count * 3);

    const spread = 40;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Random positions in a wide spread
      this.particlePositions[i3] = (Math.random() - 0.5) * spread;
      this.particlePositions[i3 + 1] = (Math.random() - 0.5) * spread * 0.6;
      this.particlePositions[i3 + 2] = (Math.random() - 0.5) * 15;

      // Gentle random velocities
      this.particleVelocities[i3] = (Math.random() - 0.5) * 0.02;
      this.particleVelocities[i3 + 1] = (Math.random() - 0.5) * 0.015;
      this.particleVelocities[i3 + 2] = (Math.random() - 0.5) * 0.01;

      // Random sizes
      this.particleSizes[i] = Math.random() * 3 + 1.5;

      // Color palette: emerald green variations
      const colorChoice = Math.random();
      if (colorChoice < 0.5) {
        // Emerald green
        colors[i3] = 0.133 + Math.random() * 0.05;
        colors[i3 + 1] = 0.773 + Math.random() * 0.1;
        colors[i3 + 2] = 0.369 + Math.random() * 0.1;
      } else if (colorChoice < 0.75) {
        // Teal
        colors[i3] = 0.12 + Math.random() * 0.05;
        colors[i3 + 1] = 0.63 + Math.random() * 0.1;
        colors[i3 + 2] = 0.56 + Math.random() * 0.1;
      } else {
        // Amber accent
        colors[i3] = 0.96;
        colors[i3 + 1] = 0.62 + Math.random() * 0.1;
        colors[i3 + 2] = 0.04 + Math.random() * 0.05;
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(this.particlePositions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(this.particleSizes, 1));

    // Custom shader material for soft glowing dots
    const material = new THREE.PointsMaterial({
      size: 2.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    this.particlesMesh = new THREE.Points(geometry, material);
    this.scene.add(this.particlesMesh);
  }

  private createLines(): void {
    // Pre-allocate buffer for connection lines
    const maxLineVertices = this.maxConnections * 2 * 3; // 2 vertices per line, 3 coords each
    const linePositions = new Float32Array(maxLineVertices);
    const lineColors = new Float32Array(maxLineVertices);

    this.linesGeometry = new THREE.BufferGeometry();
    this.linesGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    this.linesGeometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));
    this.linesGeometry.setDrawRange(0, 0);

    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.linesMesh = new THREE.LineSegments(this.linesGeometry, lineMaterial);
    this.scene.add(this.linesMesh);
  }

  private animate(): void {
    if (this.destroyed) return;
    this.animationId = requestAnimationFrame(() => this.animate());

    const elapsed = this.clock.getElapsedTime();
    const count = this.particleCount;
    const spread = 40;

    // Smooth mouse follow
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

    // Update particle positions with organic sine wave
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Organic float motion
      this.particlePositions[i3] +=
        this.particleVelocities[i3] + Math.sin(elapsed * 0.3 + i * 0.5) * 0.005;
      this.particlePositions[i3 + 1] +=
        this.particleVelocities[i3 + 1] + Math.cos(elapsed * 0.2 + i * 0.7) * 0.004;
      this.particlePositions[i3 + 2] +=
        this.particleVelocities[i3 + 2] + Math.sin(elapsed * 0.15 + i * 0.3) * 0.003;

      // Wrap around boundaries
      const halfSpread = spread / 2;
      if (this.particlePositions[i3] > halfSpread) this.particlePositions[i3] = -halfSpread;
      if (this.particlePositions[i3] < -halfSpread) this.particlePositions[i3] = halfSpread;
      if (this.particlePositions[i3 + 1] > halfSpread * 0.6)
        this.particlePositions[i3 + 1] = -halfSpread * 0.6;
      if (this.particlePositions[i3 + 1] < -halfSpread * 0.6)
        this.particlePositions[i3 + 1] = halfSpread * 0.6;
      if (this.particlePositions[i3 + 2] > 7.5) this.particlePositions[i3 + 2] = -7.5;
      if (this.particlePositions[i3 + 2] < -7.5) this.particlePositions[i3 + 2] = 7.5;
    }

    (this.particlesMesh.geometry.getAttribute('position') as THREE.BufferAttribute).needsUpdate =
      true;

    // Update connection lines between nearby particles
    this.updateLines();

    // Mouse parallax on camera
    this.camera.position.x += (this.mouseX * 2 - this.camera.position.x) * 0.02;
    this.camera.position.y += (-this.mouseY * 1.5 - this.camera.position.y) * 0.02;
    this.camera.lookAt(0, 0, 0);

    // Slow overall rotation
    this.particlesMesh.rotation.y = elapsed * 0.015;

    this.renderer.render(this.scene, this.camera);
  }

  private updateLines(): void {
    const positions = this.linesGeometry.getAttribute('position') as THREE.BufferAttribute;
    const colors = this.linesGeometry.getAttribute('color') as THREE.BufferAttribute;
    const count = this.particleCount;
    const maxDist = 8; // Connection distance threshold
    let lineIndex = 0;
    const maxLines = this.maxConnections;

    for (let i = 0; i < count && lineIndex < maxLines; i++) {
      for (let j = i + 1; j < count && lineIndex < maxLines; j++) {
        const i3 = i * 3;
        const j3 = j * 3;

        const dx = this.particlePositions[i3] - this.particlePositions[j3];
        const dy = this.particlePositions[i3 + 1] - this.particlePositions[j3 + 1];
        const dz = this.particlePositions[i3 + 2] - this.particlePositions[j3 + 2];
        const distSq = dx * dx + dy * dy + dz * dz;

        if (distSq < maxDist * maxDist) {
          const dist = Math.sqrt(distSq);
          const alpha = 1 - dist / maxDist;
          const li = lineIndex * 6; // 2 vertices * 3 coords

          // Vertex 1
          positions.array[li] = this.particlePositions[i3];
          positions.array[li + 1] = this.particlePositions[i3 + 1];
          positions.array[li + 2] = this.particlePositions[i3 + 2];

          // Vertex 2
          positions.array[li + 3] = this.particlePositions[j3];
          positions.array[li + 4] = this.particlePositions[j3 + 1];
          positions.array[li + 5] = this.particlePositions[j3 + 2];

          // Green-ish color with alpha-based intensity
          const greenIntensity = 0.5 * alpha;
          colors.array[li] = 0.13 * alpha;
          colors.array[li + 1] = greenIntensity;
          colors.array[li + 2] = 0.37 * alpha;
          colors.array[li + 3] = 0.13 * alpha;
          colors.array[li + 4] = greenIntensity;
          colors.array[li + 5] = 0.37 * alpha;

          lineIndex++;
        }
      }
    }

    this.linesGeometry.setDrawRange(0, lineIndex * 2);
    positions.needsUpdate = true;
    colors.needsUpdate = true;
  }

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
