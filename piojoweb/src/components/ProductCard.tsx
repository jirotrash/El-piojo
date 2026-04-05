import React from 'react';
import { ShoppingCart, Heart } from 'lucide-react';
import { Link } from 'react-router-dom'; // <--- Importar Link
import normalizeImageUrl from '@/lib/normalizeImageUrl';
import piojoLogo from '@/assets/piojo-logo.png';


export interface Prenda {
  id: string;
  titulo: string;
  descripcion: string;
  precio: number;
  talla: string;
  condicion: 'nuevo' | 'seminuevo' | 'usado' | 'detalles';
  imagenes: string[];
  vendedorId: string;
  categoria: 'hombre' | 'mujer' | 'unisex' | 'accesorios';
  disponible: boolean;
  fechaPublicacion: Date;
}

interface ProductCardProps {
  producto: Prenda;
}

const ProductCard: React.FC<ProductCardProps> = ({ producto }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col h-full group">
      
      {/* EL ENLACE ENVUELVE A LA IMAGEN */}
      <Link to={`/producto/${producto.id}`} className="block relative h-48 overflow-hidden bg-gray-200 cursor-pointer">
        <img
          src={normalizeImageUrl(producto.imagenes?.[0]) ?? piojoLogo}
          alt={producto.titulo}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = piojoLogo; }}
        />
        <span className={`absolute top-2 right-2 px-2 py-1 text-xs font-bold rounded-full 
          ${producto.condicion === 'nuevo' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
          {producto.condicion.toUpperCase()}
        </span>
      </Link>

      <div className="p-4 flex flex-col flex-grow">
        {/* EL ENLACE ENVUELVE AL TITULO */}
        <Link to={`/producto/${producto.id}`}>
            <h3 className="font-semibold text-gray-800 text-lg mb-1 truncate hover:text-green-700 transition">
                {producto.titulo}
            </h3>
        </Link>
        
        <p className="text-sm text-gray-500 mb-3 truncate">{producto.descripcion}</p>
        
        <div className="mt-auto flex items-center justify-between">
          <span className="text-xl font-bold text-green-700">${producto.precio}</span>
          
          <div className="flex gap-2">
            <button className="p-2 text-gray-400 hover:text-red-500 transition rounded-full hover:bg-red-50">
              <Heart size={20} />
            </button>
            <button className="p-2 bg-green-700 text-white rounded-full hover:bg-green-800 transition shadow-sm">
              <ShoppingCart size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;