import { useId, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import './WorkspaceDialog.css'

interface Props {
  label: string
  title: string
  disabled?: boolean
  busy?: boolean
  descriptionId?: string
  children: ReactNode
  onOpen?: () => void
  confirm?: { label: string; onClick: () => void }
}

export default function WorkspaceDialog({ label, title, disabled, busy, descriptionId, children, confirm, onOpen }: Props) {
  const id = useId()
  const dialog = useRef<HTMLDialogElement>(null)
  const opener = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)

  function close() {
    if (busy) return
    dialog.current?.close()
    setOpen(false)
    opener.current?.focus({ preventScroll: true })
  }

  return <>
    <button className="secondary-button" ref={opener} type="button" aria-haspopup="dialog"
      aria-describedby={descriptionId} disabled={disabled || busy} onClick={() => {
        onOpen?.()
        dialog.current?.showModal()
        setOpen(true)
      }}>{label}</button>
    <dialog className="workspace-dialog" ref={dialog} aria-labelledby={id}
      onKeyDown={(event) => {
        if (event.key !== 'Escape') return
        event.preventDefault()
        close()
      }}
      onCancel={(event) => {
        event.preventDefault()
        close()
      }}>
      <header className="workspace-dialog-header">
        <h3 id={id}>{title}</h3>
        <button className="secondary-button" type="button" disabled={busy} onClick={close}>
          {confirm ? 'Abbrechen' : 'Schließen'}
        </button>
      </header>
      <div className="workspace-dialog-content" role="region" aria-label={`${title}: Inhalt`} tabIndex={0}>{open && children}</div>
      {confirm && <footer className="workspace-dialog-footer">
        <button className="action-button" type="button" disabled={busy} onClick={confirm.onClick}>{confirm.label}</button>
      </footer>}
    </dialog>
  </>
}
