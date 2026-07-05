import React from 'react';
import { X } from 'lucide-react';

function Modal({ title, children, actions, onClose, wide = false }) {
    return (
        <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
            <section className={`modal-panel ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true" aria-label={title} onMouseDown={(event) => event.stopPropagation()}>
                <div className="modal-head">
                    <h2>{title}</h2>
                    <button className="btn icon" type="button" title="Close" onClick={onClose}><X size={18} /></button>
                </div>
                <div className="modal-body">{children}</div>
                {actions && <div className="modal-actions">{actions}</div>}
            </section>
        </div>
    );
}

export default Modal;
