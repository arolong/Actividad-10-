import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { Producto } from '../../services/ecommerce/productos.services';
import { productosService } from '../../services/ecommerce/productos.services';
import '../../App.css';

export default function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [producto, setProducto] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const cargarProducto = async () => {
      try {
        setLoading(true);
        if (!id) {
          setError('ID de producto no válido');
          return;
        }
        
        const productos = await productosService.obtenerProductos();
        const productoEncontrado = productos.find(p => p.id === parseInt(id));
        
        if (!productoEncontrado) {
          setError('Producto no encontrado');
        } else {
          setProducto(productoEncontrado);
        }
      } catch (err) {
        setError('Error al cargar el producto');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    cargarProducto();
  }, [id]);

  const handleAddCart = () => {
    if (producto) {
      // Aquí puedes agregar la lógica para agregar al carrito
      console.log(`Agregado ${quantity} de ${producto.nombre} al carrito`);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !producto) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          {error || 'Producto no encontrado'}
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => navigate('/')}
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <button 
        className="btn btn-outline-secondary mb-4" 
        onClick={() => navigate('/')}
      >
        ← Volver
      </button>

      <div className="row">
        {/* Columna de imagen */}
        <div className="col-md-6 mb-4">
          <div style={{ height: '400px', backgroundColor: '#f0f0f0', borderRadius: '8px', overflow: 'hidden' }}>
            {!imageError && producto.imagen ? (
              <img
                src={producto.imagen}
                alt={producto.nombre}
                style={{ height: '100%', width: '100%', objectFit: 'cover' }}
                onError={handleImageError}
              />
            ) : (
              <div className="d-flex align-items-center justify-content-center h-100 bg-light">
                <span className="text-muted">Sin imagen disponible</span>
              </div>
            )}
          </div>
        </div>

        {/* Columna de información */}
        <div className="col-md-6">
          <h1 className="mb-3">{producto.nombre}</h1>
          
          <div className="mb-4">
            <span className="badge bg-info text-capitalize me-2">{producto.categoria || 'Sin categoría'}</span>
            <span className={`badge ${producto.stock > 0 ? 'bg-success' : 'bg-danger'}`}>
              {producto.stock > 0 ? `${producto.stock} en stock` : 'Agotado'}
            </span>
          </div>

          <div className="mb-4">
            <h3 className="text-primary">${producto.precio.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</h3>
          </div>

          <div className="mb-4">
            <h5>Descripción</h5>
            <p className="text-muted">{producto.descripcion}</p>
          </div>

          {producto.stock > 0 && (
            <div className="mb-4">
              <label htmlFor="quantity" className="form-label">Cantidad:</label>
              <div className="input-group mb-3" style={{ width: '150px' }}>
                <button 
                  className="btn btn-outline-secondary" 
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  −
                </button>
                <input 
                  type="number" 
                  className="form-control text-center" 
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  max={producto.stock}
                />
                <button 
                  className="btn btn-outline-secondary" 
                  type="button"
                  onClick={() => setQuantity(Math.min(producto.stock, quantity + 1))}
                >
                  +
                </button>
              </div>
            </div>
          )}

          <div className="d-grid gap-2">
            <button 
              className="btn btn-primary btn-lg"
              onClick={handleAddCart}
              disabled={producto.stock === 0}
            >
              {producto.stock > 0 ? 'Agregar al carrito' : 'Agotado'}
            </button>
          </div>

          <div className="mt-4 pt-4 border-top">
            <p className="text-muted small">
              <strong>ID del producto:</strong> {producto.id}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
