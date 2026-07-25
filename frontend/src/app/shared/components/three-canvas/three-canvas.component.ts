import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  NgZone,
  Input,
  HostListener,
} from '@angular/core';
import * as THREE from 'three';

/**
 * Reusable base Three.js canvas component.
 *
 * Handles:
 * - WebGL renderer initialization with capped pixel ratio
 * - Responsive resize via ResizeObserver
 * - Animation loop running outside Angular zone for 60fps
 * - Full cleanup of GPU resources on destroy
 *
 * Subclass or compose this component and override `onRender()` / `onInit3D()`
 * via event bindings, or use it as a base and extend the scene externally.
 */
@Component({
  selector: 'fs-three-canvas',
  standalone: true,
  template: `
    <div #canvasContainer class="three-canvas-container">
      <canvas #threeCanvas></canvas>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }
      .three-canvas-container {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
      .three-canvas-container canvas {
        display: block;
        width: 100%;
        height: 100%;
      }
    `,
  ],
})
export class ThreeCanvasComponent implements AfterViewInit, OnDestroy {
  @ViewChild('threeCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasContainer', { static: true }) containerRef!: ElementRef<HTMLDivElement>;

  /** Maximum device pixel ratio. Default 2 to protect mobile GPUs. */
  @Input() maxPixelRatio = 2;

  /** Whether to enable antialiasing. Default true. */
  @Input() antialias = true;

  /** Background color. Use null for transparent. */
  @Input() bgColor: string | null = null;

  /** Background alpha. 0 = fully transparent. */
  @Input() bgAlpha = 0;

  // Three.js core objects exposed for external scene building
  renderer!: THREE.WebGLRenderer;
  scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera;

  private animationId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private clock = new THREE.Clock();
  private destroyed = false;

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    this.initRenderer();
    this.initScene();
    this.initCamera();
    this.setupResizeObserver();
    this.startRenderLoop();
  }

  ngOnDestroy(): void {
    this.destroyed = true;

    // Cancel animation frame
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    // Disconnect resize observer
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    // Dispose renderer
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.forceContextLoss();
    }

    // Traverse and dispose all scene objects
    if (this.scene) {
      this.scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry?.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach((mat) => this.disposeMaterial(mat));
          } else if (object.material) {
            this.disposeMaterial(object.material);
          }
        }
        if (object instanceof THREE.Points) {
          object.geometry?.dispose();
          if (object.material instanceof THREE.Material) {
            this.disposeMaterial(object.material);
          }
        }
        if (object instanceof THREE.Line) {
          object.geometry?.dispose();
          if (object.material instanceof THREE.Material) {
            this.disposeMaterial(object.material);
          }
        }
      });
      this.scene.clear();
    }
  }

  private disposeMaterial(material: THREE.Material): void {
    // Dispose textures on material
    const mat = material as any;
    if (mat.map) mat.map.dispose();
    if (mat.normalMap) mat.normalMap.dispose();
    if (mat.roughnessMap) mat.roughnessMap.dispose();
    if (mat.metalnessMap) mat.metalnessMap.dispose();
    if (mat.emissiveMap) mat.emissiveMap.dispose();
    if (mat.alphaMap) mat.alphaMap.dispose();
    if (mat.envMap) mat.envMap.dispose();
    material.dispose();
  }

  private initRenderer(): void {
    const canvas = this.canvasRef.nativeElement;
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: this.antialias,
      alpha: true,
      powerPreference: 'high-performance',
    });

    const dpr = Math.min(window.devicePixelRatio || 1, this.maxPixelRatio);
    this.renderer.setPixelRatio(dpr);

    if (this.bgColor !== null) {
      this.renderer.setClearColor(new THREE.Color(this.bgColor), this.bgAlpha);
    } else {
      this.renderer.setClearColor(0x000000, 0);
    }

    this.updateRendererSize();
  }

  private initScene(): void {
    this.scene = new THREE.Scene();
  }

  private initCamera(): void {
    const { width, height } = this.getContainerSize();
    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    this.camera.position.set(0, 0, 5);
  }

  private setupResizeObserver(): void {
    this.resizeObserver = new ResizeObserver(() => {
      this.handleResize();
    });
    this.resizeObserver.observe(this.containerRef.nativeElement);
  }

  @HostListener('window:resize')
  handleResize(): void {
    if (this.destroyed) return;
    const { width, height } = this.getContainerSize();
    if (width === 0 || height === 0) return;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  private updateRendererSize(): void {
    const { width, height } = this.getContainerSize();
    if (width > 0 && height > 0) {
      this.renderer.setSize(width, height, false);
    }
  }

  private getContainerSize(): { width: number; height: number } {
    const el = this.containerRef.nativeElement;
    return {
      width: el.clientWidth,
      height: el.clientHeight,
    };
  }

  private startRenderLoop(): void {
    // Run outside Angular zone to avoid change detection on every frame
    this.ngZone.runOutsideAngular(() => {
      const animate = () => {
        if (this.destroyed) return;
        this.animationId = requestAnimationFrame(animate);
        const delta = this.clock.getDelta();
        const elapsed = this.clock.getElapsedTime();
        this.onRender(delta, elapsed);
        this.renderer.render(this.scene, this.camera);
      };
      animate();
    });
  }

  /**
   * Override this method in subclasses or bind externally.
   * Called every frame before render.
   */
  protected onRender(delta: number, elapsed: number): void {
    // Base implementation is a no-op.
    // Subclasses or external controllers add animations here.
  }

  /** Utility: Check if the device is likely mobile */
  isMobileDevice(): boolean {
    return window.innerWidth < 768;
  }

  /** Utility: Get adaptive particle/detail count based on device */
  getAdaptiveCount(desktopCount: number, mobileCount: number): number {
    return this.isMobileDevice() ? mobileCount : desktopCount;
  }
}
