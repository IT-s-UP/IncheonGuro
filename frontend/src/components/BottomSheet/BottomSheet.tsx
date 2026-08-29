import type { ReactNode } from 'react';
import './BottomSheet.css';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

function BottomSheet({ open, onClose, children }: BottomSheetProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="bottom-sheet-backdrop" onClick={onClose}>
      <div className="bottom-sheet" onClick={(event) => event.stopPropagation()}>
        <span className="bottom-sheet__handle" aria-hidden="true" />
        <div className="bottom-sheet__content">{children}</div>
      </div>
    </div>
  );
}

export default BottomSheet;
