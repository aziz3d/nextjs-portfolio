export interface Model3D {
  id: string;
  name: string;
  description: string;
  modelUrl: string;
  previewImageUrl?: string;
  isActive: boolean;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

export const defaultModels: Model3D[] = [
  {
    id: 'model-1',
    name: 'Default Cube',
    description: 'A simple 3D cube model',
    modelUrl: '/models/cube.glb',
    previewImageUrl: '/images/models/cube-preview.jpg',
    isActive: true,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1]
  },
  {
    id: 'model-2',
    name: 'Laptop',
    description: '3D model of a laptop',
    modelUrl: '/models/laptop.glb',
    previewImageUrl: '/images/models/laptop-preview.jpg',
    isActive: false,
    position: [0, -0.5, 0],
    rotation: [0, Math.PI / 4, 0],
    scale: [0.8, 0.8, 0.8]
  },
  {
    id: 'model-3',
    name: 'Robot',
    description: 'Friendly robot character',
    modelUrl: '/models/robot.glb',
    previewImageUrl: '/images/models/robot-preview.jpg',
    isActive: false,
    position: [0, -1, 0],
    rotation: [0, Math.PI / 2, 0],
    scale: [0.5, 0.5, 0.5]
  }
];
