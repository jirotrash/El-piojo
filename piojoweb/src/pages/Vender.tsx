import { useState, useMemo } from "react";
import gql from "../api/gqlClient";
import { useAuth } from "@/components/AuthProvider";
import useUsuarioApi from "@/pages/Dashboard/hooks/useUsuarioApi";
import usePuntosEntregaApi from "@/pages/Dashboard/hooks/usePuntosEntregaApi";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Upload, DollarSign,  Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// 1. ESQUEMA DE VALIDACIÓN (REQ 4)
const formSchema = z.object({
  titulo: z.string().min(5, "El título debe tener al menos 5 letras.").max(50, "Máximo 50 caracteres."),
  precio: z.coerce.number().min(0, "El precio debe ser >= 0."),
  categoria: z.string({ required_error: "Selecciona una categoría." }),
  condicion: z.string({ required_error: "Selecciona la condición." }),
  descripcion: z.string().min(20, "Cuéntanos más detalles (mínimo 20 letras)."),
  donacion: z.boolean().optional(),
  marca: z.string().max(50).optional(),
  talla: z.string().max(30).optional(),
  color: z.string().max(30).optional(),
  genero: z.enum(["hombre", "mujer", "unisex"]).optional(),
  disponible: z.boolean().optional(),
  id_puntos_entrega: z.union([z.string(), z.number()]).optional(),
});

export default function Vender() {
  const [previews, setPreviews] = useState<string[]>([]); // up to 4 images
  const [files, setFiles] = useState<(File | null)[]>([]);
  const [loading, setLoading] = useState(false);

  // 2. CONFIGURACIÓN DEL FORMULARIO
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titulo: "",
      precio: 0,
      donacion: false,
      marca: "",
      talla: "",
      color: "",
      genero: "unisex",
      disponible: true,
      id_puntos_entrega: "",
      descripcion: "",
    },
  });

  // Upload endpoint (required). If empty, form will refuse to submit.
  const UPLOAD_URL = import.meta.env.VITE_UPLOAD_URL ?? '';

  // derive current user from token + usuarios list (like Navbar)
  const { token } = useAuth();
  const { data: usuariosData = [] } = useUsuarioApi();
  const { data: puntosData = [] } = usePuntosEntregaApi();
  const tokenSub = useMemo(() => {
    if (!token) return null;
    try {
      if ((token.match(/\./g) || []).length === 2) {
        const parts = token.split('.');
        const payload = parts[1];
        const b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4));
        const json = atob(b64 + pad);
        const obj = JSON.parse(json);
        return obj.sub ? String(obj.sub) : null;
      }
      const decoded = atob(token);
      const p = decoded.split(":");
      if (p && p[0] && p[0].includes("@")) return null;
    } catch (e) {
      return null;
    }
    return null;
  }, [token]);

  const currentUser = useMemo(() => {
    if (!usuariosData || usuariosData.length === 0) return null;
    if (tokenSub) {
      const byId = usuariosData.find((u: any) => String(u.id_usuarios ?? u.id) === String(tokenSub));
      if (byId) return byId;
    }
    return usuariosData[0] || null;
  }, [usuariosData, tokenSub]);

  // 3. MANEJO DE LA IMAGEN (REQ 11)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, slot = 0) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prev) => {
          const next = [...prev];
          next[slot] = reader.result as string;
          return next.slice(0, 4);
        });
      };
      reader.readAsDataURL(file);
      setFiles((prev) => {
        const next = [...prev];
        next[slot] = file;
        return next.slice(0, 4);
      });
    }
  };

  // 4. ENVÍO DEL FORMULARIO
  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!previews || previews.length === 0 || previews.every((p) => !p)) {
      alert("⚠️ ¡Falta la foto! Es obligatorio subir al menos una imagen.");
      return;
    }
    setLoading(true);

    (async () => {
      try {
        const imagenesUrls: string[] = [];

        // Si hay endpoint configurado, subimos los files; si no, usamos las previews base64
        if (UPLOAD_URL && files && files.length) {
          for (let i = 0; i < files.length; i++) {
            const f = files[i];
            if (!f) continue;
            const fd = new FormData();
            fd.append('file', f);
            const resp = await fetch(UPLOAD_URL, { method: 'POST', body: fd });
            if (!resp.ok) throw new Error('Error subiendo imagenes: ' + resp.statusText);
            const json = await resp.json();
            const url = json.url ?? json.data?.url;
            if (!url) throw new Error('Respuesta de upload sin URL');
            imagenesUrls.push(url);
          }
        } else {
          // Fallback: use base64 previews as 'urls' (temporary)
          imagenesUrls.push(...previews.filter(Boolean).slice(0, 4));
        }

        const detallePublicaciones = imagenesUrls.map((u, idx) => ({ url_foto: u, es_portada: idx === 0 }));

        const generoMap: Record<string, string> = { hombre: 'HOMBRE', mujer: 'MUJER', unisex: 'UNISEX' };
        const estadoMap: Record<string, string> = { 'nuevo': 'NUEVO', 'como-nuevo': 'BUENO', 'bueno': 'BUENO', 'detalles': 'USADO' };

        const id_usuarios = currentUser ? Number(currentUser.id_usuarios ?? currentUser.id) : undefined;

        const payload = {
          // take only the expected fields, avoid sending `condicion` raw
          titulo: values.titulo,
          descripcion: values.descripcion,
          categoria: values.categoria,
          talla: values.talla,
          marca: values.marca && String(values.marca).trim() ? values.marca : 'Generica',
          color: values.color,
          genero: generoMap[values.genero as string] ?? 'UNISEX',
          estado_uso: estadoMap[values.condicion as string] ?? 'USADO',
          precio: values.donacion ? 0 : values.precio,
          disponible: values.disponible,
          id_puntos_entrega: values.id_puntos_entrega ? Number(values.id_puntos_entrega) : undefined,
          id_usuarios,
          detallePublicaciones,
        } as any;

        const CREATE_PUBLICACION = `
          mutation CreatePublicacion($input: CreatePublicacionesInput!) {
            createPublicacion(input: $input) {
              id_publicaciones
            }
          }
        `;

        const res = await gql<{ createPublicacion: { id_publicaciones: number } }>(CREATE_PUBLICACION, { input: payload });
        console.log('Publicación creada:', res);
        alert('✅ ¡Producto publicado con éxito!');
        window.location.href = '/';
      } catch (err: any) {
        console.error(err);
        alert('Error al crear la publicación: ' + (err?.message ?? String(err)));
      } finally {
        setLoading(false);
      }
    })();
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Vender un Artículo</CardTitle>
          <CardDescription>
            Completa los datos para publicar tu producto en El Piojo Web.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* --- CARGA DE IMAGEN (REQ 11) --- */}
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 hover:bg-gray-50 transition-colors cursor-pointer relative">
                <div className="grid grid-cols-2 gap-3 w-full">
                  {[0,1,2,3].map((i) => (
                    <label key={i} className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-3 hover:bg-gray-50 transition-colors cursor-pointer h-40">
                      <input type="file" accept="image/*" onChange={(e)=>handleImageChange(e,i)} className="hidden" />
                      {previews[i] ? (
                        <img src={previews[i]} alt={`preview-${i}`} className="w-full h-full object-contain rounded-md" />
                      ) : (
                        <div className="text-center">
                          <Upload className="mx-auto h-8 w-8 text-gray-400" />
                          <p className="mt-2 text-sm text-gray-600 font-medium">Agregar foto</p>
                          <p className="text-xs text-gray-500">PNG, JPG hasta 5MB</p>
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* TÍTULO */}
              <FormField
                control={form.control}
                name="titulo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título de la publicación</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Tenis Nike Air Force 1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                {/* PRECIO */}
                <FormField
                  control={form.control}
                  name="precio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                          <Input type="number" className="pl-8" placeholder="0.00" {...field} disabled={form.watch('donacion')} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* CATEGORÍA */}
                <FormField
                  control={form.control}
                  name="categoria"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoría</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ropa">Ropa</SelectItem>
                          <SelectItem value="zapatos">Zapatos</SelectItem>
                          <SelectItem value="accesorios">Accesorios</SelectItem>
                          <SelectItem value="libros">Libros / Útiles</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* MARCA, TALLA, COLOR, GÉNERO */}
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="marca"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marca</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Nike, Zara" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="talla"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Talla</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: M, 42, S" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Color</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Negro, Azul" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="genero"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Género</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="hombre">Hombre</SelectItem>
                            <SelectItem value="mujer">Mujer</SelectItem>
                            <SelectItem value="unisex">Unisex</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="id_puntos_entrega"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Punto de entrega</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(puntosData || []).map((p: any) => (
                            <SelectItem key={p.id_puntos_entrega} value={String(p.id_puntos_entrega)}>{p.nombre}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* DONACIÓN */}
              <div className="space-y-1">
                <label className="text-sm font-medium">¿Vendes o Donas?</label>
                <div className="flex items-center gap-4">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="donacion"
                      checked={!form.watch("donacion")}
                      onChange={() => form.setValue("donacion", false)}
                    />
                    <span>Vender</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="donacion"
                      checked={!!form.watch("donacion")}
                      onChange={() => form.setValue("donacion", true)}
                    />
                    <span>Donar (sin precio)</span>
                  </label>
                </div>
              </div>

              {/* CONDICIÓN */}
              <FormField
                control={form.control}
                name="condicion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condición del artículo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="¿En qué estado está?" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="nuevo">Nuevo (Con etiqueta)</SelectItem>
                        <SelectItem value="como-nuevo">Como nuevo (Sin detalles)</SelectItem>
                        <SelectItem value="bueno">Buen estado (Usado)</SelectItem>
                        <SelectItem value="detalles">Con detalles estéticos</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* DESCRIPCIÓN */}
              <FormField
                control={form.control}
                name="descripcion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción detallada</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Menciona talla, marca, defectos, o punto de entrega..." 
                        className="resize-none h-32" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* DISPONIBLE */}
              <div className="flex items-center gap-2">
                <input
                  id="disponible"
                  type="checkbox"
                  checked={!!form.watch('disponible')}
                  onChange={(e) => form.setValue('disponible', e.target.checked)}
                />
                <label htmlFor="disponible">Disponible para la venta</label>
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-lg" disabled={loading}>
                {loading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publicando...
                    </>
                ) : (
                    "Publicar Ahora"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}