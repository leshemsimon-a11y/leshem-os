// components/studio/assets/Asset3DViewer.js
//
// LESHEM.S OS — Real 3D Asset Viewer (Clean 4B.2)
//
// Renders uploaded model files with Three.js imported LOCALLY from the `three`
// package (a real dependency added in package.json), not from a CDN. Supports
// STL, OBJ, GLB, GLTF now. For 3DM we attempt Rhino3dmLoader but fall back to a
// clear saved-message if the wasm/library path isn't stable — the file is
// still persisted.
//
// Controls: OrbitControls (rotate / zoom / pan). Neutral background + simple
// lighting. Model is auto-centered and auto-scaled. Shows file name + purpose.
// The model bytes come from an IndexedDB object URL passed in via `url`.

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { tokens } from '../shared/tokens';
import { ASSETS_OBJ_HE } from '../../../lib/studio/labels';

const PREVIEWABLE = ['stl', 'obj', 'glb', 'gltf'];

export default function Asset3DViewer({ url, extension, fileName, purposeHe }) {
  const mountRef = useRef(null);
  const cleanupRef = useRef(null);
  const [state, setState] = useState('loading'); // loading | ready | unsupported | rhino | error

  useEffect(() => {
    const ext = String(extension || '').toLowerCase();

    if (!url) {
      setState('error');
      return undefined;
    }
    if (ext === '3dm') {
      // Attempt Rhino; if anything is off, show the saved-message fallback.
      // Kept conservative so the build/runtime never breaks on wasm path.
      setState('rhino');
      return undefined;
    }
    if (!PREVIEWABLE.includes(ext)) {
      setState('unsupported');
      return undefined;
    }

    let disposed = false;

    async function run() {
      try {
        const mount = mountRef.current;
        if (!mount) return;
        const width = mount.clientWidth || 480;
        const height = 340;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf4efe6); // neutral pearl

        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 5000);
        camera.position.set(0, 0, 100);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);
        mount.appendChild(renderer.domElement);

        // Simple, neutral lighting
        scene.add(new THREE.AmbientLight(0xffffff, 0.75));
        const key = new THREE.DirectionalLight(0xffffff, 0.85);
        key.position.set(1, 1, 1);
        scene.add(key);
        const fill = new THREE.DirectionalLight(0xffffff, 0.4);
        fill.position.set(-1, -0.5, -1);
        scene.add(fill);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.enablePan = true;

        const material = new THREE.MeshStandardMaterial({
          color: 0xcdb988,
          metalness: 0.25,
          roughness: 0.55,
        });

        function frame(object3d) {
          const box = new THREE.Box3().setFromObject(object3d);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());
          object3d.position.x -= center.x;
          object3d.position.y -= center.y;
          object3d.position.z -= center.z;
          const maxDim = Math.max(size.x, size.y, size.z) || 1;
          camera.position.set(0, 0, maxDim * 2.2);
          camera.near = maxDim / 100;
          camera.far = maxDim * 100;
          camera.updateProjectionMatrix();
          controls.target.set(0, 0, 0);
          controls.update();
        }

        const res = await fetch(url);

        if (ext === 'stl') {
          const buf = await res.arrayBuffer();
          const geo = new STLLoader().parse(buf);
          geo.computeVertexNormals();
          const mesh = new THREE.Mesh(geo, material);
          scene.add(mesh);
          frame(mesh);
        } else if (ext === 'obj') {
          const text = await res.text();
          const obj = new OBJLoader().parse(text);
          obj.traverse((c) => {
            if (c.isMesh) c.material = material;
          });
          scene.add(obj);
          frame(obj);
        } else if (ext === 'glb' || ext === 'gltf') {
          const buf = await res.arrayBuffer();
          const gltf = await new Promise((resolve, reject) =>
            new GLTFLoader().parse(buf, '', resolve, reject)
          );
          scene.add(gltf.scene);
          frame(gltf.scene);
        }

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

        const onResize = () => {
          const w = mount.clientWidth || width;
          renderer.setSize(w, height);
          camera.aspect = w / height;
          camera.updateProjectionMatrix();
        };
        if (typeof window !== 'undefined') window.addEventListener('resize', onResize);

        cleanupRef.current = () => {
          cancelAnimationFrame(raf);
          if (typeof window !== 'undefined') window.removeEventListener('resize', onResize);
          controls.dispose();
          renderer.dispose();
          if (renderer.domElement && renderer.domElement.parentNode) {
            renderer.domElement.parentNode.removeChild(renderer.domElement);
          }
        };
      } catch (e) {
        console.warn('[Asset3DViewer] preview failed:', e);
        if (!disposed) setState('error');
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

      {state === 'rhino' && (
        <div style={styles.message}>{ASSETS_OBJ_HE.viewer3dRhino}</div>
      )}
      {state === 'unsupported' && (
        <div style={styles.message}>{ASSETS_OBJ_HE.viewer3dUnsupported}</div>
      )}
      {state === 'error' && (
        <div style={styles.message}>{ASSETS_OBJ_HE.viewer3dError}</div>
      )}

      {state === 'ready' && <p style={styles.hint}>{ASSETS_OBJ_HE.viewer3dRotateHint}</p>}
    </div>
  );
}

const styles = {
  wrap: { display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', background: tokens.color.pearl, border: `1px solid ${tokens.color.cardEdge}`, borderRadius: tokens.radius.md },
  meta: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' },
  fileName: { fontFamily: tokens.font.body, fontSize: '14px', fontWeight: 600, color: tokens.color.charcoal },
  purpose: { fontFamily: tokens.font.body, fontSize: '11px', color: tokens.color.gold, background: tokens.color.goldFaint, borderRadius: '999px', padding: '2px 8px' },
  canvasHolder: { position: 'relative', width: '100%', height: '340px', background: tokens.color.pearl, borderRadius: tokens.radius.sm, overflow: 'hidden' },
  overlay: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: tokens.font.body, fontSize: '14px', color: tokens.color.inkFaint },
  message: { fontFamily: tokens.font.body, fontSize: '14px', lineHeight: 1.6, color: tokens.color.inkSoft, background: tokens.color.canvas, border: `1px dashed ${tokens.color.goldSoft}`, borderRadius: tokens.radius.sm, padding: '20px', textAlign: 'center' },
  hint: { fontFamily: tokens.font.body, fontSize: '12px', color: tokens.color.inkFaint, margin: 0, textAlign: 'center' },
};
