import React, { createContext, useState, useContext } from 'react';

const ProductContext = createContext();

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'Portland Cement 50kg Bag',
      description: 'Premium Type I Portland cement for general construction, foundations, and concrete work',
      price: 360,
      image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop&q=80',
      category: 'Materials',
      stock: 500
    },
    {
      id: 2,
      name: 'Steel Rebar #4 (12mm) - 6m Length',
      description: 'Grade Fe-500D deformed steel rebar, 6m length. Perfect for concrete reinforcement and structural support',
      price: 150,
      image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=600&fit=crop&q=80',
      category: 'Structural',
      stock: 300
    },
    {
      id: 3,
      name: 'Steel Rebar #5 (16mm) - 6m Length',
      description: 'Grade Fe-500D deformed steel rebar, 6m length. Heavy-duty reinforcement for large concrete structures',
      price: 240,
      image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=600&fit=crop&q=80',
      category: 'Structural',
      stock: 250
    },
    {
      id: 4,
      name: 'Concrete Block 8x8x16 inch',
      description: 'Standard concrete masonry unit (CMU) block. Ideal for walls, foundations, and retaining structures',
      price: 35,
      image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop&q=80',
      category: 'Materials',
      stock: 2000
    },
    {
      id: 5,
      name: 'Red Clay Brick',
      description: 'Standard red clay brick, 4x2.25x8 inch. Weather-resistant and durable for exterior and interior walls',
      price: 8,
      image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop&q=80',
      category: 'Materials',
      stock: 5000
    },
    {
      id: 6,
      name: 'Ready-Mix Concrete 50kg Bag',
      description: 'Pre-mixed concrete for small projects. Just add water for foundations, sidewalks, and patios',
      price: 320,
      image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop&q=80',
      category: 'Materials',
      stock: 400
    },
    {
      id: 7,
      name: 'Teak Wood Plank 2x4x8ft',
      description: 'Premium teak wood lumber, 8ft length. Resistant to rot and insects, perfect for outdoor projects',
      price: 850,
      image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&h=600&fit=crop&q=80',
      category: 'Wood',
      stock: 600
    },
    {
      id: 8,
      name: 'Plywood Sheet 4x8x12mm',
      description: 'Commercial grade plywood, 12mm thickness. Versatile for sheathing, subflooring, and construction',
      price: 1800,
      image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&h=600&fit=crop&q=80',
      category: 'Wood',
      stock: 150
    },
    {
      id: 9,
      name: 'Gypsum Board 4x8x12mm',
      description: 'Standard 12mm gypsum board sheet. Fire-resistant and easy to install for interior walls and ceilings',
      price: 450,
      image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop&q=80',
      category: 'Materials',
      stock: 300
    },
    {
      id: 10,
      name: 'Fiberglass Insulation Roll R-19',
      description: 'Batt insulation roll, R-19 value. Energy-efficient thermal insulation for walls and attics',
      price: 1200,
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&q=80',
      category: 'Insulation',
      stock: 200
    },
    {
      id: 11,
      name: 'Asphalt Shingles Bundle',
      description: '3-tab asphalt shingles, 33.3 sq ft coverage. Weather-resistant roofing material with 20-year warranty',
      price: 850,
      image: 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800&h=600&fit=crop&q=80',
      category: 'Roofing',
      stock: 180
    },
    {
      id: 12,
      name: 'Metal Roofing Sheet 3ftx10ft',
      description: 'Galvanized steel roofing sheet, corrugated design. Durable and weather-resistant for long-lasting roofs',
      price: 1200,
      image: 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800&h=600&fit=crop&q=80',
      category: 'Roofing',
      stock: 80
    },
    {
      id: 13,
      name: 'Copper Wire 2.5 sqmm - 90m Roll',
      description: 'Copper electrical wire, 2.5 sqmm. Suitable for 20-amp circuits, residential and commercial use',
      price: 3200,
      image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&h=600&fit=crop&q=80',
      category: 'Electrical',
      stock: 120
    },
    {
      id: 14,
      name: 'PVC Pipe 4 inch x 3m',
      description: 'Schedule 40 PVC pipe, 4 inch diameter. Durable for plumbing, drainage, and irrigation systems',
      price: 450,
      image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&h=600&fit=crop&q=80',
      category: 'Plumbing',
      stock: 100
    },
    {
      id: 15,
      name: 'Copper Pipe 15mm x 3m',
      description: 'Type L copper pipe, 15mm diameter. Premium quality for water supply lines and plumbing',
      price: 850,
      image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&h=600&fit=crop&q=80',
      category: 'Plumbing',
      stock: 90
    },
    {
      id: 16,
      name: 'Galvanized Nails 4 inch (5kg box)',
      description: '4-inch galvanized nails, 5kg box. Corrosion-resistant for outdoor construction and framing',
      price: 450,
      image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=600&fit=crop&q=80',
      category: 'Hardware',
      stock: 250
    },
    {
      id: 17,
      name: 'Wood Screws Assorted (1kg)',
      description: 'Assorted wood screws, various sizes, 1kg box. Zinc-plated for general woodworking and construction',
      price: 320,
      image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=600&fit=crop&q=80',
      category: 'Hardware',
      stock: 300
    },
    {
      id: 18,
      name: 'Anchor Bolts M12x150mm',
      description: 'Zinc-plated anchor bolts, M12 diameter, 150mm length. For securing structures to concrete',
      price: 45,
      image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=600&fit=crop&q=80',
      category: 'Hardware',
      stock: 400
    },
    {
      id: 19,
      name: 'River Sand - Fine Grade (1 ton)',
      description: 'Fine construction sand, 1 ton bulk. Perfect for concrete mixing, plastering, and leveling',
      price: 1200,
      image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop&q=80',
      category: 'Materials',
      stock: 50
    },
    {
      id: 20,
      name: 'Crushed Stone Aggregate 20mm',
      description: '20mm crushed stone aggregate, 1 ton bulk. Ideal for drainage, driveways, and concrete aggregate',
      price: 1500,
      image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop&q=80',
      category: 'Materials',
      stock: 45
    },
    {
      id: 21,
      name: 'OSB Board 4x8x11mm',
      description: 'Oriented strand board (OSB), 11mm thickness. Strong and cost-effective for wall and roof sheathing',
      price: 1400,
      image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&h=600&fit=crop&q=80',
      category: 'Wood',
      stock: 200
    },
    {
      id: 22,
      name: 'MCB Distribution Board 200A',
      description: 'Main electrical distribution board, 200 amp capacity. Includes MCB and 40 circuit spaces',
      price: 8500,
      image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&h=600&fit=crop&q=80',
      category: 'Electrical',
      stock: 25
    },
    {
      id: 23,
      name: 'PVC Fittings Assorted Pack',
      description: 'Assorted PVC fittings including elbows, tees, and couplings. Compatible with 4 inch PVC pipe',
      price: 850,
      image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&h=600&fit=crop&q=80',
      category: 'Plumbing',
      stock: 150
    },
    {
      id: 24,
      name: 'Fiber Cement Board 4x8x6mm',
      description: 'Fiber cement board, 6mm thickness. Fire-resistant and low-maintenance exterior cladding',
      price: 650,
      image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop&q=80',
      category: 'Materials',
      stock: 180
    }
  ]);

  const addProduct = (product) => {
    const newProduct = {
      ...product,
      id: Date.now(),
      stock: parseInt(product.stock) || 0
    };
    setProducts([...products, newProduct]);
  };

  const updateProduct = (id, updatedProduct) => {
    setProducts(products.map(p => p.id === id ? { ...updatedProduct, id } : p));
  };

  const deleteProduct = (id) => {
    setProducts(products.filter(p => p.id !== id));
  };

  return (
    <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct }}>
      {children}
    </ProductContext.Provider>
  );
};

