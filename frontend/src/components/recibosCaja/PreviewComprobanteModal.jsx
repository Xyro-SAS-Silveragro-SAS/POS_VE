import { X } from "lucide-react";

const PreviewComprobanteModal = ({ open, onClose, comprobante }) => {
  if (!open || !comprobante) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <div className="relative max-h-full max-w-full" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 rounded-full bg-white p-1.5 text-stone-600 shadow-lg transition hover:bg-stone-100"
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>
        <img
          src={comprobante.preview}
          alt={comprobante.file.name}
          className="max-h-[85vh] max-w-full rounded-xl object-contain shadow-2xl"
        />
        <p className="mt-2 truncate text-center text-xs text-white/80">{comprobante.file.name}</p>
      </div>
    </div>
  );
};

export default PreviewComprobanteModal;
