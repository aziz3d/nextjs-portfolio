"use client"

import { TorusModel } from './torus-model'

interface PlaceholderModelProps {
  scale?: number;
}

export function PlaceholderModel(props: PlaceholderModelProps) {
  // Scale down the model to a reasonable size
  const modelScale = props.scale || 0.4

  return (
    <TorusModel scale={modelScale} wireframe={true} />
  )
}
