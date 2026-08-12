import { X } from "lucide-react";
import { format } from "date-fns";

const OPCIONES_ORIGEN = [
    { value: 'todas', label: 'Todas' },
    { value: 'masivo', label: 'Masivo' },
    { value: 'individual', label: 'Individual' },
];

const aValorInput = (fecha) => fecha ? format(fecha, 'yyyy-MM-dd') : '';
const aFecha = (valor) => valor ? new Date(`${valor}T00:00:00`) : null;

const Filtro = ({
    abierto = false,
    onClose = () => {},
    startDate = null,
    endDate = null,
    onChangeFechas = () => {},
    origen = 'todas',
    onChangeOrigen = () => {},
    onLimpiar = () => {},
    mostrarOrigen = true,
}) => {
    return (
        <>
            <div
                className={`fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300 ${abierto ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />
            <div
                role="dialog"
                aria-label="Filtros"
                className={`fixed top-0 right-0 h-dvh w-full sm:w-96 bg-white z-[70] shadow-xl transform transition-transform duration-300 ease-out flex flex-col ${abierto ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 shrink-0">
                    <h2 className="text-lg font-bold text-gray-800">Filtros</h2>
                    <button type="button" onClick={onClose} aria-label="Cerrar filtros" className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-1">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Rango de fechas
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                    Desde
                                </label>
                                <input
                                    type="date"
                                    value={aValorInput(startDate)}
                                    max={aValorInput(endDate) || undefined}
                                    onChange={(e) => onChangeFechas(aFecha(e.target.value), endDate)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                    Hasta
                                </label>
                                <input
                                    type="date"
                                    value={aValorInput(endDate)}
                                    min={aValorInput(startDate) || undefined}
                                    onChange={(e) => onChangeFechas(startDate, aFecha(e.target.value))}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {mostrarOrigen && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Origen del pedido
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {OPCIONES_ORIGEN.map(({ value, label }) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => onChangeOrigen(value)}
                                        className={`py-2 rounded-lg text-sm font-semibold border transition-colors ${
                                            origen === value
                                                ? 'bg-gray-900 text-white border-gray-900'
                                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                                        }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="px-5 py-4 border-t border-gray-200 flex gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={onLimpiar}
                        className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-gray-300 text-gray-700 hover:bg-gray-100"
                    >
                        Limpiar
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800"
                    >
                        Aplicar
                    </button>
                </div>
            </div>
        </>
    )
}
export default Filtro
