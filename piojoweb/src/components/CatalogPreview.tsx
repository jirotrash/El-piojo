import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import featuredImg from "@/assets/featured-items.png";

const items = [
  { name: "Chamarra de Mezclilla", price: "$150", condition: "Excelente", tag: "Venta" },
  { name: "Hoodie Gris Oversize", price: "$120", condition: "Muy bueno", tag: "Venta" },
  { name: "Playera Vintage Band", price: "$80", condition: "Bueno", tag: "Venta" },
  { name: "Tenis Blancos", price: "$200", condition: "Como nuevos", tag: "Venta" },
  { name: "Falda Plisada", price: "Gratis", condition: "Bueno", tag: "Donación" },
  { name: "Camisa a Cuadros", price: "$90", condition: "Excelente", tag: "Venta" },
];

const CatalogPreview = () => {
  return (
    <section id="catalogo" className="py-24 bg-muted/40 transition-colors">
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-3xl md:text-5xl font-display font-bold text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Catálogo <span className="text-gradient-hero">Destacado</span>
        </motion.h2>
        <p className="text-center text-muted-foreground mt-3 font-body max-w-lg mx-auto">
          Prendas seleccionadas con mucho cariño. ¡Cada una cuenta una historia! 👗
        </p>

        {/* Featured banner */}
        <motion.div
          className="mt-10 rounded-3xl overflow-hidden shadow-card"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <img src={featuredImg} alt="Prendas destacadas" className="w-full h-48 md:h-72 object-cover" loading="lazy" />
        </motion.div>

        {/* Items grid */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <motion.div
              key={item.name}
              className="bg-card rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all hover:-translate-y-1 cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display font-bold text-foreground">{item.name}</h3>
                  <p className="text-muted-foreground text-sm font-body mt-1">Estado: {item.condition}</p>
                </div>
                <span
                  className={`text-xs font-display font-bold px-3 py-1 rounded-full ${
                    item.tag === "Donación"
                      ? "bg-gradient-donate text-primary-foreground"
                      : "bg-gradient-hero text-primary-foreground"
                  }`}
                >
                  {item.tag}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="font-display font-bold text-xl text-primary">{item.price}</span>
                <button className="font-body font-semibold text-sm text-primary hover:underline">
                  Me interesa →
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link to="/catalogo" target="_blank" className="inline-flex items-center gap-2 bg-gradient-hero text-primary-foreground font-display font-bold px-8 py-3 rounded-full hover:opacity-90 transition-opacity">
            Ver catálogo completo →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CatalogPreview;
