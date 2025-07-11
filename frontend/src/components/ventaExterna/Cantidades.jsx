import { useState, useEffect } from 'react';

const Cantidades = ({titulo = "", tipo='normal',item = null, handleCantidad = null, cantidad = 0}) => {
    const [localValue, setLocalValue] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    // Sincronizar el valor local con el prop cantidad cuando no estamos editando
    useEffect(() => {
        if (!isEditing) {
            setLocalValue(cantidad === 0 ? '' : cantidad.toString());
        }
    }, [cantidad, isEditing]);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setLocalValue(value);
        setIsEditing(true);
        
        // Si el valor es válido, actualizar inmediatamente
        if (value === '' || (!isNaN(value) && parseFloat(value) >= 0)) {
            const numValue = value === '' ? 0 : parseInt(value);
            handleCantidad(item, numValue, tipo);
        }
    };

    const handleInputFocus = () => {
        setIsEditing(true);
        // Si el valor es 0, limpiar el campo al hacer focus
        if (cantidad === 0) {
            setLocalValue('');
        }
    };

    const handleInputBlur = (e) => {
        setIsEditing(false);
        const value = e.target.value;
        
        // Si está vacío, establecer a 0
        if (value === '') {
            handleCantidad(item, 0, tipo);
            setLocalValue('');
        } else {
            // Asegurar que el valor final sea válido
            const numValue = parseInt(value) || 0;
            handleCantidad(item, numValue, tipo);
            setLocalValue(numValue === 0 ? '' : numValue.toString());
        }
    };

    const handleDecrease = () => {
        const newValue = ((parseInt(cantidad || 0) - 1) > 0) ? parseInt(cantidad || 0) - 1 : 0;
        handleCantidad(item, newValue, tipo);
        setIsEditing(false);
    };

    const handleIncrease = () => {
        const newValue = parseInt(cantidad || 0) + 1;
        handleCantidad(item, newValue, tipo);
        setIsEditing(false);
    };

    const inputStyle = {
        /* Chrome, Safari, Edge, Opera */
        WebkitAppearance: 'none',
        MozAppearance: 'textfield', /* Firefox */
    };

    return (
        <>
            <div className="flex flex-wrap">
                <div className="font-bold w-full"><small className="font-bold">{titulo}</small></div>
                <div className="grid grid-cols-12">
                    <div className="col-span-4 items-center justify-center">
                        <svg 
                            onClick={handleDecrease}
                            xmlns="http://www.w3.org/2000/svg" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            strokeWidth="1.5" 
                            stroke="currentColor" 
                            className="size-10 cursor-pointer mr-4"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                    </div>
                    <div className="col-span-4 items-center justify-center">
                        <input 
                            style={inputStyle}
                            type="number" 
                            min="0"
                            value={localValue}
                            onChange={handleInputChange}
                            onFocus={handleInputFocus}
                            onBlur={handleInputBlur}
                            className="w-full p-2 bg-gray-100 rounded-lg text-center"
                            placeholder="0"
                        />
                    </div>
                    <div className="col-span-4 items-center justify-center">
                        <svg 
                            onClick={handleIncrease}
                            xmlns="http://www.w3.org/2000/svg" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            strokeWidth="1.5" 
                            stroke="currentColor" 
                            className="size-10 cursor-pointer ml-1"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Cantidades;