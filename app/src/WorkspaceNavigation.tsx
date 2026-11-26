import { useContext } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'

import { WorkspaceHeaderTarget } from './workspace-header'

export function WorkspaceNavigation({ children }: { children: ReactNode }) {
  const target = useContext(WorkspaceHeaderTarget)
  const navigation = <nav className="workspace-navigation" aria-label="Turniernavigation">{children}</nav>
  return target ? createPortal(navigation, target) : navigation
}
