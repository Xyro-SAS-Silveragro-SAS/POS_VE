
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { v4 } from "uuid";

const Funciones = {
    bufferToString: (buffer) => {
        if (!buffer || !buffer.data) return '';
        return String.fromCharCode.apply(null, buffer.data);
    },
    formatearPrecio: (precio) => {
        return new Intl.NumberFormat('es-CO').format(precio);
    },
    precioAhora: (precio, descuento) => {
        if(descuento > 0){
            const valorDescuento = ((precio * descuento) / 100)
            const precioAhora    = precio - valorDescuento 
            return precioAhora;
        }
        return precio;
    },
    alerta:(titulo="Atencion",mensaje="",tipo="info",callback=()=>{},botonAceptar="ACEPTAR") =>{
        const MySwal = withReactContent(Swal)
        MySwal.fire({
            title: titulo,
            html: mensaje,
            icon: tipo,
            reverseButtons: true,
            confirmButtonText: botonAceptar,
            cancelButtonText:'',
            backdrop: `
            rgba(0,0,0,0.5)
            `
          })
          .then(() => {
            return callback();
          });
    },
    confirmacion:(titulo="Atencion",mensaje="",tipo="info",callback=()=>{},callbackCancel=()=>{},botonAceptar="ACEPTAR",botonCancelar="CANCELAR") =>{
        const MySwal = withReactContent(Swal)
        MySwal.fire({
            title: titulo,
            html: mensaje,
            icon: tipo,
            showCancelButton: true,
            cancelButtonText: botonCancelar,
            confirmButtonText: botonAceptar,
            reverseButtons: true,
            backdrop: `
                rgba(0,0,0,0.5)
            `
        })
        .then((resultado) => {
          if(resultado.value){
            return callback();
          }
          else{
            return callbackCancel();
          }
        });
    },
    generarCodigoPedido:() =>{
        return v4();
    },
    getIP: async () => {
        try {
            // Usando una API externa para obtener la IP
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            console.error('Error al obtener la IP:', error);
            return '0.0.0.0'; // IP por defecto en caso de error
        }
    },
    getGeoLocation: () => {
      return new Promise((resolve, reject) => {
          if (!navigator.geolocation) {
              reject(new Error('La geolocalización no está soportada por este navegador.'));
              return;
          }
          
          navigator.geolocation.getCurrentPosition(
              (position) => {
                  resolve({
                      latitude: position.coords.latitude,
                      longitude: position.coords.longitude,
                      accuracy: position.coords.accuracy
                  });
              },
              (error) => {
                  let errorMessage = 'Error desconocido al obtener la ubicación.';
                  
                  switch (error.code) {
                      case error.PERMISSION_DENIED:
                          errorMessage = 'El usuario denegó la solicitud de geolocalización.';
                          break;
                      case error.POSITION_UNAVAILABLE:
                          errorMessage = 'La información de ubicación no está disponible.';
                          break;
                      case error.TIMEOUT:
                          errorMessage = 'La solicitud para obtener la ubicación del usuario expiró.';
                          break;
                  }
                  
                  reject(new Error(errorMessage));
              },
              {
                  enableHighAccuracy: true,
                  timeout: 5000,
                  maximumAge: 0
              }
          );
      });
    },
    generaUrlAmigable: (texto) => {
        if (!texto) return '';
        
        // Convertir a minúsculas
        let url = texto.toLowerCase();
        
        // Eliminar tildes y caracteres especiales
        url = url.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        // Eliminar caracteres no alfanuméricos y reemplazar espacios por vacío
        url = url.replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "");
        
        // Aplicar formato Pascal Case (primera letra de cada palabra en mayúscula, excepto la primera palabra)
        if (url.length > 0) {
            const palabras = texto.toLowerCase().split(" ");
            url = palabras[0].normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
            
            for (let i = 1; i < palabras.length; i++) {
                if (palabras[i].length > 0) {
                    const palabraSinTildes = palabras[i].normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                    const palabraLimpia = palabraSinTildes.replace(/[^a-z0-9]/g, "");
                    if (palabraLimpia.length > 0) {
                        url += palabraLimpia.charAt(0).toUpperCase() + palabraLimpia.slice(1);
                    }
                }
            }
        }
        
        return url;
    },
    validaEmail:(mail) => {
        let salida  = false;
        const regex = /[\w-\.]{2,}@([\w-]{2,}\.)*([\w-]{2,}\.)[\w-]{2,4}/;
        // Se utiliza la funcion test() nativa de JavaScript
        if (regex.test(mail.trim()))
        {
            salida  = true;
        }
        else
        {
            salida  = false;
        }
        return salida;
    },
    validaCelularColombia: (celular) => {
        // Eliminar espacios y guiones si existen
        const celularLimpio = celular.replace(/[\s-]/g, '');
        
        // Verificar que comience con 3 y tenga exactamente 10 dígitos
        const regex = /^3\d{9}$/;
        
        return regex.test(celularLimpio);
    },
    
    validaContrasena: (password) => {
        // Verificar longitud mínima de 6 caracteres
        if (password.length < 6) {
            return false;
        }
        // Verificar al menos una letra mayúscula
        if (!/[A-Z]/.test(password)) {
            return false;
        }
        // Verificar al menos un número
        if (!/[0-9]/.test(password)) {
            return false;
        }
        // Verificar al menos un carácter especial
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            return false;
        }
        
        // Si pasa todas las validaciones
        return true;
    }
}
export default Funciones;