import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { Search, ArrowLeft, Plus, Package, Edit3, Share2 } from 'lucide-react';
import api from '../../services/apiService';
import Funciones from '../../helpers/Funciones';
import defaultImage  from '../../assets/img/default.png'

const InfoProducto = () => {
    const {bodega, producto} = useParams();
    const [product, setProduct] = useState([])
    const [loading, setDataLogin] = useState(false)
    const [imageUrl, setImageUrl]               = useState('')

    useEffect(()=>{
        const fetchInfoItem = async () => {
            try{
                setDataLogin(true)
                const dataProducto = await api.get(`api/inventario/bodega/${bodega}/${producto}`)
                setProduct(dataProducto.datos[0])
            }
            catch(error){
                console.log(error)
            }
            finally{
                setDataLogin(false)
            }
        }
        
        fetchInfoItem()
    },[producto, bodega])


    useEffect(() => {
        updateMetaTags()
        if (product && product.ItemCode) {
            setImageUrl(`https://api.xyroposadmin.com/api/imgUnItem/${product.ItemCode}`)
        }
    },[product])

    const updateMetaTags = () => {
        const title = `${product.Articulo} - Inventario Veterinario`;
        const description = `${product.Articulo}`;
        const imageUrl = `https://api.xyroposadmin.com/api/imgUnItem/${product.ItemCode}`
        const url = window.location.href;

        // Actualizar título
        document.title = title;

        // Función helper para actualizar o crear meta tags
        const updateMetaTag = (property, content, isProperty = true) => {
        const attribute = isProperty ? 'property' : 'name';
        let tag = document.querySelector(`meta[${attribute}="${property}"]`);
        
        if (!tag) {
            tag = document.createElement('meta');
            tag.setAttribute(attribute, property);
            document.head.appendChild(tag);
        }
        tag.setAttribute('content', content);
        };

        // Meta tags básicas
        updateMetaTag('description', description, false);
        
        // Open Graph tags (Facebook, WhatsApp, etc.)
        updateMetaTag('og:title', title);
        updateMetaTag('og:description', description);
        updateMetaTag('og:image', imageUrl);
        updateMetaTag('og:url', url);
        updateMetaTag('og:type', 'product');
        updateMetaTag('og:site_name', 'Inventario Veterinario');
        
        // Twitter Cards
        updateMetaTag('twitter:card', 'summary_large_image', false);
        updateMetaTag('twitter:title', title, false);
        updateMetaTag('twitter:description', description, false);
        updateMetaTag('twitter:image', imageUrl, false);
        
        // Meta tags específicas para productos
        updateMetaTag('product:price:amount', product.Precio);
        updateMetaTag('product:price:currency', 'COP');
        updateMetaTag('product:availability', product.stock > 0 ? 'in stock' : 'out of stock');
        updateMetaTag('product:brand', product.manufacturer);
        updateMetaTag('product:condition', 'new');
    };

    const handleImageError = (e) => {
            e.target.src = defaultImage;
        setImageUrl(defaultImage);
    };




    return (
        <>
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-green-700 text-white p-4 shadow-sm">
                <div className="flex items-center gap-4">
                    <h1 className="text-lg font-semibold">Detalle del Producto</h1>
                    <div className="flex-1"></div>
                    {/* <button className="p-2 hover:bg-green-600 rounded">
                        <Share2 className="w-5 h-5" />
                    </button>
                    <button className="p-2 hover:bg-green-600 rounded">
                    <Edit3 className="w-5 h-5" />
                    </button> */}
                </div>
            </header>

            {/* Content */}
            <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Product Image and Basic Info */}
                <div className="md:flex">
                <div className="md:w-1/3 p-6">
                    <div className={`w-full h-64 ${product.color} rounded-lg flex items-center justify-center mb-4`}>
                        <img 
                            alt={producto.Articulo || "Producto"} 
                            src={imageUrl || defaultImage} 
                            className="w-full cursor-pointer hover:opacity-80 transition-opacity duration-200" 
                            onError={handleImageError}
                            title="Haz clic para ver en grande"
                        />
                    </div>
                    <div className="text-center">
                    {/* <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${stockStatus.className}`}>
                        {stockStatus.text}
                    </span> */}
                    </div>
                </div>
                
                <div className="md:w-2/3 p-6">
                    <div className="mb-4">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">{product.Articulo}</h2>
                    <p className="text-gray-600 bg-gray-100 px-3 py-1 rounded inline-block font-mono text-sm">
                        {product.ItemCode}
                    </p>
                    </div>
                    
                    <div className="mb-6">
                    <p className="text-gray-700 leading-relaxed">{product.Articulo}</p>
                    </div>

                    {/* Product Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {/* <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="font-medium text-gray-600">Ingrediente Activo:</span>
                        <span className="text-gray-800">{product.activeIngredient}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="font-medium text-gray-600">Presentación:</span>
                        <span className="text-gray-800">{product.presentation}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="font-medium text-gray-600">Fabricante:</span>
                        <span className="text-gray-800">{product.manufacturer}</span>
                        </div>
                    </div> */}
                    
                    <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="font-medium text-gray-600">Stock Disponible:</span>
                        <span className="text-gray-800 font-semibold">{product.Cantidad} unidades</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="font-medium text-gray-600">Precio Unitario:</span>
                        <span className="text-green-600 font-semibold text-lg">${Funciones.formatearPrecio(product.Precio)}</span>
                        </div>
                        {/* <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="font-medium text-gray-600">Valor Total:</span>
                        <span className="text-gray-800 font-semibold">{Funciones.formatearPrecio(product.totalValue)}</span>
                        </div> */}
                    </div>
                    </div>

                    {/* Status Cards */}
                    {/* <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-blue-600 mb-1">{product.solicited}</div>
                        <div className="text-sm text-blue-800 font-medium">Solicitadas</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-purple-600 mb-1">{product.bonus}</div>
                        <div className="text-sm text-purple-800 font-medium">Bonificadas</div>
                    </div>
                    </div> */}

                    {/* Action Buttons */}
                    {/* <div className="flex gap-3">
                    <button className="flex-1 bg-green-700 hover:bg-green-800 text-white py-3 px-6 rounded-lg font-medium transition-colors">
                        Solicitar Producto
                    </button>
                    <button className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-6 rounded-lg font-medium transition-colors">
                        Editar Información
                    </button>
                    </div> */}
                </div>
                </div>
            </div>
            </div>
        </div>
        </>
    )
}
export default InfoProducto