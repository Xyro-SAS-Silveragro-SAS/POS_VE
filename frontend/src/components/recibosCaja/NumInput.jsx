import { useEffect, useState } from "react";

const formatear = (valor) => {
  if (valor === "" || valor === null || valor === undefined) return "";
  const num = Number(valor);
  if (Number.isNaN(num)) return "";
  return new Intl.NumberFormat("es-CO").format(num);
};

const NumInput = ({ value, onChange, className = "", placeholder = "0", disabled = false }) => {
  const [texto, setTexto] = useState(formatear(value));

  useEffect(() => {
    setTexto(formatear(value));
  }, [value]);

  const handleChange = (e) => {
    const soloNumeros = e.target.value.replace(/[^\d]/g, "");
    setTexto(soloNumeros ? new Intl.NumberFormat("es-CO").format(Number(soloNumeros)) : "");
    onChange(soloNumeros ? Number(soloNumeros) : 0);
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      value={texto}
      onChange={handleChange}
      disabled={disabled}
      placeholder={placeholder}
      className={`outline-none bg-transparent disabled:text-stone-400 ${className}`}
    />
  );
};

export default NumInput;
