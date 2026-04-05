import { Link } from "react-router-dom";
import { ShoppingCart, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import usePublicacionesApi from "./Dashboard/hooks/usePublicacionesApi";
import normalizeImageUrl from '@/lib/normalizeImageUrl';
import piojoLogo from '@/assets/piojo-logo.png';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      
      {/* PORTADA */}
      <section className="bg-slate-900 text-white py-16 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">El Piojo</h1>
        <p className="text-lg text-gray-300 mb-6">Compra y venta en la UTVT</p>
        <div className="flex justify-center gap-4">
            <Link to="/login">
                <Button className="bg-blue-600 hover:bg-blue-700">Empezar a Vender</Button>
            </Link>
        </div>
      </section>

      <div className="container mx-auto px-4 mt-8 flex flex-col md:flex-row gap-8">
        
        {/* --- REQUERIMIENTO 5: FILTROS (Sidebar) --- */}
        <aside className="w-full md:w-64 space-y-6 bg-white p-4 rounded-lg shadow-sm h-fit">
          <div className="flex items-center gap-2 font-bold text-lg">
            <Filter className="h-5 w-5" /> Filtros
          </div>
          <Separator />
          
          {/* Categorías */}
          <div>
            <h3 className="font-medium mb-3">Categorías</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="cat-ropa" />
                <Label htmlFor="cat-ropa">Ropa</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="cat-zapatos" />
                <Label htmlFor="cat-zapatos">Zapatos</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="cat-accesorios" />
                <Label htmlFor="cat-accesorios">Accesorios</Label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Precio */}
          <div>
            <h3 className="font-medium mb-3">Precio Máximo</h3>
            <input type="range" min="0" max="1000" className="w-full accent-blue-600" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>$0</span>
              <span>$1000+</span>
            </div>
          </div>
        </aside>

        {/* --- LISTA DE PRODUCTOS (REQ 7) --- */}
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Catálogo Reciente</h2>
          
          <PublicacionesList />
        </div>
      </div>
    </div>
  );
}

function PublicacionesList() {
  const { data: publicaciones = [] } = usePublicacionesApi();
  if (!publicaciones || publicaciones.length === 0) {
    return <div className="text-sm text-muted-foreground">No hay publicaciones recientes.</div>;
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {publicaciones.slice(0, 9).map((p: any) => {
        const portada = (p.detallePublicaciones || p.detalle_publicaciones || []).find((d: any) => d?.es_portada) || (p.detallePublicaciones || p.detalle_publicaciones || [])[0];
        const img = normalizeImageUrl(portada?.url_foto ?? portada?.url) ?? piojoLogo;
        const title = p.titulo ?? p.descripcion ?? 'Sin título';
        const price = p.precio == null || p.precio === 0 ? 'Gratis' : `$${p.precio}`;
        return (
          <Card key={String(p.id_publicaciones ?? p.id)} className="overflow-hidden hover:shadow-lg transition-shadow">
            <Link to={`/producto/${String(p.id_publicaciones ?? p.id)}`}>
              <div className="h-48 overflow-hidden bg-gray-200 cursor-pointer relative">
                <img src={img} alt={title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              </div>
            </Link>

            <CardHeader className="p-4 pb-2">
              <Link to={`/producto/${String(p.id_publicaciones ?? p.id)}`}>
                <CardTitle className="text-lg line-clamp-1 hover:text-blue-600 cursor-pointer">{title}</CardTitle>
              </Link>
            </CardHeader>

            <CardContent className="p-4 pt-0">
              <p className="text-xl font-bold text-green-600">{price}</p>
            </CardContent>

            <CardFooter className="p-4 pt-0">
              <Button className="w-full gap-2" variant="outline">Ver Detalles</Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}