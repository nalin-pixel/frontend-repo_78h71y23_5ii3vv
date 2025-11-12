import { useEffect, useMemo, useState } from 'react'

const COLORS = [
  { key: 'green', label: 'Green', style: '#22c55e' },
  { key: 'black', label: 'Black', style: '#111827' },
  { key: 'yellow', label: 'Yellow', style: '#f59e0b' },
  { key: 'white', label: 'White', style: '#f3f4f6' },
]

const EMBROIDERY_FEE = 8.0

function ColorBadge({ c }) {
  const swatch = COLORS.find((x) => x.key === c)
  return (
    <span
      title={swatch?.label || c}
      className="w-4 h-4 inline-block rounded-full border border-gray-300"
      style={{ backgroundColor: swatch?.style || c }}
    />
  )
}

function ProductCard({ product, onAdd }) {
  const [color, setColor] = useState(product.colors?.[0] || 'green')
  const [qty, setQty] = useState(1)
  const [embroidery, setEmbroidery] = useState('')

  const img = product.images?.[0]

  const canAdd = product.in_stock && qty > 0 && product.colors?.length

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition overflow-hidden flex flex-col">
      <div className="aspect-square w-full bg-gray-50 flex items-center justify-center overflow-hidden">
        {img ? (
          <img src={img} alt={product.title} className="w-full h-full object-cover" />
        ) : (
          <div className="text-gray-400 text-sm">Add an image URL when creating a product</div>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-gray-900">{product.title}</h3>
            <p className="text-xs uppercase tracking-wide text-gray-500">{product.category}</p>
          </div>
          <p className="font-semibold text-emerald-600">${Number(product.base_price).toFixed(2)}</p>
        </div>

        <div className="mt-3">
          <label className="block text-xs text-gray-600 mb-1">Color</label>
          <div className="flex items-center gap-2">
            {(product.colors || []).map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full border-2 ${color === c ? 'border-emerald-600' : 'border-gray-300'}`}
                title={c}
                style={{ backgroundColor: COLORS.find((x) => x.key === c)?.style || c }}
              />
            ))}
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Quantity</label>
            <input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
              className="w-full rounded-lg border border-gray-300 px-2 py-1 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Embroidery (optional)</label>
            <input
              type="text"
              placeholder="Name or initials"
              value={embroidery}
              onChange={(e) => setEmbroidery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-2 py-1 text-sm"
            />
            {embroidery?.trim() && (
              <p className="mt-1 text-[11px] text-gray-500">+${EMBROIDERY_FEE.toFixed(2)} per item</p>
            )}
          </div>
        </div>

        <button
          onClick={() => onAdd({ product, color, quantity: qty, embroidery_text: embroidery?.trim() || null })}
          disabled={!canAdd}
          className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add to cart
        </button>
      </div>
    </div>
  )
}

function AdminCreateProduct({ onCreated }) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('hoodie')
  const [price, setPrice] = useState(35)
  const [colors, setColors] = useState(['green', 'black', 'yellow', 'white'])
  const [image, setImage] = useState('')
  const [desc, setDesc] = useState('')
  const [loading, setLoading] = useState(false)

  const toggleColor = (c) => {
    setColors((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]))
  }

  const submit = async () => {
    setLoading(true)
    try {
      const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
      const body = {
        title,
        category,
        description: desc,
        base_price: Number(price),
        colors,
        images: image ? [image] : [],
        in_stock: true,
      }
      const res = await fetch(`${baseUrl}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error('Failed to create product')
      setTitle('')
      setImage('')
      setDesc('')
      onCreated?.()
    } catch (e) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl border p-4 bg-white">
      <h3 className="font-semibold mb-3">Quick add product</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-600 mb-1">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-lg border px-2 py-1" />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-lg border px-2 py-1">
            <option value="hoodie">Hoodie</option>
            <option value="beanie">Beanie</option>
            <option value="shirt">Shirt</option>
            <option value="trackpants">Trackpants</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Base Price</label>
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full rounded-lg border px-2 py-1" />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Image URL</label>
          <input value={image} onChange={(e) => setImage(e.target.value)} className="w-full rounded-lg border px-2 py-1" placeholder="https://..." />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs text-gray-600 mb-1">Description</label>
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} className="w-full rounded-lg border px-2 py-2" rows={2} />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs text-gray-600 mb-2">Colors</label>
          <div className="flex gap-3 items-center flex-wrap">
            {COLORS.map((c) => (
              <label key={c.key} className="inline-flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={colors.includes(c.key)} onChange={() => toggleColor(c.key)} />
                <span className="w-4 h-4 rounded-full border" style={{ background: c.style }} />
                <span className="text-sm">{c.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
      <button onClick={submit} disabled={loading || !title} className="mt-3 rounded-lg bg-emerald-600 text-white px-3 py-2 text-sm disabled:opacity-50">
        {loading ? 'Adding...' : 'Add product'}
      </button>
    </div>
  )
}

export default function App() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState([])
  const [showAdmin, setShowAdmin] = useState(false)
  const [customer, setCustomer] = useState({ name: '', email: '' })
  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${baseUrl}/api/products`)
      const data = await res.json()
      setProducts(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const addToCart = ({ product, color, quantity, embroidery_text }) => {
    setCart((prev) => [
      ...prev,
      { id: crypto.randomUUID(), product, color, quantity, embroidery_text },
    ])
  }

  const removeFromCart = (id) => setCart((prev) => prev.filter((i) => i.id !== id))

  const totals = useMemo(() => {
    let sub = 0
    let embroidery = 0
    for (const item of cart) {
      const unit = Number(item.product.base_price) || 0
      sub += unit * item.quantity
      if (item.embroidery_text) embroidery += EMBROIDERY_FEE * item.quantity
    }
    return { sub, embroidery, grand: sub + embroidery }
  }, [cart])

  const checkout = async () => {
    if (!customer.name || !customer.email) {
      alert('Please enter your name and email')
      return
    }
    if (!cart.length) {
      alert('Your cart is empty')
      return
    }

    try {
      const body = {
        customer_name: customer.name,
        customer_email: customer.email,
        notes: '',
        items: cart.map((i) => ({
          product_id: i.product.id || i.product._id || i.product._id_str || i.product._id || i.product?.id,
          color: i.color,
          quantity: i.quantity,
          embroidery_text: i.embroidery_text || null,
        })),
      }
      const res = await fetch(`${baseUrl}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || 'Order failed')
      }
      const data = await res.json()
      alert(`Order placed! Total: $${Number(data.grand_total).toFixed(2)}`)
      setCart([])
      setCustomer({ name: '', email: '' })
    } catch (e) {
      alert(e.message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-amber-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-emerald-600" />
            <h1 className="text-xl font-bold text-gray-800">School Merch</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Cart: {cart.length}</span>
            <button onClick={() => setShowAdmin((s) => !s)} className="text-sm rounded-lg border px-3 py-1.5">
              {showAdmin ? 'Hide Admin' : 'Add Products'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {showAdmin && (
          <div className="mb-8">
            <AdminCreateProduct onCreated={load} />
          </div>
        )}

        <section>
          <h2 className="text-lg font-semibold mb-4">Browse merchandise</h2>
          {loading ? (
            <p className="text-gray-600">Loading products...</p>
          ) : products.length === 0 ? (
            <p className="text-gray-600">No products yet. Use "Add Products" to create items with image URLs.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((p) => (
                <ProductCard key={p.id || p._id} product={p} onAdd={addToCart} />
              ))}
            </div>
          )}
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold mb-3">Your cart</h2>
          {cart.length === 0 ? (
            <p className="text-gray-600">Items you add will appear here.</p>
          ) : (
            <div className="bg-white rounded-xl border p-4">
              <ul className="divide-y">
                {cart.map((i) => (
                  <li key={i.id} className="py-3 flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <strong>{i.product.title}</strong>
                        <span className="text-xs uppercase text-gray-500">{i.product.category}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <ColorBadge c={i.color} />
                        <span>x{i.quantity}</span>
                        {i.embroidery_text && (
                          <span className="text-emerald-700">Embroidery: "{i.embroidery_text}" (+${EMBROIDERY_FEE.toFixed(2)}/ea)</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-900 font-medium">
                        ${(Number(i.product.base_price) * i.quantity + (i.embroidery_text ? EMBROIDERY_FEE * i.quantity : 0)).toFixed(2)}
                      </div>
                      <button onClick={() => removeFromCart(i.id)} className="text-xs text-red-600 hover:underline">Remove</button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-4 border-t pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="text-sm text-gray-700">
                  <div>Subtotal: ${totals.sub.toFixed(2)}</div>
                  <div>Embroidery: ${totals.embroidery.toFixed(2)}</div>
                  <div className="font-semibold text-gray-900">Total: ${totals.grand.toFixed(2)}</div>
                </div>
                <div className="flex-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      placeholder="Your name"
                      value={customer.name}
                      onChange={(e) => setCustomer((c) => ({ ...c, name: e.target.value }))}
                      className="w-full rounded-lg border px-3 py-2"
                    />
                    <input
                      placeholder="Email for receipt"
                      value={customer.email}
                      onChange={(e) => setCustomer((c) => ({ ...c, email: e.target.value }))}
                      className="w-full rounded-lg border px-3 py-2"
                    />
                  </div>
                </div>
                <button onClick={checkout} className="rounded-lg bg-emerald-600 text-white px-4 py-2 font-medium">
                  Place order
                </button>
              </div>
            </div>
          )}
        </section>

        <footer className="mt-12 text-center text-xs text-gray-500">Colors available: green, black, yellow, white. Optional custom embroidery +${EMBROIDERY_FEE.toFixed(2)} per item.</footer>
      </main>
    </div>
  )
}
