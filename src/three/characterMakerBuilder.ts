import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import type {
  CharacterAddonConfig,
  CharacterBeakStyle,
  CharacterEyebrowExpression,
  CharacterHairStyle,
  CharacterHeadSegmentProfile,
  CharacterLimbProfile,
  CharacterMakerDoc,
  CharacterMaterialFinish,
  CharacterMouthStyle,
  CharacterMuzzleConfig,
  CharacterMuzzlePresetId,
  CharacterNoseStyle,
  CharacterNostrilStyle,
  CharacterPresetId,
  CharacterSpikesConfig,
  CharacterSurfaceCoatConfig,
  CharacterTeethStyle,
} from '../types/maker';
import { getSavedCharacterSpeciesDefault } from '../utils/defaultCharacterPresets';
import {
  polygonizeSdfToGeometry,
  SdfFieldEvaluator,
  type SdfPrimitive,
} from './sdfMarchingCubes';

export type CharacterPresetCategory = 'humans' | 'animals' | 'creatures';

export interface CharacterPresetInfo {
  id: CharacterPresetId;
  name: string;
  subtitle: string;
  accentHex: string;
  group: 'storybook' | 'hero';
  category: CharacterPresetCategory;
  build: () => CharacterMakerDoc;
}

export interface BuiltCharacterAsset {
  root: THREE.Group;
  skinnedMesh: THREE.SkinnedMesh;
  skeleton: THREE.Skeleton;
  bones: THREE.Bone[];
  bonesByName: Record<string, THREE.Bone>;
  eyelids: {
    node: THREE.Object3D;
    role: 'top' | 'bottom';
    minOpenRad: number;
    maxCloseRad: number;
    restClosedFrac: number;
  }[];
  partAnchors: { key: string; worldPos: THREE.Vector3 }[];
  vertexCount: number;
  triangleCount: number;
}

export const MUZZLE_PRESET_OPTIONS: { id: CharacterMuzzlePresetId; label: string }[] = [
  { id: 'none', label: 'No Muzzle' },
  { id: 'bunnySplit', label: 'Bunny Split' },
  { id: 'squirrelPuff', label: 'Squirrel Puff' },
  { id: 'catWhiskerPad', label: 'Cat Whisker Pad' },
  { id: 'foxTaper', label: 'Fox Tapered' },
  { id: 'dogSnout', label: 'Dog Snout' },
  { id: 'horseMuzzle', label: 'Horse Muzzle' },
  { id: 'bearBroad', label: 'Bear Broad' },
  { id: 'lizardSnout', label: 'Gecko / Lizard' },
];

export const BEAK_PRESET_OPTIONS: { id: CharacterBeakStyle; label: string }[] = [
  { id: 'none', label: 'None' },
  { id: 'songbird', label: 'Bird / Tweety' },
  { id: 'duck', label: 'Duck Bill' },
  { id: 'owl', label: 'Owl Hook' },
  { id: 'eagleHawk', label: 'Eagle / Hawk' },
  { id: 'storkCrane', label: 'Stork / Crane' },
  { id: 'pelican', label: 'Pelican Pouch' },
];

export function getBeakPresetDefaults(style: CharacterBeakStyle): {
  beakLength: number;
  beakWidth: number;
  beakHeight: number;
  beakHook: number;
  beakOpen: number;
  beakColor: string;
  beakLowerColor: string;
} {
  switch (style) {
    case 'duck':
      return {
        beakLength: 0.115,
        beakWidth: 0.088,
        beakHeight: 0.036,
        beakHook: -0.08,
        beakOpen: 0.08,
        beakColor: '#FB923C',
        beakLowerColor: '#EA580C',
      };
    case 'owl':
      return {
        beakLength: 0.058,
        beakWidth: 0.042,
        beakHeight: 0.052,
        beakHook: 0.65,
        beakOpen: 0.04,
        beakColor: '#F59E0B',
        beakLowerColor: '#B45309',
      };
    case 'eagleHawk':
      return {
        beakLength: 0.11,
        beakWidth: 0.052,
        beakHeight: 0.068,
        beakHook: 0.92,
        beakOpen: 0.05,
        beakColor: '#FBBF24',
        beakLowerColor: '#D97706',
      };
    case 'storkCrane':
      return {
        beakLength: 0.24,
        beakWidth: 0.044,
        beakHeight: 0.042,
        beakHook: 0.04,
        beakOpen: 0.03,
        beakColor: '#EF4444',
        beakLowerColor: '#DC2626',
      };
    case 'pelican':
      return {
        beakLength: 0.25,
        beakWidth: 0.068,
        beakHeight: 0.086,
        beakHook: 0.28,
        beakOpen: 0.06,
        beakColor: '#F59E0B',
        beakLowerColor: '#FDE68A',
      };
    case 'songbird':
    default:
      return {
        beakLength: 0.068,
        beakWidth: 0.048,
        beakHeight: 0.044,
        beakHook: 0.12,
        beakOpen: 0.08,
        beakColor: '#F59E0B',
        beakLowerColor: '#D97706',
      };
  }
}

export function createMuzzlePreset(
  preset: CharacterMuzzlePresetId,
  color = '#F6CFAF'
): CharacterMuzzleConfig {
  switch (preset) {
    case 'bunnySplit':
      return {
        preset,
        length: 0.072,
        yOffset: -0.022,
        tiltDeg: 4,
        splitCleft: 0.85,
        segments: [
          { rx: 0.092, ry: 0.074 },
          { rx: 0.086, ry: 0.070 },
          { rx: 0.078, ry: 0.064 },
          { rx: 0.072, ry: 0.058 },
          { rx: 0.056, ry: 0.046 },
        ],
        color,
      };
    case 'squirrelPuff':
      return {
        preset,
        length: 0.068,
        yOffset: -0.02,
        tiltDeg: 2,
        splitCleft: 0.78,
        segments: [
          { rx: 0.095, ry: 0.075 },
          { rx: 0.088, ry: 0.070 },
          { rx: 0.076, ry: 0.060 },
          { rx: 0.064, ry: 0.050 },
          { rx: 0.048, ry: 0.040 },
        ],
        color,
      };
    case 'catWhiskerPad':
      return {
        preset,
        length: 0.064,
        yOffset: -0.024,
        tiltDeg: 3,
        splitCleft: 0.72,
        segments: [
          { rx: 0.088, ry: 0.068 },
          { rx: 0.082, ry: 0.062 },
          { rx: 0.074, ry: 0.056 },
          { rx: 0.066, ry: 0.048 },
          { rx: 0.050, ry: 0.038 },
        ],
        color,
      };
    case 'foxTaper':
      return {
        preset,
        length: 0.145,
        yOffset: -0.024,
        tiltDeg: 7,
        splitCleft: 0,
        segments: [
          { rx: 0.094, ry: 0.082 },
          { rx: 0.074, ry: 0.064 },
          { rx: 0.054, ry: 0.048 },
          { rx: 0.038, ry: 0.035 },
          { rx: 0.024, ry: 0.023 },
        ],
        color,
      };
    case 'dogSnout':
      return {
        preset,
        length: 0.132,
        yOffset: -0.022,
        tiltDeg: 5,
        splitCleft: 0.12,
        segments: [
          { rx: 0.096, ry: 0.084 },
          { rx: 0.078, ry: 0.068 },
          { rx: 0.066, ry: 0.056 },
          { rx: 0.058, ry: 0.050 },
          { rx: 0.046, ry: 0.042 },
        ],
        color,
      };
    case 'horseMuzzle':
      // Wide root tapering to flatter mid bridge, then flaring softly into a rounder end!
      return {
        preset,
        length: 0.195,
        yOffset: -0.026,
        tiltDeg: 18,
        splitCleft: 0.08,
        segments: [
          { rx: 0.096, ry: 0.092 },
          { rx: 0.072, ry: 0.072 },
          { rx: 0.056, ry: 0.054 },
          { rx: 0.066, ry: 0.064 },
          { rx: 0.062, ry: 0.058 },
        ],
        color,
      };
    case 'bearBroad':
      return {
        preset,
        length: 0.105,
        yOffset: -0.025,
        tiltDeg: 5,
        splitCleft: 0.18,
        segments: [
          { rx: 0.108, ry: 0.094 },
          { rx: 0.094, ry: 0.082 },
          { rx: 0.082, ry: 0.072 },
          { rx: 0.072, ry: 0.062 },
          { rx: 0.058, ry: 0.052 },
        ],
        color,
      };
    case 'lizardSnout':
      return {
        preset,
        length: 0.135,
        yOffset: -0.018,
        tiltDeg: 4,
        splitCleft: 0,
        segments: [
          { rx: 0.118, ry: 0.076 },
          { rx: 0.106, ry: 0.064 },
          { rx: 0.092, ry: 0.054 },
          { rx: 0.076, ry: 0.044 },
          { rx: 0.054, ry: 0.032 },
        ],
        color,
      };
    case 'none':
    default:
      return {
        preset: 'none',
        length: 0,
        yOffset: -0.02,
        tiltDeg: 4,
        splitCleft: 0,
        segments: [
          { rx: 0.085, ry: 0.075 },
          { rx: 0.076, ry: 0.068 },
          { rx: 0.068, ry: 0.060 },
          { rx: 0.058, ry: 0.052 },
          { rx: 0.046, ry: 0.042 },
        ],
        color,
      };
  }
}

export interface ResolvedCharacterExtras {
  muzzle: CharacterMuzzleConfig;
  beakStyle: CharacterBeakStyle;
  beakLength: number;
  beakWidth: number;
  beakHeight: number;
  beakHook: number;
  beakOpen: number;
  beakColor: string;
  beakLowerColor: string;
  noseStyle: CharacterNoseStyle;
  noseSize: number;
  noseScaleX: number;
  noseScaleY: number;
  noseScaleZ: number;
  noseOffsetY: number;
  noseOffsetZ: number;
  noseColor: string;
  nostrilsEnabled: boolean;
  nostrilStyle: CharacterNostrilStyle;
  nostrilSideAngleDeg: number;
  nostrilHeightOffset: number;
  nostrilForwardOffset: number;
  nostrilSize: number;
  nostrilColor: string;
  mouthStyle: CharacterMouthStyle;
  mouthWidthScale: number;
  mouthOpenAmount: number;
  mouthOffsetY: number;
  mouthOffsetZ: number;
  mouthTiltDeg: number;
  mouthRecessEnabled: boolean;
  mouthTongueEnabled: boolean;
  mouthTongueColor: string;
  mouthTeethStyle: CharacterTeethStyle;
  buckTeethSize: number;
  buckTeethTopWidth: number;
  buckTeethBottomWidth: number;
  wingFold: number;
  wingTipColor: string;
  hairAccentColor: string;
  hairOffsetX: number;
  hairOffsetY: number;
  hairOffsetZ: number;
  hairRotX: number;
  hairRotY: number;
  hairRotZ: number;
  hairScale: number;
  surfaceCoat: CharacterSurfaceCoatConfig;
  spikes: CharacterSpikesConfig;
  addons: CharacterAddonConfig;
  headCrown: CharacterHeadSegmentProfile;
  headJaw: CharacterHeadSegmentProfile;
}

export function createDefaultHeadCrown(head: CharacterLimbProfile): CharacterHeadSegmentProfile {
  return {
    startRadius: Number(Math.max(0.02, head.endRadius * 0.78).toFixed(3)),
    midRadius: Number(Math.max(0.02, head.endRadius * 0.68).toFixed(3)),
    endRadius: Number(Math.max(0.018, head.endRadius * 0.44).toFixed(3)),
    curvature: 0.15,
    length: Number(Math.max(0.04, head.endRadius * 0.44).toFixed(3)),
    squashX: Number((head.squashX ?? 1.0).toFixed(2)),
    squashZ: Number((head.squashZ ?? 1.02).toFixed(2)),
    color: head.color,
    offsetY: 0,
    offsetZ: 0,
    blendScale: 0.72,
  };
}

export function createDefaultHeadJaw(head: CharacterLimbProfile): CharacterHeadSegmentProfile {
  return {
    startRadius: Number(Math.max(0.02, head.startRadius * 0.74).toFixed(3)),
    midRadius: Number(Math.max(0.02, head.startRadius * 0.65).toFixed(3)),
    endRadius: Number(Math.max(0.016, head.startRadius * 0.48).toFixed(3)),
    curvature: 0.1,
    length: 0.06,
    squashX: Number(((head.squashX ?? 1.0) * 0.94).toFixed(2)),
    squashZ: Number(((head.squashZ ?? 1.0) * 0.96).toFixed(2)),
    color: head.color,
    offsetY: 0.018,
    offsetZ: 0.016,
    blendScale: 0.62,
  };
}

export function createDefaultSurfaceCoat(): CharacterSurfaceCoatConfig {
  return {
    mode: 'none',
    intensity: 0.72,
    density: 0.85,
    scaleSize: 1.0,
    clumpiness: 0.55,
    tipColor: '#FDE68A',
  };
}

export function createDefaultSpikesConfig(): CharacterSpikesConfig {
  return {
    enabled: false,
    style: 'porcupineQuills',
    zone: 'spine',
    density: 0.85,
    length: 0.16,
    thickness: 1.0,
    sweepDeg: 32,
    color: '#292524',
    tipColor: '#FEF3C7',
  };
}

export function createDefaultAddonConfig(): CharacterAddonConfig {
  return {
    eyewear: 'none',
    eyewearColor: '#1E293B',
    eyewearLensColor: '#38BDF8',
    eyewearOffsetY: 0,
    eyewearOffsetZ: 0,
    eyewearScale: 1.0,
    headGear: 'none',
    headGearColor: '#EF4444',
    headGearAccentColor: '#FBBF24',
    headGearOffsetY: 0,
    headGearRotX: 0,
    headGearScale: 1.0,
    bodyGear: 'none',
    bodyGearColor: '#8B5E3C',
    bodyGearAccentColor: '#F59E0B',
    bodyGearScale: 1.0,
  };
}

export function resolveCharacterExtras(doc: CharacterMakerDoc): ResolvedCharacterExtras {
  let muzzle: CharacterMuzzleConfig;
  if (doc.muzzle && doc.muzzle.segments?.length === 5) {
    muzzle = doc.muzzle;
  } else if (doc.snoutLength > 0.015) {
    muzzle = {
      preset: 'custom',
      length: doc.snoutLength,
      yOffset: -0.02,
      tiltDeg: 5,
      splitCleft: 0,
      segments: [
        { rx: doc.snoutWidth * 1.12, ry: doc.snoutWidth * 0.92 },
        { rx: doc.snoutWidth * 1.0, ry: doc.snoutWidth * 0.84 },
        { rx: doc.snoutWidth * 0.88, ry: doc.snoutWidth * 0.76 },
        { rx: doc.snoutWidth * 0.74, ry: doc.snoutWidth * 0.64 },
        { rx: doc.snoutWidth * 0.62, ry: doc.snoutWidth * 0.54 },
      ],
      color: doc.snoutColor || doc.head.color,
    };
  } else {
    muzzle = createMuzzlePreset('none', doc.snoutColor || doc.head.color);
  }

  const beakStyle: CharacterBeakStyle =
    doc.beakStyle ?? (doc.mouthStyle === 'beak' ? 'songbird' : 'none');
  const beakDefaults = getBeakPresetDefaults(beakStyle === 'none' ? 'songbird' : beakStyle);

  return {
    muzzle,
    beakStyle,
    beakLength: doc.beakLength ?? beakDefaults.beakLength,
    beakWidth: doc.beakWidth ?? beakDefaults.beakWidth,
    beakHeight: doc.beakHeight ?? beakDefaults.beakHeight,
    beakHook: doc.beakHook ?? beakDefaults.beakHook,
    beakOpen: doc.beakOpen ?? beakDefaults.beakOpen,
    beakColor: doc.beakColor ?? beakDefaults.beakColor,
    beakLowerColor: doc.beakLowerColor ?? beakDefaults.beakLowerColor,
    noseStyle: doc.noseStyle ?? 'none',
    noseSize: doc.noseSize ?? 0.024,
    noseScaleX: doc.noseScaleX ?? 1.1,
    noseScaleY: doc.noseScaleY ?? 0.88,
    noseScaleZ: doc.noseScaleZ ?? 0.82,
    noseOffsetY: doc.noseOffsetY ?? 0.0,
    noseOffsetZ: doc.noseOffsetZ ?? 0.0,
    noseColor: doc.noseColor ?? '#1E1B18',
    nostrilsEnabled: doc.nostrilsEnabled ?? false,
    nostrilStyle: doc.nostrilStyle ?? 'teardrop',
    nostrilSideAngleDeg: doc.nostrilSideAngleDeg ?? 34,
    nostrilHeightOffset: doc.nostrilHeightOffset ?? 0.014,
    nostrilForwardOffset: doc.nostrilForwardOffset ?? 0.0,
    nostrilSize: doc.nostrilSize ?? 1.0,
    nostrilColor: doc.nostrilColor ?? '#1B1112',
    mouthStyle: doc.mouthStyle,
    mouthWidthScale: doc.mouthWidthScale ?? 1.0,
    mouthOpenAmount: doc.mouthOpenAmount ?? 0.85,
    mouthOffsetY: doc.mouthOffsetY ?? 0.0,
    mouthOffsetZ: doc.mouthOffsetZ ?? 0.0,
    mouthTiltDeg: doc.mouthTiltDeg ?? 0.0,
    mouthRecessEnabled: doc.mouthRecessEnabled ?? false,
    mouthTongueEnabled: doc.mouthTongueEnabled ?? true,
    mouthTongueColor: doc.mouthTongueColor ?? '#F472B6',
    mouthTeethStyle: doc.mouthTeethStyle ?? 'none',
    buckTeethSize: doc.buckTeethSize ?? 1.0,
    buckTeethTopWidth: doc.buckTeethTopWidth ?? 0.88,
    buckTeethBottomWidth: doc.buckTeethBottomWidth ?? 1.05,
    wingFold: doc.wingFold ?? 0.15,
    wingTipColor: doc.wingTipColor ?? doc.extremityTipColor,
    hairAccentColor: doc.hairAccentColor ?? '#F43F5E',
    hairOffsetX: doc.hairOffsetX ?? 0,
    hairOffsetY: doc.hairOffsetY ?? 0,
    hairOffsetZ: doc.hairOffsetZ ?? 0,
    hairRotX: doc.hairRotX ?? 0,
    hairRotY: doc.hairRotY ?? 0,
    hairRotZ: doc.hairRotZ ?? 0,
    hairScale: doc.hairScale ?? 1.0,
    surfaceCoat: { ...createDefaultSurfaceCoat(), ...(doc.surfaceCoat ?? {}) },
    spikes: { ...createDefaultSpikesConfig(), ...(doc.spikes ?? {}) },
    addons: { ...createDefaultAddonConfig(), ...(doc.addons ?? {}) },
    headCrown: { ...createDefaultHeadCrown(doc.head), ...(doc.headCrown ?? {}) },
    headJaw: { ...createDefaultHeadJaw(doc.head), ...(doc.headJaw ?? {}) },
  };
}

function hexToRgbTuple(hex: string): [number, number, number] {
  const c = new THREE.Color(hex || '#D4C2B0');
  const out = c.clone().convertLinearToSRGB();
  return [out.r, out.g, out.b];
}

function createClayMaterial(finish: CharacterMaterialFinish): THREE.MeshStandardMaterial {
  switch (finish) {
    case 'glossySlime':
      return new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.16,
        metalness: 0.04,
      });
    case 'toonSatin':
      return new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.42,
        metalness: 0.02,
      });
    case 'velvetCreature':
      return new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.86,
        metalness: 0.0,
      });
    case 'clay':
    default:
      return new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.64,
        metalness: 0.02,
      });
  }
}

export function createDefaultCharacterDoc(): CharacterMakerDoc {
  return {
    version: 1,
    presetId: 'adventurer',
    materialFinish: 'clay',
    blendSmoothness: 0.072,
    shoulderWidth: 0.21,
    hipWidth: 0.12,
    armSpreadDeg: 32,
    legStanceWidth: 0.12,
    headForwardTilt: 0.02,
    snoutLength: 0,
    snoutWidth: 0.08,
    snoutColor: '#F6CFAF',
    muzzle: createMuzzlePreset('none', '#F6CFAF'),
    bellyPatchEnabled: false,
    bellyColor: '#FCE8D5',
    extremityTipColor: '#3B2F2F',

    head: {
      startRadius: 0.155,
      midRadius: 0.19,
      endRadius: 0.16,
      curvature: 0.25,
      length: 0.28,
      squashX: 1.0,
      squashZ: 1.04,
      color: '#F3C7A4',
    },
    neck: {
      startRadius: 0.068,
      midRadius: 0.052,
      endRadius: 0.058,
      curvature: -0.1,
      length: 0.12,
      color: '#EEBE99',
    },
    torso: {
      startRadius: 0.14,
      midRadius: 0.175,
      endRadius: 0.155,
      curvature: 0.18,
      length: 0.34,
      squashX: 1.24,
      squashZ: 0.86,
      color: '#3B82F6',
    },
    belly: {
      startRadius: 0.135,
      midRadius: 0.145,
      endRadius: 0.14,
      curvature: 0.08,
      length: 0.22,
      squashX: 1.12,
      squashZ: 0.92,
      color: '#2563EB',
    },
    hips: {
      startRadius: 0.135,
      midRadius: 0.15,
      endRadius: 0.13,
      curvature: 0.15,
      length: 0.16,
      squashX: 1.18,
      squashZ: 0.92,
      color: '#334155',
    },
    upperArm: {
      startRadius: 0.066,
      midRadius: 0.058,
      endRadius: 0.05,
      curvature: 0.1,
      length: 0.27,
      color: '#3B82F6',
    },
    lowerArm: {
      startRadius: 0.052,
      midRadius: 0.048,
      endRadius: 0.038,
      curvature: 0.05,
      length: 0.25,
      color: '#F3C7A4',
    },
    upperLeg: {
      startRadius: 0.088,
      midRadius: 0.078,
      endRadius: 0.062,
      curvature: 0.15,
      length: 0.34,
      color: '#334155',
    },
    lowerLeg: {
      startRadius: 0.062,
      midRadius: 0.056,
      endRadius: 0.044,
      curvature: -0.05,
      length: 0.33,
      color: '#475569',
    },

    handStyle: 'fingers5',
    handScale: 1.0,
    fingerSpread: 0.45,
    footStyle: 'biped',
    footScale: 1.0,

    extraArmsEnabled: false,
    extraArmHeightOffset: -0.14,
    extraArmProfile: {
      startRadius: 0.052,
      midRadius: 0.044,
      endRadius: 0.034,
      curvature: 0.05,
      length: 0.42,
      color: '#3B82F6',
    },

    extraLegsEnabled: false,
    extraLegRearOffset: 0.28,
    extraLegProfile: {
      startRadius: 0.075,
      midRadius: 0.062,
      endRadius: 0.042,
      curvature: 0.1,
      length: 0.56,
      color: '#334155',
    },

    tailStyle: 'none',
    tailCurl: 0.35,
    tailProfile: {
      startRadius: 0.068,
      midRadius: 0.048,
      endRadius: 0.02,
      curvature: -0.15,
      length: 0.52,
      color: '#3B82F6',
    },

    earStyle: 'human',
    earSize: 1.0,
    earTilt: 0.15,
    earColor: '#F3C7A4',

    hornCount: 0,
    hornStyle: 'curvedBack',
    hornLength: 0.24,
    hornThickness: 0.042,
    hornColor: '#E5DEC9',

    wingStyle: 'none',
    wingSpan: 0.65,
    wingTilt: 0.25,
    wingFold: 0.15,
    wingColor: '#60A5FA',
    wingTipColor: '#DBEAFE',

    whiskerPairs: 0,
    whiskerLength: 0.18,
    whiskerDroop: 0.25,
    whiskerColor: '#FEF3C7',

    hairStyle: 'spikyTufts',
    hairSize: 1.0,
    hairColor: '#5C3A21',
    hairAccentColor: '#F43F5E',
    hairOffsetX: 0,
    hairOffsetY: 0,
    hairOffsetZ: 0,
    hairRotX: 0,
    hairRotY: 0,
    hairRotZ: 0,
    hairScale: 1.0,
    surfaceCoat: createDefaultSurfaceCoat(),
    spikes: createDefaultSpikesConfig(),
    addons: createDefaultAddonConfig(),

    beakStyle: 'none',
    beakLength: 0.07,
    beakWidth: 0.05,
    beakHeight: 0.044,
    beakHook: 0.12,
    beakOpen: 0.06,
    beakColor: '#F59E0B',
    beakLowerColor: '#D97706',

    noseStyle: 'buttonSphere',
    noseSize: 0.018,
    noseScaleX: 0.9,
    noseScaleY: 0.85,
    noseScaleZ: 0.85,
    noseOffsetY: 0.0,
    noseOffsetZ: 0.0,
    noseColor: '#E5B08B',

    nostrilsEnabled: false,
    nostrilStyle: 'teardrop',
    nostrilSideAngleDeg: 36,
    nostrilHeightOffset: 0.015,
    nostrilForwardOffset: 0,
    nostrilSize: 1.0,
    nostrilColor: '#1E1112',

    eyeCount: 2,
    eyeFlatness: 0.62,
    eyeSize: 0.048,
    eyeAspectX: 0.92,
    eyeAspectY: 1.12,
    eyeSpacing: 0.076,
    eyeHeight: 0.03,
    pupilStyle: 'round',
    pupilSize: 0.56,
    scleraColor: '#FFFFFF',
    irisColor: '#2563EB',
    pupilColor: '#111827',

    eyelidEnabled: true,
    eyelidRestHeight: 0.12,
    eyelidLowerEnabled: true,
    eyelidColor: '#E6B38B',
    autoBlink: true,

    eyebrowEnabled: true,
    eyebrowExpression: 'friendly',
    eyebrowHeight: 0.024,
    eyebrowTiltDeg: 4,
    eyebrowArch: 0.35,
    eyebrowThickness: 0.013,
    eyebrowWidth: 0.065,
    eyebrowColor: '#4A2C16',

    mouthStyle: 'smile',
    mouthSize: 1.0,
    mouthColor: '#9F4A4A',
    mouthWidthScale: 1.0,
    mouthOpenAmount: 0.85,
    mouthOffsetY: 0,
    mouthOffsetZ: 0,
    mouthTiltDeg: 0,
    mouthRecessEnabled: false,
    mouthTongueEnabled: true,
    mouthTongueColor: '#F472B6',
    mouthTeethStyle: 'none',
    buckTeethSize: 1.0,
    buckTeethTopWidth: 0.85,
    buckTeethBottomWidth: 1.08,
  };
}

/** Helper creating the cute storybook upright pear body (tubby lower belly & tapered-down upper torso) */
function makeStorybookPearBody(
  base: CharacterMakerDoc,
  furColor: string,
  bellyColor: string,
  legColor: string,
  scale = 1.0
): Partial<CharacterMakerDoc> {
  return {
    materialFinish: 'clay',
    blendSmoothness: 0.072,
    shoulderWidth: 0.155 * scale,
    hipWidth: 0.135 * scale,
    legStanceWidth: 0.125 * scale,
    armSpreadDeg: 38,
    bellyPatchEnabled: true,
    bellyColor,
    // Tapered-down upper chest -> plump tubby lower belly -> rounded hips
    torso: {
      startRadius: 0.165 * scale,
      midRadius: 0.132 * scale,
      endRadius: 0.095 * scale,
      curvature: -0.08,
      length: 0.25 * scale,
      squashX: 1.08,
      squashZ: 0.94,
      color: furColor,
    },
    belly: {
      startRadius: 0.195 * scale,
      midRadius: 0.228 * scale,
      endRadius: 0.175 * scale,
      curvature: 0.48,
      length: 0.24 * scale,
      squashX: 1.12,
      squashZ: 1.12,
      color: furColor,
    },
    hips: {
      startRadius: 0.185 * scale,
      midRadius: 0.205 * scale,
      endRadius: 0.155 * scale,
      curvature: 0.35,
      length: 0.15 * scale,
      squashX: 1.15,
      squashZ: 1.06,
      color: furColor,
    },
    upperArm: {
      startRadius: 0.056 * scale,
      midRadius: 0.048 * scale,
      endRadius: 0.04 * scale,
      curvature: 0.12,
      length: 0.22 * scale,
      color: furColor,
    },
    lowerArm: {
      startRadius: 0.042 * scale,
      midRadius: 0.038 * scale,
      endRadius: 0.032 * scale,
      curvature: 0.1,
      length: 0.20 * scale,
      color: furColor,
    },
    upperLeg: {
      startRadius: 0.092 * scale,
      midRadius: 0.078 * scale,
      endRadius: 0.056 * scale,
      curvature: 0.32,
      length: 0.24 * scale,
      color: legColor,
    },
    lowerLeg: {
      startRadius: 0.054 * scale,
      midRadius: 0.046 * scale,
      endRadius: 0.038 * scale,
      curvature: 0.05,
      length: 0.22 * scale,
      color: legColor,
    },
  };
}

export const CHARACTER_PRESETS: CharacterPresetInfo[] = [
  // ---- HUMANS (Standard Humanoid first, preserving Adventurer Hero & Forest Elf) ----
  {
    id: 'standardHumanoid',
    name: 'Standard Humanoid',
    subtitle: 'Sphere head, defined neck taper & structured shoulders/joints',
    accentHex: '#2563EB',
    group: 'hero',
    category: 'humans',
    build: () => {
      const base = createDefaultCharacterDoc();
      const skin = '#F2C6A0';
      const shirt = '#2563EB';
      const pants = '#334155';
      return {
        ...base,
        presetId: 'standardHumanoid',
        materialFinish: 'toonSatin',
        blendSmoothness: 0.026,
        shoulderWidth: 0.215,
        hipWidth: 0.125,
        armSpreadDeg: 34,
        legStanceWidth: 0.115,
        headForwardTilt: 0.01,
        snoutLength: 0,
        muzzle: createMuzzlePreset('none', skin),
        bellyPatchEnabled: false,
        extremityTipColor: '#292524',
        // Classic spherical head tapering clearly down into a distinct neck & collarbone
        head: {
          startRadius: 0.125,
          midRadius: 0.145,
          endRadius: 0.128,
          curvature: 0.22,
          length: 0.09,
          squashX: 0.98,
          squashZ: 1.02,
          color: skin,
        },
        neck: {
          startRadius: 0.056,
          midRadius: 0.044,
          endRadius: 0.052,
          curvature: -0.06,
          length: 0.185,
          squashX: 0.96,
          squashZ: 0.96,
          color: '#E7B892',
        },
        torso: {
          startRadius: 0.126,
          midRadius: 0.158,
          endRadius: 0.135,
          curvature: 0.12,
          length: 0.34,
          squashX: 1.28,
          squashZ: 0.84,
          color: shirt,
        },
        belly: {
          startRadius: 0.118,
          midRadius: 0.115,
          endRadius: 0.126,
          curvature: 0.0,
          length: 0.21,
          squashX: 1.15,
          squashZ: 0.88,
          color: '#1D4ED8',
        },
        hips: {
          startRadius: 0.125,
          midRadius: 0.136,
          endRadius: 0.12,
          curvature: 0.08,
          length: 0.15,
          squashX: 1.18,
          squashZ: 0.92,
          color: pants,
        },
        upperArm: {
          startRadius: 0.058,
          midRadius: 0.05,
          endRadius: 0.042,
          curvature: 0.04,
          length: 0.28,
          color: shirt,
        },
        lowerArm: {
          startRadius: 0.044,
          midRadius: 0.04,
          endRadius: 0.032,
          curvature: 0.02,
          length: 0.26,
          color: skin,
        },
        upperLeg: {
          startRadius: 0.082,
          midRadius: 0.072,
          endRadius: 0.054,
          curvature: 0.08,
          length: 0.36,
          color: pants,
        },
        lowerLeg: {
          startRadius: 0.054,
          midRadius: 0.048,
          endRadius: 0.038,
          curvature: -0.04,
          length: 0.35,
          color: '#475569',
        },
        handStyle: 'fingers5',
        handScale: 0.95,
        footStyle: 'biped',
        footScale: 1.0,
        earStyle: 'human',
        earSize: 0.92,
        earColor: skin,
        hairStyle: 'shortCrop',
        hairSize: 1.0,
        hairScale: 1.0,
        hairColor: '#4A3123',
        noseStyle: 'longHuman',
        noseSize: 0.017,
        noseColor: '#E3B088',
        eyeFlatness: 0.68,
        eyeSize: 0.034,
        eyeSpacing: 0.056,
        eyeHeight: 0.014,
        irisColor: '#2563EB',
        eyelidColor: '#E5B48D',
        eyebrowColor: '#3E2723',
        eyebrowHeight: 0.018,
        eyebrowWidth: 0.052,
        eyebrowThickness: 0.01,
        mouthStyle: 'smile',
        mouthSize: 0.85,
        mouthOffsetY: 0.008,
        mouthColor: '#9F4A4A',
      };
    },
  },

  // ---- STORYBOOK ANTHROPOMORPHIC ANIMALS ----
  {
    id: 'storyHorse',
    name: 'Storybook Horse',
    subtitle: 'Tubby upright pony with 5-seg flared muzzle, side nostrils & hoofs',
    accentHex: '#A16207',
    group: 'storybook',
    category: 'animals',
    build: () => {
      const base = createDefaultCharacterDoc();
      const coat = '#9A5B37';
      const muzzleCol = '#C88D67';
      return {
        ...base,
        presetId: 'storyHorse',
        ...makeStorybookPearBody(base, coat, '#F3DEC9', coat, 1.02),
        extremityTipColor: '#292524',
        head: {
          startRadius: 0.135,
          midRadius: 0.165,
          endRadius: 0.14,
          curvature: 0.15,
          length: 0.26,
          squashX: 0.92,
          squashZ: 1.06,
          color: coat,
        },
        neck: {
          startRadius: 0.068,
          midRadius: 0.056,
          endRadius: 0.062,
          curvature: -0.05,
          length: 0.15,
          color: coat,
        },
        snoutLength: 0.195,
        snoutWidth: 0.072,
        snoutColor: muzzleCol,
        muzzle: createMuzzlePreset('horseMuzzle', muzzleCol),
        noseStyle: 'none',
        nostrilsEnabled: true,
        nostrilStyle: 'teardrop',
        nostrilSideAngleDeg: 52,
        nostrilHeightOffset: 0.022,
        nostrilForwardOffset: -0.015,
        nostrilSize: 1.15,
        nostrilColor: '#2B1610',
        handStyle: 'hoof',
        footStyle: 'hoof',
        earStyle: 'horsePerked',
        earSize: 1.1,
        earColor: coat,
        hairStyle: 'horseMane',
        hairSize: 1.1,
        hairColor: '#3E2212',
        tailStyle: 'horseTail',
        tailCurl: 0.18,
        tailProfile: { startRadius: 0.044, midRadius: 0.072, endRadius: 0.036, curvature: 0.25, length: 0.62, color: '#3E2212' },
        eyeFlatness: 0.82,
        eyeSize: 0.044,
        eyeSpacing: 0.082,
        eyeHeight: 0.038,
        irisColor: '#5C3A21',
        eyelidColor: '#854D2B',
        eyebrowColor: '#3E2212',
        mouthStyle: 'openSmile',
        mouthSize: 0.88,
        mouthOffsetY: -0.018,
        mouthOffsetZ: 0.0,
        mouthTeethStyle: 'strips',
      };
    },
  },
  {
    id: 'storySquirrel',
    name: 'Storybook Squirrel',
    subtitle: 'Cute tubby squirrel with split puff muzzle, buck teeth & big plume tail',
    accentHex: '#EA580C',
    group: 'storybook',
    category: 'animals',
    build: () => {
      const base = createDefaultCharacterDoc();
      const fur = '#C86428';
      return {
        ...base,
        presetId: 'storySquirrel',
        ...makeStorybookPearBody(base, fur, '#FEF3C7', fur, 0.94),
        extremityTipColor: '#7C2D12',
        head: {
          startRadius: 0.165,
          midRadius: 0.195,
          endRadius: 0.168,
          curvature: 0.32,
          length: 0.26,
          squashX: 1.06,
          squashZ: 1.02,
          color: fur,
        },
        neck: { startRadius: 0.058, midRadius: 0.046, endRadius: 0.052, curvature: -0.08, length: 0.08, color: fur },
        snoutLength: 0.068,
        snoutWidth: 0.08,
        snoutColor: '#FDE6C4',
        muzzle: createMuzzlePreset('squirrelPuff', '#FDE6C4'),
        noseStyle: 'triangleAnimal',
        noseSize: 0.02,
        noseScaleX: 1.25,
        noseScaleY: 0.85,
        noseScaleZ: 0.78,
        noseColor: '#271714',
        handStyle: 'paw',
        footStyle: 'paw',
        earStyle: 'squirrelRound',
        earSize: 1.08,
        earColor: fur,
        hairStyle: 'fluffyBangs',
        hairSize: 0.95,
        hairColor: '#9A3412',
        tailStyle: 'squirrelPlume',
        tailCurl: 0.95,
        tailProfile: { startRadius: 0.072, midRadius: 0.145, endRadius: 0.095, curvature: 0.55, length: 0.82, color: '#B45309' },
        whiskerPairs: 2,
        whiskerLength: 0.14,
        whiskerColor: '#431407',
        eyeFlatness: 0.88,
        eyeSize: 0.052,
        eyeSpacing: 0.078,
        eyeHeight: 0.028,
        pupilStyle: 'starry',
        irisColor: '#78350F',
        eyelidColor: '#B45309',
        eyebrowColor: '#7C2D12',
        mouthStyle: 'openSmile',
        mouthSize: 0.92,
        mouthTeethStyle: 'buck',
        buckTeethSize: 1.08,
        buckTeethTopWidth: 0.82,
        buckTeethBottomWidth: 1.05,
      };
    },
  },
  {
    id: 'storyRabbit',
    name: 'Storybook Rabbit',
    subtitle: 'Tubby bunny with split cheeks, tall ears, buck teeth & pom-pom tail',
    accentHex: '#EC4899',
    group: 'storybook',
    category: 'animals',
    build: () => {
      const base = createDefaultCharacterDoc();
      const fur = '#EDE7DF';
      return {
        ...base,
        presetId: 'storyRabbit',
        ...makeStorybookPearBody(base, fur, '#FFFFFF', fur, 0.96),
        extremityTipColor: '#F9A8D4',
        head: {
          startRadius: 0.16,
          midRadius: 0.192,
          endRadius: 0.165,
          curvature: 0.34,
          length: 0.27,
          squashX: 1.05,
          squashZ: 1.03,
          color: fur,
        },
        neck: { startRadius: 0.056, midRadius: 0.044, endRadius: 0.05, curvature: -0.08, length: 0.085, color: fur },
        snoutLength: 0.072,
        snoutWidth: 0.084,
        snoutColor: '#FFFBF7',
        muzzle: createMuzzlePreset('bunnySplit', '#FFFBF7'),
        noseStyle: 'triangleAnimal',
        noseSize: 0.022,
        noseScaleX: 1.28,
        noseScaleY: 0.88,
        noseScaleZ: 0.82,
        noseColor: '#F472B6',
        handStyle: 'paw',
        footStyle: 'paw',
        footScale: 1.25,
        earStyle: 'rabbitLong',
        earSize: 1.25,
        earTilt: 0.12,
        earColor: fur,
        hairStyle: 'curlSwirl',
        hairSize: 0.72,
        hairColor: '#E2D9CE',
        tailStyle: 'bunnyCotton',
        tailCurl: 0.2,
        tailProfile: { startRadius: 0.078, midRadius: 0.092, endRadius: 0.068, curvature: 0.55, length: 0.22, color: '#FFFFFF' },
        whiskerPairs: 2,
        whiskerLength: 0.16,
        whiskerColor: '#9CA3AF',
        eyeFlatness: 0.84,
        eyeSize: 0.052,
        eyeSpacing: 0.076,
        eyeHeight: 0.03,
        pupilStyle: 'starry',
        irisColor: '#2563EB',
        eyelidColor: '#DDD6CE',
        eyebrowColor: '#A8A29E',
        mouthStyle: 'openSmile',
        mouthSize: 0.92,
        mouthTeethStyle: 'buck',
        buckTeethSize: 1.15,
        buckTeethTopWidth: 0.82,
        buckTeethBottomWidth: 1.06,
      };
    },
  },
  {
    id: 'storyFox',
    name: 'Storybook Fox',
    subtitle: 'Sly charming fox with long tapered snout, brush tail & triangular ears',
    accentHex: '#F97316',
    group: 'storybook',
    category: 'animals',
    build: () => {
      const base = createDefaultCharacterDoc();
      const fur = '#E05A1E';
      return {
        ...base,
        presetId: 'storyFox',
        ...makeStorybookPearBody(base, fur, '#FFF7ED', fur, 0.98),
        extremityTipColor: '#FFF7ED',
        head: {
          startRadius: 0.148,
          midRadius: 0.185,
          endRadius: 0.148,
          curvature: 0.22,
          length: 0.25,
          squashX: 1.12,
          squashZ: 1.02,
          color: fur,
        },
        neck: { startRadius: 0.058, midRadius: 0.045, endRadius: 0.05, curvature: -0.1, length: 0.10, color: fur },
        snoutLength: 0.145,
        snoutWidth: 0.07,
        snoutColor: '#FFF3E6',
        muzzle: createMuzzlePreset('foxTaper', '#FFF3E6'),
        noseStyle: 'buttonSphere',
        noseSize: 0.022,
        noseScaleX: 1.08,
        noseScaleY: 0.95,
        noseScaleZ: 0.95,
        noseColor: '#18181B',
        handStyle: 'paw',
        footStyle: 'paw',
        earStyle: 'catFoxTriangle',
        earSize: 1.2,
        earTilt: 0.18,
        earColor: fur,
        hairStyle: 'fluffyBangs',
        hairSize: 0.85,
        hairColor: '#C2410C',
        tailStyle: 'foxBrush',
        tailCurl: 0.38,
        tailProfile: { startRadius: 0.068, midRadius: 0.118, endRadius: 0.032, curvature: 0.42, length: 0.72, color: fur },
        whiskerPairs: 2,
        whiskerLength: 0.14,
        whiskerColor: '#431407',
        eyeFlatness: 0.78,
        eyeSize: 0.046,
        eyeSpacing: 0.078,
        eyeHeight: 0.032,
        irisColor: '#D97706',
        eyelidColor: '#C2410C',
        eyebrowExpression: 'sly',
        eyebrowColor: '#7C2D12',
        mouthStyle: 'openSmile',
        mouthSize: 0.88,
        mouthOffsetY: -0.014,
        mouthTeethStyle: 'canine',
      };
    },
  },
  {
    id: 'storyGecko',
    name: 'Storybook Gecko',
    subtitle: 'Tubby gecko lizard with huge rolled spiral tail nearly tall as its back',
    accentHex: '#22C55E',
    group: 'storybook',
    category: 'animals',
    build: () => {
      const base = createDefaultCharacterDoc();
      const scales = '#4ADE80';
      return {
        ...base,
        presetId: 'storyGecko',
        ...makeStorybookPearBody(base, scales, '#FEF08A', '#22C55E', 0.96),
        materialFinish: 'toonSatin',
        extremityTipColor: '#15803D',
        head: {
          startRadius: 0.145,
          midRadius: 0.182,
          endRadius: 0.142,
          curvature: 0.25,
          length: 0.24,
          squashX: 1.18,
          squashZ: 1.02,
          color: scales,
        },
        neck: { startRadius: 0.06, midRadius: 0.048, endRadius: 0.056, curvature: -0.05, length: 0.10, color: '#22C55E' },
        snoutLength: 0.135,
        snoutWidth: 0.095,
        snoutColor: '#86EFAC',
        muzzle: createMuzzlePreset('lizardSnout', '#86EFAC'),
        noseStyle: 'none',
        nostrilsEnabled: true,
        nostrilStyle: 'round',
        nostrilSideAngleDeg: 44,
        nostrilHeightOffset: 0.014,
        nostrilForwardOffset: -0.01,
        nostrilSize: 0.95,
        nostrilColor: '#14532D',
        handStyle: 'fingers4',
        handScale: 1.15,
        footStyle: 'claw',
        footScale: 1.1,
        earStyle: 'none',
        hairStyle: 'none',
        tailStyle: 'geckoTail',
        tailCurl: 1.0,
        tailProfile: { startRadius: 0.088, midRadius: 0.064, endRadius: 0.026, curvature: 0.2, length: 0.95, color: '#22C55E' },
        eyeFlatness: 0.98,
        eyeSize: 0.056,
        eyeAspectX: 1.05,
        eyeAspectY: 1.12,
        eyeSpacing: 0.102,
        eyeHeight: 0.036,
        pupilStyle: 'catSlit',
        pupilSize: 0.65,
        scleraColor: '#FEF9C3',
        irisColor: '#F59E0B',
        eyelidColor: '#16A34A',
        eyelidRestHeight: 0.14,
        eyebrowEnabled: false,
        mouthStyle: 'openSmile',
        mouthSize: 1.15,
        mouthOffsetY: -0.015,
        mouthOffsetZ: 0.01,
        mouthTongueEnabled: true,
        mouthTongueColor: '#FB7185',
      };
    },
  },
  {
    id: 'storyBear',
    name: 'Storybook Bear',
    subtitle: 'Cozy big-bellied bear with round ears, broad snout & friendly smile',
    accentHex: '#92400E',
    group: 'storybook',
    category: 'animals',
    build: () => {
      const base = createDefaultCharacterDoc();
      const fur = '#854D27';
      return {
        ...base,
        presetId: 'storyBear',
        ...makeStorybookPearBody(base, fur, '#FDE68A', fur, 1.08),
        extremityTipColor: '#451A03',
        head: {
          startRadius: 0.19,
          midRadius: 0.22,
          endRadius: 0.19,
          curvature: 0.35,
          length: 0.29,
          squashX: 1.1,
          squashZ: 1.04,
          color: fur,
        },
        neck: { startRadius: 0.085, midRadius: 0.072, endRadius: 0.08, curvature: 0, length: 0.06, color: fur },
        snoutLength: 0.105,
        snoutWidth: 0.105,
        snoutColor: '#D6A87C',
        muzzle: createMuzzlePreset('bearBroad', '#D6A87C'),
        noseStyle: 'oval',
        noseSize: 0.032,
        noseScaleX: 1.35,
        noseScaleY: 0.92,
        noseScaleZ: 0.85,
        noseColor: '#1C1917',
        handStyle: 'paw',
        handScale: 1.2,
        footStyle: 'paw',
        footScale: 1.2,
        earStyle: 'squirrelRound',
        earSize: 1.18,
        earColor: fur,
        hairStyle: 'fluffyBangs',
        hairSize: 0.9,
        hairColor: '#63371B',
        tailStyle: 'bunnyCotton',
        tailProfile: { startRadius: 0.07, midRadius: 0.08, endRadius: 0.06, curvature: 0.5, length: 0.2, color: fur },
        eyeFlatness: 0.72,
        eyeSize: 0.044,
        eyeSpacing: 0.082,
        eyeHeight: 0.036,
        irisColor: '#451A03',
        eyelidColor: '#6B3D1F',
        eyebrowColor: '#451A03',
        mouthStyle: 'openSmile',
        mouthSize: 1.05,
        mouthTeethStyle: 'stripsAndCanine',
      };
    },
  },
  {
    id: 'storyOwl',
    name: 'Storybook Owl',
    subtitle: 'Plump wise owl with hooked beak, round bird wings, big eyes & tufts',
    accentHex: '#78350F',
    group: 'storybook',
    category: 'animals',
    build: () => {
      const base = createDefaultCharacterDoc();
      const plumage = '#78523A';
      return {
        ...base,
        presetId: 'storyOwl',
        ...makeStorybookPearBody(base, plumage, '#FDE68A', '#D97706', 0.96),
        extremityTipColor: '#92400E',
        head: {
          startRadius: 0.195,
          midRadius: 0.22,
          endRadius: 0.192,
          curvature: 0.36,
          length: 0.27,
          squashX: 1.14,
          squashZ: 0.98,
          color: plumage,
        },
        neck: { startRadius: 0.072, midRadius: 0.06, endRadius: 0.068, curvature: 0, length: 0.055, color: plumage },
        snoutLength: 0,
        muzzle: createMuzzlePreset('none', plumage),
        beakStyle: 'owl',
        ...getBeakPresetDefaults('owl'),
        noseStyle: 'none',
        handStyle: 'nub',
        handScale: 0.9,
        footStyle: 'claw',
        footScale: 1.05,
        earStyle: 'catFoxTriangle',
        earSize: 0.95,
        earTilt: 0.35,
        earColor: '#5C3D2B',
        hairStyle: 'featherTuft',
        hairSize: 0.85,
        hairColor: '#5C3D2B',
        wingStyle: 'birdRound',
        wingSpan: 0.64,
        wingTilt: 0.18,
        wingFold: 0.25,
        wingColor: '#63422E',
        wingTipColor: '#D6B89C',
        tailStyle: 'birdTail',
        tailCurl: -0.1,
        tailProfile: { startRadius: 0.055, midRadius: 0.065, endRadius: 0.045, curvature: 0.1, length: 0.36, color: '#5C3D2B' },
        eyeFlatness: 0.86,
        eyeSize: 0.064,
        eyeAspectX: 1.04,
        eyeAspectY: 1.04,
        eyeSpacing: 0.088,
        eyeHeight: 0.025,
        irisColor: '#F59E0B',
        pupilStyle: 'round',
        eyelidColor: '#5C3D2B',
        eyebrowEnabled: true,
        eyebrowExpression: 'determined',
        eyebrowThickness: 0.016,
        eyebrowColor: '#452A1B',
        mouthStyle: 'none',
      };
    },
  },
  {
    id: 'storyTweety',
    name: 'Fat Tweety Bird',
    subtitle: 'Chubby canary bird with short orange beak, rounded wings & fan tail',
    accentHex: '#EAB308',
    group: 'storybook',
    category: 'animals',
    build: () => {
      const base = createDefaultCharacterDoc();
      const yellow = '#FACC15';
      return {
        ...base,
        presetId: 'storyTweety',
        ...makeStorybookPearBody(base, yellow, '#FEF9C3', '#F97316', 0.92),
        extremityTipColor: '#EA580C',
        belly: {
          startRadius: 0.205,
          midRadius: 0.24,
          endRadius: 0.185,
          curvature: 0.56,
          length: 0.24,
          squashX: 1.14,
          squashZ: 1.14,
          color: yellow,
        },
        head: {
          startRadius: 0.185,
          midRadius: 0.215,
          endRadius: 0.185,
          curvature: 0.4,
          length: 0.27,
          squashX: 1.08,
          squashZ: 1.04,
          color: yellow,
        },
        neck: { startRadius: 0.064, midRadius: 0.05, endRadius: 0.058, curvature: 0, length: 0.055, color: yellow },
        snoutLength: 0,
        muzzle: createMuzzlePreset('none', yellow),
        beakStyle: 'songbird',
        ...getBeakPresetDefaults('songbird'),
        noseStyle: 'none',
        handStyle: 'nub',
        handScale: 0.88,
        footStyle: 'claw',
        footScale: 1.0,
        earStyle: 'none',
        hairStyle: 'featherTuft',
        hairSize: 1.0,
        hairColor: '#EAB308',
        wingStyle: 'birdRound',
        wingSpan: 0.56,
        wingTilt: 0.2,
        wingFold: 0.22,
        wingColor: yellow,
        wingTipColor: '#FEF08A',
        tailStyle: 'birdTail',
        tailCurl: 0.25,
        tailProfile: { startRadius: 0.048, midRadius: 0.056, endRadius: 0.038, curvature: 0.1, length: 0.34, color: '#EAB308' },
        eyeFlatness: 0.78,
        eyeSize: 0.062,
        eyeAspectX: 0.94,
        eyeAspectY: 1.15,
        eyeSpacing: 0.078,
        eyeHeight: 0.032,
        pupilStyle: 'starry',
        irisColor: '#38BDF8',
        eyelidColor: '#EAB308',
        eyebrowExpression: 'friendly',
        eyebrowColor: '#CA8A04',
        mouthStyle: 'none',
      };
    },
  },

  // ---- CLASSIC HEROES & FANTASY ----
  {
    id: 'adventurer',
    name: 'Adventurer Hero',
    subtitle: 'Stylized clay hero with 5-finger hands & expressive eyes',
    accentHex: '#3B82F6',
    group: 'hero',
    category: 'humans',
    build: () => createDefaultCharacterDoc(),
  },
  {
    id: 'forestElf',
    name: 'Forest Elf',
    subtitle: 'Slender curves, long pointed elf ears & arched brows',
    accentHex: '#20B46A',
    group: 'hero',
    category: 'humans',
    build: () => {
      const base = createDefaultCharacterDoc();
      return {
        ...base,
        presetId: 'forestElf',
        materialFinish: 'toonSatin',
        blendSmoothness: 0.062,
        shoulderWidth: 0.19,
        hipWidth: 0.11,
        armSpreadDeg: 30,
        head: { ...base.head, startRadius: 0.138, midRadius: 0.175, endRadius: 0.148, length: 0.27, color: '#F6D6BA' },
        neck: { ...base.neck, startRadius: 0.056, midRadius: 0.044, endRadius: 0.048, length: 0.14, color: '#F2CEAF' },
        torso: { ...base.torso, startRadius: 0.125, midRadius: 0.155, endRadius: 0.138, length: 0.36, color: '#1F9D63' },
        belly: { ...base.belly, startRadius: 0.115, midRadius: 0.122, endRadius: 0.125, color: '#15803D' },
        hips: { ...base.hips, startRadius: 0.118, midRadius: 0.132, endRadius: 0.115, color: '#3F2E21' },
        upperArm: { ...base.upperArm, startRadius: 0.052, midRadius: 0.044, endRadius: 0.038, length: 0.29, color: '#1F9D63' },
        lowerArm: { ...base.lowerArm, startRadius: 0.04, midRadius: 0.038, endRadius: 0.03, length: 0.27, color: '#F6D6BA' },
        upperLeg: { ...base.upperLeg, startRadius: 0.076, midRadius: 0.066, endRadius: 0.05, length: 0.38, color: '#3F2E21' },
        lowerLeg: { ...base.lowerLeg, startRadius: 0.05, midRadius: 0.046, endRadius: 0.035, length: 0.37, color: '#5C4033' },
        earStyle: 'elfPointed',
        earSize: 1.45,
        earTilt: 0.28,
        earColor: '#F6D6BA',
        hairStyle: 'ponytail',
        hairColor: '#F5C451',
        irisColor: '#10B981',
        eyebrowExpression: 'determined',
        eyebrowColor: '#B48322',
        eyelidColor: '#E5BFA0',
        snoutColor: '#F6D6BA',
      };
    },
  },
  {
    id: 'pocketCritter',
    name: 'Pocket Critter',
    subtitle: 'Plump clay monster-pal with round paws & bulb tail',
    accentHex: '#F59E0B',
    group: 'hero',
    category: 'creatures',
    build: () => {
      const base = createDefaultCharacterDoc();
      return {
        ...base,
        presetId: 'pocketCritter',
        materialFinish: 'clay',
        blendSmoothness: 0.09,
        shoulderWidth: 0.19,
        hipWidth: 0.15,
        armSpreadDeg: 36,
        legStanceWidth: 0.145,
        snoutLength: 0.068,
        snoutWidth: 0.10,
        snoutColor: '#FCD34D',
        muzzle: createMuzzlePreset('catWhiskerPad', '#FCD34D'),
        noseStyle: 'triangleAnimal',
        noseSize: 0.018,
        noseColor: '#1F2937',
        bellyPatchEnabled: true,
        bellyColor: '#FEF3C7',
        extremityTipColor: '#92400E',
        head: { startRadius: 0.22, midRadius: 0.255, endRadius: 0.2, curvature: 0.42, length: 0.32, squashX: 1.12, squashZ: 1.05, color: '#F59E0B' },
        neck: { startRadius: 0.12, midRadius: 0.11, endRadius: 0.125, curvature: 0.15, length: 0.05, color: '#F59E0B' },
        torso: { startRadius: 0.19, midRadius: 0.225, endRadius: 0.195, curvature: 0.45, length: 0.28, squashX: 1.12, squashZ: 1.04, color: '#F59E0B' },
        belly: { startRadius: 0.18, midRadius: 0.215, endRadius: 0.19, curvature: 0.45, length: 0.2, squashX: 1.1, squashZ: 1.08, color: '#FDE68A' },
        hips: { startRadius: 0.18, midRadius: 0.195, endRadius: 0.16, curvature: 0.35, length: 0.14, squashX: 1.12, squashZ: 1.02, color: '#D97706' },
        upperArm: { startRadius: 0.068, midRadius: 0.062, endRadius: 0.054, curvature: 0.32, length: 0.18, color: '#F59E0B' },
        lowerArm: { startRadius: 0.055, midRadius: 0.052, endRadius: 0.046, curvature: 0.28, length: 0.16, color: '#FBBF24' },
        upperLeg: { startRadius: 0.11, midRadius: 0.095, endRadius: 0.072, curvature: 0.48, length: 0.22, color: '#F59E0B' },
        lowerLeg: { startRadius: 0.072, midRadius: 0.062, endRadius: 0.052, curvature: 0.22, length: 0.18, color: '#D97706' },
        handStyle: 'paw',
        handScale: 1.15,
        footStyle: 'paw',
        footScale: 1.18,
        tailStyle: 'bulbTip',
        tailCurl: 0.65,
        tailProfile: { startRadius: 0.08, midRadius: 0.055, endRadius: 0.032, curvature: 0.1, length: 0.54, color: '#D97706' },
        earStyle: 'animalPerk',
        earSize: 1.35,
        earTilt: 0.25,
        earColor: '#F59E0B',
        hairStyle: 'curlSwirl',
        hairColor: '#FEF3C7',
        whiskerPairs: 2,
        whiskerLength: 0.15,
        whiskerColor: '#78350F',
        eyeFlatness: 0.92,
        eyeSize: 0.062,
        eyeAspectX: 1.0,
        eyeAspectY: 1.08,
        eyeSpacing: 0.105,
        eyeHeight: 0.035,
        irisColor: '#92400E',
        pupilStyle: 'starry',
        eyelidColor: '#D97706',
        eyebrowEnabled: false,
        mouthStyle: 'openSmile',
      };
    },
  },
  {
    id: 'alienExplorer',
    name: 'Alien Explorer',
    subtitle: '4-eyed starfarer with extra arms, antennae & sleek limbs',
    accentHex: '#7C5CFF',
    group: 'hero',
    category: 'creatures',
    build: () => {
      const base = createDefaultCharacterDoc();
      return {
        ...base,
        presetId: 'alienExplorer',
        materialFinish: 'glossySlime',
        blendSmoothness: 0.068,
        shoulderWidth: 0.185,
        hipWidth: 0.105,
        armSpreadDeg: 38,
        snoutLength: 0,
        muzzle: createMuzzlePreset('none', '#5EEAD4'),
        noseStyle: 'none',
        extremityTipColor: '#0F766E',
        head: { startRadius: 0.13, midRadius: 0.21, endRadius: 0.23, curvature: 0.3, length: 0.34, squashX: 0.96, squashZ: 1.08, color: '#2DD4BF' },
        neck: { startRadius: 0.048, midRadius: 0.038, endRadius: 0.045, curvature: -0.25, length: 0.16, color: '#14B8A6' },
        torso: { startRadius: 0.12, midRadius: 0.145, endRadius: 0.12, curvature: 0.05, length: 0.33, squashX: 1.14, squashZ: 0.85, color: '#6366F1' },
        belly: { startRadius: 0.11, midRadius: 0.115, endRadius: 0.115, curvature: -0.05, length: 0.22, color: '#4F46E5' },
        hips: { startRadius: 0.11, midRadius: 0.125, endRadius: 0.11, curvature: 0.08, length: 0.15, color: '#312E81' },
        upperArm: { startRadius: 0.046, midRadius: 0.038, endRadius: 0.032, curvature: -0.1, length: 0.29, color: '#2DD4BF' },
        lowerArm: { startRadius: 0.035, midRadius: 0.034, endRadius: 0.028, curvature: 0.0, length: 0.28, color: '#5EEAD4' },
        upperLeg: { startRadius: 0.072, midRadius: 0.06, endRadius: 0.045, curvature: -0.1, length: 0.36, color: '#312E81' },
        lowerLeg: { startRadius: 0.048, midRadius: 0.042, endRadius: 0.032, curvature: -0.18, length: 0.38, color: '#14B8A6' },
        handStyle: 'fingers3',
        footStyle: 'claw',
        extraArmsEnabled: true,
        extraArmHeightOffset: -0.16,
        extraArmProfile: { startRadius: 0.04, midRadius: 0.034, endRadius: 0.028, curvature: 0.0, length: 0.44, color: '#2DD4BF' },
        earStyle: 'antennae',
        earSize: 1.25,
        earColor: '#A855F7',
        hairStyle: 'none',
        eyeCount: 4,
        eyeFlatness: 0.96,
        eyeSize: 0.054,
        eyeAspectX: 0.9,
        eyeAspectY: 1.24,
        eyeSpacing: 0.085,
        eyeHeight: 0.02,
        irisColor: '#A855F7',
        pupilStyle: 'glow',
        scleraColor: '#0F172A',
        pupilColor: '#E879F9',
        eyelidColor: '#14B8A6',
        eyelidRestHeight: 0.22,
        eyebrowEnabled: false,
        mouthStyle: 'smirk',
        mouthColor: '#115E59',
      };
    },
  },
  {
    id: 'hornedMonster',
    name: 'Horned Monster',
    subtitle: 'Broad shoulders, ram horns, dragon wings, claws & hoofs',
    accentHex: '#EF4444',
    group: 'hero',
    category: 'creatures',
    build: () => {
      const base = createDefaultCharacterDoc();
      return {
        ...base,
        presetId: 'hornedMonster',
        materialFinish: 'velvetCreature',
        blendSmoothness: 0.085,
        shoulderWidth: 0.28,
        hipWidth: 0.145,
        armSpreadDeg: 34,
        legStanceWidth: 0.155,
        snoutLength: 0.105,
        snoutWidth: 0.115,
        snoutColor: '#B91C1C',
        muzzle: createMuzzlePreset('dogSnout', '#B91C1C'),
        noseStyle: 'wideSnoutNose',
        noseSize: 0.028,
        noseColor: '#1C1917',
        bellyPatchEnabled: true,
        bellyColor: '#FCA5A5',
        extremityTipColor: '#1E1B18',
        head: { startRadius: 0.175, midRadius: 0.195, endRadius: 0.155, curvature: 0.18, length: 0.27, squashX: 1.08, squashZ: 1.12, color: '#DC2626' },
        neck: { startRadius: 0.11, midRadius: 0.098, endRadius: 0.105, curvature: 0.1, length: 0.08, color: '#B91C1C' },
        torso: { startRadius: 0.195, midRadius: 0.245, endRadius: 0.22, curvature: 0.3, length: 0.36, squashX: 1.32, squashZ: 0.96, color: '#DC2626' },
        belly: { startRadius: 0.175, midRadius: 0.185, endRadius: 0.18, curvature: 0.15, length: 0.22, color: '#B91C1C' },
        hips: { startRadius: 0.16, midRadius: 0.17, endRadius: 0.145, curvature: 0.18, length: 0.16, squashX: 1.16, squashZ: 0.95, color: '#7F1D1D' },
        upperArm: { startRadius: 0.096, midRadius: 0.084, endRadius: 0.068, curvature: 0.28, length: 0.31, color: '#DC2626' },
        lowerArm: { startRadius: 0.072, midRadius: 0.078, endRadius: 0.056, curvature: 0.35, length: 0.29, color: '#B91C1C' },
        upperLeg: { startRadius: 0.125, midRadius: 0.102, endRadius: 0.068, curvature: 0.42, length: 0.34, color: '#991B1B' },
        lowerLeg: { startRadius: 0.068, midRadius: 0.06, endRadius: 0.048, curvature: -0.15, length: 0.33, color: '#7F1D1D' },
        handStyle: 'claw',
        handScale: 1.18,
        footStyle: 'hoof',
        footScale: 1.15,
        tailStyle: 'dragonTail',
        tailCurl: 0.45,
        tailProfile: { startRadius: 0.082, midRadius: 0.056, endRadius: 0.024, curvature: -0.1, length: 0.65, color: '#991B1B' },
        earStyle: 'bat',
        earSize: 1.15,
        earColor: '#B91C1C',
        hornCount: 2,
        hornStyle: 'ramSpiral',
        hornLength: 0.32,
        hornThickness: 0.055,
        hornColor: '#E7E5E4',
        wingStyle: 'dragon',
        wingSpan: 0.78,
        wingTilt: 0.32,
        wingColor: '#7F1D1D',
        wingTipColor: '#450A0A',
        hairStyle: 'mohawk',
        hairColor: '#292524',
        eyeFlatness: 0.85,
        eyeSize: 0.048,
        eyeSpacing: 0.086,
        irisColor: '#F59E0B',
        pupilStyle: 'catSlit',
        scleraColor: '#FEF3C7',
        eyelidColor: '#991B1B',
        eyelidRestHeight: 0.28,
        eyebrowEnabled: true,
        eyebrowExpression: 'determined',
        eyebrowTiltDeg: -24,
        eyebrowThickness: 0.018,
        eyebrowColor: '#292524',
        mouthStyle: 'openSmile',
        mouthSize: 1.05,
        mouthTeethStyle: 'canine',
        mouthColor: '#450A0A',
      };
    },
  },
];

export function createCharacterPresetDoc(id: CharacterPresetId): CharacterMakerDoc {
  const saved = getSavedCharacterSpeciesDefault(id);
  if (saved) {
    return { ...saved, presetId: id };
  }
  const found = CHARACTER_PRESETS.find((p) => p.id === id) ?? CHARACTER_PRESETS[0];
  return found.build();
}

function tupleVec(v: THREE.Vector3): [number, number, number] {
  return [v.x, v.y, v.z];
}

function expressionTiltOffset(expr: CharacterEyebrowExpression): number {
  switch (expr) {
    case 'determined':
      return -18;
    case 'friendly':
      return 12;
    case 'surprised':
      return 8;
    case 'sly':
      return -10;
    default:
      return 0;
  }
}

/** Creates a smooth tube with hemispherical sphere end-caps so eyebrows & closed mouths never look chopped off */
function createRoundedCurveMesh(
  points: THREE.Vector3[],
  radius: number,
  mat: THREE.Material,
  tubularSegs = 14
): THREE.Group {
  const group = new THREE.Group();
  const r = Math.max(0.0035, radius);
  const curve = new THREE.CatmullRomCurve3(points);
  const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, tubularSegs, r, 10, false), mat);
  tube.castShadow = true;
  group.add(tube);

  const capGeo = new THREE.SphereGeometry(r * 1.02, 10, 8);
  const capStart = new THREE.Mesh(capGeo, mat);
  capStart.position.copy(points[0]);
  group.add(capStart);

  const capEnd = new THREE.Mesh(capGeo, mat);
  capEnd.position.copy(points[points.length - 1]);
  group.add(capEnd);

  return group;
}

function createArchBrowGroup(
  width: number,
  archHeight: number,
  thickness: number,
  mat: THREE.Material
): THREE.Group {
  const halfW = Math.max(0.018, width * 0.5);
  const pts = [
    new THREE.Vector3(-halfW, 0, -halfW * 0.14),
    new THREE.Vector3(-halfW * 0.45, archHeight * 0.85, 0),
    new THREE.Vector3(0, archHeight, halfW * 0.06),
    new THREE.Vector3(halfW * 0.45, archHeight * 0.85, 0),
    new THREE.Vector3(halfW, 0, -halfW * 0.14),
  ];
  return createRoundedCurveMesh(pts, thickness, mat, 14);
}

/** Builds a sculpted 3D bird/duck/owl/eagle/stork/pelican beak aligned along +Z */
function buildBeakGroup(ext: ResolvedCharacterExtras): THREE.Group {
  const g = new THREE.Group();
  g.name = 'CharBeak';
  const matTop = new THREE.MeshStandardMaterial({
    color: ext.beakColor,
    roughness: 0.36,
    metalness: 0.04,
  });
  const matBot = new THREE.MeshStandardMaterial({
    color: ext.beakLowerColor,
    roughness: 0.42,
    metalness: 0.02,
  });

  const L = ext.beakLength;
  const W = ext.beakWidth * 0.5;
  const H = ext.beakHeight * 0.5;
  const hook = ext.beakHook;
  const openAngle = ext.beakOpen * 0.28;

  const style = ext.beakStyle;

  if (style === 'duck') {
    // Broad flat spoon bill
    const upperGeo = new THREE.SphereGeometry(1, 20, 14);
    upperGeo.scale(W * 1.15, H * 0.65, L * 0.68);
    const upper = new THREE.Mesh(upperGeo, matTop);
    upper.position.set(0, H * 0.18, L * 0.42);
    upper.rotation.x = -openAngle * 0.4;
    upper.castShadow = true;
    g.add(upper);

    // Cute rounded duck bill nail at tip
    const nail = new THREE.Mesh(new THREE.SphereGeometry(W * 0.24, 12, 10), matBot);
    nail.scale.set(1.1, 0.55, 1.1);
    nail.position.set(0, H * 0.22, L * 0.94);
    g.add(nail);

    const lowerGeo = new THREE.SphereGeometry(1, 18, 12);
    lowerGeo.scale(W * 0.96, H * 0.42, L * 0.58);
    const lower = new THREE.Mesh(lowerGeo, matBot);
    lower.position.set(0, -H * 0.24, L * 0.36);
    lower.rotation.x = openAngle;
    g.add(lower);
    return g;
  }

  // Lofted curved cone / curved spline for songbird, owl, eagleHawk, storkCrane, pelican
  const upperPivot = new THREE.Group();
  upperPivot.rotation.x = -openAngle * 0.35;
  const segCount = 6;
  const rBase = Math.max(0.01, (W + H) * 0.5);
  for (let i = 0; i < segCount; i++) {
    const t0 = i / segCount;
    const t1 = (i + 1) / segCount;
    const tm = (t0 + t1) * 0.5;
    const z0 = t0 * L;
    const z1 = t1 * L;
    const drop0 = hook * 0.42 * L * Math.pow(t0, 2.2);
    const drop1 = hook * 0.42 * L * Math.pow(t1, 2.2);
    const rad0 = Math.max(0.003, rBase * (1 - Math.pow(t0, 1.08) * 0.9));
    const rad1 = Math.max(0.002, rBase * (1 - Math.pow(t1, 1.08) * 0.92));

    const segLen = Math.hypot(z1 - z0, drop1 - drop0);
    const segGeo = new THREE.CylinderGeometry(rad1, rad0, segLen + 0.003, 14);
    segGeo.rotateX(Math.PI * 0.5);
    const aspectX = W / Math.max(0.008, H);
    const segMesh = new THREE.Mesh(segGeo, matTop);
    segMesh.position.set(0, -(drop0 + drop1) * 0.5 + H * 0.14 * (1 - tm), (z0 + z1) * 0.5);
    segMesh.rotation.x = Math.atan2(drop1 - drop0, Math.max(1e-4, z1 - z0));
    segMesh.scale.set(aspectX, 0.95, 1);
    segMesh.castShadow = true;
    upperPivot.add(segMesh);
  }
  const tipBall = new THREE.Mesh(new THREE.SphereGeometry(Math.max(0.003, rBase * 0.12), 10, 8), matTop);
  tipBall.position.set(0, -hook * 0.42 * L, L);
  upperPivot.add(tipBall);
  g.add(upperPivot);

  // Lower mandible (with deep scoop pouch for Pelican!)
  const lowerPivot = new THREE.Group();
  lowerPivot.rotation.x = openAngle + 0.04;
  if (style === 'pelican') {
    const pouchGeo = new THREE.SphereGeometry(1, 20, 14);
    pouchGeo.scale(W * 0.95, H * 1.15, L * 0.54);
    const pouch = new THREE.Mesh(pouchGeo, matBot);
    pouch.position.set(0, -H * 0.58, L * 0.44);
    pouch.castShadow = true;
    lowerPivot.add(pouch);
  } else {
    const lowerLen = style === 'storkCrane' ? L * 0.95 : L * 0.78;
    const lowerGeo = new THREE.ConeGeometry(Math.max(0.006, rBase * 0.65), lowerLen, 14);
    lowerGeo.rotateX(Math.PI * 0.5);
    lowerGeo.scale(W / Math.max(0.008, H) * 0.9, 0.55, 1);
    const lowerMesh = new THREE.Mesh(lowerGeo, matBot);
    lowerMesh.position.set(0, -H * 0.22, lowerLen * 0.48);
    lowerPivot.add(lowerMesh);
  }
  g.add(lowerPivot);

  return g;
}

/** Builds the shapeable Nose mesh (sphere <-> oval <-> flat <-> long human <-> bulbous <-> triangle animal) */
function buildNoseGroup(ext: ResolvedCharacterExtras): THREE.Group {
  const g = new THREE.Group();
  g.name = 'CharNose';
  const mat = new THREE.MeshStandardMaterial({
    color: ext.noseColor,
    roughness: ext.noseStyle === 'longHuman' ? 0.58 : 0.22,
    metalness: 0.04,
  });

  const s = ext.noseSize;
  const sx = ext.noseScaleX;
  const sy = ext.noseScaleY;
  const sz = ext.noseScaleZ;

  if (ext.noseStyle === 'triangleAnimal') {
    // Rounded cartoon animal triangle nose shield
    const shape = new THREE.Shape();
    shape.moveTo(0, -0.78);
    shape.quadraticCurveTo(0.85, -0.45, 0.98, 0.32);
    shape.quadraticCurveTo(1.02, 0.72, 0.48, 0.78);
    shape.quadraticCurveTo(0, 0.84, -0.48, 0.78);
    shape.quadraticCurveTo(-1.02, 0.72, -0.98, 0.32);
    shape.quadraticCurveTo(-0.85, -0.45, 0, -0.78);

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.55,
      bevelEnabled: true,
      bevelThickness: 0.32,
      bevelSize: 0.22,
      bevelSegments: 5,
      curveSegments: 14,
    });
    geo.center();
    const m = new THREE.Mesh(geo, mat);
    m.scale.set(s * sx * 0.92, s * sy * 0.85, s * sz * 0.88);
    m.castShadow = true;
    g.add(m);
  } else if (ext.noseStyle === 'longHuman') {
    // Angled nasal bridge + soft bulb tip + subtle wing nostrils
    const bridgeGeo = new THREE.CapsuleGeometry(0.42, 1.15, 6, 12);
    const bridge = new THREE.Mesh(bridgeGeo, mat);
    bridge.rotation.x = -0.55;
    bridge.scale.set(s * sx * 0.82, s * sy * 0.95, s * sz * 0.95);
    bridge.position.set(0, s * sy * 0.25, s * sz * 0.25);
    bridge.castShadow = true;
    g.add(bridge);

    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.56, 16, 12), mat);
    tip.scale.set(s * sx * 0.95, s * sy * 0.82, s * sz * 0.92);
    tip.position.set(0, -s * sy * 0.18, s * sz * 0.62);
    g.add(tip);
  } else if (ext.noseStyle === 'wideSnoutNose') {
    const pad = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), mat);
    pad.scale.set(s * sx * 1.45, s * sy * 0.78, s * sz * 0.82);
    pad.castShadow = true;
    g.add(pad);

    const pitMat = new THREE.MeshBasicMaterial({ color: '#09090B' });
    ([-1, 1] as const).forEach((side) => {
      const nPit = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 8), pitMat);
      nPit.scale.set(s * sx * 0.85, s * sy * 0.65, s * sz * 0.45);
      nPit.position.set(side * s * sx * 0.62, s * sy * 0.04, s * sz * 0.72);
      g.add(nPit);
    });
  } else {
    // buttonSphere | oval | flatButton | bulbous
    const flatMult = ext.noseStyle === 'flatButton' ? 0.38 : 1.0;
    const bulbMult = ext.noseStyle === 'bulbous' ? 1.25 : 1.0;
    const ovalMultY = ext.noseStyle === 'oval' ? 0.72 : 1.0;
    const ovalMultX = ext.noseStyle === 'oval' ? 1.26 : 1.0;
    const sph = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), mat);
    sph.scale.set(
      s * sx * bulbMult * ovalMultX,
      s * sy * bulbMult * ovalMultY,
      s * sz * bulbMult * flatMult
    );
    sph.castShadow = true;
    g.add(sph);
  }

  return g;
}

/** Builds a sculpted 2D-to-3D open mouth cavity that wraps smoothly around curved muzzles, with optional recess depth, flat bottom cartoon tongue, and teeth */
function buildOpenMouthGroup(
  ext: ResolvedCharacterExtras,
  ms: number,
  hasMuzzle: boolean
): THREE.Group {
  const g = new THREE.Group();
  g.name = 'CharOpenMouth';

  const w = 0.048 * ms * ext.mouthWidthScale;
  const h = 0.042 * ms * ext.mouthOpenAmount;

  const isSurprised = ext.mouthStyle === 'openSurprised';
  const isWorried = ext.mouthStyle === 'openWorried';
  const isGrin = ext.mouthStyle === 'openGrin';
  const recessed = ext.mouthRecessEnabled;

  // Depth layers relative to skin surface: recessed sits inside carved pocket, smooth hugs skin directly
  const zBack = recessed ? -0.0055 : 0.0003;
  const zTongue = recessed ? -0.0036 : 0.0012;
  const zTeeth = recessed ? -0.0022 : 0.0020;
  const zRimFront = recessed ? 0.0014 : 0.0025;
  const zRimBack = recessed ? -0.0062 : -0.0026;
  const wrapStrength = hasMuzzle ? 2.75 : 1.35;

  const applySnoutWrap = (geo: THREE.BufferGeometry, baseOffsetZ = 0) => {
    const pos = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vy = pos.getY(i);
      const vz = pos.getZ(i);
      const wrap = -Math.min(0.014, vx * vx * wrapStrength + vy * vy * wrapStrength * 0.72);
      pos.setZ(i, vz + baseOffsetZ + wrap);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
  };

  // Outline shape in XY centered around (0, 0)
  const mouthShape = new THREE.Shape();
  if (isSurprised) {
    const steps = 28;
    for (let i = 0; i <= steps; i++) {
      const a = (i / steps) * Math.PI * 2;
      const x = Math.cos(a) * w * 0.68;
      const y = Math.sin(a) * h * 0.96;
      if (i === 0) mouthShape.moveTo(x, y);
      else mouthShape.lineTo(x, y);
    }
  } else if (isWorried) {
    const steps = 28;
    for (let i = 0; i <= steps; i++) {
      const a = (i / steps) * Math.PI * 2;
      const x = Math.cos(a) * w * 0.92;
      const y = Math.sin(a) * h * 0.68 - Math.cos(a * 2) * h * 0.14;
      if (i === 0) mouthShape.moveTo(x, y);
      else mouthShape.lineTo(x, y);
    }
  } else {
    const archY = isGrin ? h * 0.18 : h * 0.06;
    mouthShape.moveTo(-w, h * 0.36);
    mouthShape.quadraticCurveTo(0, archY, w, h * 0.36);
    mouthShape.bezierCurveTo(w * 1.02, -h * 0.92, -w * 1.02, -h * 0.92, -w, h * 0.36);
  }

  // Deep matte-black inner mouth backwall
  const cavityMat = new THREE.MeshBasicMaterial({ color: '#14090D' });
  const cavityGeo = new THREE.ShapeGeometry(mouthShape, 20);
  applySnoutWrap(cavityGeo, zBack);
  g.add(new THREE.Mesh(cavityGeo, cavityMat));

  // Sleek tapered dark inner rim connecting outer contour into muzzle curve without sticking out
  const rimPoints = mouthShape.getPoints(32);
  const wallVerts: number[] = [];
  const wallIndices: number[] = [];
  for (let i = 0; i < rimPoints.length; i++) {
    const pt = rimPoints[i];
    wallVerts.push(pt.x * 1.03, pt.y * 1.03, zRimFront);
    wallVerts.push(pt.x * 1.08, pt.y * 1.08, zRimBack);
  }
  for (let i = 0; i < rimPoints.length - 1; i++) {
    const a = i * 2;
    const b = a + 1;
    const c = (i + 1) * 2;
    const d = c + 1;
    wallIndices.push(a, b, c, b, d, c);
  }
  const wallGeo = new THREE.BufferGeometry();
  wallGeo.setAttribute('position', new THREE.Float32BufferAttribute(wallVerts, 3));
  wallGeo.setIndex(wallIndices);
  applySnoutWrap(wallGeo, 0);
  const rimMat = new THREE.MeshStandardMaterial({
    color: '#1A0D12',
    roughness: 0.72,
    side: THREE.DoubleSide,
  });
  g.add(new THREE.Mesh(wallGeo, rimMat));

  // Mid-pink flat cartoon tongue hugging the lower half of the black mouth shape (sits BEHIND teeth!)
  if (ext.mouthTongueEnabled) {
    const tShape = new THREE.Shape();
    const tw = w * (isSurprised ? 0.54 : 0.72);
    const th = h * (isSurprised ? 0.62 : 0.68);
    const tBot = isSurprised ? -h * 0.92 : -h * 0.56;
    const tTop = tBot + th;
    tShape.moveTo(-tw, tBot + th * 0.25);
    tShape.quadraticCurveTo(-tw * 0.45, tTop, 0, tTop - th * 0.12);
    tShape.quadraticCurveTo(tw * 0.45, tTop, tw, tBot + th * 0.25);
    tShape.quadraticCurveTo(0, tBot - th * 0.16, -tw, tBot + th * 0.25);

    const tMat = new THREE.MeshBasicMaterial({ color: ext.mouthTongueColor });
    const tongueGeo = new THREE.ShapeGeometry(tShape, 16);
    applySnoutWrap(tongueGeo, zTongue);
    g.add(new THREE.Mesh(tongueGeo, tMat));
  }

  // Teeth (slight crisp depth, wrapped with mouth curvature, in front of tongue inside the opening)
  const teethMat = new THREE.MeshStandardMaterial({
    color: '#F8FAFC',
    roughness: 0.22,
    metalness: 0.02,
  });

  if (ext.mouthTeethStyle === 'strips' || ext.mouthTeethStyle === 'stripsAndCanine') {
    const uStrip = new THREE.Shape();
    const uw = w * (isSurprised ? 0.46 : 0.82);
    const uTopY = isSurprised ? h * 0.78 : h * 0.22;
    const uArch = isSurprised ? h * 0.82 : isGrin ? h * 0.14 : h * 0.04;
    const uThick = Math.max(0.004, h * 0.28);
    uStrip.moveTo(-uw, uTopY);
    uStrip.quadraticCurveTo(0, uArch, uw, uTopY);
    uStrip.lineTo(uw * 0.92, uTopY - uThick);
    uStrip.quadraticCurveTo(0, uArch - uThick, -uw * 0.92, uTopY - uThick);
    uStrip.closePath();

    const uGeo = new THREE.ExtrudeGeometry(uStrip, {
      depth: 0.0028,
      bevelEnabled: true,
      bevelThickness: 0.0007,
      bevelSize: 0.0007,
      bevelSegments: 2,
    });
    applySnoutWrap(uGeo, zTeeth);
    g.add(new THREE.Mesh(uGeo, teethMat));

    if (!isSurprised) {
      const lStrip = new THREE.Shape();
      const lw = w * 0.64;
      const lBotY = -h * 0.5;
      const lThick = Math.max(0.0035, h * 0.22);
      lStrip.moveTo(-lw, lBotY + lThick);
      lStrip.quadraticCurveTo(0, lBotY + lThick * 0.25, lw, lBotY + lThick);
      lStrip.lineTo(lw * 0.88, lBotY);
      lStrip.quadraticCurveTo(0, lBotY - lThick * 0.55, -lw * 0.88, lBotY);
      lStrip.closePath();

      const lGeo = new THREE.ExtrudeGeometry(lStrip, {
        depth: 0.0026,
        bevelEnabled: true,
        bevelThickness: 0.0006,
        bevelSize: 0.0006,
        bevelSegments: 2,
      });
      applySnoutWrap(lGeo, zTeeth);
      g.add(new THREE.Mesh(lGeo, teethMat));
    }
  }

  if (ext.mouthTeethStyle === 'canine' || ext.mouthTeethStyle === 'stripsAndCanine') {
    const fangTopY = isSurprised ? h * 0.62 : h * 0.2;
    const fangX = w * (isSurprised ? 0.34 : 0.54);
    const fangH = Math.max(0.008, h * 0.38);
    const fangR = Math.max(0.004, w * 0.14);
    ([-1, 1] as const).forEach((side) => {
      const fGeo = new THREE.ConeGeometry(fangR, fangH, 10);
      fGeo.rotateX(Math.PI);
      fGeo.scale(0.95, 1, 0.45);
      fGeo.translate(side * fangX, fangTopY - fangH * 0.42, zTeeth + 0.0012);
      applySnoutWrap(fGeo, 0);
      g.add(new THREE.Mesh(fGeo, teethMat));
    });
  }

  if (ext.mouthTeethStyle === 'buck') {
    const bLen = Math.max(0.006, h * 0.52 * ext.buckTeethSize);
    const topHalf = w * 0.18 * ext.buckTeethTopWidth;
    const botHalf = w * 0.18 * ext.buckTeethBottomWidth;
    const centerGap = Math.max(0.0012, w * 0.025);
    const topY = isSurprised ? h * 0.72 : h * 0.22;

    ([-1, 1] as const).forEach((side) => {
      const cx = side * (centerGap + Math.max(topHalf, botHalf) * 0.92);
      const tShape = new THREE.Shape();
      tShape.moveTo(-topHalf, 0);
      tShape.lineTo(topHalf, 0);
      tShape.lineTo(botHalf, -bLen * 0.85);
      tShape.quadraticCurveTo(botHalf * 0.55, -bLen, 0, -bLen);
      tShape.quadraticCurveTo(-botHalf * 0.55, -bLen, -botHalf, -bLen * 0.85);
      tShape.closePath();

      const tGeo = new THREE.ExtrudeGeometry(tShape, {
        depth: 0.003,
        bevelEnabled: true,
        bevelThickness: 0.0008,
        bevelSize: 0.0007,
        bevelSegments: 2,
      });
      tGeo.translate(cx, topY, zTeeth);
      applySnoutWrap(tGeo, 0);
      g.add(new THREE.Mesh(tGeo, teethMat));
    });
  }

  return g;
}

/** Deterministic integer hash 0..1 for stable procedural sampling */
function hashInt01(n: number): number {
  let x = (n | 0) * 374761393;
  x = (x ^ (x >> 13)) * 1274126177;
  return ((x ^ (x >> 16)) >>> 0) / 4294967295;
}

/** Merges multiple vertex-colored BufferGeometries into one single indexed/non-indexed BufferGeometry */
function mergeVertexColoredGeometries(parts: THREE.BufferGeometry[]): THREE.BufferGeometry | null {
  if (parts.length === 0) return null;
  let totalVerts = 0;
  const normalized = parts.map((raw) => {
    const g = raw.index ? raw.toNonIndexed() : raw;
    totalVerts += g.attributes.position.count;
    return g;
  });

  const positions = new Float32Array(totalVerts * 3);
  const normals = new Float32Array(totalVerts * 3);
  const colors = new Float32Array(totalVerts * 3);
  let offset = 0;

  for (const g of normalized) {
    const posAttr = g.attributes.position as THREE.BufferAttribute;
    const normAttr = g.attributes.normal as THREE.BufferAttribute | undefined;
    const colAttr = g.attributes.color as THREE.BufferAttribute | undefined;
    const count = posAttr.count;
    for (let i = 0; i < count; i++) {
      const dst = (offset + i) * 3;
      positions[dst] = posAttr.getX(i);
      positions[dst + 1] = posAttr.getY(i);
      positions[dst + 2] = posAttr.getZ(i);
      if (normAttr) {
        normals[dst] = normAttr.getX(i);
        normals[dst + 1] = normAttr.getY(i);
        normals[dst + 2] = normAttr.getZ(i);
      } else {
        normals[dst + 1] = 1;
      }
      if (colAttr) {
        colors[dst] = colAttr.getX(i);
        colors[dst + 1] = colAttr.getY(i);
        colors[dst + 2] = colAttr.getZ(i);
      } else {
        colors[dst] = 1;
        colors[dst + 1] = 1;
        colors[dst + 2] = 1;
      }
    }
    offset += count;
    if (g !== parts[normalized.indexOf(g)]) {
      g.dispose();
    }
  }
  for (const p of parts) p.dispose();

  const merged = new THREE.BufferGeometry();
  merged.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  merged.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  merged.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  merged.computeBoundingSphere();
  return merged;
}

function paintGeometryGradient(
  geo: THREE.BufferGeometry,
  baseCol: THREE.Color,
  tipCol: THREE.Color,
  minAxisY = 0,
  maxAxisY = 1
): THREE.BufferGeometry {
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const colArr = new Float32Array(pos.count * 3);
  const tmp = new THREE.Color();
  const span = Math.max(0.0001, maxAxisY - minAxisY);
  for (let i = 0; i < pos.count; i++) {
    const t = THREE.MathUtils.clamp((pos.getY(i) - minAxisY) / span, 0, 1);
    tmp.copy(baseCol).lerp(tipCol, t);
    colArr[i * 3] = tmp.r;
    colArr[i * 3 + 1] = tmp.g;
    colArr[i * 3 + 2] = tmp.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colArr, 3));
  return geo;
}

/** Builds procedural seamless tileable albedo+bump+roughness textures for fur & scales */
function createSurfaceCoatTextures(coat: CharacterSurfaceCoatConfig): {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
  bumpScale: number;
} | null {
  if (coat.mode === 'none' || typeof document === 'undefined') return null;

  const size = 256;
  const albedoCanvas = document.createElement('canvas');
  const bumpCanvas = document.createElement('canvas');
  const roughCanvas = document.createElement('canvas');
  albedoCanvas.width = bumpCanvas.width = roughCanvas.width = size;
  albedoCanvas.height = bumpCanvas.height = roughCanvas.height = size;

  const aCtx = albedoCanvas.getContext('2d');
  const bCtx = bumpCanvas.getContext('2d');
  const rCtx = roughCanvas.getContext('2d');
  if (!aCtx || !bCtx || !rCtx) return null;

  const intensity = THREE.MathUtils.clamp(coat.intensity, 0.05, 1);
  const densityMult = THREE.MathUtils.clamp(coat.density, 0.3, 1.8);
  const sizeScale = THREE.MathUtils.clamp(coat.scaleSize, 0.5, 2.0);
  const tipRgb = new THREE.Color(coat.tipColor || '#FDE68A');

  // Neutral white base for albedo (preserves vertexColors cleanly!)
  aCtx.fillStyle = '#FFFFFF';
  aCtx.fillRect(0, 0, size, size);
  bCtx.fillStyle = '#505050';
  bCtx.fillRect(0, 0, size, size);
  rCtx.fillStyle = coat.mode.startsWith('scales') ? '#707070' : '#D0D0D0';
  rCtx.fillRect(0, 0, size, size);

  if (coat.mode.startsWith('fur')) {
    const isLong = coat.mode === 'furLong';
    const isClump = coat.mode === 'furClumped';
    const count = Math.round((isLong ? 340 : 520) * densityMult);
    const baseLen = (isLong ? 36 : isClump ? 26 : 16) * sizeScale;
    const baseW = (isClump ? 4.4 : isLong ? 2.6 : 1.9) * sizeScale;

    for (let i = 0; i < count; i++) {
      const h1 = hashInt01(i * 13 + 7);
      const h2 = hashInt01(i * 29 + 19);
      const h3 = hashInt01(i * 41 + 31);
      let x = h1 * size;
      let y = h2 * size;
      if (isClump) {
        const cx = Math.floor(h1 * 6) * (size / 6) + size / 12;
        const cy = Math.floor(h2 * 6) * (size / 6) + size / 12;
        const spread = THREE.MathUtils.lerp(28, 10, coat.clumpiness);
        x = (cx + (h3 - 0.5) * spread + size) % size;
        y = (cy + (hashInt01(i * 53) - 0.5) * spread + size) % size;
      }
      const len = baseLen * (0.7 + h3 * 0.65);
      const angle = (hashInt01(i * 71) - 0.5) * (isClump ? 0.55 : 0.35);

      const darkTone = Math.round(255 - intensity * 68);
      const bumpHi = Math.round(135 + intensity * 115);

      // Draw wrapped across tile edges
      for (const ox of [-size, 0, size]) {
        for (const oy of [-size, 0, size]) {
          const px = x + ox;
          const py = y + oy;
          if (px < -len || px > size + len || py < -len || py > size + len) continue;
          const ex = px + Math.sin(angle) * len;
          const ey = py + Math.cos(angle) * len;

          aCtx.strokeStyle = `rgba(${darkTone},${darkTone},${darkTone},${0.35 * intensity})`;
          aCtx.lineWidth = baseW * 1.15;
          aCtx.lineCap = 'round';
          aCtx.beginPath();
          aCtx.moveTo(px, py);
          aCtx.lineTo(ex, ey);
          aCtx.stroke();

          // Subtle tip highlight blend
          const tipHex = `rgba(${Math.round(tipRgb.r * 255)},${Math.round(tipRgb.g * 255)},${Math.round(tipRgb.b * 255)},${0.22 * intensity})`;
          aCtx.strokeStyle = tipHex;
          aCtx.lineWidth = baseW * 0.65;
          aCtx.beginPath();
          aCtx.moveTo(px + (ex - px) * 0.45, py + (ey - py) * 0.45);
          aCtx.lineTo(ex, ey);
          aCtx.stroke();

          bCtx.strokeStyle = `rgb(${bumpHi},${bumpHi},${bumpHi})`;
          bCtx.lineWidth = baseW;
          bCtx.lineCap = 'round';
          bCtx.beginPath();
          bCtx.moveTo(px, py);
          bCtx.lineTo(ex, ey);
          bCtx.stroke();
        }
      }
    }
  } else {
    // Scales (fish, dragon, hex)
    const isDragon = coat.mode === 'scalesDragon';
    const isHex = coat.mode === 'scalesHex';
    const cols = Math.max(4, Math.round((isDragon ? 8 : 11) * densityMult / sizeScale));
    const rows = cols;
    const cellW = size / cols;
    const cellH = size / rows;
    const outlineTone = Math.round(255 - intensity * 95);

    for (let row = -1; row <= rows + 1; row++) {
      for (let col = -1; col <= cols + 1; col++) {
        const cx = (col + (row % 2 === 0 ? 0 : 0.5)) * cellW;
        const cy = row * cellH;
        const rx = cellW * (isDragon ? 0.52 : 0.55);
        const ry = cellH * (isDragon ? 0.64 : 0.6);

        const drawScale = (ctx: CanvasRenderingContext2D, fill: string, stroke: string, lw: number) => {
          ctx.beginPath();
          if (isDragon) {
            ctx.moveTo(cx, cy - ry);
            ctx.lineTo(cx + rx, cy);
            ctx.lineTo(cx, cy + ry);
            ctx.lineTo(cx - rx, cy);
            ctx.closePath();
          } else if (isHex) {
            for (let k = 0; k < 6; k++) {
              const a = (k / 6) * Math.PI * 2 + Math.PI / 6;
              const px = cx + Math.cos(a) * rx * 0.96;
              const py = cy + Math.sin(a) * ry * 0.96;
              if (k === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.closePath();
          } else {
            ctx.arc(cx, cy, rx, 0, Math.PI * 2);
          }
          ctx.fillStyle = fill;
          ctx.fill();
          ctx.strokeStyle = stroke;
          ctx.lineWidth = lw;
          ctx.stroke();
        };

        const grad = bCtx.createRadialGradient(cx, cy - ry * 0.25, rx * 0.1, cx, cy, Math.max(rx, ry));
        grad.addColorStop(0, `rgb(${Math.min(255, Math.round(180 + intensity * 75))},${Math.min(255, Math.round(180 + intensity * 75))},${Math.min(255, Math.round(180 + intensity * 75))})`);
        grad.addColorStop(1, 'rgb(45,45,45)');
        bCtx.save();
        bCtx.fillStyle = grad;
        drawScale(bCtx, '#C8C8C8', '#222222', Math.max(1.5, cellW * 0.08));
        bCtx.restore();
        if (isDragon) {
          // Dorsal keel ridge along center of each dragon scale
          bCtx.strokeStyle = '#FFFFFF';
          bCtx.lineWidth = Math.max(1.5, cellW * 0.09);
          bCtx.beginPath();
          bCtx.moveTo(cx, cy - ry * 0.72);
          bCtx.lineTo(cx, cy + ry * 0.72);
          bCtx.stroke();
        }

        const tintFill = `rgba(${Math.round(235 + tipRgb.r * 20)},${Math.round(235 + tipRgb.g * 20)},${Math.round(235 + tipRgb.b * 20)},${0.18 * intensity})`;
        drawScale(aCtx, tintFill, `rgba(${outlineTone},${outlineTone},${outlineTone},${0.55 * intensity})`, Math.max(1, cellW * 0.07));
        drawScale(rCtx, isDragon ? '#585858' : '#3C3C3C', '#CCCCCC', Math.max(1, cellW * 0.06));
      }
    }
  }

  const repeat = coat.mode.startsWith('fur') ? 4 : 4; // even repeat keeps seamless UV symmetry
  const makeTex = (canvas: HTMLCanvasElement, isColor: boolean) => {
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeat, repeat);
    tex.colorSpace = isColor ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    tex.needsUpdate = true;
    return tex;
  };

  return {
    map: makeTex(albedoCanvas, true),
    bumpMap: makeTex(bumpCanvas, false),
    roughnessMap: makeTex(roughCanvas, false),
    bumpScale: (coat.mode.startsWith('scales') ? 0.022 : 0.016) * intensity,
  };
}

/** Builds layered 3D hair meshes mounted directly on Head bone so placement, rotation & scale move freely without skull SDF melting */
function buildLayeredHairGroup(
  doc: CharacterMakerDoc,
  ext: ResolvedCharacterExtras,
  crownLocalY: number,
  skullRx: number,
  skullRz: number
): THREE.Group | null {
  if (doc.hairStyle === 'none') return null;

  const rootGroup = new THREE.Group();
  rootGroup.name = 'CharHair';
  rootGroup.position.set(ext.hairOffsetX, crownLocalY + ext.hairOffsetY, ext.hairOffsetZ);
  rootGroup.rotation.set(
    THREE.MathUtils.degToRad(ext.hairRotX),
    THREE.MathUtils.degToRad(ext.hairRotY),
    THREE.MathUtils.degToRad(ext.hairRotZ)
  );

  const scaleGroup = new THREE.Group();
  const s = THREE.MathUtils.clamp((doc.hairSize || 1) * ext.hairScale, 0.25, 3.0);
  scaleGroup.scale.setScalar(s);
  rootGroup.add(scaleGroup);

  const hairMat = new THREE.MeshStandardMaterial({
    color: doc.hairColor,
    roughness: 0.62,
    metalness: 0.03,
  });
  const accentMat = new THREE.MeshStandardMaterial({
    color: ext.hairAccentColor,
    roughness: 0.42,
    metalness: 0.06,
  });

  const r = Math.max(0.11, skullRx * 1.03);
  const rz = Math.max(0.11, skullRz * 1.03);

  const addCap = (heightFrac = 0.65, yShift = -r * 0.36, capMat = hairMat) => {
    const capGeo = new THREE.SphereGeometry(1, 20, 14, 0, Math.PI * 2, 0, Math.PI * heightFrac);
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.scale.set(r * 1.04, r * 0.96, rz * 1.05);
    cap.position.set(0, yShift, -rz * 0.03);
    cap.rotation.x = -0.22;
    cap.castShadow = true;
    scaleGroup.add(cap);
    return cap;
  };

  const addStrand = (
    pts: THREE.Vector3[],
    rBase: number,
    rTip: number,
    mat = hairMat,
    flattenX = 1.0
  ) => {
    const segs = Math.max(2, pts.length - 1);
    for (let i = 0; i < segs; i++) {
      const f0 = i / segs;
      const f1 = (i + 1) / segs;
      const rad0 = THREE.MathUtils.lerp(rBase, rTip, f0);
      const rad1 = THREE.MathUtils.lerp(rBase, rTip, f1);
      const a = pts[i];
      const b = pts[i + 1];
      const dir = b.clone().sub(a);
      const len = Math.max(0.01, dir.length());
      const geo = new THREE.CylinderGeometry(rad1, rad0, len * 1.08, 10);
      geo.scale(flattenX, 1, 1);
      const m = new THREE.Mesh(geo, mat);
      m.position.copy(a).lerp(b, 0.5);
      m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
      m.castShadow = true;
      scaleGroup.add(m);
    }
    const tipBall = new THREE.Mesh(new THREE.SphereGeometry(rTip * 0.98, 8, 6), mat);
    tipBall.position.copy(pts[pts.length - 1]);
    tipBall.scale.set(flattenX, 1, 1);
    scaleGroup.add(tipBall);
  };

  const style: CharacterHairStyle = doc.hairStyle;

  if (style === 'buzzFade') {
    addCap(0.56, -r * 0.38);
  } else if (style === 'shortCrop') {
    addCap(0.62, -r * 0.35);
    // Crisp layered front bangs locks
    for (let i = -2; i <= 2; i++) {
      const x = i * r * 0.32;
      addStrand(
        [
          new THREE.Vector3(x * 0.7, r * 0.28, rz * 0.38),
          new THREE.Vector3(x * 0.92, r * 0.04, rz * 0.92),
          new THREE.Vector3(x * 0.96, -r * 0.14, rz * 0.88),
        ],
        0.028,
        0.012
      );
    }
  } else if (style === 'sidePart') {
    addCap(0.6, -r * 0.36);
    // Voluminous swept side wave across brow
    for (let i = 0; i < 5; i++) {
      const f = i / 4;
      const sx = -r * 0.42 + f * r * 0.55;
      addStrand(
        [
          new THREE.Vector3(sx, r * 0.42, rz * 0.18),
          new THREE.Vector3(sx + r * 0.38, r * 0.34 - f * 0.02, rz * 0.65),
          new THREE.Vector3(sx + r * 0.66, r * 0.06, rz * 0.72),
        ],
        0.036 - f * 0.004,
        0.014
      );
    }
  } else if (style === 'pompadour') {
    addCap(0.54, -r * 0.4);
    // High rolled pompadour crest
    const pompGeo = new THREE.CapsuleGeometry(r * 0.42, r * 0.85, 8, 14);
    pompGeo.rotateX(Math.PI * 0.36);
    const pomp = new THREE.Mesh(pompGeo, hairMat);
    pomp.scale.set(0.95, 1.05, 1.15);
    pomp.position.set(0, r * 0.46, rz * 0.38);
    pomp.castShadow = true;
    scaleGroup.add(pomp);
    // Swept back ridge
    const backCrest = new THREE.Mesh(new THREE.SphereGeometry(r * 0.44, 14, 10), hairMat);
    backCrest.scale.set(0.88, 0.85, 1.25);
    backCrest.position.set(0, r * 0.38, -rz * 0.15);
    scaleGroup.add(backCrest);
  } else if (style === 'messySpiky') {
    addCap(0.58, -r * 0.36);
    const spikeDirs = [
      [0, 0.17, 0.06],
      [-0.08, 0.14, 0.08],
      [0.08, 0.14, 0.08],
      [-0.12, 0.1, 0.02],
      [0.12, 0.1, 0.02],
      [-0.07, 0.15, -0.06],
      [0.07, 0.15, -0.06],
      [0, 0.13, -0.11],
      [-0.1, 0.06, 0.1],
      [0.1, 0.06, 0.1],
    ];
    for (const [dx, dy, dz] of spikeDirs) {
      const base = new THREE.Vector3(dx * 0.45, r * 0.15, dz * 0.45);
      const mid = base.clone().add(new THREE.Vector3(dx * 0.55, dy * 0.65, dz * 0.55));
      const tip = base.clone().add(new THREE.Vector3(dx * 1.1, dy * 1.05, dz * 1.1));
      addStrand([base, mid, tip], 0.036, 0.005);
    }
  } else if (style === 'undercut') {
    addCap(0.5, -r * 0.42);
    for (let i = -2; i <= 2; i++) {
      const x = i * r * 0.24;
      addStrand(
        [
          new THREE.Vector3(x * 0.6, r * 0.32, -rz * 0.35),
          new THREE.Vector3(x * 0.8 + 0.02, r * 0.5, rz * 0.1),
          new THREE.Vector3(x * 0.9 + 0.04, r * 0.36, rz * 0.72),
        ],
        0.042,
        0.015
      );
    }
  } else if (style === 'surferCurtains') {
    addCap(0.6, -r * 0.35);
    ([-1, 1] as const).forEach((side) => {
      for (let i = 0; i < 3; i++) {
        const zOff = (i - 1) * rz * 0.32;
        addStrand(
          [
            new THREE.Vector3(side * 0.02, r * 0.4, zOff + rz * 0.12),
            new THREE.Vector3(side * r * 0.88, r * 0.12, zOff + rz * 0.42),
            new THREE.Vector3(side * r * 1.06, -r * 0.72, zOff + rz * 0.25),
            new THREE.Vector3(side * r * 0.92, -r * 1.15, zOff - rz * 0.08),
          ],
          0.036,
          0.014
        );
      }
    });
  } else if (style === 'longStraight') {
    addCap(0.68, -r * 0.32);
    // Sleek back veil draping past shoulders
    for (let i = -3; i <= 3; i++) {
      const x = i * r * 0.32;
      const depthCurve = Math.sqrt(Math.max(0.1, 1 - (i / 3.6) ** 2));
      addStrand(
        [
          new THREE.Vector3(x * 0.7, r * 0.25, -rz * 0.35 * depthCurve),
          new THREE.Vector3(x * 0.98, -r * 0.55, -rz * 0.96 * depthCurve),
          new THREE.Vector3(x * 1.05, -r * 1.65, -rz * 1.05 * depthCurve),
          new THREE.Vector3(x * 1.02, -r * 2.45, -rz * 0.98 * depthCurve),
        ],
        0.044,
        0.024
      );
    }
    // Face-framing front locks + soft bangs
    ([-1, 1] as const).forEach((side) => {
      addStrand(
        [
          new THREE.Vector3(side * r * 0.55, r * 0.25, rz * 0.58),
          new THREE.Vector3(side * r * 0.98, -r * 0.45, rz * 0.56),
          new THREE.Vector3(side * r * 0.92, -r * 1.45, rz * 0.44),
        ],
        0.032,
        0.014
      );
    });
  } else if (style === 'bobCut') {
    addCap(0.7, -r * 0.34);
    for (let i = -3; i <= 3; i++) {
      const a = Math.PI * 0.18 + ((i + 3) / 6) * Math.PI * 1.64;
      const sx = Math.sin(a) * r * 0.95;
      const sz = -Math.cos(a) * rz * 0.95;
      addStrand(
        [
          new THREE.Vector3(sx * 0.6, r * 0.2, sz * 0.6),
          new THREE.Vector3(sx * 1.12, -r * 0.38, sz * 1.12),
          new THREE.Vector3(sx * 0.96, -r * 0.88, sz * 0.96),
        ],
        0.042,
        0.022
      );
    }
    // Smooth fringe
    for (let i = -2; i <= 2; i++) {
      addStrand(
        [
          new THREE.Vector3(i * r * 0.24, r * 0.34, rz * 0.5),
          new THREE.Vector3(i * r * 0.28, r * 0.04, rz * 0.95),
        ],
        0.028,
        0.016
      );
    }
  } else if (style === 'wavyShoulder') {
    addCap(0.68, -r * 0.32);
    for (let i = -3; i <= 3; i++) {
      const x = i * r * 0.32;
      const phase = i * 0.6;
      addStrand(
        [
          new THREE.Vector3(x * 0.65, r * 0.22, -rz * 0.25),
          new THREE.Vector3(x * 1.05 + Math.sin(phase) * 0.02, -r * 0.35, -rz * 0.95),
          new THREE.Vector3(x * 1.14 - Math.sin(phase) * 0.025, -r * 0.95, -rz * 0.88),
          new THREE.Vector3(x * 1.06 + Math.sin(phase) * 0.03, -r * 1.62, -rz * 1.02),
        ],
        0.042,
        0.018
      );
    }
    ([-1, 1] as const).forEach((side) => {
      addStrand(
        [
          new THREE.Vector3(side * r * 0.62, r * 0.22, rz * 0.5),
          new THREE.Vector3(side * r * 1.06, -r * 0.38, rz * 0.58),
          new THREE.Vector3(side * r * 0.95, -r * 1.05, rz * 0.35),
        ],
        0.032,
        0.014
      );
    });
  } else if (style === 'twinPigtails') {
    addCap(0.62, -r * 0.34);
    ([-1, 1] as const).forEach((side) => {
      const tie = new THREE.Mesh(new THREE.TorusGeometry(0.036, 0.013, 8, 16), accentMat);
      tie.position.set(side * r * 1.05, r * 0.14, -rz * 0.12);
      tie.rotation.y = side * 0.7;
      scaleGroup.add(tie);
      addStrand(
        [
          new THREE.Vector3(side * r * 1.04, r * 0.14, -rz * 0.12),
          new THREE.Vector3(side * r * 1.48, -r * 0.15, -rz * 0.22),
          new THREE.Vector3(side * r * 1.56, -r * 0.95, -rz * 0.28),
          new THREE.Vector3(side * r * 1.38, -r * 1.45, -rz * 0.12),
        ],
        0.052,
        0.018
      );
    });
  } else if (style === 'highBun') {
    addCap(0.62, -r * 0.35);
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.052, 0.014, 8, 18), accentMat);
    band.rotation.x = Math.PI * 0.5;
    band.position.set(0, r * 0.68, -rz * 0.18);
    scaleGroup.add(band);
    const bun = new THREE.Mesh(new THREE.SphereGeometry(r * 0.58, 16, 14), hairMat);
    bun.scale.set(1.05, 0.88, 1.05);
    bun.position.set(0, r * 0.88, -rz * 0.2);
    bun.castShadow = true;
    scaleGroup.add(bun);
  } else if (style === 'braidedCrown') {
    addCap(0.64, -r * 0.34);
    // Woven crown ring of beads circling forehead & sides
    const links = 16;
    for (let i = 0; i < links; i++) {
      const a = (i / links) * Math.PI * 2;
      const link = new THREE.Mesh(new THREE.SphereGeometry(0.032, 10, 8), i % 4 === 0 ? accentMat : hairMat);
      link.position.set(Math.sin(a) * r * 1.02, r * 0.28 + Math.cos(a) * 0.02, Math.cos(a) * rz * 1.02);
      link.scale.set(1.15, 0.85, 1.15);
      scaleGroup.add(link);
    }
    // Back plait
    for (let p = 0; p < 6; p++) {
      const bead = new THREE.Mesh(new THREE.SphereGeometry(0.036 * (1 - p * 0.1), 10, 8), hairMat);
      bead.position.set((p % 2 === 0 ? 1 : -1) * 0.012, -r * 0.15 - p * 0.058, -rz * 1.02 - p * 0.012);
      scaleGroup.add(bead);
    }
  } else if (style === 'curlyAfro') {
    const puffOffsets = [
      [0, r * 0.32, 0, 1.0],
      [-r * 0.62, r * 0.18, rz * 0.35, 0.72],
      [r * 0.62, r * 0.18, rz * 0.35, 0.72],
      [-r * 0.78, -r * 0.12, -rz * 0.05, 0.74],
      [r * 0.78, -r * 0.12, -rz * 0.05, 0.74],
      [-r * 0.56, r * 0.12, -rz * 0.58, 0.76],
      [r * 0.56, r * 0.12, -rz * 0.58, 0.76],
      [0, r * 0.02, -rz * 0.76, 0.78],
      [-r * 0.42, -r * 0.45, -rz * 0.65, 0.66],
      [r * 0.42, -r * 0.45, -rz * 0.65, 0.66],
      [0, -r * 0.5, -rz * 0.72, 0.68],
      [-r * 0.32, r * 0.45, rz * 0.1, 0.68],
      [r * 0.32, r * 0.45, rz * 0.1, 0.68],
    ];
    for (const [px, py, pz, pr] of puffOffsets) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(r * 0.62 * pr, 14, 12), hairMat);
      puff.position.set(px, py, pz);
      puff.castShadow = true;
      scaleGroup.add(puff);
    }
  } else if (style === 'ponytail') {
    addCap(0.64, -r * 0.34);
    const tie = new THREE.Mesh(new THREE.TorusGeometry(0.036, 0.012, 8, 14), accentMat);
    tie.position.set(0, r * 0.2, -rz * 0.96);
    scaleGroup.add(tie);
    addStrand(
      [
        new THREE.Vector3(0, r * 0.2, -rz * 0.92),
        new THREE.Vector3(0, r * 0.12, -rz * 1.48),
        new THREE.Vector3(0, -r * 0.52, -rz * 1.66),
        new THREE.Vector3(0, -r * 1.15, -rz * 1.45),
      ],
      0.056,
      0.016
    );
  } else if (style === 'spikyTufts') {
    const dirs = [
      [0, 0.16, 0.06],
      [0.1, 0.12, 0.03],
      [-0.1, 0.12, 0.03],
      [0.06, 0.13, -0.09],
      [-0.06, 0.13, -0.09],
    ];
    for (const [dx, dy, dz] of dirs) {
      addStrand(
        [new THREE.Vector3(dx * 0.25, -0.02, dz * 0.25), new THREE.Vector3(dx, dy, dz)],
        0.044,
        0.008
      );
    }
  } else if (style === 'mohawk') {
    for (let i = 0; i < 5; i++) {
      const z = 0.09 - i * 0.065;
      addStrand(
        [new THREE.Vector3(0, -0.02 - i * 0.01, z), new THREE.Vector3(0, 0.14 - i * 0.01, z - 0.04)],
        0.042,
        0.008,
        hairMat,
        0.55
      );
    }
  } else if (style === 'curlSwirl') {
    addStrand(
      [
        new THREE.Vector3(0, -0.01, 0),
        new THREE.Vector3(0, 0.1, 0.04),
        new THREE.Vector3(0, 0.14, 0.11),
        new THREE.Vector3(0, 0.09, 0.13),
      ],
      0.055,
      0.014
    );
  } else if (style === 'mushroomCap') {
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(1, 22, 14, 0, Math.PI * 2, 0, Math.PI * 0.56),
      hairMat
    );
    dome.scale.set(r * 1.65, r * 0.95, rz * 1.65);
    dome.position.set(0, -r * 0.15, 0);
    dome.castShadow = true;
    scaleGroup.add(dome);
  } else if (style === 'horseMane') {
    addStrand(
      [new THREE.Vector3(0, 0.01, 0.02), new THREE.Vector3(0, 0.05, 0.13)],
      0.04,
      0.012
    );
    for (let i = 0; i < 5; i++) {
      const f = i / 4;
      addStrand(
        [
          new THREE.Vector3(0, 0.02 - f * 0.24, -rz * 0.72),
          new THREE.Vector3(0, 0.05 - f * 0.24, -rz * 1.48),
        ],
        0.045,
        0.016,
        hairMat,
        0.58
      );
    }
  } else if (style === 'lionMane') {
    const count = 12;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      const puff = new THREE.Mesh(new THREE.SphereGeometry(r * 0.56, 12, 10), hairMat);
      puff.position.set(Math.sin(a) * r * 1.15, -r * 0.52 + Math.cos(a) * r * 1.05, -rz * 0.15);
      puff.scale.set(1.0, 1.0, 0.85);
      puff.castShadow = true;
      scaleGroup.add(puff);
    }
  } else if (style === 'featherTuft') {
    ([-0.035, 0, 0.035] as const).forEach((xOff, idx) => {
      addStrand(
        [
          new THREE.Vector3(xOff * 0.4, -0.01, 0.02 - idx * 0.015),
          new THREE.Vector3(xOff * 0.85, 0.11 - Math.abs(idx - 1) * 0.025, -0.04),
        ],
        0.026,
        0.008,
        hairMat,
        0.75
      );
    });
  } else if (style === 'fluffyBangs') {
    for (let b = -1; b <= 1; b++) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(r * 0.42, 12, 10), hairMat);
      puff.scale.set(1.05, 0.78, 0.88);
      puff.position.set(b * r * 0.42, -r * 0.06, rz * 0.72);
      puff.castShadow = true;
      scaleGroup.add(puff);
    }
  }

  return rootGroup;
}

/** Builds per-bone 3D fur tufts / raised scale shingles + dorsal spikes/quills that animate with skeleton & export to GLB */
function buildSurfaceCoatAndSpikes(
  bones: THREE.Bone[],
  bodyGeo: THREE.BufferGeometry,
  coat: CharacterSurfaceCoatConfig,
  spikes: CharacterSpikesConfig,
  headCenterY: number,
  headCenterZ: number,
  excludedBones: Set<number>
): void {
  const wantCoat = coat.mode !== 'none' && coat.intensity > 0.08;
  const wantSpikes = spikes.enabled;
  if (!wantCoat && !wantSpikes) return;

  const posAttr = bodyGeo.attributes.position as THREE.BufferAttribute;
  const normAttr = bodyGeo.attributes.normal as THREE.BufferAttribute;
  const colAttr = bodyGeo.attributes.color as THREE.BufferAttribute;
  const skinIdxAttr = bodyGeo.attributes.skinIndex as THREE.BufferAttribute;
  const vCount = posAttr.count;
  if (vCount === 0) return;

  // Precompute bone world inverses once
  const boneWorldInv = bones.map((b) => new THREE.Matrix4().copy(b.matrixWorld).invert());

  const coatPartsByBone = new Map<number, THREE.BufferGeometry[]>();
  const spikePartsByBone = new Map<number, THREE.BufferGeometry[]>();
  const upAxis = new THREE.Vector3(0, 1, 0);
  const tmpPos = new THREE.Vector3();
  const tmpNorm = new THREE.Vector3();
  const tmpColor = new THREE.Color();
  const coatTipCol = new THREE.Color(coat.tipColor || '#FDE68A');
  const spikeBaseCol = new THREE.Color(spikes.color || '#292524');
  const spikeTipCol = new THREE.Color(spikes.tipColor || '#FEF3C7');
  const qWorld = new THREE.Quaternion();
  const matLocal = new THREE.Matrix4();

  // Deterministic stride based on vertex count & requested densities
  if (wantCoat) {
    const isFur = coat.mode.startsWith('fur');
    const isClumped = coat.mode === 'furClumped';
    const isDragon = coat.mode === 'scalesDragon';
    const isHex = coat.mode === 'scalesHex';
    const targetSamples = Math.round((isFur ? 420 : 280) * THREE.MathUtils.clamp(coat.density, 0.25, 1.8));
    const stride = Math.max(1, Math.floor(vCount / Math.max(1, targetSamples)));
    const tuftH =
      (coat.mode === 'furLong' ? 0.075 : isClumped ? 0.056 : 0.036) *
      coat.scaleSize *
      (0.55 + coat.intensity * 0.65);
    const tuftW =
      (isClumped ? 0.018 : isFur ? 0.011 : 0.026 * coat.scaleSize) *
      (isFur ? coat.scaleSize : 1);

    for (let i = 0; i < vCount; i += stride) {
      const boneIdx = skinIdxAttr.getX(i);
      if (excludedBones.has(boneIdx)) continue;

      tmpPos.fromBufferAttribute(posAttr, i);
      tmpNorm.fromBufferAttribute(normAttr, i).normalize();

      // Protect face & eye/mouth region so fur/scales don't poke out of eyes/lips
      if (tmpPos.y > headCenterY - 0.14 && tmpPos.z > headCenterZ + 0.015 && tmpNorm.z > 0.22) {
        continue;
      }

      tmpColor.setRGB(colAttr.getX(i), colAttr.getY(i), colAttr.getZ(i));
      const h = hashInt01(i * 97 + 13);

      let partGeo: THREE.BufferGeometry;
      const dir = new THREE.Vector3();

      if (isFur) {
        const bladeLen = tuftH * (0.72 + h * 0.56);
        partGeo = new THREE.ConeGeometry(tuftW, bladeLen, isClumped ? 5 : 4);
        partGeo.translate(0, bladeLen * 0.42, 0);
        // Sweep fur tangentially down + slightly out from normal
        const downBias = coat.mode === 'furLong' ? -0.78 : -0.45;
        dir.copy(tmpNorm).multiplyScalar(0.55).add(new THREE.Vector3((h - 0.5) * 0.22, downBias, -0.15)).normalize();
        if (isClumped && h > 0.65) {
          partGeo.scale(1.45, 1.15, 1.45);
        }
        paintGeometryGradient(partGeo, tmpColor, coatTipCol, 0, bladeLen * 0.9);
      } else {
        // Raised 3D scale shingle / dragon scute
        const scLen = 0.036 * coat.scaleSize;
        partGeo = new THREE.ConeGeometry(tuftW, scLen, isDragon ? 4 : isHex ? 6 : 5);
        partGeo.scale(1.15, 1, isDragon ? 0.42 : 0.28);
        partGeo.translate(0, scLen * 0.24, 0);
        dir.copy(tmpNorm).multiplyScalar(0.45).add(new THREE.Vector3(0, -0.68, -0.12)).normalize();
        paintGeometryGradient(partGeo, tmpColor, coatTipCol, 0, scLen * 0.6);
      }

      qWorld.setFromUnitVectors(upAxis, dir);
      matLocal.compose(tmpPos, qWorld, new THREE.Vector3(1, 1, 1));
      matLocal.premultiply(boneWorldInv[boneIdx]);
      partGeo.applyMatrix4(matLocal);

      let list = coatPartsByBone.get(boneIdx);
      if (!list) {
        list = [];
        coatPartsByBone.set(boneIdx, list);
      }
      list.push(partGeo);
    }

    const coatMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: coat.mode.startsWith('scales') ? 0.34 : 0.85,
      metalness: coat.mode.startsWith('scales') ? 0.08 : 0.0,
    });
    coatPartsByBone.forEach((parts, boneIdx) => {
      const merged = mergeVertexColoredGeometries(parts);
      if (merged && bones[boneIdx]) {
        const mesh = new THREE.Mesh(merged, coatMat);
        mesh.name = `CharCoat_${boneIdx}`;
        mesh.castShadow = true;
        bones[boneIdx].add(mesh);
      }
    });
  }

  if (wantSpikes) {
    const spikeSamples = Math.round(
      (spikes.zone === 'fullBody' ? 220 : spikes.zone === 'spine' ? 75 : 140) *
        THREE.MathUtils.clamp(spikes.density, 0.25, 1.8)
    );
    const stride = Math.max(1, Math.floor(vCount / Math.max(1, spikeSamples)));
    const sweepFrac = THREE.MathUtils.clamp(spikes.sweepDeg / 85, -0.25, 0.95);
    const sLen = THREE.MathUtils.clamp(spikes.length, 0.04, 0.45);
    const sRad = 0.02 * THREE.MathUtils.clamp(spikes.thickness, 0.4, 2.2);

    for (let i = 0; i < vCount; i += stride) {
      const boneIdx = skinIdxAttr.getX(i);
      if (excludedBones.has(boneIdx)) continue;

      tmpPos.fromBufferAttribute(posAttr, i);
      tmpNorm.fromBufferAttribute(normAttr, i).normalize();

      // Always protect eyes, brow & front of face
      if (tmpPos.y > headCenterY - 0.14 && tmpPos.z > headCenterZ - 0.01 && tmpNorm.z > 0.12) {
        continue;
      }

      // Filter by requested placement zone
      if (spikes.zone === 'spine') {
        const onBackSpine = Math.abs(tmpPos.x) < 0.095 && tmpNorm.z < -0.25;
        const onCrownRidge = Math.abs(tmpPos.x) < 0.075 && tmpPos.y > headCenterY + 0.03 && tmpNorm.y > 0.35;
        if (!onBackSpine && !onCrownRidge) continue;
      } else if (spikes.zone === 'headAndBack') {
        const onBack = tmpNorm.z < -0.12;
        const onCrown = tmpPos.y > headCenterY + 0.04 && tmpNorm.y > 0.28;
        if (!onBack && !onCrown) continue;
      } else if (spikes.zone === 'shouldersAndBack') {
        const onBackOrShoulder = tmpNorm.z < -0.15 || (tmpNorm.y > 0.45 && Math.abs(tmpPos.x) > 0.08 && tmpPos.y < headCenterY);
        if (!onBackOrShoulder) continue;
      }

      const h = hashInt01(i * 131 + 29);
      const lenThis = sLen * (0.76 + h * 0.48);
      let partGeo: THREE.BufferGeometry;

      if (spikes.style === 'dorsalFins') {
        partGeo = new THREE.ConeGeometry(sRad * 2.1, lenThis * 1.15, 5);
        partGeo.scale(0.32, 1, 1.9);
      } else if (spikes.style === 'crystalSpines') {
        partGeo = new THREE.CylinderGeometry(sRad * 0.25, sRad * 1.05, lenThis, 6);
      } else if (spikes.style === 'boneSpikes') {
        partGeo = new THREE.ConeGeometry(sRad * 1.28, lenThis, 7);
      } else {
        // Porcupine quills: long slender banded needles
        partGeo = new THREE.ConeGeometry(sRad * 0.68, lenThis * 1.18, 6);
      }
      partGeo.translate(0, lenThis * 0.45, 0);
      paintGeometryGradient(partGeo, spikeBaseCol, spikeTipCol, 0, lenThis * 0.95);

      const dir = tmpNorm
        .clone()
        .lerp(new THREE.Vector3(0, -0.18, -1).normalize(), Math.max(0, sweepFrac))
        .normalize();
      if (sweepFrac < 0) {
        dir.lerp(new THREE.Vector3(0, 1, 0), -sweepFrac).normalize();
      }
      qWorld.setFromUnitVectors(upAxis, dir);
      matLocal.compose(tmpPos, qWorld, new THREE.Vector3(1, 1, 1));
      matLocal.premultiply(boneWorldInv[boneIdx]);
      partGeo.applyMatrix4(matLocal);

      let list = spikePartsByBone.get(boneIdx);
      if (!list) {
        list = [];
        spikePartsByBone.set(boneIdx, list);
      }
      list.push(partGeo);
    }

    const spikeMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: spikes.style === 'crystalSpines' ? 0.16 : 0.48,
      metalness: spikes.style === 'crystalSpines' ? 0.18 : 0.04,
      flatShading: spikes.style === 'crystalSpines',
    });
    spikePartsByBone.forEach((parts, boneIdx) => {
      const merged = mergeVertexColoredGeometries(parts);
      if (merged && bones[boneIdx]) {
        const mesh = new THREE.Mesh(merged, spikeMat);
        mesh.name = `CharSpikes_${boneIdx}`;
        mesh.castShadow = true;
        bones[boneIdx].add(mesh);
      }
    });
  }
}

/** Builds optional bone-mounted eyewear, headwear & back/shoulder game gear */
function buildLayeredAddons(
  doc: CharacterMakerDoc,
  ext: ResolvedCharacterExtras,
  headB: THREE.Bone,
  chestB: THREE.Bone,
  neckB: THREE.Bone,
  crownLocalY: number,
  headCenterY: number,
  baseHeadDepthZ: number,
  attachFromSkullInterior: (
    skullInteriorOrigin: THREE.Vector3,
    outwardDir: THREE.Vector3,
    fallbackExteriorOrigin: THREE.Vector3,
    object: THREE.Object3D,
    surfaceBias?: number,
    normalBlendForward?: number
  ) => void
): void {
  const addons = ext.addons;

  // 1. Eyewear
  if (addons.eyewear !== 'none') {
    const ew = new THREE.Group();
    ew.name = 'CharAddon_Eyewear';
    ew.scale.setScalar(addons.eyewearScale);
    const frameMat = new THREE.MeshStandardMaterial({
      color: addons.eyewearColor,
      roughness: 0.35,
      metalness: 0.45,
    });
    const lensMat = new THREE.MeshStandardMaterial({
      color: addons.eyewearLensColor,
      roughness: 0.12,
      metalness: 0.15,
      transparent: true,
      opacity: addons.eyewear === 'cyberVisor' ? 0.86 : 0.58,
      emissive: addons.eyewear === 'cyberVisor' ? new THREE.Color(addons.eyewearLensColor) : new THREE.Color('#000000'),
      emissiveIntensity: addons.eyewear === 'cyberVisor' ? 0.45 : 0,
    });

    const sp = Math.max(0.036, doc.eyeSpacing);
    const rad = Math.max(0.026, doc.eyeSize * 1.15);

    if (addons.eyewear === 'roundGlasses' || addons.eyewear === 'goggles') {
      const tubeR = addons.eyewear === 'goggles' ? rad * 0.28 : 0.0055;
      ([-1, 1] as const).forEach((s) => {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(rad, tubeR, 10, 22), frameMat);
        ring.position.x = s * sp;
        const lens = new THREE.Mesh(new THREE.CircleGeometry(rad * 0.94, 18), lensMat);
        lens.position.set(s * sp, 0, 0.002);
        ew.add(ring, lens);
      });
      const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.0045, 0.0045, Math.max(0.01, (sp - rad) * 2.1), 8), frameMat);
      bridge.rotation.z = Math.PI * 0.5;
      ew.add(bridge);
    } else if (addons.eyewear === 'cyberVisor') {
      const visorGeo = new THREE.CylinderGeometry(sp * 1.65, sp * 1.65, rad * 1.45, 24, 1, true, -0.78, 1.56);
      const visor = new THREE.Mesh(visorGeo, lensMat);
      visor.position.z = -sp * 1.52;
      const topTrim = new THREE.Mesh(
        new THREE.CylinderGeometry(sp * 1.68, sp * 1.68, 0.012, 24, 1, true, -0.82, 1.64),
        frameMat
      );
      topTrim.position.set(0, rad * 0.72, -sp * 1.52);
      ew.add(visor, topTrim);
    } else if (addons.eyewear === 'monocle') {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(rad * 1.05, 0.0055, 10, 22), frameMat);
      ring.position.x = sp;
      const lens = new THREE.Mesh(new THREE.CircleGeometry(rad * 0.98, 18), lensMat);
      lens.position.set(sp, 0, 0.002);
      ew.add(ring, lens);
    }

    const eyeY = headCenterY + doc.eyeHeight + addons.eyewearOffsetY;
    const origin = new THREE.Vector3(0, eyeY, doc.headForwardTilt);
    const fallback = new THREE.Vector3(0, eyeY, baseHeadDepthZ + 0.035);
    attachFromSkullInterior(origin, new THREE.Vector3(0, 0, 1), fallback, ew, 0.018 + addons.eyewearOffsetZ, 0.85);
  }

  // 2. HeadGear
  if (addons.headGear !== 'none') {
    const hg = new THREE.Group();
    hg.name = 'CharAddon_HeadGear';
    hg.position.set(0, crownLocalY + addons.headGearOffsetY, 0);
    hg.rotation.x = THREE.MathUtils.degToRad(addons.headGearRotX);
    hg.scale.setScalar(addons.headGearScale);
    const primMat = new THREE.MeshStandardMaterial({ color: addons.headGearColor, roughness: 0.55 });
    const accMat = new THREE.MeshStandardMaterial({
      color: addons.headGearAccentColor,
      roughness: 0.3,
      metalness: addons.headGear === 'crown' || addons.headGear === 'halo' ? 0.65 : 0.1,
      emissive: addons.headGear === 'halo' ? new THREE.Color(addons.headGearAccentColor) : new THREE.Color('#000000'),
      emissiveIntensity: addons.headGear === 'halo' ? 0.7 : 0,
    });
    const r = Math.max(0.11, doc.head.midRadius);

    if (addons.headGear === 'adventurerCap') {
      const dome = new THREE.Mesh(new THREE.SphereGeometry(r * 1.05, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.52), primMat);
      dome.position.y = -r * 0.32;
      dome.castShadow = true;
      const brim = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.98, r * 1.06, 0.018, 18, 1, false, -0.95, 1.9), accMat);
      brim.position.set(0, -r * 0.24, r * 0.52);
      brim.rotation.x = 0.14;
      hg.add(dome, brim);
    } else if (addons.headGear === 'wizardHat') {
      const brim = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.75, r * 1.85, 0.022, 22), primMat);
      brim.position.y = -r * 0.18;
      const band = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.04, r * 1.08, 0.045, 18), accMat);
      band.position.y = -r * 0.14;
      const cone = new THREE.Mesh(new THREE.ConeGeometry(r * 1.06, 0.34, 18), primMat);
      cone.position.set(0, r * 0.55, -0.02);
      cone.rotation.x = -0.15;
      cone.castShadow = true;
      hg.add(brim, band, cone);
    } else if (addons.headGear === 'crown') {
      const band = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.78, r * 0.72, 0.06, 16, 1, true), accMat);
      band.material.side = THREE.DoubleSide;
      band.position.y = -r * 0.04;
      hg.add(band);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const prong = new THREE.Mesh(new THREE.ConeGeometry(0.024, 0.075, 5), accMat);
        prong.position.set(Math.sin(a) * r * 0.75, r * 0.18, Math.cos(a) * r * 0.75);
        const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.014, 0), primMat);
        gem.position.set(Math.sin(a) * r * 0.78, -r * 0.02, Math.cos(a) * r * 0.78);
        hg.add(prong, gem);
      }
    } else if (addons.headGear === 'halo') {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(r * 0.92, 0.016, 10, 28), accMat);
      ring.rotation.x = Math.PI * 0.5;
      ring.position.y = r * 0.55;
      hg.add(ring);
    } else if (addons.headGear === 'flowerCrown') {
      const vine = new THREE.Mesh(new THREE.TorusGeometry(r * 1.02, 0.014, 8, 26), new THREE.MeshStandardMaterial({ color: '#16A34A', roughness: 0.75 }));
      vine.rotation.x = Math.PI * 0.5;
      vine.position.y = -r * 0.12;
      hg.add(vine);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const blossom = new THREE.Mesh(new THREE.DodecahedronGeometry(0.028, 0), i % 2 === 0 ? primMat : accMat);
        blossom.position.set(Math.sin(a) * r * 1.04, -r * 0.11, Math.cos(a) * r * 1.04);
        hg.add(blossom);
      }
    }
    headB.add(hg);
  }

  // 3. BodyGear
  if (addons.bodyGear !== 'none') {
    const bg = new THREE.Group();
    bg.name = 'CharAddon_BodyGear';
    bg.scale.setScalar(addons.bodyGearScale);
    const primMat = new THREE.MeshStandardMaterial({ color: addons.bodyGearColor, roughness: 0.65 });
    const accMat = new THREE.MeshStandardMaterial({ color: addons.bodyGearAccentColor, roughness: 0.45 });
    const torsoZ = -doc.torso.midRadius * (doc.torso.squashZ ?? 0.88) - 0.04;
    const torsoTopY = doc.torso.length * 0.72;

    if (addons.bodyGear === 'backpack') {
      const pack = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.28, 0.13, 2, 2, 2), primMat);
      pack.position.set(0, doc.torso.length * 0.42, torsoZ - 0.04);
      pack.castShadow = true;
      const flap = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.08, 0.145), accMat);
      flap.position.set(0, doc.torso.length * 0.54, torsoZ - 0.04);
      const roll = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.26, 12), accMat);
      roll.rotation.z = Math.PI * 0.5;
      roll.position.set(0, doc.torso.length * 0.62, torsoZ - 0.04);
      bg.add(pack, flap, roll);
      chestB.add(bg);
    } else if (addons.bodyGear === 'quiver') {
      const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.042, 0.34, 12), primMat);
      tube.position.set(0.04, doc.torso.length * 0.48, torsoZ - 0.03);
      tube.rotation.z = -0.35;
      tube.castShadow = true;
      bg.add(tube);
      for (let i = -1; i <= 1; i++) {
        const fletch = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.07, 5), accMat);
        fletch.position.set(0.04 + i * 0.025 + 0.06, doc.torso.length * 0.68, torsoZ - 0.03);
        fletch.rotation.z = -0.35;
        bg.add(fletch);
      }
      chestB.add(bg);
    } else if (addons.bodyGear === 'cape') {
      const capeGeo = new THREE.CylinderGeometry(0.16, 0.28, doc.torso.length + doc.belly.length + 0.18, 12, 1, true, Math.PI * 0.62, Math.PI * 0.76);
      const capeMat = new THREE.MeshStandardMaterial({ color: addons.bodyGearColor, roughness: 0.75, side: THREE.DoubleSide });
      const cape = new THREE.Mesh(capeGeo, capeMat);
      cape.position.set(0, torsoTopY * 0.36, -0.02);
      cape.castShadow = true;
      const clasp = new THREE.Mesh(new THREE.SphereGeometry(0.024, 10, 8), accMat);
      clasp.position.set(0, torsoTopY * 0.94, doc.torso.midRadius * 0.78);
      bg.add(cape, clasp);
      chestB.add(bg);
    } else if (addons.bodyGear === 'scarf') {
      const collar = new THREE.Mesh(new THREE.TorusGeometry(doc.neck.startRadius * 1.45, 0.038, 10, 20), primMat);
      collar.rotation.x = Math.PI * 0.5;
      collar.position.set(0, 0.02, 0);
      const tail = new THREE.Mesh(new THREE.BoxGeometry(0.068, 0.24, 0.024), accMat);
      tail.position.set(doc.neck.startRadius * 0.9, -0.1, doc.neck.startRadius * 0.95);
      tail.rotation.set(-0.18, 0, -0.12);
      bg.add(collar, tail);
      neckB.add(bg);
    } else if (addons.bodyGear === 'pauldrons') {
      ([-1, 1] as const).forEach((s) => {
        const dome = new THREE.Mesh(new THREE.SphereGeometry(0.095, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.55), primMat);
        dome.position.set(s * doc.shoulderWidth, doc.torso.length * 0.68, 0);
        dome.rotation.z = -s * 0.35;
        dome.castShadow = true;
        const rim = new THREE.Mesh(new THREE.TorusGeometry(0.094, 0.012, 8, 18), accMat);
        rim.rotation.x = Math.PI * 0.5;
        rim.position.copy(dome.position);
        rim.rotation.z = dome.rotation.z;
        bg.add(dome, rim);
      });
      chestB.add(bg);
    }
  }
}

export function buildCharacterRigAndMesh(
  doc: CharacterMakerDoc,
  resolution = 44
): BuiltCharacterAsset {
  const root = new THREE.Group();
  root.name = 'CharacterRoot';
  const ext = resolveCharacterExtras(doc);

  // 1. Compute vertical kinematic skeleton anchors in bind pose (feet planted around Y = 0)
  const footThickness =
    doc.footStyle === 'hoof'
      ? 0.095 * doc.footScale
      : doc.footStyle === 'paw'
      ? 0.08 * doc.footScale
      : 0.075 * doc.footScale;
  const ankleY = footThickness + 0.01;
  const kneeY = ankleY + doc.lowerLeg.length;
  const hipY = kneeY + doc.upperLeg.length;
  const spineBaseY = hipY + doc.hips.length * 0.55;
  const chestY = spineBaseY + doc.belly.length * 0.88;
  const shoulderY = chestY + doc.torso.length * 0.68;
  const neckBaseY = chestY + doc.torso.length * 0.92;
  const headCenterY = neckBaseY + doc.neck.length + doc.head.length * 0.38;

  const hipX = doc.legStanceWidth;
  const shoulderX = doc.shoulderWidth;
  const spreadRad = THREE.MathUtils.degToRad(THREE.MathUtils.clamp(doc.armSpreadDeg, 8, 72));
  const cosSpread = Math.cos(spreadRad);
  const sinSpread = Math.sin(spreadRad);

  const lShoulderPos = new THREE.Vector3(shoulderX, shoulderY, 0);
  const lElbowPos = new THREE.Vector3(
    shoulderX + doc.upperArm.length * cosSpread,
    shoulderY - doc.upperArm.length * sinSpread,
    0
  );
  const lWristPos = new THREE.Vector3(
    lElbowPos.x + doc.lowerArm.length * cosSpread,
    lElbowPos.y - doc.lowerArm.length * sinSpread * 0.88,
    0.02
  );

  const rShoulderPos = new THREE.Vector3(-shoulderX, shoulderY, 0);
  const rElbowPos = new THREE.Vector3(
    -shoulderX - doc.upperArm.length * cosSpread,
    shoulderY - doc.upperArm.length * sinSpread,
    0
  );
  const rWristPos = new THREE.Vector3(
    rElbowPos.x - doc.lowerArm.length * cosSpread,
    rElbowPos.y - doc.lowerArm.length * sinSpread * 0.88,
    0.02
  );

  const lHipPos = new THREE.Vector3(hipX, hipY, 0);
  const lKneePos = new THREE.Vector3(hipX, kneeY, 0.015);
  const lAnklePos = new THREE.Vector3(hipX, ankleY, 0);

  const rHipPos = new THREE.Vector3(-hipX, hipY, 0);
  const rKneePos = new THREE.Vector3(-hipX, kneeY, 0.015);
  const rAnklePos = new THREE.Vector3(-hipX, ankleY, 0);

  const hipsCenterPos = new THREE.Vector3(0, hipY, 0);
  const spinePos = new THREE.Vector3(0, spineBaseY, 0);
  const chestPos = new THREE.Vector3(0, chestY, 0);
  const neckPos = new THREE.Vector3(0, neckBaseY, 0);
  const headPos = new THREE.Vector3(0, headCenterY, doc.headForwardTilt);

  // 2. Construct THREE.Bone hierarchy matching ProceduralRigController names
  const bones: THREE.Bone[] = [];
  const bonesByName: Record<string, THREE.Bone> = {};
  const addBone = (
    name: string,
    parent: THREE.Bone | null,
    worldPos: THREE.Vector3,
    parentWorldPos: THREE.Vector3 | null
  ): { bone: THREE.Bone; index: number } => {
    const bone = new THREE.Bone();
    bone.name = name;
    if (parent && parentWorldPos) {
      bone.position.copy(worldPos).sub(parentWorldPos);
      parent.add(bone);
    } else {
      bone.position.copy(worldPos);
      root.add(bone);
    }
    const index = bones.length;
    bones.push(bone);
    bonesByName[name] = bone;
    return { bone, index };
  };

  const hipsB = addBone('Hips', null, hipsCenterPos, null);
  const spineB = addBone('Spine', hipsB.bone, spinePos, hipsCenterPos);
  const chestB = addBone('Chest', spineB.bone, chestPos, spinePos);
  const neckB = addBone('Neck', chestB.bone, neckPos, chestPos);
  const headB = addBone('Head', neckB.bone, headPos, neckPos);

  const lUpperArmB = addBone('LeftUpperArm', chestB.bone, lShoulderPos, chestPos);
  const lLowerArmB = addBone('LeftLowerArm', lUpperArmB.bone, lElbowPos, lShoulderPos);
  const lHandB = addBone('LeftHand', lLowerArmB.bone, lWristPos, lElbowPos);

  const rUpperArmB = addBone('RightUpperArm', chestB.bone, rShoulderPos, chestPos);
  const rLowerArmB = addBone('RightLowerArm', rUpperArmB.bone, rElbowPos, rShoulderPos);
  const rHandB = addBone('RightHand', rLowerArmB.bone, rWristPos, rElbowPos);

  const lUpperLegB = addBone('LeftUpperLeg', hipsB.bone, lHipPos, hipsCenterPos);
  const lLowerLegB = addBone('LeftLowerLeg', lUpperLegB.bone, lKneePos, lHipPos);
  const lFootB = addBone('LeftFoot', lLowerLegB.bone, lAnklePos, lKneePos);

  const rUpperLegB = addBone('RightUpperLeg', hipsB.bone, rHipPos, hipsCenterPos);
  const rLowerLegB = addBone('RightLowerLeg', rUpperLegB.bone, rKneePos, rHipPos);
  const rFootB = addBone('RightFoot', rLowerLegB.bone, rAnklePos, rKneePos);

  // Optional Tail bones
  let tailBones: { index: number; pos: THREE.Vector3 }[] = [];
  if (doc.tailStyle !== 'none') {
    const tBase = new THREE.Vector3(0, hipY + 0.04, -doc.hips.endRadius * 0.78);
    const tSeg = doc.tailProfile.length / 3;
    const curl = doc.tailCurl;
    const tMid1 = new THREE.Vector3(0, tBase.y + tSeg * curl * 0.25, tBase.z - tSeg);
    const tMid2 = new THREE.Vector3(0, tMid1.y + tSeg * curl * 0.75, tMid1.z - tSeg * 0.85);
    const tTip = new THREE.Vector3(0, tMid2.y + tSeg * curl * 1.15, tMid2.z - tSeg * 0.75);

    const tb1 = addBone('Tail_01', hipsB.bone, tBase, hipsCenterPos);
    const tb2 = addBone('Tail_02', tb1.bone, tMid1, tBase);
    const tb3 = addBone('Tail_03', tb2.bone, tMid2, tMid1);
    tailBones = [
      { index: tb1.index, pos: tBase },
      { index: tb2.index, pos: tMid1 },
      { index: tb3.index, pos: tMid2 },
      { index: tb3.index, pos: tTip },
    ];
  }

  // Optional Extra Arm Pair
  let extraArmPos: {
    lSh: THREE.Vector3;
    lEl: THREE.Vector3;
    lWr: THREE.Vector3;
    rSh: THREE.Vector3;
    rEl: THREE.Vector3;
    rWr: THREE.Vector3;
    lUpIdx: number;
    lLoIdx: number;
    rUpIdx: number;
    rLoIdx: number;
  } | null = null;
  if (doc.extraArmsEnabled) {
    const exY = shoulderY + doc.extraArmHeightOffset;
    const exLen = doc.extraArmProfile.length * 0.5;
    const exSpread = spreadRad + 0.22;
    const cE = Math.cos(exSpread);
    const sE = Math.sin(exSpread);
    const lSh = new THREE.Vector3(shoulderX * 0.88, exY, 0.02);
    const lEl = new THREE.Vector3(lSh.x + exLen * cE, exY - exLen * sE, 0.06);
    const lWr = new THREE.Vector3(lEl.x + exLen * cE, lEl.y - exLen * sE * 0.85, 0.14);
    const rSh = new THREE.Vector3(-shoulderX * 0.88, exY, 0.02);
    const rEl = new THREE.Vector3(rSh.x - exLen * cE, exY - exLen * sE, 0.06);
    const rWr = new THREE.Vector3(rEl.x - exLen * cE, rEl.y - exLen * sE * 0.85, 0.14);
    const exLU = addBone('ExtraLeftUpperArm', spineB.bone, lSh, spinePos);
    const exLL = addBone('ExtraLeftLowerArm', exLU.bone, lEl, lSh);
    const exRU = addBone('ExtraRightUpperArm', spineB.bone, rSh, spinePos);
    const exRL = addBone('ExtraRightLowerArm', exRU.bone, rEl, rSh);
    extraArmPos = {
      lSh,
      lEl,
      lWr,
      rSh,
      rEl,
      rWr,
      lUpIdx: exLU.index,
      lLoIdx: exLL.index,
      rUpIdx: exRU.index,
      rLoIdx: exRL.index,
    };
  }

  // Optional Extra Leg Pair
  let extraLegPos: {
    lHip: THREE.Vector3;
    lKn: THREE.Vector3;
    lAnk: THREE.Vector3;
    rHip: THREE.Vector3;
    rKn: THREE.Vector3;
    rAnk: THREE.Vector3;
    lUpIdx: number;
    lLoIdx: number;
    rUpIdx: number;
    rLoIdx: number;
  } | null = null;
  if (doc.extraLegsEnabled) {
    const rearZ = -doc.extraLegRearOffset;
    const exHipY = hipY * 0.96;
    const exKneeY = (exHipY + ankleY) * 0.5;
    const exX = hipX * 1.15;
    const lHip = new THREE.Vector3(exX, exHipY, rearZ);
    const lKn = new THREE.Vector3(exX * 1.08, exKneeY, rearZ - 0.04);
    const lAnk = new THREE.Vector3(exX * 1.08, ankleY, rearZ - 0.02);
    const rHip = new THREE.Vector3(-exX, exHipY, rearZ);
    const rKn = new THREE.Vector3(-exX * 1.08, exKneeY, rearZ - 0.04);
    const rAnk = new THREE.Vector3(-exX * 1.08, ankleY, rearZ - 0.02);
    const exLU = addBone('ExtraLeftUpperLeg', hipsB.bone, lHip, hipsCenterPos);
    const exLL = addBone('ExtraLeftLowerLeg', exLU.bone, lKn, lHip);
    const exRU = addBone('ExtraRightUpperLeg', hipsB.bone, rHip, hipsCenterPos);
    const exRL = addBone('ExtraRightLowerLeg', exRU.bone, rKn, rHip);
    extraLegPos = {
      lHip,
      lKn,
      lAnk,
      rHip,
      rKn,
      rAnk,
      lUpIdx: exLU.index,
      lLoIdx: exLL.index,
      rUpIdx: exRU.index,
      rLoIdx: exRL.index,
    };
  }

  // 3. Build SDF Primitive List
  const prims: SdfPrimitive[] = [];
  const tipCol = hexToRgbTuple(doc.extremityTipColor);

  // Hips / Pelvis
  prims.push({
    kind: 'capsule',
    a: [0, hipY - doc.hips.length * 0.15, 0],
    b: [0, spineBaseY + doc.hips.length * 0.35, 0],
    oval: [doc.hips.squashX ?? 1.15, doc.hips.squashZ ?? 0.92],
    startRadius: doc.hips.startRadius,
    midRadius: doc.hips.midRadius,
    endRadius: doc.hips.endRadius,
    curvature: doc.hips.curvature,
    blendScale: 1.02,
    color: hexToRgbTuple(doc.hips.color),
    boneA: hipsB.index,
    boneB: spineB.index,
    boneLerp: 0.45,
  });

  // Belly / Lower Torso
  prims.push({
    kind: 'capsule',
    a: [0, spineBaseY, 0],
    b: [0, chestY + 0.035, 0],
    oval: [doc.belly.squashX ?? 1.12, doc.belly.squashZ ?? 0.92],
    startRadius: doc.belly.startRadius,
    midRadius: doc.belly.midRadius,
    endRadius: doc.belly.endRadius,
    curvature: doc.belly.curvature,
    blendScale: 1.05,
    color: hexToRgbTuple(doc.belly.color),
    boneA: spineB.index,
    boneB: chestB.index,
    boneLerp: 0.55,
  });

  // Chest / Upper Torso
  prims.push({
    kind: 'capsule',
    a: [0, chestY, 0],
    b: [0, neckBaseY, 0],
    oval: [doc.torso.squashX ?? 1.24, doc.torso.squashZ ?? 0.86],
    startRadius: doc.torso.startRadius,
    midRadius: doc.torso.midRadius,
    endRadius: doc.torso.endRadius,
    curvature: doc.torso.curvature,
    blendScale: 0.95,
    color: hexToRgbTuple(doc.torso.color),
    boneA: chestB.index,
    boneB: neckB.index,
    boneLerp: 0.25,
  });

  // Shoulder bridge
  if (doc.shoulderWidth > 0.14) {
    prims.push({
      kind: 'capsule',
      a: [-shoulderX * 0.72, shoulderY, 0],
      b: [shoulderX * 0.72, shoulderY, 0],
      startRadius: doc.upperArm.startRadius * 1.1,
      midRadius: doc.torso.midRadius * 0.72,
      endRadius: doc.upperArm.startRadius * 1.1,
      curvature: 0.08,
      blendScale: 0.88,
      color: hexToRgbTuple(doc.torso.color),
      boneA: chestB.index,
    });
  }

  // Belly Patch
  if (doc.bellyPatchEnabled) {
    const bellyPatchZ =
      Math.max(doc.belly.midRadius, doc.torso.midRadius) * (doc.belly.squashZ ?? 0.9) * 0.54;
    prims.push({
      kind: 'ellipsoid',
      a: [0, (spineBaseY + chestY) * 0.52, bellyPatchZ],
      b: [
        doc.belly.midRadius * 0.78,
        (chestY - spineBaseY + doc.torso.length * 0.5) * 0.52,
        doc.belly.midRadius * 0.52,
      ],
      startRadius: 0.1,
      midRadius: 0.1,
      endRadius: 0.1,
      curvature: 0,
      blendScale: 0.5,
      color: hexToRgbTuple(doc.bellyColor),
      boneA: spineB.index,
      boneB: chestB.index,
      boneLerp: 0.5,
    });
  }

  // Rear bridge when extra legs enabled
  if (extraLegPos) {
    prims.push({
      kind: 'capsule',
      a: [0, hipY + 0.02, 0],
      b: [0, hipY + 0.02, -doc.extraLegRearOffset],
      oval: [1.1, 0.95],
      startRadius: doc.hips.midRadius * 0.92,
      midRadius: doc.hips.midRadius * 0.98,
      endRadius: doc.hips.endRadius * 0.9,
      curvature: 0.15,
      blendScale: 0.95,
      color: hexToRgbTuple(doc.hips.color),
      boneA: hipsB.index,
    });
  }

  // Neck (tight proportional blendScale so slender necks stay genuinely slim without puffing up!)
  const neckMinR = Math.min(doc.neck.startRadius, doc.neck.midRadius, doc.neck.endRadius);
  const neckBlendScale = THREE.MathUtils.clamp(neckMinR / 0.068, 0.2, 0.78);
  prims.push({
    kind: 'capsule',
    a: [0, neckBaseY - 0.008, 0],
    b: [0, neckBaseY + doc.neck.length + 0.014, doc.headForwardTilt * 0.5],
    oval: [doc.neck.squashX ?? 1.0, doc.neck.squashZ ?? 1.0],
    startRadius: doc.neck.startRadius,
    midRadius: doc.neck.midRadius,
    endRadius: doc.neck.endRadius,
    curvature: doc.neck.curvature,
    blendScale: neckBlendScale,
    color: hexToRgbTuple(doc.neck.color),
    boneA: neckB.index,
    boneB: headB.index,
    boneLerp: 0.55,
  });

  // Head (Main Skull + Crown/Brow Segment + Jaw/Chin Segment)
  const headBotY = neckBaseY + doc.neck.length + 0.01;
  const headTopY = headBotY + doc.head.length * 0.65;
  prims.push({
    kind: 'capsule',
    a: [0, headBotY, doc.headForwardTilt],
    b: [0, headTopY, doc.headForwardTilt * 0.9],
    oval: [doc.head.squashX ?? 1.0, doc.head.squashZ ?? 1.04],
    startRadius: doc.head.startRadius,
    midRadius: doc.head.midRadius,
    endRadius: doc.head.endRadius,
    curvature: doc.head.curvature,
    blendScale: 0.85,
    color: hexToRgbTuple(doc.head.color),
    boneA: headB.index,
  });

  // Head Segment 2: Upper Crown / Forehead / Brow Dome
  const crownProf = ext.headCrown;
  const crownStartY = headTopY - 0.01 + crownProf.offsetY;
  const crownEndY = crownStartY + crownProf.length;
  prims.push({
    kind: 'capsule',
    a: [0, crownStartY, doc.headForwardTilt * 0.9 + crownProf.offsetZ],
    b: [0, crownEndY, doc.headForwardTilt * 0.85 + crownProf.offsetZ],
    oval: [crownProf.squashX ?? 1.0, crownProf.squashZ ?? 1.02],
    startRadius: crownProf.startRadius,
    midRadius: crownProf.midRadius,
    endRadius: crownProf.endRadius,
    curvature: crownProf.curvature,
    blendScale: crownProf.blendScale,
    color: hexToRgbTuple(crownProf.color || doc.head.color),
    boneA: headB.index,
  });

  // Head Segment 3: Lower Jaw / Chin / Jowl Sculpt
  const jawProf = ext.headJaw;
  const jawStartY = headBotY + jawProf.offsetY;
  const jawEndY = jawStartY - jawProf.length * 0.68;
  const jawStartZ = doc.headForwardTilt + jawProf.offsetZ;
  const jawEndZ = jawStartZ + jawProf.length * 0.48;
  prims.push({
    kind: 'capsule',
    a: [0, jawStartY, jawStartZ],
    b: [0, jawEndY, jawEndZ],
    oval: [jawProf.squashX ?? 0.94, jawProf.squashZ ?? 0.96],
    startRadius: jawProf.startRadius,
    midRadius: jawProf.midRadius,
    endRadius: jawProf.endRadius,
    curvature: jawProf.curvature,
    blendScale: jawProf.blendScale,
    color: hexToRgbTuple(jawProf.color || doc.head.color),
    boneA: headB.index,
  });

  // 5-Segment Sculpted Muzzle + Optional Dual Oval Split Cheek Pads (bunny/squirrel/cat)
  const muzzleCfg = ext.muzzle;
  const hasMuzzle = muzzleCfg.preset !== 'none' && muzzleCfg.length > 0.012;
  const muzzleStartPt = new THREE.Vector3(
    0,
    headCenterY - doc.head.midRadius * 0.16 + muzzleCfg.yOffset,
    doc.headForwardTilt + doc.head.midRadius * (doc.head.squashZ ?? 1) * 0.54
  );
  const muzzleTiltRad = THREE.MathUtils.degToRad(muzzleCfg.tiltDeg);
  const muzzleDir = new THREE.Vector3(0, -Math.sin(muzzleTiltRad), Math.cos(muzzleTiltRad)).normalize();
  const muzzleEndPt = muzzleStartPt.clone().addScaledVector(muzzleDir, hasMuzzle ? muzzleCfg.length : 0);

  if (hasMuzzle) {
    const mCol = hexToRgbTuple(muzzleCfg.color);
    const segs = muzzleCfg.segments;
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < 5; i++) {
      pts.push(muzzleStartPt.clone().addScaledVector(muzzleDir, muzzleCfg.length * (i / 4)));
    }
    for (let i = 0; i < 4; i++) {
      const sA = segs[i];
      const sB = segs[i + 1];
      const avgOvalX = ((sA.rx / Math.max(0.01, sA.ry)) + (sB.rx / Math.max(0.01, sB.ry))) * 0.5;
      prims.push({
        kind: 'capsule',
        a: tupleVec(pts[i]),
        b: tupleVec(pts[i + 1]),
        oval: [THREE.MathUtils.clamp(avgOvalX, 0.45, 2.2), 1.0],
        startRadius: sA.ry,
        midRadius: (sA.ry + sB.ry) * 0.5,
        endRadius: sB.ry,
        curvature: 0.08,
        blendScale: 0.44,
        color: mCol,
        boneA: headB.index,
      });
    }

    // Split cheek puffs (bunny / squirrel / cat dual oval sphere lobes + center cleft)
    if (muzzleCfg.splitCleft > 0.05) {
      const endSeg = segs[4];
      const padCenter = pts[3].clone().lerp(pts[4], 0.62);
      const cleftFrac = THREE.MathUtils.clamp(muzzleCfg.splitCleft, 0, 1);
      const sepX = endSeg.rx * (0.44 + cleftFrac * 0.34);
      const lobeRx = endSeg.rx * (0.58 + cleftFrac * 0.14);
      const lobeRy = endSeg.ry * (0.82 + cleftFrac * 0.16);
      const lobeRz = Math.max(0.028, muzzleCfg.length * 0.42);
      ([-1, 1] as const).forEach((side) => {
        prims.push({
          kind: 'ellipsoid',
          a: [padCenter.x + side * sepX, padCenter.y - 0.006, padCenter.z + 0.004],
          b: [lobeRx, lobeRy, lobeRz],
          startRadius: lobeRy,
          midRadius: lobeRy,
          endRadius: lobeRy,
          curvature: 0,
          blendScale: 0.28,
          color: mCol,
          boneA: headB.index,
        });
      });

      // Subtle center vertical groove between the two oval pads
      if (cleftFrac > 0.22) {
        prims.push({
          kind: 'capsule',
          op: 'sub',
          a: [0, padCenter.y - lobeRy * 0.9, padCenter.z + lobeRz * 0.85],
          b: [0, padCenter.y + lobeRy * 0.35, padCenter.z + lobeRz * 0.92],
          startRadius: 0.0065 * cleftFrac,
          midRadius: 0.008 * cleftFrac,
          endRadius: 0.004 * cleftFrac,
          curvature: 0,
          blendScale: 0.14,
          color: mCol,
          boneA: headB.index,
        });
      }
    }
  }

  // Arms helper
  const addArmChain = (
    sideSign: 1 | -1,
    sh: THREE.Vector3,
    el: THREE.Vector3,
    wr: THREE.Vector3,
    upIdx: number,
    loIdx: number,
    handIdx: number,
    upProf = doc.upperArm,
    loProf = doc.lowerArm,
    includeHand = true
  ) => {
    prims.push({
      kind: 'capsule',
      a: tupleVec(sh),
      b: tupleVec(el),
      startRadius: upProf.startRadius,
      midRadius: upProf.midRadius,
      endRadius: upProf.endRadius,
      curvature: upProf.curvature,
      blendScale: 0.78,
      color: hexToRgbTuple(upProf.color),
      boneA: upIdx,
      boneB: loIdx,
      boneLerp: 0.65,
    });
    prims.push({
      kind: 'capsule',
      a: tupleVec(el),
      b: tupleVec(wr),
      startRadius: loProf.startRadius,
      midRadius: loProf.midRadius,
      endRadius: loProf.endRadius,
      curvature: loProf.curvature,
      blendScale: 0.66,
      color: hexToRgbTuple(loProf.color),
      boneA: loIdx,
      boneB: handIdx,
      boneLerp: 0.45,
    });

    if (!includeHand) return;

    const handDir = new THREE.Vector3().subVectors(wr, el).normalize();
    const handCol = hexToRgbTuple(loProf.color);
    const hs = doc.handScale;
    const palmLen = 0.072 * hs;
    const palmEnd = wr.clone().addScaledVector(handDir, palmLen);

    if (doc.handStyle === 'nub') {
      prims.push({
        kind: 'capsule',
        a: tupleVec(wr),
        b: tupleVec(palmEnd),
        startRadius: loProf.endRadius * 1.05 * hs,
        midRadius: loProf.endRadius * 1.25 * hs,
        endRadius: loProf.endRadius * 0.9 * hs,
        curvature: 0.3,
        blendScale: 0.45,
        color: handCol,
        boneA: handIdx,
      });
      return;
    }

    if (doc.handStyle === 'hoof') {
      const hoofEnd = wr.clone().addScaledVector(handDir, 0.08 * hs);
      prims.push({
        kind: 'capsule',
        a: tupleVec(wr),
        b: tupleVec(hoofEnd),
        oval: [1.15, 0.95],
        startRadius: loProf.endRadius * 1.02 * hs,
        midRadius: loProf.endRadius * 1.28 * hs,
        endRadius: loProf.endRadius * 1.32 * hs,
        curvature: 0.05,
        blendScale: 0.3,
        color: tipCol,
        boneA: handIdx,
      });
      return;
    }

    if (doc.handStyle === 'paw') {
      const pawEnd = wr.clone().addScaledVector(handDir, 0.078 * hs);
      prims.push({
        kind: 'capsule',
        a: tupleVec(wr),
        b: tupleVec(pawEnd),
        oval: [1.22, 0.88],
        startRadius: loProf.endRadius * 1.05 * hs,
        midRadius: loProf.endRadius * 1.48 * hs,
        endRadius: loProf.endRadius * 1.15 * hs,
        curvature: 0.35,
        blendScale: 0.4,
        color: handCol,
        boneA: handIdx,
      });
      for (let t = -1; t <= 1; t++) {
        const toeBase = pawEnd.clone().add(new THREE.Vector3(0, -0.01 * hs, t * 0.025 * hs));
        const toeTip = toeBase.clone().addScaledVector(handDir, 0.032 * hs);
        prims.push({
          kind: 'capsule',
          a: tupleVec(toeBase),
          b: tupleVec(toeTip),
          startRadius: 0.018 * hs,
          midRadius: 0.019 * hs,
          endRadius: 0.014 * hs,
          curvature: 0.2,
          blendScale: 0.22,
          color: handCol,
          boneA: handIdx,
        });
      }
      return;
    }

    if (doc.handStyle === 'claw') {
      prims.push({
        kind: 'capsule',
        a: tupleVec(wr),
        b: tupleVec(palmEnd),
        oval: [1.18, 0.85],
        startRadius: loProf.endRadius * hs,
        midRadius: loProf.endRadius * 1.32 * hs,
        endRadius: loProf.endRadius * 1.1 * hs,
        curvature: 0.2,
        blendScale: 0.38,
        color: handCol,
        boneA: handIdx,
      });
      for (let c = -1; c <= 1; c++) {
        const cBase = palmEnd.clone().add(new THREE.Vector3(0, 0, c * 0.026 * hs));
        const cMid = cBase
          .clone()
          .addScaledVector(handDir, 0.045 * hs)
          .add(new THREE.Vector3(0, -0.008 * hs, c * 0.008));
        const cTip = cMid
          .clone()
          .addScaledVector(handDir, 0.042 * hs)
          .add(new THREE.Vector3(0, -0.026 * hs, 0));
        prims.push(
          {
            kind: 'capsule',
            a: tupleVec(cBase),
            b: tupleVec(cMid),
            startRadius: 0.016 * hs,
            midRadius: 0.013 * hs,
            endRadius: 0.009 * hs,
            curvature: -0.1,
            blendScale: 0.2,
            color: tipCol,
            boneA: handIdx,
          },
          {
            kind: 'capsule',
            a: tupleVec(cMid),
            b: tupleVec(cTip),
            startRadius: 0.009 * hs,
            midRadius: 0.006 * hs,
            endRadius: 0.002 * hs,
            curvature: -0.2,
            blendScale: 0.16,
            color: tipCol,
            boneA: handIdx,
          }
        );
      }
      return;
    }

    // Articulated Fingers (2..5 including Opposable Thumb)
    const totalDigits =
      doc.handStyle === 'fingers2'
        ? 2
        : doc.handStyle === 'fingers3'
        ? 3
        : doc.handStyle === 'fingers4'
        ? 4
        : 5;
    const fingerCount = totalDigits - 1;

    prims.push({
      kind: 'capsule',
      a: tupleVec(wr),
      b: tupleVec(palmEnd),
      oval: [0.95, 1.32],
      startRadius: loProf.endRadius * 0.96 * hs,
      midRadius: 0.036 * hs,
      endRadius: 0.032 * hs,
      curvature: 0.15,
      blendScale: 0.34,
      color: handCol,
      boneA: handIdx,
    });

    const thumbBase = wr
      .clone()
      .addScaledVector(handDir, palmLen * 0.55)
      .add(new THREE.Vector3(0, 0.012 * hs, 0.03 * hs));
    const thumbDir = handDir
      .clone()
      .add(new THREE.Vector3(-sideSign * 0.12, 0.25, 0.72))
      .normalize();
    const thumbTip = thumbBase.clone().addScaledVector(thumbDir, 0.056 * hs);
    prims.push({
      kind: 'capsule',
      a: tupleVec(thumbBase),
      b: tupleVec(thumbTip),
      startRadius: 0.0145 * hs,
      midRadius: 0.0125 * hs,
      endRadius: 0.0105 * hs,
      curvature: 0.05,
      blendScale: 0.18,
      color: handCol,
      boneA: handIdx,
    });

    const fanAngle = doc.fingerSpread * 0.55;
    for (let f = 0; f < fingerCount; f++) {
      const frac = fingerCount === 1 ? 0 : (f / (fingerCount - 1)) * 2 - 1;
      const zOff = (0.022 - frac * 0.028) * hs;
      const lenScale = fingerCount === 4 && (f === 0 || f === 3) ? 0.84 : 1.0;
      const fBase = palmEnd.clone().add(new THREE.Vector3(0, 0, zOff));
      const fDir = handDir
        .clone()
        .add(new THREE.Vector3(0, -0.08, -frac * fanAngle))
        .normalize();
      const fTip = fBase.clone().addScaledVector(fDir, 0.072 * hs * lenScale);
      prims.push({
        kind: 'capsule',
        a: tupleVec(fBase),
        b: tupleVec(fTip),
        startRadius: 0.0125 * hs,
        midRadius: 0.011 * hs,
        endRadius: 0.0088 * hs,
        curvature: 0.05,
        blendScale: 0.16,
        color: handCol,
        boneA: handIdx,
      });
    }
  };

  addArmChain(1, lShoulderPos, lElbowPos, lWristPos, lUpperArmB.index, lLowerArmB.index, lHandB.index);
  addArmChain(-1, rShoulderPos, rElbowPos, rWristPos, rUpperArmB.index, rLowerArmB.index, rHandB.index);

  if (extraArmPos) {
    addArmChain(
      1,
      extraArmPos.lSh,
      extraArmPos.lEl,
      extraArmPos.lWr,
      extraArmPos.lUpIdx,
      extraArmPos.lLoIdx,
      extraArmPos.lLoIdx,
      doc.extraArmProfile,
      doc.extraArmProfile,
      true
    );
    addArmChain(
      -1,
      extraArmPos.rSh,
      extraArmPos.rEl,
      extraArmPos.rWr,
      extraArmPos.rUpIdx,
      extraArmPos.rLoIdx,
      extraArmPos.rLoIdx,
      doc.extraArmProfile,
      doc.extraArmProfile,
      true
    );
  }

  // Legs + Feet helper
  const addLegChain = (
    sideSign: 1 | -1,
    hip: THREE.Vector3,
    knee: THREE.Vector3,
    ankle: THREE.Vector3,
    upIdx: number,
    loIdx: number,
    footIdx: number,
    upProf = doc.upperLeg,
    loProf = doc.lowerLeg
  ) => {
    prims.push({
      kind: 'capsule',
      a: tupleVec(hip),
      b: tupleVec(knee),
      startRadius: upProf.startRadius,
      midRadius: upProf.midRadius,
      endRadius: upProf.endRadius,
      curvature: upProf.curvature,
      blendScale: 0.88,
      color: hexToRgbTuple(upProf.color),
      boneA: upIdx,
      boneB: loIdx,
      boneLerp: 0.65,
    });
    prims.push({
      kind: 'capsule',
      a: tupleVec(knee),
      b: tupleVec(ankle),
      startRadius: loProf.startRadius,
      midRadius: loProf.midRadius,
      endRadius: loProf.endRadius,
      curvature: loProf.curvature,
      blendScale: 0.72,
      color: hexToRgbTuple(loProf.color),
      boneA: loIdx,
      boneB: footIdx,
      boneLerp: 0.4,
    });

    const fs = doc.footScale;
    const fCol = doc.footStyle === 'hoof' ? tipCol : hexToRgbTuple(loProf.color);
    const footCenterY = Math.max(0.032, footThickness * 0.48);

    if (doc.footStyle === 'hoof') {
      prims.push({
        kind: 'capsule',
        a: [ankle.x, ankle.y, ankle.z],
        b: [ankle.x, footCenterY, ankle.z + 0.032 * fs],
        oval: [1.1, 1.2],
        startRadius: loProf.endRadius * 1.05 * fs,
        midRadius: loProf.endRadius * 1.28 * fs,
        endRadius: loProf.endRadius * 1.35 * fs,
        curvature: 0.05,
        blendScale: 0.32,
        color: tipCol,
        boneA: footIdx,
      });
    } else if (doc.footStyle === 'paw') {
      prims.push({
        kind: 'capsule',
        a: [ankle.x, footCenterY + 0.01, ankle.z - 0.01],
        b: [ankle.x, footCenterY, ankle.z + 0.085 * fs],
        oval: [1.22, 0.9],
        startRadius: 0.052 * fs,
        midRadius: 0.058 * fs,
        endRadius: 0.048 * fs,
        curvature: 0.35,
        blendScale: 0.42,
        color: fCol,
        boneA: footIdx,
      });
      for (let t = -1; t <= 1; t++) {
        prims.push({
          kind: 'capsule',
          a: [ankle.x + t * 0.025 * fs, footCenterY - 0.005, ankle.z + 0.085 * fs],
          b: [ankle.x + t * 0.03 * fs, footCenterY - 0.008, ankle.z + 0.125 * fs],
          startRadius: 0.02 * fs,
          midRadius: 0.022 * fs,
          endRadius: 0.015 * fs,
          curvature: 0.25,
          blendScale: 0.2,
          color: fCol,
          boneA: footIdx,
        });
      }
    } else if (doc.footStyle === 'claw') {
      prims.push({
        kind: 'capsule',
        a: [ankle.x, footCenterY + 0.012, ankle.z - 0.015],
        b: [ankle.x, footCenterY, ankle.z + 0.075 * fs],
        oval: [1.12, 0.9],
        startRadius: 0.048 * fs,
        midRadius: 0.054 * fs,
        endRadius: 0.045 * fs,
        curvature: 0.2,
        blendScale: 0.38,
        color: fCol,
        boneA: footIdx,
      });
      for (let c = -1; c <= 1; c++) {
        prims.push({
          kind: 'capsule',
          a: [ankle.x + c * 0.028 * fs, footCenterY, ankle.z + 0.072 * fs],
          b: [ankle.x + c * 0.038 * fs, footCenterY - 0.012, ankle.z + 0.15 * fs],
          startRadius: 0.018 * fs,
          midRadius: 0.013 * fs,
          endRadius: 0.004 * fs,
          curvature: -0.15,
          blendScale: 0.18,
          color: tipCol,
          boneA: footIdx,
        });
      }
    } else {
      prims.push({
        kind: 'capsule',
        a: [ankle.x, footCenterY + 0.008, ankle.z - 0.02],
        b: [ankle.x + sideSign * 0.008, footCenterY, ankle.z + 0.125 * fs],
        oval: [1.14, 0.88],
        startRadius: 0.05 * fs,
        midRadius: 0.054 * fs,
        endRadius: 0.044 * fs,
        curvature: 0.22,
        blendScale: 0.42,
        color: fCol,
        boneA: footIdx,
      });
    }
  };

  addLegChain(1, lHipPos, lKneePos, lAnklePos, lUpperLegB.index, lLowerLegB.index, lFootB.index);
  addLegChain(-1, rHipPos, rKneePos, rAnklePos, rUpperLegB.index, rLowerLegB.index, rFootB.index);

  if (extraLegPos) {
    addLegChain(
      1,
      extraLegPos.lHip,
      extraLegPos.lKn,
      extraLegPos.lAnk,
      extraLegPos.lUpIdx,
      extraLegPos.lLoIdx,
      extraLegPos.lLoIdx,
      doc.extraLegProfile,
      doc.extraLegProfile
    );
    addLegChain(
      -1,
      extraLegPos.rHip,
      extraLegPos.rKn,
      extraLegPos.rAnk,
      extraLegPos.rUpIdx,
      extraLegPos.rLoIdx,
      extraLegPos.rLoIdx,
      doc.extraLegProfile,
      doc.extraLegProfile
    );
  }

  // ---- TAILS (16 Thorough Children's Book & Fantasy Animal Tail Styles!) ----
  if (doc.tailStyle !== 'none' && tailBones.length === 4) {
    const tCol = hexToRgbTuple(doc.tailProfile.color);
    const r0 = doc.tailProfile.startRadius;
    const r1 = doc.tailProfile.midRadius;
    const r2 = doc.tailProfile.endRadius;
    const tLen = doc.tailProfile.length;
    const tBase = tailBones[0].pos.clone();

    if (doc.tailStyle === 'bunnyCotton') {
      // Fluffy round cotton puff ball right above hips
      prims.push(
        {
          kind: 'ellipsoid',
          a: [0, tBase.y + 0.03, tBase.z - r1 * 0.55],
          b: [r1 * 1.15, r1 * 1.12, r1 * 1.1],
          startRadius: r1,
          midRadius: r1,
          endRadius: r1,
          curvature: 0,
          blendScale: 0.5,
          color: tCol,
          boneA: tailBones[0].index,
        },
        {
          kind: 'ellipsoid',
          a: [0, tBase.y + 0.055, tBase.z - r1 * 0.85],
          b: [r1 * 0.88, r1 * 0.88, r1 * 0.88],
          startRadius: r1,
          midRadius: r1,
          endRadius: r1,
          curvature: 0,
          blendScale: 0.45,
          color: tipCol,
          boneA: tailBones[1].index,
        }
      );
    } else if (doc.tailStyle === 'geckoTail') {
      // Rolled coiled spiral gecko tail nearly as tall as the character's back!
      const coilCenterY = hipY + Math.max(0.24, (neckBaseY - hipY) * 0.62);
      const maxCoilR = Math.max(0.18, (neckBaseY - hipY) * 0.46) * (tLen / 0.72);
      const coilZ = -doc.hips.midRadius - maxCoilR * 0.78;
      // Stem connecting rump cleanly into outer spiral ring
      const spiralEntry = new THREE.Vector3(0, coilCenterY - maxCoilR * 0.75, coilZ + maxCoilR * 0.45);
      prims.push({
        kind: 'capsule',
        a: tupleVec(tBase),
        b: tupleVec(spiralEntry),
        startRadius: r0,
        midRadius: r0 * 0.85,
        endRadius: r1 * 0.92,
        curvature: 0.1,
        blendScale: 0.6,
        color: tCol,
        boneA: tailBones[0].index,
        boneB: tailBones[1].index,
        boneLerp: 0.6,
      });

      const steps = 11;
      const startAngle = -Math.PI * 0.65;
      const totalSweep = Math.PI * 2.95; // ~1.5 turns curling inward toward center
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= steps; i++) {
        const f = i / steps;
        const ang = startAngle + f * totalSweep;
        const rad = maxCoilR * (1 - f * 0.76);
        pts.push(new THREE.Vector3(0, coilCenterY + Math.sin(ang) * rad, coilZ + Math.cos(ang) * rad));
      }
      for (let i = 0; i < steps; i++) {
        const f0 = i / steps;
        const f1 = (i + 1) / steps;
        const rad0 = THREE.MathUtils.lerp(r1 * 0.92, r2 * 0.85, f0);
        const rad1 = THREE.MathUtils.lerp(r1 * 0.92, r2 * 0.85, f1);
        prims.push({
          kind: 'capsule',
          a: tupleVec(pts[i]),
          b: tupleVec(pts[i + 1]),
          startRadius: rad0,
          midRadius: (rad0 + rad1) * 0.5,
          endRadius: rad1,
          curvature: 0.08,
          blendScale: 0.35,
          color: i > steps - 3 ? tipCol : tCol,
          boneA: tailBones[i < 4 ? 1 : 2].index,
        });
      }
    } else if (doc.tailStyle === 'squirrelPlume') {
      // Big bushy S-curved squirrel tail rising behind back nearly to head level!
      const p0 = tBase.clone();
      const p1 = new THREE.Vector3(0, hipY + tLen * 0.18, tBase.z - tLen * 0.28);
      const p2 = new THREE.Vector3(0, hipY + tLen * 0.58, tBase.z - tLen * 0.36);
      const p3 = new THREE.Vector3(0, hipY + tLen * 0.92, tBase.z - tLen * 0.14);
      const p4 = new THREE.Vector3(0, hipY + tLen * 0.86, tBase.z + tLen * 0.04);
      const plumePts = [p0, p1, p2, p3, p4];
      const plumeRads = [r0, r1 * 0.95, r1 * 1.15, r1 * 1.05, r2 * 0.85];
      for (let i = 0; i < 4; i++) {
        prims.push({
          kind: 'capsule',
          a: tupleVec(plumePts[i]),
          b: tupleVec(plumePts[i + 1]),
          oval: [0.82, 1.18],
          startRadius: plumeRads[i],
          midRadius: (plumeRads[i] + plumeRads[i + 1]) * 0.52,
          endRadius: plumeRads[i + 1],
          curvature: 0.35,
          blendScale: 0.65,
          color: i === 3 ? tipCol : tCol,
          boneA: tailBones[Math.min(2, i)].index,
        });
      }
    } else if (doc.tailStyle === 'horseTail') {
      // Short top dock arching back, then flowing full downward tail plume!
      const pDock = new THREE.Vector3(0, tBase.y + 0.07, tBase.z - 0.14);
      const pMid = new THREE.Vector3(0, tBase.y - tLen * 0.25, tBase.z - 0.24);
      const pBot = new THREE.Vector3(0, Math.max(0.08, tBase.y - tLen * 0.72), tBase.z - 0.26);
      prims.push(
        {
          kind: 'capsule',
          a: tupleVec(tBase),
          b: tupleVec(pDock),
          startRadius: r0 * 0.75,
          midRadius: r0 * 0.72,
          endRadius: r1 * 0.9,
          curvature: 0.15,
          blendScale: 0.45,
          color: tCol,
          boneA: tailBones[0].index,
        },
        {
          kind: 'capsule',
          a: tupleVec(pDock),
          b: tupleVec(pMid),
          oval: [0.95, 1.15],
          startRadius: r1 * 0.9,
          midRadius: r1 * 1.35,
          endRadius: r1 * 1.18,
          curvature: 0.3,
          blendScale: 0.5,
          color: tCol,
          boneA: tailBones[1].index,
        },
        {
          kind: 'capsule',
          a: tupleVec(pMid),
          b: tupleVec(pBot),
          oval: [0.92, 1.12],
          startRadius: r1 * 1.18,
          midRadius: r1 * 0.92,
          endRadius: Math.max(0.014, r2 * 0.55),
          curvature: 0.15,
          blendScale: 0.48,
          color: tCol,
          boneA: tailBones[2].index,
        }
      );
    } else if (doc.tailStyle === 'catTail') {
      // Long graceful slender S-curved cat tail curling gently at tip
      const p1 = new THREE.Vector3(0, tBase.y - 0.04, tBase.z - tLen * 0.28);
      const p2 = new THREE.Vector3(0, tBase.y + tLen * 0.22, tBase.z - tLen * 0.55);
      const p3 = new THREE.Vector3(0, tBase.y + tLen * 0.58, tBase.z - tLen * 0.58);
      const p4 = new THREE.Vector3(0, tBase.y + tLen * 0.68, tBase.z - tLen * 0.44);
      const catR = Math.min(0.036, r0 * 0.58);
      const pts = [tBase, p1, p2, p3, p4];
      for (let i = 0; i < 4; i++) {
        prims.push({
          kind: 'capsule',
          a: tupleVec(pts[i]),
          b: tupleVec(pts[i + 1]),
          startRadius: catR * (1 - i * 0.08),
          midRadius: catR * (0.95 - i * 0.08),
          endRadius: catR * (0.9 - i * 0.08),
          curvature: 0.08,
          blendScale: 0.42,
          color: i === 3 ? tipCol : tCol,
          boneA: tailBones[Math.min(2, i)].index,
        });
      }
    } else if (doc.tailStyle === 'dogTail') {
      // Happy upward curved wagging tail
      const p1 = new THREE.Vector3(0, tBase.y + 0.04, tBase.z - tLen * 0.32);
      const p2 = new THREE.Vector3(0, tBase.y + tLen * 0.26, tBase.z - tLen * 0.56);
      const p3 = new THREE.Vector3(0, tBase.y + tLen * 0.44, tBase.z - tLen * 0.44);
      const pts = [tBase, p1, p2, p3];
      const rads = [r0 * 0.72, r1 * 0.85, r1 * 0.78, Math.max(0.015, r2 * 0.75)];
      for (let i = 0; i < 3; i++) {
        prims.push({
          kind: 'capsule',
          a: tupleVec(pts[i]),
          b: tupleVec(pts[i + 1]),
          startRadius: rads[i],
          midRadius: (rads[i] + rads[i + 1]) * 0.52,
          endRadius: rads[i + 1],
          curvature: 0.2,
          blendScale: 0.45,
          color: i === 2 ? tipCol : tCol,
          boneA: tailBones[i].index,
        });
      }
    } else if (doc.tailStyle === 'birdTail') {
      // 5 fanned layered tail feathers flaring gracefully out behind hips
      for (let f = -2; f <= 2; f++) {
        const ang = f * 0.22;
        const lift = 0.06 + (2 - Math.abs(f)) * 0.025 + doc.tailCurl * 0.14;
        const fTip = new THREE.Vector3(
          Math.sin(ang) * tLen * 0.72,
          tBase.y + lift,
          tBase.z - Math.cos(ang) * tLen * 0.75
        );
        prims.push({
          kind: 'capsule',
          a: tupleVec(tBase),
          b: tupleVec(fTip),
          oval: [1.35, 0.34],
          startRadius: 0.024,
          midRadius: 0.042,
          endRadius: 0.018,
          curvature: 0.22,
          blendScale: 0.28,
          color: Math.abs(f) === 2 ? tipCol : tCol,
          boneA: tailBones[1].index,
        });
      }
    } else {
      // Standard chained 3-segment spine for smooth, foxBrush, lionTail, dragonTail, fishTail, bulbTip, spiky, fluffy, fin
      const rA = THREE.MathUtils.lerp(r0, r1, 0.65);
      const rB = THREE.MathUtils.lerp(r1, r2, 0.65);
      const isFox = doc.tailStyle === 'foxBrush';
      const isLion = doc.tailStyle === 'lionTail';

      prims.push(
        {
          kind: 'capsule',
          a: tupleVec(tailBones[0].pos),
          b: tupleVec(tailBones[1].pos),
          startRadius: isLion ? r0 * 0.52 : r0,
          midRadius: isLion ? r0 * 0.45 : isFox ? r1 * 1.15 : (r0 + rA) * 0.5,
          endRadius: isLion ? r0 * 0.42 : isFox ? r1 * 1.25 : rA,
          curvature: isFox ? 0.35 : doc.tailProfile.curvature,
          blendScale: 0.72,
          color: tCol,
          boneA: tailBones[0].index,
          boneB: tailBones[1].index,
          boneLerp: 0.7,
        },
        {
          kind: 'capsule',
          a: tupleVec(tailBones[1].pos),
          b: tupleVec(tailBones[2].pos),
          startRadius: isLion ? r0 * 0.42 : isFox ? r1 * 1.25 : rA,
          midRadius: isLion ? r0 * 0.38 : isFox ? r1 * 1.32 : r1,
          endRadius: isLion ? r0 * 0.36 : isFox ? r1 * 0.95 : rB,
          curvature: isFox ? 0.3 : doc.tailProfile.curvature,
          blendScale: 0.65,
          color: tCol,
          boneA: tailBones[1].index,
          boneB: tailBones[2].index,
          boneLerp: 0.7,
        },
        {
          kind: 'capsule',
          a: tupleVec(tailBones[2].pos),
          b: tupleVec(tailBones[3].pos),
          startRadius: isLion ? r0 * 0.36 : isFox ? r1 * 0.95 : rB,
          midRadius: isFox ? r1 * 0.75 : (rB + r2) * 0.5,
          endRadius:
            doc.tailStyle === 'fluffy'
              ? r1 * 1.45
              : isFox
              ? Math.max(0.018, r2 * 0.75)
              : isLion
              ? r0 * 0.34
              : r2,
          curvature: doc.tailStyle === 'fluffy' ? 0.55 : doc.tailProfile.curvature,
          blendScale: 0.58,
          color: isFox ? tipCol : tCol,
          boneA: tailBones[2].index,
        }
      );

      if (doc.tailStyle === 'bulbTip' || isLion) {
        const tuftB = tailBones[3].pos.clone();
        const tuftTip = tuftB.clone().add(new THREE.Vector3(0, 0.04, -0.09));
        prims.push({
          kind: 'capsule',
          a: tupleVec(tuftB),
          b: tupleVec(tuftTip),
          startRadius: isLion ? r0 * 0.72 : r1 * 1.3,
          midRadius: isLion ? r0 * 0.92 : r1 * 1.45,
          endRadius: isLion ? 0.012 : r1 * 0.85,
          curvature: 0.35,
          blendScale: 0.42,
          color: tipCol,
          boneA: tailBones[2].index,
        });
      } else if (doc.tailStyle === 'spiky' || doc.tailStyle === 'dragonTail') {
        const cnt = doc.tailStyle === 'dragonTail' ? 4 : 3;
        for (let s = 0; s < cnt; s++) {
          const frac = (s + 0.45) / (cnt + 0.1);
          const idx = Math.min(2, Math.floor(frac * 3));
          const spBase = tailBones[idx].pos.clone().lerp(tailBones[idx + 1].pos, 0.5);
          const spTip = spBase.clone().add(new THREE.Vector3(0, 0.085, -0.025));
          prims.push({
            kind: 'capsule',
            a: tupleVec(spBase),
            b: tupleVec(spTip),
            oval: [0.55, 1.2],
            startRadius: 0.024,
            midRadius: 0.015,
            endRadius: 0.004,
            curvature: -0.2,
            blendScale: 0.25,
            color: tipCol,
            boneA: tailBones[idx].index,
          });
        }
        if (doc.tailStyle === 'dragonTail') {
          const arrowTip = tailBones[3].pos.clone().add(new THREE.Vector3(0, 0.03, -0.11));
          prims.push({
            kind: 'capsule',
            a: tupleVec(tailBones[3].pos),
            b: tupleVec(arrowTip),
            oval: [1.65, 0.45],
            startRadius: 0.045,
            midRadius: 0.062,
            endRadius: 0.008,
            curvature: -0.1,
            blendScale: 0.28,
            color: tipCol,
            boneA: tailBones[2].index,
          });
        }
      } else if (doc.tailStyle === 'fin' || doc.tailStyle === 'fishTail') {
        const lobes = doc.tailStyle === 'fishTail' ? [-1, 1] : [0];
        lobes.forEach((lobe) => {
          const lobeEnd = tailBones[3].pos
            .clone()
            .add(new THREE.Vector3(lobe * 0.02, 0.075 * (lobe === 0 ? 1 : lobe), -0.14));
          prims.push({
            kind: 'capsule',
            a: tupleVec(tailBones[3].pos),
            b: tupleVec(lobeEnd),
            oval: [0.32, 1.55],
            startRadius: 0.022,
            midRadius: 0.078,
            endRadius: 0.014,
            curvature: 0.25,
            blendScale: 0.34,
            color: tipCol,
            boneA: tailBones[2].index,
          });
        });
      }
    }
  }

  // ---- EARS ----
  if (doc.earStyle !== 'none') {
    const eCol = hexToRgbTuple(doc.earColor);
    const eScale = doc.earSize;
    const headSideX = doc.head.midRadius * (doc.head.squashX ?? 1) * 0.88;
    const earBaseY = headCenterY + 0.015;
    const earBaseZ = doc.headForwardTilt - 0.01;

    ([-1, 1] as const).forEach((side) => {
      const rootPt = new THREE.Vector3(side * headSideX, earBaseY, earBaseZ);
      if (doc.earStyle === 'human') {
        prims.push({
          kind: 'ellipsoid',
          a: [side * (headSideX + 0.018 * eScale), earBaseY, earBaseZ - 0.008],
          b: [0.022 * eScale, 0.044 * eScale, 0.028 * eScale],
          startRadius: 0.03,
          midRadius: 0.03,
          endRadius: 0.03,
          curvature: 0,
          blendScale: 0.38,
          color: eCol,
          boneA: headB.index,
        });
      } else if (doc.earStyle === 'elfPointed') {
        const tipPt = rootPt.clone().add(
          new THREE.Vector3(side * 0.16 * eScale, (0.065 + doc.earTilt * 0.08) * eScale, -0.075 * eScale)
        );
        prims.push({
          kind: 'capsule',
          a: tupleVec(rootPt),
          b: tupleVec(tipPt),
          oval: [1.0, 0.55],
          startRadius: 0.036 * eScale,
          midRadius: 0.024 * eScale,
          endRadius: 0.005 * eScale,
          curvature: -0.15,
          blendScale: 0.35,
          color: eCol,
          boneA: headB.index,
        });
      } else if (doc.earStyle === 'rabbitLong') {
        const baseTop = new THREE.Vector3(
          side * headSideX * 0.52,
          headTopY + doc.head.endRadius * 0.65,
          earBaseZ
        );
        const midPt = baseTop.clone().add(new THREE.Vector3(side * 0.035 * eScale, 0.14 * eScale, -0.01));
        const tipPt = midPt.clone().add(
          new THREE.Vector3(side * (0.025 + doc.earTilt * 0.06) * eScale, 0.15 * eScale, -0.025)
        );
        prims.push(
          {
            kind: 'capsule',
            a: tupleVec(baseTop),
            b: tupleVec(midPt),
            oval: [1.15, 0.46],
            startRadius: 0.034 * eScale,
            midRadius: 0.044 * eScale,
            endRadius: 0.042 * eScale,
            curvature: 0.18,
            blendScale: 0.36,
            color: eCol,
            boneA: headB.index,
          },
          {
            kind: 'capsule',
            a: tupleVec(midPt),
            b: tupleVec(tipPt),
            oval: [1.12, 0.42],
            startRadius: 0.042 * eScale,
            midRadius: 0.036 * eScale,
            endRadius: 0.016 * eScale,
            curvature: 0.15,
            blendScale: 0.34,
            color: tipCol,
            boneA: headB.index,
          }
        );
      } else if (doc.earStyle === 'rabbitFloppy') {
        const baseTop = new THREE.Vector3(side * headSideX * 0.85, earBaseY + 0.055, earBaseZ);
        const midPt = baseTop.clone().add(new THREE.Vector3(side * 0.065 * eScale, -0.08 * eScale, 0.015));
        const tipPt = midPt.clone().add(new THREE.Vector3(side * 0.015 * eScale, -0.17 * eScale, 0.025));
        prims.push(
          {
            kind: 'capsule',
            a: tupleVec(baseTop),
            b: tupleVec(midPt),
            oval: [0.62, 1.25],
            startRadius: 0.03 * eScale,
            midRadius: 0.042 * eScale,
            endRadius: 0.048 * eScale,
            curvature: 0.2,
            blendScale: 0.35,
            color: eCol,
            boneA: headB.index,
          },
          {
            kind: 'capsule',
            a: tupleVec(midPt),
            b: tupleVec(tipPt),
            oval: [0.58, 1.25],
            startRadius: 0.048 * eScale,
            midRadius: 0.05 * eScale,
            endRadius: 0.026 * eScale,
            curvature: 0.22,
            blendScale: 0.35,
            color: tipCol,
            boneA: headB.index,
          }
        );
      } else if (doc.earStyle === 'squirrelRound') {
        const earCtr = new THREE.Vector3(
          side * headSideX * 0.64,
          headTopY + doc.head.endRadius * 0.72,
          earBaseZ - 0.005
        );
        prims.push({
          kind: 'ellipsoid',
          a: tupleVec(earCtr),
          b: [0.052 * eScale, 0.056 * eScale, 0.024 * eScale],
          startRadius: 0.05,
          midRadius: 0.05,
          endRadius: 0.05,
          curvature: 0,
          blendScale: 0.36,
          color: eCol,
          boneA: headB.index,
        });
      } else if (doc.earStyle === 'catFoxTriangle' || doc.earStyle === 'animalPerk') {
        const baseTop = new THREE.Vector3(
          side * headSideX * 0.6,
          headTopY + doc.head.endRadius * 0.56,
          earBaseZ - 0.01
        );
        const tipPt = baseTop
          .clone()
          .add(new THREE.Vector3(side * (0.05 + doc.earTilt * 0.04) * eScale, 0.145 * eScale, 0.008));
        prims.push({
          kind: 'capsule',
          a: tupleVec(baseTop),
          b: tupleVec(tipPt),
          oval: [1.18, 0.56],
          startRadius: 0.05 * eScale,
          midRadius: 0.032 * eScale,
          endRadius: 0.007 * eScale,
          curvature: -0.1,
          blendScale: 0.38,
          color: eCol,
          boneA: headB.index,
        });
        if (doc.earStyle === 'catFoxTriangle') {
          const hollowPt = baseTop.clone().lerp(tipPt, 0.42).add(new THREE.Vector3(0, 0, 0.022 * eScale));
          prims.push({
            kind: 'ellipsoid',
            op: 'sub',
            a: tupleVec(hollowPt),
            b: [0.024 * eScale, 0.044 * eScale, 0.016 * eScale],
            startRadius: 0.02,
            midRadius: 0.02,
            endRadius: 0.02,
            curvature: 0,
            blendScale: 0.18,
            color: eCol,
            boneA: headB.index,
          });
        }
      } else if (doc.earStyle === 'horsePerked') {
        const baseTop = new THREE.Vector3(
          side * headSideX * 0.54,
          headTopY + doc.head.endRadius * 0.68,
          earBaseZ - 0.015
        );
        const tipPt = baseTop
          .clone()
          .add(new THREE.Vector3(side * 0.038 * eScale, 0.145 * eScale, 0.025 * eScale));
        prims.push({
          kind: 'capsule',
          a: tupleVec(baseTop),
          b: tupleVec(tipPt),
          oval: [0.82, 0.62],
          startRadius: 0.034 * eScale,
          midRadius: 0.034 * eScale,
          endRadius: 0.009 * eScale,
          curvature: 0.18,
          blendScale: 0.3,
          color: eCol,
          boneA: headB.index,
        });
      } else if (doc.earStyle === 'floppy' || doc.earStyle === 'dogFloppy') {
        const midPt = rootPt.clone().add(new THREE.Vector3(side * 0.06 * eScale, -0.04 * eScale, 0.01));
        const tipPt = midPt.clone().add(new THREE.Vector3(side * 0.025 * eScale, -0.13 * eScale, 0.02));
        prims.push(
          {
            kind: 'capsule',
            a: tupleVec(rootPt),
            b: tupleVec(midPt),
            oval: [0.85, 1.2],
            startRadius: 0.032 * eScale,
            midRadius: 0.038 * eScale,
            endRadius: 0.042 * eScale,
            curvature: 0.15,
            blendScale: 0.38,
            color: eCol,
            boneA: headB.index,
          },
          {
            kind: 'capsule',
            a: tupleVec(midPt),
            b: tupleVec(tipPt),
            oval: [0.7, 1.25],
            startRadius: 0.042 * eScale,
            midRadius: 0.046 * eScale,
            endRadius: 0.025 * eScale,
            curvature: 0.25,
            blendScale: 0.38,
            color: eCol,
            boneA: headB.index,
          }
        );
      } else if (doc.earStyle === 'bat' || doc.earStyle === 'fin') {
        const wingEnd = rootPt.clone().add(
          new THREE.Vector3(side * 0.17 * eScale, 0.095 * eScale, -0.04 * eScale)
        );
        prims.push({
          kind: 'capsule',
          a: tupleVec(rootPt),
          b: tupleVec(wingEnd),
          oval: [1.0, 0.42],
          startRadius: 0.042 * eScale,
          midRadius: 0.064 * eScale,
          endRadius: 0.012 * eScale,
          curvature: 0.25,
          blendScale: 0.35,
          color: eCol,
          boneA: headB.index,
        });
      } else if (doc.earStyle === 'antennae') {
        const aBase = new THREE.Vector3(side * headSideX * 0.42, headTopY + 0.03, earBaseZ + 0.03);
        const aMid = aBase.clone().add(new THREE.Vector3(side * 0.05 * eScale, 0.11 * eScale, 0.02));
        const aTip = aMid.clone().add(new THREE.Vector3(side * 0.055 * eScale, 0.065 * eScale, 0.04));
        prims.push(
          {
            kind: 'capsule',
            a: tupleVec(aBase),
            b: tupleVec(aMid),
            startRadius: 0.015 * eScale,
            midRadius: 0.011 * eScale,
            endRadius: 0.01 * eScale,
            curvature: 0,
            blendScale: 0.32,
            color: hexToRgbTuple(doc.head.color),
            boneA: headB.index,
          },
          {
            kind: 'capsule',
            a: tupleVec(aMid),
            b: tupleVec(aTip),
            startRadius: 0.01 * eScale,
            midRadius: 0.01 * eScale,
            endRadius: 0.028 * eScale,
            curvature: 0.2,
            blendScale: 0.32,
            color: eCol,
            boneA: headB.index,
          }
        );
      }
    });
  }

  // ---- HORNS ----
  if (doc.hornCount > 0) {
    const hCol = hexToRgbTuple(doc.hornColor);
    const hLen = doc.hornLength;
    const hRad = doc.hornThickness;
    const addHorn = (side: number, zOff: number, scaleMult = 1) => {
      const base = new THREE.Vector3(
        side * doc.head.endRadius * 0.55,
        headTopY + doc.head.endRadius * 0.55,
        doc.headForwardTilt + zOff
      );
      const pts: THREE.Vector3[] = [base];
      const segs = 3;
      for (let i = 1; i <= segs; i++) {
        const t = i / segs;
        if (doc.hornStyle === 'straight') {
          pts.push(base.clone().add(new THREE.Vector3(side * 0.04 * t, hLen * scaleMult * t, 0.02 * t)));
        } else if (doc.hornStyle === 'curvedBack') {
          pts.push(
            base.clone().add(
              new THREE.Vector3(
                side * 0.06 * t,
                hLen * scaleMult * (t - 0.25 * t * t),
                -hLen * scaleMult * 0.55 * t * t
              )
            )
          );
        } else if (doc.hornStyle === 'ramSpiral') {
          const ang = t * Math.PI * 1.35;
          pts.push(
            base.clone().add(
              new THREE.Vector3(
                side * (0.06 + 0.08 * Math.sin(ang * 0.8)),
                hLen * scaleMult * 0.45 * Math.sin(ang),
                -hLen * scaleMult * 0.48 * (1 - Math.cos(ang))
              )
            )
          );
        } else if (doc.hornStyle === 'devilSweep') {
          pts.push(
            base.clone().add(
              new THREE.Vector3(
                side * (0.09 * Math.sin(t * Math.PI * 0.6)),
                hLen * scaleMult * t,
                0.08 * Math.sin(t * Math.PI)
              )
            )
          );
        } else {
          pts.push(
            base.clone().add(
              new THREE.Vector3(side * 0.14 * t, hLen * scaleMult * (0.85 * t + 0.15 * t * t), -0.05 * t)
            )
          );
        }
      }
      for (let i = 0; i < segs; i++) {
        const f0 = i / segs;
        const f1 = (i + 1) / segs;
        prims.push({
          kind: 'capsule',
          a: tupleVec(pts[i]),
          b: tupleVec(pts[i + 1]),
          startRadius: hRad * scaleMult * (1 - f0 * 0.72),
          midRadius: hRad * scaleMult * (1 - ((f0 + f1) * 0.5) * 0.75),
          endRadius: Math.max(0.004, hRad * scaleMult * (1 - f1 * 0.85)),
          curvature: -0.05,
          blendScale: 0.36,
          color: hCol,
          boneA: headB.index,
        });
      }
      if (doc.hornStyle === 'antler') {
        const branchStart = pts[1];
        const branchTip = branchStart.clone().add(new THREE.Vector3(side * 0.05, hLen * 0.42, 0.07));
        prims.push({
          kind: 'capsule',
          a: tupleVec(branchStart),
          b: tupleVec(branchTip),
          startRadius: hRad * 0.52,
          midRadius: hRad * 0.34,
          endRadius: 0.005,
          curvature: 0,
          blendScale: 0.22,
          color: hCol,
          boneA: headB.index,
        });
      }
    };

    if (doc.hornCount === 1) {
      addHorn(0, 0.06, 1.05);
    } else if (doc.hornCount === 2) {
      addHorn(1, 0.02, 1.0);
      addHorn(-1, 0.02, 1.0);
    } else {
      addHorn(1, 0.035, 1.0);
      addHorn(-1, 0.035, 1.0);
      addHorn(1.2, -0.065, 0.68);
      addHorn(-1.2, -0.065, 0.68);
    }
  }

  // Hair is now built purely as a layered transformable head attachment after polygonization (never fused into the skull SDF).

  // ---- WINGS (Dragon, Bat, Rounded Bird, Soaring Eagle, Long Crane, Angel, Fairy & Butterfly) ----
  if (doc.wingStyle !== 'none') {
    const wCol = hexToRgbTuple(doc.wingColor);
    const wTipCol = hexToRgbTuple(ext.wingTipColor);
    const span = doc.wingSpan;
    const tilt = doc.wingTilt;
    const fold = ext.wingFold;
    const openFrac = 1 - fold * 0.65;

    ([-1, 1] as const).forEach((side) => {
      const wRoot = new THREE.Vector3(side * 0.075, shoulderY - 0.04, -doc.torso.midRadius * 0.72);

      if (doc.wingStyle === 'fairy' || doc.wingStyle === 'fairyButterfly') {
        // Dual upper & lower petal lobes per side
        const upperMid = wRoot.clone().add(
          new THREE.Vector3(side * span * 0.48 * openFrac, span * (0.28 + tilt * 0.2), -span * 0.22)
        );
        const lowerMid = wRoot.clone().add(
          new THREE.Vector3(side * span * 0.34 * openFrac, -span * 0.14, -span * 0.24)
        );
        prims.push(
          {
            kind: 'capsule',
            a: tupleVec(wRoot),
            b: tupleVec(upperMid),
            oval: [1.15, 0.26],
            startRadius: 0.045,
            midRadius: span * 0.22,
            endRadius: span * 0.14,
            curvature: 0.32,
            blendScale: 0.32,
            color: wCol,
            boneA: chestB.index,
          },
          {
            kind: 'capsule',
            a: tupleVec(wRoot),
            b: tupleVec(lowerMid),
            oval: [1.1, 0.24],
            startRadius: 0.036,
            midRadius: span * 0.15,
            endRadius: span * 0.095,
            curvature: 0.28,
            blendScale: 0.32,
            color: doc.wingStyle === 'fairyButterfly' ? wTipCol : wCol,
            boneA: chestB.index,
          }
        );
      } else if (doc.wingStyle === 'birdRound') {
        // Plump cupped rounded songbird/owl wings
        const wElbow = wRoot.clone().add(
          new THREE.Vector3(side * span * 0.32 * openFrac, -span * 0.04 + tilt * 0.15, -span * 0.2 * (0.6 + fold))
        );
        const wTip = wElbow.clone().add(
          new THREE.Vector3(side * span * 0.36 * openFrac, -span * 0.16, -span * 0.14)
        );
        prims.push(
          {
            kind: 'capsule',
            a: tupleVec(wRoot),
            b: tupleVec(wElbow),
            oval: [0.9, 0.44],
            startRadius: 0.046,
            midRadius: span * 0.14,
            endRadius: span * 0.12,
            curvature: 0.25,
            blendScale: 0.42,
            color: wCol,
            boneA: chestB.index,
          },
          {
            kind: 'capsule',
            a: tupleVec(wElbow),
            b: tupleVec(wTip),
            oval: [0.95, 0.38],
            startRadius: span * 0.12,
            midRadius: span * 0.1,
            endRadius: 0.032,
            curvature: 0.2,
            blendScale: 0.36,
            color: wTipCol,
            boneA: chestB.index,
          }
        );
      } else {
        // Soaring Bird, Long Crane, Angel Feather, Bat, or Dragon wings
        const isLong = doc.wingStyle === 'birdLong';
        const isSoaring = doc.wingStyle === 'birdSoaring' || doc.wingStyle === 'angelFeather';
        const isDragon = doc.wingStyle === 'dragon';
        const multLen = isLong ? 1.24 : 1.0;

        const wElbow = wRoot.clone().add(
          new THREE.Vector3(
            side * span * 0.42 * openFrac * multLen,
            span * (0.28 + tilt * 0.32),
            -span * (0.22 + fold * 0.25)
          )
        );
        const wTip = wElbow.clone().add(
          new THREE.Vector3(
            side * span * 0.56 * openFrac * multLen,
            span * (0.1 + tilt * 0.24 - (isLong ? 0.12 : 0)),
            -span * (0.18 + fold * 0.2)
          )
        );

        prims.push(
          {
            kind: 'capsule',
            a: tupleVec(wRoot),
            b: tupleVec(wElbow),
            oval: [1.0, 0.42],
            startRadius: 0.036,
            midRadius: 0.048,
            endRadius: 0.04,
            curvature: 0.1,
            blendScale: 0.42,
            color: wCol,
            boneA: chestB.index,
          },
          {
            kind: 'capsule',
            a: tupleVec(wElbow),
            b: tupleVec(wTip),
            oval: [1.0, 0.34],
            startRadius: 0.04,
            midRadius: 0.034,
            endRadius: 0.008,
            curvature: 0,
            blendScale: 0.36,
            color: wCol,
            boneA: chestB.index,
          }
        );

        if (isDragon) {
          // Dragon shoulder horn spur
          const spurTip = wElbow.clone().add(new THREE.Vector3(0, 0.08, 0.05));
          prims.push({
            kind: 'capsule',
            a: tupleVec(wElbow),
            b: tupleVec(spurTip),
            startRadius: 0.022,
            midRadius: 0.014,
            endRadius: 0.004,
            curvature: -0.1,
            blendScale: 0.24,
            color: tipCol,
            boneA: chestB.index,
          });
        }

        const bladeCount = isSoaring ? 4 : 3;
        for (let b = 0; b < bladeCount; b++) {
          const f = (b + 0.5) / (bladeCount + 0.3);
          const bStart = wElbow.clone().lerp(wTip, f * 0.88);
          const bEnd = bStart.clone().add(
            new THREE.Vector3(
              side * span * 0.06 * openFrac,
              -span * (isLong ? 0.26 : 0.36) * (1 - f * 0.35),
              -0.025
            )
          );
          prims.push({
            kind: 'capsule',
            a: tupleVec(bStart),
            b: tupleVec(bEnd),
            oval: [1.35, 0.28],
            startRadius: 0.042,
            midRadius: 0.048,
            endRadius: 0.012,
            curvature: 0.22,
            blendScale: 0.32,
            color: b >= bladeCount - 1 ? wTipCol : wCol,
            boneA: chestB.index,
          });
        }
      }
    });
  }

  // ---- WHISKERS ----
  if (doc.whiskerPairs > 0) {
    const whCol = hexToRgbTuple(doc.whiskerColor);
    const wLen = doc.whiskerLength;
    const anchorZ = hasMuzzle
      ? muzzleStartPt.z + muzzleCfg.length * 0.55
      : doc.headForwardTilt + doc.head.midRadius * 0.62;
    const anchorY = hasMuzzle ? muzzleStartPt.y - 0.01 : headCenterY - 0.035;
    const anchorX = hasMuzzle ? muzzleCfg.segments[3].rx * 0.85 : doc.head.midRadius * 0.72;

    for (let p = 0; p < doc.whiskerPairs; p++) {
      const yOff = (p - (doc.whiskerPairs - 1) * 0.5) * 0.022;
      const tiltDroop = doc.whiskerDroop * (0.04 + p * 0.015);
      ([-1, 1] as const).forEach((side) => {
        const wBase = new THREE.Vector3(side * anchorX, anchorY + yOff, anchorZ);
        const wEnd = wBase.clone().add(new THREE.Vector3(side * wLen, -tiltDroop, -0.02));
        prims.push({
          kind: 'capsule',
          a: tupleVec(wBase),
          b: tupleVec(wEnd),
          startRadius: 0.0085,
          midRadius: 0.0065,
          endRadius: 0.003,
          curvature: 0,
          blendScale: 0.16,
          color: whCol,
          boneA: headB.index,
        });
      });
    }
  }

  // Optional gentle SDF dimple under open mouths so the cavity looks truly carved into the surface
  const isOpenMouth =
    doc.mouthStyle === 'openSmile' ||
    doc.mouthStyle === 'openSurprised' ||
    doc.mouthStyle === 'openWorried' ||
    doc.mouthStyle === 'openGrin';
  const baseHeadDepthZ = doc.headForwardTilt + doc.head.midRadius * (doc.head.squashZ ?? 1);
  const tipSkinPad = hasMuzzle ? Math.max(0.14, muzzleCfg.segments[4].ry + 0.12) : 0.14;
  const mouthAnchorY =
    (hasMuzzle ? muzzleEndPt.y - muzzleCfg.segments[4].ry * 0.42 : headCenterY - doc.head.midRadius * 0.34) +
    ext.mouthOffsetY;
  const mouthAnchorZ =
    hasMuzzle ? muzzleEndPt.z + muzzleCfg.segments[4].ry * 0.55 : baseHeadDepthZ * 0.92;

  let cachedMouthSurfHit: { point: THREE.Vector3; normal: THREE.Vector3 } | null = null;
  if (isOpenMouth && ext.beakStyle === 'none') {
    const preMouthEval = new SdfFieldEvaluator(prims, doc.blendSmoothness);
    const mouthDir = new THREE.Vector3(0, -0.08, 1).normalize();
    const preRayOrigin = new THREE.Vector3(0, mouthAnchorY, mouthAnchorZ + tipSkinPad);
    cachedMouthSurfHit = preMouthEval.projectPointToSurface(preRayOrigin, mouthDir, 24);

    if (ext.mouthRecessEnabled) {
      const ms = doc.mouthSize;
      const mw = 0.048 * ms * ext.mouthWidthScale;
      const mh = 0.038 * ms * ext.mouthOpenAmount;
      const dimplePt = cachedMouthSurfHit.point
        .clone()
        .addScaledVector(cachedMouthSurfHit.normal, -0.004);
      prims.push({
        kind: 'ellipsoid',
        op: 'sub',
        a: [dimplePt.x, dimplePt.y, dimplePt.z],
        b: [mw * 0.92, mh * 0.88, 0.026],
        startRadius: 0.02,
        midRadius: 0.02,
        endRadius: 0.02,
        curvature: 0,
        blendScale: 0.12,
        color: [0, 0, 0],
        boneA: headB.index,
      });
    }
  }

  // 4. Evaluate SDF & Polygonize Seamless Clay Mesh via Marching Cubes
  const evaluator = new SdfFieldEvaluator(prims, doc.blendSmoothness);
  const mcResult = polygonizeSdfToGeometry(evaluator, bones.length, resolution);

  const bodyMat = createClayMaterial(doc.materialFinish);
  const coatTextures = createSurfaceCoatTextures(ext.surfaceCoat);
  if (coatTextures) {
    bodyMat.map = coatTextures.map;
    bodyMat.bumpMap = coatTextures.bumpMap;
    bodyMat.bumpScale = coatTextures.bumpScale;
    bodyMat.roughnessMap = coatTextures.roughnessMap;
    if (ext.surfaceCoat.mode.startsWith('scales')) {
      bodyMat.roughness = 0.42;
      bodyMat.metalness = 0.08;
    } else {
      bodyMat.roughness = 0.88;
    }
  }
  const skinnedMesh = new THREE.SkinnedMesh(mcResult.geometry, bodyMat);
  skinnedMesh.name = 'OrganicBodyMesh';
  skinnedMesh.castShadow = true;
  skinnedMesh.receiveShadow = true;
  root.add(skinnedMesh);

  root.updateMatrixWorld(true);
  const skeleton = new THREE.Skeleton(bones);
  skinnedMesh.bind(skeleton);

  // 4b. Attach layered Hair Studio object directly to Head Bone
  const effectiveHeadTopY = Math.max(
    headTopY + doc.head.endRadius * 0.55,
    crownEndY + crownProf.endRadius * 0.45
  );
  const crownLocalY = effectiveHeadTopY - headCenterY;
  const layeredHair = buildLayeredHairGroup(
    doc,
    ext,
    crownLocalY,
    doc.head.midRadius * (doc.head.squashX ?? 1),
    doc.head.midRadius * (doc.head.squashZ ?? 1.04)
  );
  if (layeredHair) {
    headB.bone.add(layeredHair);
  }

  // 4c. Attach bone-skinned 3D fur tufts / scale shingles & dorsal spikes/quills
  const excludedCoatBones = new Set<number>([
    lHandB.index,
    rHandB.index,
    lFootB.index,
    rFootB.index,
  ]);
  buildSurfaceCoatAndSpikes(
    bones,
    mcResult.geometry,
    ext.surfaceCoat,
    ext.spikes,
    headCenterY,
    doc.headForwardTilt,
    excludedCoatBones
  );

  // 5. Surface-Mounted Facial Features (Parented to Head Bone)
  const eyelidsOut: BuiltCharacterAsset['eyelids'] = [];
  const headWorldInverse = new THREE.Matrix4().copy(headB.bone.matrixWorld).invert();
  const headWorldQ = new THREE.Quaternion();
  headB.bone.getWorldQuaternion(headWorldQ);
  const headWorldQInv = headWorldQ.clone().invert();

  const placeSurfaceHit = (
    proj: { point: THREE.Vector3; normal: THREE.Vector3 },
    object: THREE.Object3D,
    surfaceBias = 0.0,
    normalBlendForward = 0.45
  ) => {
    const finalWorldPos = proj.point.clone().addScaledVector(proj.normal, surfaceBias);
    const localPos = finalWorldPos.clone().applyMatrix4(headWorldInverse);
    object.position.copy(localPos);

    const blendedFwd = proj.normal
      .clone()
      .multiplyScalar(1 - normalBlendForward)
      .add(new THREE.Vector3(0, 0, normalBlendForward))
      .normalize();
    const qWorld = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), blendedFwd);
    object.quaternion.copy(headWorldQInv).multiply(qWorld);
    headB.bone.add(object);
  };

  const attachToHeadSurface = (
    worldAnchor: THREE.Vector3,
    outwardDir: THREE.Vector3,
    object: THREE.Object3D,
    surfaceBias = 0.0,
    normalBlendForward = 0.45
  ) => {
    const proj = evaluator.projectPointToSurface(worldAnchor, outwardDir, 20);
    placeSurfaceHit(proj, object, surfaceBias, normalBlendForward);
  };

  /**
   * Projects cranial eyes & eyebrows strictly from inside the skull outward so they land on the
   * cranium/brow socket and never get pulled down onto a protruding horse/fox muzzle tip.
   */
  const attachFromSkullInterior = (
    skullInteriorOrigin: THREE.Vector3,
    outwardDir: THREE.Vector3,
    fallbackExteriorOrigin: THREE.Vector3,
    object: THREE.Object3D,
    surfaceBias = 0.0,
    normalBlendForward = 0.45
  ) => {
    const hit = evaluator.projectOutwardFromInterior(skullInteriorOrigin, outwardDir, 0.65);
    if (hit) {
      placeSurfaceHit(hit, object, surfaceBias, normalBlendForward);
    } else {
      attachToHeadSurface(fallbackExteriorOrigin, outwardDir, object, surfaceBias, normalBlendForward);
    }
  };

  // Eyes (1..6)
  const eyePositions: { x: number; y: number; scale: number }[] = [];
  const baseEyeY = headCenterY + doc.eyeHeight;
  if (doc.eyeCount === 1) {
    eyePositions.push({ x: 0, y: baseEyeY, scale: 1.28 });
  } else if (doc.eyeCount === 2) {
    eyePositions.push({ x: doc.eyeSpacing, y: baseEyeY, scale: 1 });
    eyePositions.push({ x: -doc.eyeSpacing, y: baseEyeY, scale: 1 });
  } else if (doc.eyeCount === 3) {
    eyePositions.push({ x: doc.eyeSpacing, y: baseEyeY, scale: 1 });
    eyePositions.push({ x: -doc.eyeSpacing, y: baseEyeY, scale: 1 });
    eyePositions.push({ x: 0, y: baseEyeY + doc.eyeSize * 1.45, scale: 0.85 });
  } else if (doc.eyeCount === 4) {
    eyePositions.push({ x: doc.eyeSpacing, y: baseEyeY + doc.eyeSize * 0.55, scale: 0.95 });
    eyePositions.push({ x: -doc.eyeSpacing, y: baseEyeY + doc.eyeSize * 0.55, scale: 0.95 });
    eyePositions.push({ x: doc.eyeSpacing * 1.28, y: baseEyeY - doc.eyeSize * 0.9, scale: 0.72 });
    eyePositions.push({ x: -doc.eyeSpacing * 1.28, y: baseEyeY - doc.eyeSize * 0.9, scale: 0.72 });
  } else {
    eyePositions.push({ x: doc.eyeSpacing * 0.82, y: baseEyeY + doc.eyeSize * 0.65, scale: 0.88 });
    eyePositions.push({ x: -doc.eyeSpacing * 0.82, y: baseEyeY + doc.eyeSize * 0.65, scale: 0.88 });
    eyePositions.push({ x: doc.eyeSpacing * 1.42, y: baseEyeY - doc.eyeSize * 0.15, scale: 0.68 });
    eyePositions.push({ x: -doc.eyeSpacing * 1.42, y: baseEyeY - doc.eyeSize * 0.15, scale: 0.68 });
    eyePositions.push({ x: doc.eyeSpacing * 0.72, y: baseEyeY - doc.eyeSize * 0.95, scale: 0.6 });
    eyePositions.push({ x: -doc.eyeSpacing * 0.72, y: baseEyeY - doc.eyeSize * 0.95, scale: 0.6 });
  }

  const scleraMat = new THREE.MeshStandardMaterial({
    color: doc.scleraColor,
    roughness: 0.18,
    metalness: 0.02,
  });
  const irisMat = new THREE.MeshStandardMaterial({
    color: doc.irisColor,
    roughness: 0.25,
    metalness: 0.05,
    emissive: doc.pupilStyle === 'glow' ? new THREE.Color(doc.irisColor) : new THREE.Color('#000000'),
    emissiveIntensity: doc.pupilStyle === 'glow' ? 0.55 : 0,
  });
  const pupilMat = new THREE.MeshStandardMaterial({
    color: doc.pupilColor,
    roughness: 0.12,
    metalness: 0.02,
    emissive: doc.pupilStyle === 'glow' ? new THREE.Color(doc.pupilColor) : new THREE.Color('#000000'),
    emissiveIntensity: doc.pupilStyle === 'glow' ? 0.9 : 0,
  });
  const catchlightMat = new THREE.MeshBasicMaterial({ color: '#FFFFFF' });
  const eyelidMat = new THREE.MeshStandardMaterial({
    color: doc.eyelidColor,
    roughness: doc.materialFinish === 'glossySlime' ? 0.18 : 0.62,
    metalness: 0.02,
    side: THREE.DoubleSide,
  });

  const eyeDepthEmbedFrac = THREE.MathUtils.lerp(0.22, 0.55, doc.eyeFlatness);

  eyePositions.forEach((ep, idx) => {
    const eyeSocket = new THREE.Group();
    eyeSocket.name = `CharEye_${idx}`;

    const r = doc.eyeSize * ep.scale;
    const scaledEyeFrame = new THREE.Group();
    scaledEyeFrame.scale.set(r * doc.eyeAspectX, r * doc.eyeAspectY, r * doc.eyeFlatness);
    eyeSocket.add(scaledEyeFrame);

    const eyeball = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 16), scleraMat);
    eyeball.name = `CharEyeSclera_${idx}`;
    eyeball.castShadow = true;
    scaledEyeFrame.add(eyeball);

    const irisRadius = THREE.MathUtils.clamp(doc.pupilSize * 1.28, 0.28, 0.92);
    const iris = new THREE.Mesh(
      new THREE.SphereGeometry(irisRadius, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.42),
      irisMat
    );
    iris.rotation.x = Math.PI * 0.5;
    iris.position.z = 0.72;
    iris.scale.set(1, 0.42, 1);
    scaledEyeFrame.add(iris);

    const pScale = THREE.MathUtils.clamp(doc.pupilSize * 0.78, 0.18, 0.75);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(pScale, 16, 12), pupilMat);
    pupil.position.z = 0.88;
    if (doc.pupilStyle === 'catSlit') {
      pupil.scale.set(0.32, 1.15, 0.35);
    } else if (doc.pupilStyle === 'oval') {
      pupil.scale.set(0.75, 1.15, 0.35);
    } else {
      pupil.scale.set(1, 1, 0.35);
    }
    scaledEyeFrame.add(pupil);

    const specMain = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), catchlightMat);
    specMain.position.set(0.28, 0.34, 0.98);
    specMain.scale.set(1, 1, 0.35);
    scaledEyeFrame.add(specMain);
    if (doc.pupilStyle === 'starry') {
      const specSub = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), catchlightMat);
      specSub.position.set(-0.24, -0.26, 0.99);
      specSub.scale.set(1, 1, 0.35);
      scaledEyeFrame.add(specSub);
    }

    if (doc.eyelidEnabled) {
      const topMinOpen = -Math.PI * 0.52;
      const topMaxClose = Math.PI * 0.5;
      const restFrac = THREE.MathUtils.clamp(doc.eyelidRestHeight, 0, 1);

      const topLidPivot = new THREE.Group();
      topLidPivot.name = `CharEye_${idx}_EyelidTop`;
      topLidPivot.rotation.x = THREE.MathUtils.lerp(topMinOpen, topMaxClose, restFrac);
      topLidPivot.userData = {
        eyelidRole: 'top',
        restClosedFrac: restFrac,
        minOpenRad: topMinOpen,
        maxCloseRad: topMaxClose,
        autoBlink: doc.autoBlink,
      };
      const topLidShell = new THREE.Mesh(
        new THREE.SphereGeometry(1.07, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.56),
        eyelidMat
      );
      topLidShell.castShadow = true;
      topLidPivot.add(topLidShell);
      scaledEyeFrame.add(topLidPivot);
      eyelidsOut.push({
        node: topLidPivot,
        role: 'top',
        minOpenRad: topMinOpen,
        maxCloseRad: topMaxClose,
        restClosedFrac: restFrac,
      });

      if (doc.eyelidLowerEnabled) {
        const botMinOpen = Math.PI * 0.52;
        const botMaxClose = -Math.PI * 0.04;
        const botRestFrac = restFrac * 0.35;
        const botLidPivot = new THREE.Group();
        botLidPivot.name = `CharEye_${idx}_EyelidBottom`;
        botLidPivot.rotation.x = THREE.MathUtils.lerp(botMinOpen, botMaxClose, botRestFrac);
        botLidPivot.userData = {
          eyelidRole: 'bottom',
          restClosedFrac: botRestFrac,
          minOpenRad: botMinOpen,
          maxCloseRad: botMaxClose,
          autoBlink: doc.autoBlink,
        };
        const botLidShell = new THREE.Mesh(
          new THREE.SphereGeometry(1.055, 20, 10, 0, Math.PI * 2, Math.PI * 0.52, Math.PI * 0.48),
          eyelidMat
        );
        botLidPivot.add(botLidShell);
        scaledEyeFrame.add(botLidPivot);
        eyelidsOut.push({
          node: botLidPivot,
          role: 'bottom',
          minOpenRad: botMinOpen,
          maxCloseRad: botMaxClose,
          restClosedFrac: botRestFrac,
        });
      }
    }

    const skullOrigin = new THREE.Vector3(
      ep.x * 0.18,
      THREE.MathUtils.clamp(ep.y, headBotY + 0.02, headTopY + doc.head.endRadius * 0.55) * 0.4 + headCenterY * 0.6,
      doc.headForwardTilt - doc.head.midRadius * 0.08
    );
    const skullTarget = new THREE.Vector3(ep.x, ep.y, baseHeadDepthZ);
    const rayDir = skullTarget.clone().sub(skullOrigin).normalize();
    const fallbackOrigin = new THREE.Vector3(ep.x, ep.y, baseHeadDepthZ + 0.035);
    const bias = r * doc.eyeFlatness * (1 - eyeDepthEmbedFrac * 1.35);
    attachFromSkullInterior(skullOrigin, rayDir, fallbackOrigin, eyeSocket, bias, 0.45);
  });

  // Eyebrows (with smooth rounded sphere end caps!)
  if (doc.eyebrowEnabled) {
    const browMat = new THREE.MeshStandardMaterial({
      color: doc.eyebrowColor,
      roughness: 0.65,
      metalness: 0.02,
    });
    const exprTilt = expressionTiltOffset(doc.eyebrowExpression);
    const browEyes = doc.eyeCount === 1 ? [eyePositions[0]] : eyePositions.slice(0, 2);
    browEyes.forEach((ep, bIdx) => {
      const browGroup = new THREE.Group();
      browGroup.name = `CharEyebrow_${bIdx}`;
      const browMeshGroup = createArchBrowGroup(
        doc.eyebrowWidth,
        doc.eyebrowArch * 0.028,
        doc.eyebrowThickness,
        browMat
      );
      const sideSign = doc.eyeCount === 1 ? 0 : ep.x >= 0 ? -1 : 1;
      browMeshGroup.rotation.z = THREE.MathUtils.degToRad((doc.eyebrowTiltDeg + exprTilt) * sideSign);
      browGroup.add(browMeshGroup);

      const browY = ep.y + doc.eyeSize * doc.eyeAspectY + doc.eyebrowHeight;
      const browSkullOrigin = new THREE.Vector3(
        ep.x * 0.18,
        THREE.MathUtils.clamp(browY, headBotY + 0.04, headTopY + doc.head.endRadius * 0.72) * 0.45 + headCenterY * 0.55,
        doc.headForwardTilt - doc.head.midRadius * 0.08
      );
      const browTarget = new THREE.Vector3(ep.x, browY, baseHeadDepthZ);
      const browRayDir = browTarget.clone().sub(browSkullOrigin).normalize();
      const browFallbackOrigin = new THREE.Vector3(ep.x, browY, baseHeadDepthZ + 0.035);
      attachFromSkullInterior(
        browSkullOrigin,
        browRayDir,
        browFallbackOrigin,
        browGroup,
        doc.eyebrowThickness * 0.9,
        0.45
      );
    });
  }

  // Beak (when beakStyle !== 'none')
  if (ext.beakStyle !== 'none') {
    const beakGroup = buildBeakGroup(ext);
    const beakY = headCenterY - doc.head.midRadius * 0.16;
    const rayOrigin = new THREE.Vector3(0, beakY, baseHeadDepthZ + 0.14);
    attachToHeadSurface(rayOrigin, new THREE.Vector3(0, -0.05, 1).normalize(), beakGroup, -0.008, 0.7);
  }

  // Shapeable Nose (when noseStyle !== 'none')
  if (ext.noseStyle !== 'none') {
    const noseGroup = buildNoseGroup(ext);
    const noseAnchorY =
      (hasMuzzle ? muzzleEndPt.y + muzzleCfg.segments[4].ry * 0.25 : headCenterY - 0.015) +
      ext.noseOffsetY;
    const noseAnchorZ =
      (hasMuzzle ? muzzleEndPt.z + tipSkinPad : baseHeadDepthZ + 0.14) + ext.noseOffsetZ;
    const rayOrigin = new THREE.Vector3(0, noseAnchorY, noseAnchorZ);
    const bias = ext.noseStyle === 'flatButton' ? 0.004 : -0.002;
    attachToHeadSurface(rayOrigin, new THREE.Vector3(0, 0.06, 1).normalize(), noseGroup, bias, 0.55);
  }

  // Separate Movable Surface-Hugging Nostrils (Horses, Moose, Dragons, Lizards)
  if (ext.nostrilsEnabled) {
    const rimMat = new THREE.MeshStandardMaterial({
      color: hasMuzzle ? muzzleCfg.color : doc.head.color,
      roughness: 0.6,
      metalness: 0.02,
    });
    const pitMat = new THREE.MeshBasicMaterial({ color: ext.nostrilColor });
    const ang = THREE.MathUtils.degToRad(THREE.MathUtils.clamp(ext.nostrilSideAngleDeg, 4, 92));
    const ns = ext.nostrilSize;

    // Position centerline inside the muzzle near the front tip (adjustable forward/back & up/down)
    const axisZ =
      (hasMuzzle ? muzzleEndPt.z - muzzleCfg.length * 0.16 : baseHeadDepthZ * 0.55) +
      ext.nostrilForwardOffset;
    const axisY =
      (hasMuzzle ? muzzleEndPt.y : headCenterY - doc.head.midRadius * 0.12) +
      ext.nostrilHeightOffset;
    const centerPt = new THREE.Vector3(0, axisY, axisZ);

    ([-1, 1] as const).forEach((side) => {
      const nostrilGroup = new THREE.Group();
      nostrilGroup.name = `CharNostril_${side > 0 ? 'L' : 'R'}`;

      const rx =
        ext.nostrilStyle === 'slit'
          ? 0.0048 * ns
          : ext.nostrilStyle === 'teardrop'
          ? 0.0075 * ns
          : 0.0085 * ns;
      const ry =
        ext.nostrilStyle === 'slit'
          ? 0.0125 * ns
          : ext.nostrilStyle === 'teardrop'
          ? 0.0115 * ns
          : 0.0085 * ns;

      const rim = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), rimMat);
      rim.scale.set(rx * 1.42, ry * 1.38, 0.0055 * ns);
      nostrilGroup.add(rim);

      const pit = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), pitMat);
      pit.scale.set(rx, ry, 0.003 * ns);
      pit.position.z = 0.0042 * ns;
      if (ext.nostrilStyle === 'teardrop') {
        pit.rotation.z = side * 0.25;
      }
      nostrilGroup.add(pit);

      // Ray starts inside muzzle centerline and marches outward at +/- ang to kiss the exact surface normal!
      const dir = new THREE.Vector3(side * Math.sin(ang), 0.12, Math.cos(ang)).normalize();
      attachFromSkullInterior(centerPt, dir, centerPt, nostrilGroup, 0.001, 0.12);
    });
  }

  // Mouth (Closed curves with rounded ends OR Open inset black cavity with tongue & teeth + manual placement)
  if (doc.mouthStyle !== 'none' && doc.mouthStyle !== 'beak') {
    const ms = doc.mouthSize;
    const mouthGroup = new THREE.Group();
    mouthGroup.name = 'CharMouth';
    const manualTilt = THREE.MathUtils.degToRad(ext.mouthTiltDeg);

    if (isOpenMouth) {
      const openG = buildOpenMouthGroup(ext, ms, hasMuzzle);
      openG.rotation.x = manualTilt;
      mouthGroup.add(openG);
      const baseSurfaceBias = ext.mouthRecessEnabled ? -0.002 : 0.0005;
      const totalBias = baseSurfaceBias + ext.mouthOffsetZ;
      if (cachedMouthSurfHit) {
        placeSurfaceHit(cachedMouthSurfHit, mouthGroup, totalBias, 0.08);
      } else {
        const rayOrigin = new THREE.Vector3(0, mouthAnchorY, mouthAnchorZ + tipSkinPad);
        attachToHeadSurface(rayOrigin, new THREE.Vector3(0, -0.08, 1).normalize(), mouthGroup, totalBias, 0.08);
      }
    } else {
      const mouthMat = new THREE.MeshStandardMaterial({
        color: doc.mouthColor,
        roughness: 0.48,
        metalness: 0.02,
      });
      const wScale = ext.mouthWidthScale;
      if (doc.mouthStyle === 'catW') {
        // Cute :3 bunny / kitty double-U mouth with soft rounded end caps
        const leftPts = [
          new THREE.Vector3(-0.046 * ms * wScale, 0.012 * ms, -0.005),
          new THREE.Vector3(-0.023 * ms * wScale, -0.012 * ms, 0.006),
          new THREE.Vector3(0, 0.005 * ms, 0.008),
        ];
        const rightPts = [
          new THREE.Vector3(0, 0.005 * ms, 0.008),
          new THREE.Vector3(0.023 * ms * wScale, -0.012 * ms, 0.006),
          new THREE.Vector3(0.046 * ms * wScale, 0.012 * ms, -0.005),
        ];
        mouthGroup.add(createRoundedCurveMesh(leftPts, 0.0072 * ms, mouthMat, 10));
        mouthGroup.add(createRoundedCurveMesh(rightPts, 0.0072 * ms, mouthMat, 10));
      } else {
        const curvePts =
          doc.mouthStyle === 'smirk'
            ? [
                new THREE.Vector3(-0.042 * ms * wScale, 0.004 * ms, 0),
                new THREE.Vector3(0, -0.005 * ms, 0.008 * ms),
                new THREE.Vector3(0.045 * ms * wScale, 0.018 * ms, -0.004 * ms),
              ]
            : doc.mouthStyle === 'frown'
            ? [
                new THREE.Vector3(-0.044 * ms * wScale, -0.012 * ms, -0.005 * ms),
                new THREE.Vector3(0, 0.012 * ms, 0.008 * ms),
                new THREE.Vector3(0.044 * ms * wScale, -0.012 * ms, -0.005 * ms),
              ]
            : [
                new THREE.Vector3(-0.048 * ms * wScale, 0.016 * ms, -0.006 * ms),
                new THREE.Vector3(0, -0.014 * ms, 0.008 * ms),
                new THREE.Vector3(0.048 * ms * wScale, 0.016 * ms, -0.006 * ms),
              ];
        mouthGroup.add(createRoundedCurveMesh(curvePts, 0.0082 * ms, mouthMat, 14));

        if (doc.mouthStyle === 'fangs') {
          const fangMat = new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.25 });
          ([-1, 1] as const).forEach((s) => {
            const fang = new THREE.Mesh(new THREE.ConeGeometry(0.009 * ms, 0.026 * ms, 8), fangMat);
            fang.rotation.x = Math.PI;
            fang.position.set(s * 0.026 * ms * wScale, 0.002 * ms, 0.005 * ms);
            mouthGroup.add(fang);
          });
        }
      }
      mouthGroup.rotation.x = manualTilt;
      const rayOrigin = new THREE.Vector3(0, mouthAnchorY, mouthAnchorZ + tipSkinPad);
      attachToHeadSurface(
        rayOrigin,
        new THREE.Vector3(0, -0.08, 1).normalize(),
        mouthGroup,
        0.003 + ext.mouthOffsetZ,
        0.14
      );
    }
  }

  // 5b. Layered Bone-Mounted Fun Addons (Eyewear, Headwear & Back/Shoulder Gear)
  buildLayeredAddons(
    doc,
    ext,
    headB.bone,
    chestB.bone,
    neckB.bone,
    crownLocalY,
    headCenterY,
    baseHeadDepthZ,
    attachFromSkullInterior
  );

  root.updateMatrixWorld(true);

  const partAnchors = [
    { key: 'head', worldPos: headPos },
    { key: 'headCrown', worldPos: new THREE.Vector3(0, (crownStartY + crownEndY) * 0.5, doc.headForwardTilt + crownProf.offsetZ) },
    { key: 'headJaw', worldPos: new THREE.Vector3(0, (jawStartY + jawEndY) * 0.5, (jawStartZ + jawEndZ) * 0.5) },
    { key: 'neck', worldPos: neckPos },
    { key: 'torso', worldPos: new THREE.Vector3(0, (chestY + neckBaseY) * 0.5, 0) },
    { key: 'belly', worldPos: spinePos },
    { key: 'hips', worldPos: hipsCenterPos },
    { key: 'muzzle', worldPos: muzzleStartPt.clone().lerp(muzzleEndPt, 0.5) },
    { key: 'upperArm', worldPos: lShoulderPos.clone().lerp(lElbowPos, 0.5) },
    { key: 'lowerArm', worldPos: lElbowPos.clone().lerp(lWristPos, 0.5) },
    { key: 'upperLeg', worldPos: lHipPos.clone().lerp(lKneePos, 0.5) },
    { key: 'lowerLeg', worldPos: lKneePos.clone().lerp(lAnklePos, 0.5) },
  ];

  return {
    root,
    skinnedMesh,
    skeleton,
    bones,
    bonesByName,
    eyelids: eyelidsOut,
    partAnchors,
    vertexCount: mcResult.vertexCount,
    triangleCount: mcResult.triangleCount,
  };
}

export async function buildAndExportCharacterDocToGlb(
  doc: CharacterMakerDoc,
  resolution = 52
): Promise<{ buffer: ArrayBuffer; built: BuiltCharacterAsset }> {
  const built = buildCharacterRigAndMesh(doc, resolution);
  const exporter = new GLTFExporter();
  const res = await exporter.parseAsync(built.root, { binary: true });
  if (!(res instanceof ArrayBuffer)) {
    throw new Error('Expected binary ArrayBuffer from GLTFExporter');
  }
  return { buffer: res, built };
}
