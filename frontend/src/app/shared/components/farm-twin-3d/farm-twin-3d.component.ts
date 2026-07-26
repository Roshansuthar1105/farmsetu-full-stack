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
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/**
 * Data-driven 3D Farm Digital Twin that builds geometry
 * entirely from real backend farm properties:
 *
 *  - farmBoundary (GeoJSON polygon) → actual 3D farm shape
 *  - farmArea / calculatedArea → terrain scale
 *  - soilType → terrain color & roughness
 *  - soilPh → pH indicator band
 *  - waterSource → water feature type (well, canal, sprinklers)
 *  - waterLevel → animated water plane height
 *  - temperature → atmospheric tint & haze density
 *  - humidity → fog density & dew particles
 *  - rainfall → rain particle system
 *  - nitrogen / phosphorus / potassium → sensor node colors
 *  - farmName → floating 3D label
 *  - farmingType → crop visual style (organic/conventional)
 */
@Component({
  selector: 'fs-farm-twin-3d',
  standalone: true,
  template: `
    <div #container class="farm-twin-container">
      <canvas #farmCanvas></canvas>
      <!-- Dynamic HUD overlay driven by inputs -->
      <div class="farm-twin-hud-top">
        <span class="hud-farm-name">{{ farmName || 'Farm Plot' }}</span>
        <span class="hud-farm-meta">{{ farmArea ? (farmArea + ' Acres') : '' }}{{ soilType ? ' · ' + soilType : '' }}{{ farmingType ? ' · ' + farmingType : '' }}</span>
      </div>
      <div class="farm-twin-overlay">
        <div class="farm-twin-legend">
          <span class="legend-item"><span class="legend-dot" style="background:#22c55e;"></span> Optimal</span>
          <span class="legend-item"><span class="legend-dot" style="background:#f59e0b;"></span> Moderate</span>
          <span class="legend-item"><span class="legend-dot" style="background:#ef4444;"></span> Critical</span>
        </div>
        <span class="farm-twin-hint">Drag to rotate · Scroll to zoom</span>
      </div>
      <!-- Live stats bar -->
      <div class="farm-twin-stats">
        <div class="stat-chip" *ngIf="temperature != null">
          <span class="stat-icon">🌡</span>
          <span>{{ temperature }}°C</span>
        </div>
        <div class="stat-chip" *ngIf="humidity != null">
          <span class="stat-icon">💧</span>
          <span>{{ humidity }}%</span>
        </div>
        <div class="stat-chip" *ngIf="rainfall != null">
          <span class="stat-icon">🌧</span>
          <span>{{ rainfall }}mm</span>
        </div>
        <div class="stat-chip" *ngIf="waterLevel != null">
          <span class="stat-icon">🏊</span>
          <span>{{ waterLevel }}m</span>
        </div>
        <div class="stat-chip" *ngIf="soilPh != null">
          <span class="stat-icon">⚗️</span>
          <span>pH {{ soilPh }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host { display: block; width: 100%; }
      .farm-twin-container {
        position: relative; width: 100%; height: 360px;
        border-radius: 1rem; overflow: hidden;
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      }
      @media (min-width: 768px) { .farm-twin-container { height: 420px; } }
      .farm-twin-container canvas { display: block; width: 100%; height: 100%; cursor: grab; }
      .farm-twin-container canvas:active { cursor: grabbing; }
      .farm-twin-hud-top {
        position: absolute; top: 0; left: 0; right: 0;
        display: flex; align-items: center; justify-content: space-between;
        padding: 10px 14px; pointer-events: none;
        background: linear-gradient(rgba(15, 23, 42, 0.75), transparent);
      }
      .hud-farm-name {
        font-size: 13px; font-weight: 800; color: rgba(255,255,255,0.9);
        text-transform: uppercase; letter-spacing: 0.05em;
      }
      .hud-farm-meta {
        font-size: 10px; font-weight: 600; color: rgba(255,255,255,0.45);
        text-transform: capitalize;
      }
      .farm-twin-overlay {
        position: absolute; bottom: 0; left: 0; right: 0;
        display: flex; align-items: center; justify-content: space-between;
        padding: 8px 14px; pointer-events: none;
        background: linear-gradient(transparent, rgba(15, 23, 42, 0.85));
      }
      .farm-twin-legend { display: flex; gap: 12px; font-size: 10px; font-weight: 600; color: rgba(255,255,255,0.6); }
      .legend-item { display: flex; align-items: center; gap: 4px; }
      .legend-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
      .farm-twin-hint { font-size: 9px; color: rgba(255,255,255,0.35); font-weight: 500; }
      .farm-twin-stats {
        position: absolute; top: 38px; left: 10px;
        display: flex; flex-direction: column; gap: 4px;
        pointer-events: none;
      }
      .stat-chip {
        display: flex; align-items: center; gap: 4px;
        background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(6px);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 8px; padding: 3px 8px;
        font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.7);
      }
      .stat-icon { font-size: 11px; }
    `,
  ],
  imports: [CommonModule],
})
export class FarmTwin3dComponent implements AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('farmCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('container', { static: true }) containerRef!: ElementRef<HTMLDivElement>;

  // ── Farm identity ──
  @Input() farmName = '';
  @Input() farmArea = 0;
  @Input() calculatedArea = 0;
  @Input() farmingType = '';

  // ── Soil properties ──
  @Input() soilType = '';
  @Input() soilPh: number | null = null;

  // ── Farm boundary GeoJSON coords string: "[[lat,lng],[lat,lng],...]" ──
  @Input() farmBoundary = '';

  // ── Water ──
  @Input() waterSource = '';
  @Input() waterLevel: number | null = null;

  // ── Atmosphere ──
  @Input() temperature: number | null = null;
  @Input() humidity: number | null = null;
  @Input() rainfall: number | null = null;

  // ── Soil nutrients ──
  @Input() nitrogen: number | null = null;
  @Input() phosphorus: number | null = null;
  @Input() potassium: number | null = null;

  // ── Three.js internals ──
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;
  private clock = new THREE.Clock();
  private animationId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private destroyed = false;

  // Dynamic scene objects
  private terrainMesh!: THREE.Mesh;
  private boundaryLine: THREE.Line | null = null;
  private waterPlaneMesh: THREE.Mesh | null = null;
  private sensorNodes: THREE.Mesh[] = [];
  private sensorGlows: THREE.Mesh[] = [];
  private rainParticles: THREE.Points | null = null;
  private rainPositions: Float32Array | null = null;
  private waterFeatures: THREE.Object3D[] = [];
  private cropGroup: THREE.Group | null = null;

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      this.init();
      this.animate();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // If scene exists, rebuild dynamic parts on input change
    if (!this.scene) return;
    // Only rebuild if meaningful properties changed
    const keys = Object.keys(changes);
    const needsRebuild = keys.some(k => !changes[k].firstChange);
    if (needsRebuild) {
      this.ngZone.runOutsideAngular(() => this.rebuildScene());
    }
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    if (this.animationId !== null) cancelAnimationFrame(this.animationId);
    if (this.controls) this.controls.dispose();
    if (this.resizeObserver) this.resizeObserver.disconnect();
    if (this.renderer) { this.renderer.dispose(); this.renderer.forceContextLoss(); }
    if (this.scene) {
      this.scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Line || obj instanceof THREE.Points) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
          else if (obj.material) (obj.material as THREE.Material).dispose();
        }
      });
      this.scene.clear();
    }
  }

  // ──────────────────────────────────────────────
  //  INITIALIZATION
  // ──────────────────────────────────────────────

  private init(): void {
    const canvas = this.canvasRef.nativeElement;
    const { width, height } = this.getSize();
    const isMobile = width < 768;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(width, height, false);
    this.renderer.setClearColor(this.getSkyClearColor(), 1);
    this.renderer.shadowMap.enabled = !isMobile;
    if (!isMobile) this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(this.getFogColor(), this.getFogDensity());

    // Camera — scale based on farm area (terrain is capped at 30 units)
    const terrainScale = this.getTerrainScale();
    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    const camDist = terrainScale * 0.9;
    this.camera.position.set(camDist, camDist * 0.7, camDist);
    this.camera.lookAt(0, 0, 0);

    // Controls
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.enablePan = false;
    this.controls.minDistance = terrainScale * 0.4;
    this.controls.maxDistance = terrainScale * 3;
    this.controls.maxPolarAngle = Math.PI / 2.2;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.4;
    this.controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };

    // Build all scene elements from data
    this.setupLighting();
    this.buildTerrain();
    this.buildBoundaryOutline();
    this.buildSoilZones();
    this.buildWaterFeatures();
    this.buildSensorNodes();
    this.buildCropVegetation();
    this.buildRainSystem();
    this.buildGridHelper();

    // Resize observer
    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(this.containerRef.nativeElement);
  }

  /** Tear down dynamic objects and rebuild from latest inputs */
  private rebuildScene(): void {
    // Remove dynamic objects (keep lights & camera)
    const toRemove: THREE.Object3D[] = [];
    this.scene.traverse((obj) => {
      if (obj === this.scene) return;
      if (obj instanceof THREE.Light || obj === this.camera) return;
      toRemove.push(obj);
    });
    toRemove.forEach(obj => {
      this.scene.remove(obj);
      if (obj instanceof THREE.Mesh || obj instanceof THREE.Line || obj instanceof THREE.Points) {
        obj.geometry?.dispose();
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
        else if (obj.material) (obj.material as THREE.Material).dispose();
      }
    });
    this.sensorNodes = [];
    this.sensorGlows = [];
    this.waterFeatures = [];

    // Update atmosphere
    this.renderer.setClearColor(this.getSkyClearColor(), 1);
    (this.scene.fog as THREE.FogExp2).color.set(this.getFogColor());
    (this.scene.fog as THREE.FogExp2).density = this.getFogDensity();

    // Rebuild everything
    this.buildTerrain();
    this.buildBoundaryOutline();
    this.buildSoilZones();
    this.buildWaterFeatures();
    this.buildSensorNodes();
    this.buildCropVegetation();
    this.buildRainSystem();
    this.buildGridHelper();

    // Adjust camera distance
    const terrainScale = this.getTerrainScale();
    this.controls.minDistance = terrainScale * 0.4;
    this.controls.maxDistance = terrainScale * 3;
  }

  // ──────────────────────────────────────────────
  //  DATA → GEOMETRY CALCULATIONS
  // ──────────────────────────────────────────────

  /** Convert acres to a 3D terrain side-length (capped for visual clarity) */
  private getTerrainScale(): number {
    const acres = this.calculatedArea || this.farmArea || 2;
    // Use logarithmic scaling so large farms (100+ acres) don't blow up the scene.
    // Small farms (1-5 acres) → 10-16 units, large farms (100-500 acres) → 22-30 units
    const raw = 8 + Math.log2(Math.max(1, acres)) * 4;
    return Math.min(30, Math.max(10, raw));
  }

  /** Parse farmBoundary JSON to 2D points normalized to 3D space */
  private parseBoundaryTo3D(): { x: number; z: number }[] | null {
    if (!this.farmBoundary) return null;
    try {
      const coords: number[][] = JSON.parse(this.farmBoundary);
      if (!Array.isArray(coords) || coords.length < 3) return null;

      // Find centroid
      let cLat = 0, cLng = 0;
      coords.forEach(c => { cLat += c[0]; cLng += c[1]; });
      cLat /= coords.length;
      cLng /= coords.length;

      const scale = this.getTerrainScale();
      // Convert lat/lng offsets to local 3D coordinates
      // 1 degree lat ≈ 111,320 m, 1 degree lng ≈ 111,320 * cos(lat) m
      const cosLat = Math.cos(cLat * Math.PI / 180);
      const mPerDegLat = 111320;
      const mPerDegLng = 111320 * cosLat;

      // Find max extent to normalize
      let maxExtent = 0;
      const localCoords = coords.map(c => {
        const dx = (c[1] - cLng) * mPerDegLng;
        const dz = (c[0] - cLat) * mPerDegLat;
        maxExtent = Math.max(maxExtent, Math.abs(dx), Math.abs(dz));
        return { dx, dz };
      });

      // Normalize to fit terrain scale
      const normFactor = maxExtent > 0 ? (scale * 0.4) / maxExtent : 1;

      return localCoords.map(c => ({
        x: c.dx * normFactor,
        z: -c.dz * normFactor, // Flip Z for 3D convention
      }));
    } catch (e) {
      return null;
    }
  }

  /** Soil type → terrain color */
  private getSoilColor(): number {
    const soilColors: Record<string, number> = {
      loamy:  0x3d6b35, // Rich dark green-brown
      clay:   0x6b4423, // Reddish brown
      clayey: 0x6b4423,
      sandy:  0x9e8c6c, // Sandy beige
      silt:   0x5a6b42, // Silty gray-green
      peaty:  0x2d1f12, // Very dark brown
      chalky: 0x8a8a7a, // Grayish white
      black:  0x1a1a14, // Dark black soil
    };
    const key = (this.soilType || 'loamy').toLowerCase();
    return soilColors[key] ?? 0x3d6b35;
  }

  /** Soil type → material roughness */
  private getSoilRoughness(): number {
    const map: Record<string, number> = {
      loamy: 0.8, clay: 0.7, clayey: 0.7,
      sandy: 0.95, silt: 0.75, peaty: 0.85,
      chalky: 0.6, black: 0.82,
    };
    return map[(this.soilType || '').toLowerCase()] ?? 0.8;
  }

  /** Temperature → sky / clear color tint */
  private getSkyClearColor(): number {
    const temp = this.temperature ?? 25;
    if (temp >= 40) return 0x1a120a; // Hot — warm dark amber sky
    if (temp >= 30) return 0x12181f; // Warm — slight warm tint
    if (temp <= 5) return 0x0d1520;  // Cold — blue-ish dark
    return 0x0f172a;                 // Default slate
  }

  /** Humidity + rainfall → fog density, scaled inversely with terrain size */
  private getFogDensity(): number {
    const hum = this.humidity ?? 50;
    const rain = this.rainfall ?? 0;
    const scale = this.getTerrainScale();
    // Base density inversely proportional to scene size
    let density = 0.6 / scale;
    // Add subtle atmospheric effects (much smaller than base)
    if (hum > 80) density += 0.15 / scale;
    else if (hum > 60) density += 0.08 / scale;
    if (rain > 100) density += 0.1 / scale;
    return density;
  }

  private getFogColor(): number {
    const temp = this.temperature ?? 25;
    if (temp >= 40) return 0x1a140e;
    return 0x0f172a;
  }

  // ──────────────────────────────────────────────
  //  SCENE BUILDERS
  // ──────────────────────────────────────────────

  private setupLighting(): void {
    // Temperature-adjusted sun warmth
    const temp = this.temperature ?? 25;
    const sunColor = temp >= 35 ? 0xffe8b0 : temp <= 10 ? 0xc8d8ff : 0xfff4e0;
    const sunIntensity = temp >= 35 ? 1.2 : 1.0;

    const ambient = new THREE.AmbientLight(0x556688, 0.8);
    this.scene.add(ambient);

    const ts = this.getTerrainScale();
    const dirLight = new THREE.DirectionalLight(sunColor, sunIntensity);
    dirLight.position.set(ts * 0.6, ts * 0.8, ts * 0.5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(512, 512);
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = ts * 4;
    dirLight.shadow.camera.left = -ts;
    dirLight.shadow.camera.right = ts;
    dirLight.shadow.camera.top = ts;
    dirLight.shadow.camera.bottom = -ts;
    this.scene.add(dirLight);

    const hemiLight = new THREE.HemisphereLight(
      temp >= 35 ? 0xffcc88 : 0x88bbff,
      0x336622, 0.6
    );
    this.scene.add(hemiLight);

    const accentLight = new THREE.PointLight(0x22c55e, 0.4, ts * 3);
    accentLight.position.set(0, ts * 0.3, 0);
    this.scene.add(accentLight);
  }

  /** Build terrain plane sized by actual farm area with soil-type coloring */
  private buildTerrain(): void {
    const scale = this.getTerrainScale();
    const segments = Math.min(64, Math.max(16, Math.floor(scale * 2)));
    const geometry = new THREE.PlaneGeometry(scale, scale, segments, segments);

    // Generate elevation based on soil type
    const posAttr = geometry.getAttribute('position');
    const soilKey = (this.soilType || 'loamy').toLowerCase();

    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);
      let elevation = 0;

      // Different soil types → different terrain roughness
      if (soilKey === 'sandy') {
        // Sandy: gentle rolling dunes
        elevation = Math.sin(x * 0.4) * Math.cos(y * 0.3) * 0.5 +
                    Math.sin(x * 1.2 + 2) * 0.15;
      } else if (soilKey === 'clay' || soilKey === 'clayey') {
        // Clay: flat with subtle cracks
        elevation = Math.sin(x * 0.2) * Math.cos(y * 0.2) * 0.15;
      } else if (soilKey === 'peaty') {
        // Peaty: marshy bumps
        elevation = Math.sin(x * 0.6) * Math.cos(y * 0.5) * 0.4 +
                    Math.sin(x * 2 + y * 1.5) * 0.08;
      } else if (soilKey === 'black') {
        // Black soil: rich flat plains
        elevation = Math.sin(x * 0.15) * Math.cos(y * 0.15) * 0.2;
      } else {
        // Loamy / default: moderate undulation
        elevation = Math.sin(x * 0.3) * Math.cos(y * 0.3) * 0.3 +
                    Math.sin(x * 0.7 + 1) * Math.cos(y * 0.5 + 2) * 0.15;
      }

      posAttr.setZ(i, elevation);
    }
    geometry.computeVertexNormals();

    // Moisture-adjusted soil color
    const baseColor = new THREE.Color(this.getSoilColor());
    const hum = this.humidity ?? 50;
    if (hum > 70) baseColor.lerp(new THREE.Color(0x1a3a1a), 0.2); // Darker when wet
    if (hum < 30) baseColor.lerp(new THREE.Color(0x8b7355), 0.25); // Lighter when dry

    const material = new THREE.MeshStandardMaterial({
      color: baseColor,
      roughness: this.getSoilRoughness(),
      metalness: 0.02,
      flatShading: true,
    });

    this.terrainMesh = new THREE.Mesh(geometry, material);
    this.terrainMesh.rotation.x = -Math.PI / 2;
    this.terrainMesh.receiveShadow = true;
    this.scene.add(this.terrainMesh);
  }

  /** If farm boundary exists, render actual polygon outline in 3D */
  private buildBoundaryOutline(): void {
    const points3D = this.parseBoundaryTo3D();
    if (!points3D || points3D.length < 3) return;

    // Build closed loop
    const vertices: THREE.Vector3[] = points3D.map(p => new THREE.Vector3(p.x, 0.15, p.z));
    vertices.push(vertices[0].clone()); // Close the shape

    const lineGeo = new THREE.BufferGeometry().setFromPoints(vertices);
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x22c55e,
      linewidth: 2,
      transparent: true,
      opacity: 0.8,
    });
    this.boundaryLine = new THREE.Line(lineGeo, lineMat);
    this.scene.add(this.boundaryLine);

    // Also create a filled semi-transparent polygon on the ground
    const shape = new THREE.Shape();
    shape.moveTo(points3D[0].x, points3D[0].z);
    for (let i = 1; i < points3D.length; i++) {
      shape.lineTo(points3D[i].x, points3D[i].z);
    }
    shape.closePath();

    const fillGeo = new THREE.ShapeGeometry(shape);
    const fillMat = new THREE.MeshBasicMaterial({
      color: 0x22c55e,
      transparent: true,
      opacity: 0.08,
      side: THREE.DoubleSide,
    });
    const fillMesh = new THREE.Mesh(fillGeo, fillMat);
    fillMesh.rotation.x = -Math.PI / 2;
    fillMesh.position.y = 0.05;
    this.scene.add(fillMesh);

    // Boundary corner pins
    points3D.forEach((p) => {
      const pinGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.6, 6);
      const pinMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, emissive: 0x22c55e, emissiveIntensity: 0.3 });
      const pin = new THREE.Mesh(pinGeo, pinMat);
      pin.position.set(p.x, 0.3, p.z);
      pin.castShadow = true;
      this.scene.add(pin);
    });
  }

  /** Soil pH → colored zone ring on terrain */
  private buildSoilZones(): void {
    if (this.soilPh == null) return;
    const scale = this.getTerrainScale();

    // pH color: acidic (< 6) red, neutral (6-7.5) green, alkaline (> 7.5) blue
    let phColor: number;
    if (this.soilPh < 6.0) phColor = 0xef4444;
    else if (this.soilPh > 7.5) phColor = 0x3b82f6;
    else phColor = 0x22c55e;

    const ringGeo = new THREE.RingGeometry(scale * 0.25, scale * 0.3, 48);
    const ringMat = new THREE.MeshBasicMaterial({
      color: phColor, transparent: true, opacity: 0.12, side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.03;
    this.scene.add(ring);
  }

  /** Water source → 3D water features */
  private buildWaterFeatures(): void {
    const scale = this.getTerrainScale();
    const source = (this.waterSource || '').toLowerCase();

    if (source === 'canal') {
      // Render a meandering canal across the farm
      const canalPath: THREE.Vector3[] = [];
      for (let i = -10; i <= 10; i++) {
        const t = i / 10;
        canalPath.push(new THREE.Vector3(
          t * scale * 0.45,
          -0.05,
          Math.sin(t * 3) * scale * 0.08
        ));
      }
      const canalCurve = new THREE.CatmullRomCurve3(canalPath);
      const canalGeo = new THREE.TubeGeometry(canalCurve, 40, 0.25, 6, false);
      const canalMat = new THREE.MeshStandardMaterial({
        color: 0x1e90ff, transparent: true, opacity: 0.6,
        roughness: 0.1, metalness: 0.3,
      });
      const canal = new THREE.Mesh(canalGeo, canalMat);
      this.scene.add(canal);
      this.waterFeatures.push(canal);
    } else if (source === 'borewell') {
      // Render a well structure at center
      const wellGeo = new THREE.CylinderGeometry(0.4, 0.5, 0.8, 12);
      const wellMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.4, metalness: 0.5 });
      const well = new THREE.Mesh(wellGeo, wellMat);
      well.position.set(0, 0.4, 0);
      well.castShadow = true;
      this.scene.add(well);
      this.waterFeatures.push(well);

      // Water surface inside well
      const waterGeo = new THREE.CircleGeometry(0.35, 16);
      const waterMat = new THREE.MeshStandardMaterial({
        color: 0x1e90ff, transparent: true, opacity: 0.7, metalness: 0.4, roughness: 0.1,
      });
      const waterDisc = new THREE.Mesh(waterGeo, waterMat);
      waterDisc.rotation.x = -Math.PI / 2;
      waterDisc.position.set(0, 0.15, 0);
      this.scene.add(waterDisc);
      this.waterFeatures.push(waterDisc);
    } else if (source === 'drip' || source === 'sprinkler') {
      // Render irrigation pipe lines across crop area
      const pipeCount = Math.floor(scale / 3);
      for (let i = 0; i < pipeCount; i++) {
        const offset = (i - pipeCount / 2) * 2.5;
        const pipeGeo = new THREE.CylinderGeometry(0.03, 0.03, scale * 0.7, 6);
        const pipeMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.6 });
        const pipe = new THREE.Mesh(pipeGeo, pipeMat);
        pipe.rotation.z = Math.PI / 2;
        pipe.position.set(0, 0.08, offset);
        this.scene.add(pipe);
        this.waterFeatures.push(pipe);

        if (source === 'sprinkler' && i % 2 === 0) {
          // Sprinkler heads
          const headGeo = new THREE.SphereGeometry(0.1, 8, 8);
          const headMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.7 });
          const head = new THREE.Mesh(headGeo, headMat);
          head.position.set(0, 0.2, offset);
          this.scene.add(head);
          this.waterFeatures.push(head);
        }
      }
    }

    // Underground water table plane (based on waterLevel)
    if (this.waterLevel != null && this.waterLevel > 0) {
      const wtDepth = -Math.min(this.waterLevel * 0.3, 3); // Clamp visual depth
      const wtGeo = new THREE.PlaneGeometry(scale * 0.8, scale * 0.8);
      const wtMat = new THREE.MeshStandardMaterial({
        color: 0x0ea5e9, transparent: true, opacity: 0.15,
        roughness: 0.05, metalness: 0.3, side: THREE.DoubleSide,
      });
      this.waterPlaneMesh = new THREE.Mesh(wtGeo, wtMat);
      this.waterPlaneMesh.rotation.x = -Math.PI / 2;
      this.waterPlaneMesh.position.y = wtDepth;
      this.scene.add(this.waterPlaneMesh);
    }
  }

  /** NPK sensor nodes placed based on boundary or terrain scale */
  private buildSensorNodes(): void {
    const scale = this.getTerrainScale();
    const boundary3D = this.parseBoundaryTo3D();
    const hasN = this.nitrogen != null;
    const hasP = this.phosphorus != null;
    const hasK = this.potassium != null;
    const hasHum = this.humidity != null;

    // Place sensors at boundary corners if available, else distribute evenly
    const sensors: { x: number; z: number; label: string; value: number; unit: string }[] = [];

    if (hasHum) {
      const pos = boundary3D && boundary3D[0] ? boundary3D[0] : { x: 0, z: 0 };
      sensors.push({ ...pos, label: 'Humidity', value: this.humidity!, unit: '%' });
    }
    if (hasN) {
      const pos = boundary3D && boundary3D.length > 1 ? boundary3D[1] : { x: -scale * 0.3, z: -scale * 0.2 };
      sensors.push({ ...pos, label: 'Nitrogen', value: this.nitrogen!, unit: 'mg/kg' });
    }
    if (hasP) {
      const pos = boundary3D && boundary3D.length > 2 ? boundary3D[2] : { x: scale * 0.3, z: scale * 0.1 };
      sensors.push({ ...pos, label: 'Phosphorus', value: this.phosphorus!, unit: 'mg/kg' });
    }
    if (hasK) {
      const pos = boundary3D && boundary3D.length > 3 ? boundary3D[3] : { x: -scale * 0.1, z: scale * 0.3 };
      sensors.push({ ...pos, label: 'Potassium', value: this.potassium!, unit: 'mg/kg' });
    }

    if (sensors.length === 0) return;

    sensors.forEach(sensor => {
      // Sensor pole
      const poleGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.8, 8);
      const poleMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.6 });
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(sensor.x, 0.9, sensor.z);
      this.scene.add(pole);

      // Sensor sphere color based on value health
      const color = this.getSensorHealthColor(sensor.value, sensor.label);
      const nodeGeo = new THREE.SphereGeometry(0.2, 16, 16);
      const nodeMat = new THREE.MeshStandardMaterial({
        color, emissive: color, emissiveIntensity: 0.5,
        metalness: 0.3, roughness: 0.4,
      });
      const node = new THREE.Mesh(nodeGeo, nodeMat);
      node.position.set(sensor.x, 1.9, sensor.z);
      this.scene.add(node);
      this.sensorNodes.push(node);

      // Glow ring
      const glowGeo = new THREE.RingGeometry(0.3, 0.55, 32);
      const glowMat = new THREE.MeshBasicMaterial({
        color, transparent: true, opacity: 0.25, side: THREE.DoubleSide,
      });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      glow.position.set(sensor.x, 0.05, sensor.z);
      glow.rotation.x = -Math.PI / 2;
      this.scene.add(glow);
      this.sensorGlows.push(glow);
    });
  }

  /** Crop vegetation density based on farming type and nutrient levels */
  private buildCropVegetation(): void {
    const scale = this.getTerrainScale();
    this.cropGroup = new THREE.Group();

    const isOrganic = (this.farmingType || '').toUpperCase() === 'ORGANIC';
    // Nutrient health score (0–1) determines crop density & height
    const avgNutrient = (
      (this.nitrogen ?? 70) / 140 +
      (this.phosphorus ?? 50) / 145 +
      (this.potassium ?? 100) / 205
    ) / 3;
    const healthFactor = Math.max(0.3, Math.min(1, avgNutrient));

    // Organic: more diverse, natural crop patterns; Conventional: organized rows
    const boundary3D = this.parseBoundaryTo3D();
    const cropArea = scale * 0.35;
    const density = Math.floor(healthFactor * (isOrganic ? 30 : 45));
    const maxCropH = healthFactor * (isOrganic ? 1.2 : 0.9);

    // Crop colors: organic gets more variety
    const cropColors = isOrganic
      ? [0x15803d, 0x166534, 0x4ade80, 0x84cc16, 0xa3e635]
      : [0x15803d, 0x22c55e, 0x166534];

    for (let i = 0; i < density; i++) {
      let cx: number, cz: number;

      if (isOrganic) {
        // Organic: scattered naturally within boundary or area
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * cropArea;
        cx = Math.cos(angle) * radius;
        cz = Math.sin(angle) * radius;
      } else {
        // Conventional: organized grid rows
        const row = Math.floor(i / 6);
        const col = i % 6;
        cx = (col - 3) * (cropArea / 3);
        cz = (row - density / 12) * (cropArea / 4);
      }

      // Stalk
      const stalkH = 0.2 + Math.random() * maxCropH;
      const sg = new THREE.CylinderGeometry(0.02, 0.04, stalkH, 4);
      const color = cropColors[Math.floor(Math.random() * cropColors.length)];
      const sm = new THREE.MeshStandardMaterial({ color, roughness: 0.9 });
      const stalk = new THREE.Mesh(sg, sm);
      stalk.position.set(cx, stalkH / 2, cz);
      stalk.rotation.z = (Math.random() - 0.5) * 0.1;
      stalk.castShadow = true;
      this.cropGroup.add(stalk);

      // Small leaf/canopy on top for taller stalks
      if (stalkH > 0.5) {
        const leafGeo = new THREE.SphereGeometry(0.1 + Math.random() * 0.1, 6, 4);
        const leafMat = new THREE.MeshStandardMaterial({
          color: cropColors[Math.floor(Math.random() * cropColors.length)],
          roughness: 0.8,
        });
        const leaf = new THREE.Mesh(leafGeo, leafMat);
        leaf.position.set(cx, stalkH + 0.05, cz);
        leaf.scale.y = 0.5;
        this.cropGroup.add(leaf);
      }
    }

    this.scene.add(this.cropGroup);
  }

  /** Rain particle system based on rainfall data */
  private buildRainSystem(): void {
    const rain = this.rainfall ?? 0;
    if (rain < 20) return; // No visible rain below 20mm

    const scale = this.getTerrainScale();
    const count = Math.min(Math.floor(rain * 2), 500);
    this.rainPositions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      this.rainPositions[i3] = (Math.random() - 0.5) * scale;
      this.rainPositions[i3 + 1] = Math.random() * scale * 0.6;
      this.rainPositions[i3 + 2] = (Math.random() - 0.5) * scale;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(this.rainPositions, 3));

    const material = new THREE.PointsMaterial({
      color: 0x88bbff,
      size: 0.08,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.rainParticles = new THREE.Points(geometry, material);
    this.scene.add(this.rainParticles);
  }

  private buildGridHelper(): void {
    const scale = this.getTerrainScale();
    const divisions = Math.min(32, Math.max(8, Math.floor(scale)));
    const grid = new THREE.GridHelper(scale, divisions, 0x1e3a2f, 0x1e293b);
    grid.position.y = 0.01;
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.25;
    this.scene.add(grid);
  }

  // ──────────────────────────────────────────────
  //  ANIMATION LOOP
  // ──────────────────────────────────────────────

  private animate(): void {
    if (this.destroyed) return;
    this.animationId = requestAnimationFrame(() => this.animate());

    const elapsed = this.clock.getElapsedTime();
    this.controls.update();

    // Sensor node pulse
    this.sensorNodes.forEach((node, idx) => {
      const s = 1 + Math.sin(elapsed * 2 + idx * 1.5) * 0.15;
      node.scale.setScalar(s);
    });

    // Sensor glow rings
    this.sensorGlows.forEach((glow, idx) => {
      const s = 1 + Math.sin(elapsed * 1.5 + idx * 1.2) * 0.2;
      glow.scale.setScalar(s);
      (glow.material as THREE.MeshBasicMaterial).opacity = 0.15 + Math.sin(elapsed * 2 + idx) * 0.1;
    });

    // Water table gentle wave
    if (this.waterPlaneMesh) {
      this.waterPlaneMesh.position.y += Math.sin(elapsed * 0.8) * 0.001;
    }

    // Rain fall animation
    if (this.rainParticles && this.rainPositions) {
      const scale = this.getTerrainScale();
      const speed = ((this.rainfall ?? 50) / 100) * 0.15 + 0.05;
      for (let i = 0; i < this.rainPositions.length / 3; i++) {
        const i3 = i * 3;
        this.rainPositions[i3 + 1] -= speed;
        if (this.rainPositions[i3 + 1] < 0) {
          this.rainPositions[i3 + 1] = scale * 0.6;
        }
      }
      (this.rainParticles.geometry.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true;
    }

    // Gentle crop sway
    if (this.cropGroup) {
      this.cropGroup.children.forEach((child, idx) => {
        child.rotation.z = Math.sin(elapsed * 0.8 + idx * 0.3) * 0.03;
      });
    }

    this.renderer.render(this.scene, this.camera);
  }

  // ──────────────────────────────────────────────
  //  UTILITIES
  // ──────────────────────────────────────────────

  private getSensorHealthColor(value: number, label: string): THREE.ColorRepresentation {
    let normalized: number;
    switch (label) {
      case 'Humidity': normalized = value / 100; break;
      case 'Nitrogen': normalized = value / 140; break;
      case 'Phosphorus': normalized = value / 145; break;
      case 'Potassium': normalized = value / 205; break;
      default: normalized = 0.5;
    }
    if (normalized >= 0.6) return 0x22c55e;
    if (normalized >= 0.3) return 0xf59e0b;
    return 0xef4444;
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
