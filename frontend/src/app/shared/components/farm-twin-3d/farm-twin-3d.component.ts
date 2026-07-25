import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  NgZone,
  Input,
  OnChanges,
  SimpleChanges,
  HostListener,
} from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/**
 * Interactive 3D Farm Digital Twin visualizer.
 *
 * Features:
 * - 3D terrain grid with elevated crop bed patches
 * - Animated glowing sensor nodes (soil moisture, NPK pins)
 * - OrbitControls for 360° rotation and zoom with touch support
 * - Responsive canvas with adaptive quality
 * - Accepts farm data inputs to dynamically color terrain zones
 */
@Component({
  selector: 'fs-farm-twin-3d',
  standalone: true,
  template: `
    <div #container class="farm-twin-container">
      <canvas #farmCanvas></canvas>
      <div class="farm-twin-overlay">
        <div class="farm-twin-legend">
          <span class="legend-item"><span class="legend-dot" style="background:#22c55e;"></span> Optimal</span>
          <span class="legend-item"><span class="legend-dot" style="background:#f59e0b;"></span> Moderate</span>
          <span class="legend-item"><span class="legend-dot" style="background:#ef4444;"></span> Low</span>
        </div>
        <span class="farm-twin-hint">Drag to rotate · Scroll to zoom</span>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }
      .farm-twin-container {
        position: relative;
        width: 100%;
        height: 320px;
        border-radius: 1rem;
        overflow: hidden;
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      }
      @media (min-width: 768px) {
        .farm-twin-container {
          height: 380px;
        }
      }
      .farm-twin-container canvas {
        display: block;
        width: 100%;
        height: 100%;
        cursor: grab;
      }
      .farm-twin-container canvas:active {
        cursor: grabbing;
      }
      .farm-twin-overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 14px;
        pointer-events: none;
        background: linear-gradient(transparent, rgba(15, 23, 42, 0.8));
      }
      .farm-twin-legend {
        display: flex;
        gap: 12px;
        font-size: 10px;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.6);
      }
      .legend-item {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .legend-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        display: inline-block;
      }
      .farm-twin-hint {
        font-size: 9px;
        color: rgba(255, 255, 255, 0.35);
        font-weight: 500;
      }
    `,
  ],
})
export class FarmTwin3dComponent implements AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('farmCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('container', { static: true }) containerRef!: ElementRef<HTMLDivElement>;

  /** Soil moisture level 0-100 to color the terrain */
  @Input() moisture = 65;
  /** Nitrogen level 0-140 */
  @Input() nitrogen = 80;
  /** Phosphorus level 0-145 */
  @Input() phosphorus = 50;
  /** Potassium level 0-205 */
  @Input() potassium = 100;
  /** Farm area in acres for scale reference */
  @Input() farmArea = 2;

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;
  private clock = new THREE.Clock();
  private animationId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private destroyed = false;

  // Scene objects
  private terrainMesh!: THREE.Mesh;
  private sensorNodes: THREE.Mesh[] = [];
  private sensorGlows: THREE.Mesh[] = [];
  private gridHelper!: THREE.GridHelper;

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      this.init();
      this.animate();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.terrainMesh) {
      this.updateTerrainColor();
    }
  }

  ngOnDestroy(): void {
    this.destroyed = true;

    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.controls) {
      this.controls.dispose();
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
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Line) {
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

  private init(): void {
    const canvas = this.canvasRef.nativeElement;
    const { width, height } = this.getSize();
    const isMobile = width < 768;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !isMobile,
      alpha: false,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(width, height, false);
    this.renderer.setClearColor(0x0f172a, 1);
    this.renderer.shadowMap.enabled = !isMobile;
    if (!isMobile) {
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    // Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x0f172a, 0.02);

    // Camera
    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 200);
    this.camera.position.set(12, 10, 12);
    this.camera.lookAt(0, 0, 0);

    // OrbitControls with touch support
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.enablePan = false;
    this.controls.minDistance = 6;
    this.controls.maxDistance = 30;
    this.controls.maxPolarAngle = Math.PI / 2.2; // Prevent going below ground
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.5;

    // Touch gesture config
    this.controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_PAN,
    };

    // Lighting
    this.setupLighting();

    // Build scene
    this.createTerrain();
    this.createCropBeds();
    this.createSensorNodes();
    this.createGridHelper();

    // Resize observer
    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(this.containerRef.nativeElement);
  }

  private setupLighting(): void {
    // Ambient
    const ambient = new THREE.AmbientLight(0x334466, 0.6);
    this.scene.add(ambient);

    // Directional light (sun simulation)
    const dirLight = new THREE.DirectionalLight(0xfff4e0, 0.8);
    dirLight.position.set(10, 15, 8);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(512, 512);
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 50;
    this.scene.add(dirLight);

    // Hemisphere light for natural sky-ground gradient
    const hemiLight = new THREE.HemisphereLight(0x88bbff, 0x224400, 0.4);
    this.scene.add(hemiLight);

    // Point light for emerald glow accent
    const accentLight = new THREE.PointLight(0x22c55e, 0.5, 30);
    accentLight.position.set(0, 5, 0);
    this.scene.add(accentLight);
  }

  private createTerrain(): void {
    // Create a flat rectangular terrain plane
    const geometry = new THREE.PlaneGeometry(16, 16, 32, 32);

    // Subtle elevation variation
    const posAttr = geometry.getAttribute('position');
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);
      const elevation = Math.sin(x * 0.3) * Math.cos(y * 0.3) * 0.3 +
                        Math.sin(x * 0.7 + 1) * Math.cos(y * 0.5 + 2) * 0.15;
      posAttr.setZ(i, elevation);
    }
    geometry.computeVertexNormals();

    // Terrain color based on soil moisture
    const terrainColor = this.getMoistureColor(this.moisture);

    const material = new THREE.MeshStandardMaterial({
      color: terrainColor,
      roughness: 0.85,
      metalness: 0.05,
      flatShading: true,
    });

    this.terrainMesh = new THREE.Mesh(geometry, material);
    this.terrainMesh.rotation.x = -Math.PI / 2;
    this.terrainMesh.receiveShadow = true;
    this.scene.add(this.terrainMesh);
  }

  private createCropBeds(): void {
    // Create raised crop bed patches on the terrain
    const bedPositions = [
      { x: -4, z: -4, w: 3, h: 3 },
      { x: 2, z: -3, w: 4, h: 2.5 },
      { x: -3, z: 3, w: 3.5, h: 2 },
      { x: 3, z: 2, w: 3, h: 3 },
    ];

    const cropColors = [0x4ade80, 0x86efac, 0x22c55e, 0xa3e635];

    bedPositions.forEach((bed, idx) => {
      const geometry = new THREE.BoxGeometry(bed.w, 0.3, bed.h);
      const material = new THREE.MeshStandardMaterial({
        color: cropColors[idx % cropColors.length],
        roughness: 0.75,
        metalness: 0.0,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(bed.x, 0.2, bed.z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.scene.add(mesh);

      // Tiny crop stalks on each bed
      const stalkCount = Math.floor(bed.w * bed.h * 1.5);
      for (let i = 0; i < stalkCount; i++) {
        const stalkH = 0.3 + Math.random() * 0.6;
        const sg = new THREE.CylinderGeometry(0.02, 0.03, stalkH, 4);
        const sm = new THREE.MeshStandardMaterial({
          color: 0x15803d,
          roughness: 0.9,
        });
        const stalk = new THREE.Mesh(sg, sm);
        stalk.position.set(
          bed.x + (Math.random() - 0.5) * (bed.w - 0.3),
          0.35 + stalkH / 2,
          bed.z + (Math.random() - 0.5) * (bed.h - 0.3)
        );
        stalk.rotation.z = (Math.random() - 0.5) * 0.1;
        stalk.castShadow = true;
        this.scene.add(stalk);
      }
    });
  }

  private createSensorNodes(): void {
    // Sensor pin positions
    const sensors = [
      { x: 0, z: 0, label: 'moisture', value: this.moisture },
      { x: -5, z: -2, label: 'nitrogen', value: this.nitrogen },
      { x: 5, z: 1, label: 'phosphorus', value: this.phosphorus },
      { x: -1, z: 5, label: 'potassium', value: this.potassium },
    ];

    sensors.forEach((sensor) => {
      // Sensor pole
      const poleGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.8, 8);
      const poleMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.6 });
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(sensor.x, 0.9, sensor.z);
      this.scene.add(pole);

      // Sensor node sphere
      const color = this.getSensorColor(sensor.value, sensor.label);
      const nodeGeo = new THREE.SphereGeometry(0.2, 16, 16);
      const nodeMat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.5,
        metalness: 0.3,
        roughness: 0.4,
      });
      const node = new THREE.Mesh(nodeGeo, nodeMat);
      node.position.set(sensor.x, 1.9, sensor.z);
      this.scene.add(node);
      this.sensorNodes.push(node);

      // Glow ring around sensor
      const glowGeo = new THREE.RingGeometry(0.3, 0.5, 32);
      const glowMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide,
      });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      glow.position.set(sensor.x, 0.05, sensor.z);
      glow.rotation.x = -Math.PI / 2;
      this.scene.add(glow);
      this.sensorGlows.push(glow);
    });
  }

  private createGridHelper(): void {
    this.gridHelper = new THREE.GridHelper(16, 16, 0x1e3a2f, 0x1e293b);
    this.gridHelper.position.y = 0.01;
    (this.gridHelper.material as THREE.Material).transparent = true;
    (this.gridHelper.material as THREE.Material).opacity = 0.35;
    this.scene.add(this.gridHelper);
  }

  private animate(): void {
    if (this.destroyed) return;
    this.animationId = requestAnimationFrame(() => this.animate());

    const elapsed = this.clock.getElapsedTime();

    // Update controls
    this.controls.update();

    // Animate sensor node pulse
    this.sensorNodes.forEach((node, idx) => {
      const scale = 1 + Math.sin(elapsed * 2 + idx * 1.5) * 0.15;
      node.scale.setScalar(scale);
    });

    // Animate sensor glow rings
    this.sensorGlows.forEach((glow, idx) => {
      const s = 1 + Math.sin(elapsed * 1.5 + idx * 1.2) * 0.2;
      glow.scale.setScalar(s);
      (glow.material as THREE.MeshBasicMaterial).opacity = 0.15 + Math.sin(elapsed * 2 + idx) * 0.1;
    });

    this.renderer.render(this.scene, this.camera);
  }

  private updateTerrainColor(): void {
    if (this.terrainMesh) {
      const color = this.getMoistureColor(this.moisture);
      (this.terrainMesh.material as THREE.MeshStandardMaterial).color.set(color);
    }
  }

  private getMoistureColor(moisture: number): THREE.ColorRepresentation {
    if (moisture >= 60) return 0x166534; // Rich green - optimal
    if (moisture >= 35) return 0x854d0e; // Brown/amber - moderate
    return 0x991b1b; // Red/dry - low
  }

  private getSensorColor(
    value: number,
    type: string
  ): THREE.ColorRepresentation {
    // Normalize value based on type ranges
    let normalized: number;
    switch (type) {
      case 'moisture':
        normalized = value / 100;
        break;
      case 'nitrogen':
        normalized = value / 140;
        break;
      case 'phosphorus':
        normalized = value / 145;
        break;
      case 'potassium':
        normalized = value / 205;
        break;
      default:
        normalized = 0.5;
    }

    if (normalized >= 0.6) return 0x22c55e; // Good - green
    if (normalized >= 0.3) return 0xf59e0b; // Moderate - amber
    return 0xef4444; // Low - red
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
