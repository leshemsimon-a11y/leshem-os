// components/studio/assets/Asset3DViewer.js
//
// LESHEM.S OS — 3D Asset Viewer (Clean 4B.1)
//
// A simple, self-contained 3D preview for uploaded model files (STL / OBJ /
// 3DM / GLB / GLTF). Three.js and its loaders are loaded DYNAMICALLY FROM A
// CDN at runtime (via import()) so the project adds NO npm dependency and the
// Vercel build stays unchanged. If Three.js, a loader, or the format can't be
// handled, the file STILL persists and the viewer shows the required message:
//   "הקובץ נשמר. תצוגת 3D לפורמט הזה תתווסף בהמשך."
//
// Controls: OrbitControls (rotate / zoom / pan). Lighting: neutral ambient +
// directional. Local only — the model bytes come from an IndexedDB object URL
// passed in via `url`. No network calls other than fetching the library code.

import { useEffect, useRef, useState } from 'react';
import { tokens } from '../shared/tokens';
import { ASSETS_OBJ_HE } from '../../../lib/studio/labels';

const THREE_VERSION = '0.160.0';
const CDN = `https://unpkg.com/three@${THREE_VERSION}`;

const SUPPORTED = ['stl', 'obj', '3dm', 'glb', 'gltf'];

export default function Asset3DViewer({ url, extension, fileName, purposeHe }) {
  const mountRef = useRef(null);
  const [state, setState] = useState('loading'); // loading | ready | unsupported | error
  const cleanupRef = useRef(null);

  useEffect(() => {
    const ext = String(extension || '').toLowerCase();
    if (!url || !SUPPORTED.includes(ext)) {
      setState('unsupported');
      return undefined;
    }

    let disposed = false;

    async function run() {
      try {
        const THREE = await import(/* webpackIgnore: true */ `${CDN}/build/three.module.js`);
        if (disposed) return;

        const { OrbitControls } = await import(
          /* webpackIgnore: true */ `${CDN}/examples/jsm/controls/OrbitControls.js`
        );

        const mount = mountRef.current;
        if (!mount) return;
        const width = mount.clientWidth || 480;
        const height = 320;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf4efe6);

        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 5000);
        camera.position.set(0, 0, 100);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio || 1);
        mount.appendChild(renderer.domElement);

        // Neutral lighting
        scene.add(new THREE.AmbientLight(0xffffff, 0.7));
        const dir = new THREE.DirectionalLight(0xffffff, 0.8);
        dir.position.set(1, 1, 1);
        scene.add(dir);
        const dir2 = new THREE.DirectionalLight(0xffffff, 0.4);
        dir2.position.set(-1, -0.5, -1);
        scene.add(dir2);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;

        const material = new THREE.MeshStandardMaterial({
          color: 0xcdb988,
          metalness: 0.25,
          roughness: 0.55,
        });

        function frameObject(object3d) {
          const box = new THREE.Box3().setFromObject(object3d);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());
          object3d.position.sub(center);
          const maxDim = Math.max(size.x, size.y, size.z) || 1;
          camera.position.set(0, 0, maxDim * 2.2);
          camera.near = maxDim / 100;
          camera.far = maxDim * 100;
          camera.updateProjectionMatrix();
          controls.update();
        }

        async function loadModel() {
          if (ext === 'stl') {
            const { STLLoader } = await import(
              /* webpackIgnore: true */ `${CDN}/examples/jsm/loaders/STLLoader.js`
            );
            const geo = new STLLoader().parse(await (await fetch(url)).arrayBuffer());
            const mesh = new THREE.Mesh(geo, material);
            scene.add(mesh);
            frameObject(mesh);
            return;
          }
          if (ext === 'obj') {
            const { OBJLoader } = await import(
              /* webpackIgnore: true */ `${CDN}/examples/jsm/loaders/OBJLoader.js`
            );
            const text = await (await fetch(url)).text();
            const obj = new OBJLoader().parse(text);
            obj.traverse((c) => {
              if (c.isMesh) c.material = material;
            });
            scene.add(obj);
            frameObject(obj);
            return;
          }
          if (ext === 'glb' || ext === 'gltf') {
            const { GLTFLoader } = await import(
              /* webpackIgnore: true */ `${CDN}/examples/jsm/loaders/GLTFLoader.js`
            );
            const buf = await (await fetch(url)).arrayBuffer();
            const gltf = await new Promise((res, rej) =>
              new GLTFLoader().parse(buf, '', res, rej)
            );
            scene.add(gltf.scene);
            frameObject(gltf.scene);
            return;
          }
          if (ext === '3dm') {
            const { Rhino3dmLoader } = await import(
              /* webpackIgnore: true */ `${CDN}/examples/jsm/loaders/3DMLoader.js`
            );
            const loader = new Rhino3dmLoader();
            loader.setLibraryPath('https://unpkg.com/rhino3dm@8.4.0/');
            const buf = await (await fetch(url)).arrayBuffer();
            const obj = await new Promise((res, rej) => loader.parse(buf, res, rej));
            scene.add(obj);
            frameObject(obj);
          }
        }

        await loadModel();
        if (disposed) {
          renderer.dispose();
          return;
        }
        setState('ready');

        let raf = 0;
        const animate = () => {
          raf = requestAnimationFrame(animate);
          controls.update();
          renderer.render(scene, camera);
        };
        animate();

        cleanupRef.current = () => {
          cancelAnimationFrame(raf);
          controls.dispose();
          renderer.dispose();
          if (renderer.domElement && renderer.domElement.parentNode) {
            renderer.domElement.parentNode.removeChild(renderer.domElement);
          }
        };
      } catch (e) {
        console.warn('[Asset3DViewer] preview unavailable:', e);
        if (!disposed) setState((s) => (s === 'unsupported' ? s : 'error'));
      }
    }

    run();

    return () => {
      disposed = true;
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [url, extension]);

  return (
    <div style={styles.wrap} dir="rtl">
      <div style={styles.meta}>
        <span style={styles.fileName}>{fileName}</span>
        {purposeHe && <span style={styles.purpose}>{purposeHe}</span>}
      </div>

      {(state === 'loading' || state === 'ready') && (
        <div ref={mountRef} style={styles.canvasHolder}>
          {state === 'loading' && (
            <div style={styles.overlay}>{ASSETS_OBJ_HE.viewer3dLoading}</div>
          )}
        </div>
      )}

      {state === 'unsupported' && (
        <div style={styles.message}>{ASSETS_OBJ_HE.viewer3dUnsupported}</div>
      )}
      {state === 'error' && (
        <div style={styles.message}>{ASSETS_OBJ_HE.viewer3dError}</div>
      )}

      {state === 'ready' && (
        <p style={styles.hint}>{ASSETS_OBJ_HE.viewer3dRotateHint}</p>
      )}
    </div>
  );
}

const styles = {
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '12px',
    background: tokens.color.pearl,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.md,
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
  },
  fileName: {
    fontFamily: tokens.font.body,
    fontSize: '14px',
    fontWeight: 600,
    color: tokens.color.charcoal,
  },
  purpose: {
    fontFamily: tokens.font.body,
    fontSize: '11px',
    color: tokens.color.gold,
    background: tokens.color.goldFaint,
    borderRadius: '999px',
    padding: '2px 8px',
  },
  canvasHolder: {
    position: 'relative',
    width: '100%',
    height: '320px',
    background: tokens.color.pearl,
    borderRadius: tokens.radius.sm,
    overflow: 'hidden',
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: tokens.font.body,
    fontSize: '14px',
    color: tokens.color.inkFaint,
  },
  message: {
    fontFamily: tokens.font.body,
    fontSize: '14px',
    lineHeight: 1.6,
    color: tokens.color.inkSoft,
    background: tokens.color.canvas,
    border: `1px dashed ${tokens.color.goldSoft}`,
    borderRadius: tokens.radius.sm,
    padding: '20px',
    textAlign: 'center',
  },
  hint: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    color: tokens.color.inkFaint,
    margin: 0,
    textAlign: 'center',
  },
};
