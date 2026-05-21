-- =============================================
-- Frames & Decor PK - Complete Database Schema
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- CATEGORIES TABLE
-- =============================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PRODUCTS TABLE
-- =============================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  specifications JSONB DEFAULT '{}',
  price DECIMAL(10,2) NOT NULL,
  sale_price DECIMAL(10,2),
  sizes TEXT[] DEFAULT '{}',
  colors TEXT[] DEFAULT '{}',
  materials TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  wall_preview_images TEXT[] DEFAULT '{}',
  is_premium BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_bestseller BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INVENTORY TABLE
-- =============================================
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE UNIQUE,
  quantity INT NOT NULL DEFAULT 0,
  low_stock_threshold INT DEFAULT 5,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- USERS PROFILE TABLE (extends Supabase auth.users)
-- =============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  whatsapp TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ADDRESSES TABLE
-- =============================================
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  notes TEXT,
  delivery_instructions TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- COUPONS TABLE
-- =============================================
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL,
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  max_uses INT,
  used_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ORDERS TABLE
-- =============================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_whatsapp TEXT,
  shipping_address TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  notes TEXT,
  delivery_instructions TEXT,
  subtotal DECIMAL(10,2) NOT NULL,
  shipping_fee DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  coupon_code TEXT,
  total DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_method TEXT DEFAULT 'cod',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ORDER ITEMS TABLE
-- =============================================
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_image TEXT,
  size TEXT,
  color TEXT,
  material TEXT,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- REVIEWS TABLE
-- =============================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SETTINGS TABLE
-- =============================================
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- NEWSLETTER SUBSCRIBERS
-- =============================================
CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Generate unique order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'FD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL OR NEW.order_number = '')
  EXECUTE FUNCTION generate_order_number();

-- Auto-reduce inventory on order item insert
CREATE OR REPLACE FUNCTION reduce_inventory()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE inventory
  SET quantity = quantity - NEW.quantity,
      updated_at = NOW()
  WHERE product_id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_order_item_insert
  AFTER INSERT ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION reduce_inventory();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', COALESCE(NEW.raw_user_meta_data->>'role', 'customer'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Products policies (public read)
CREATE POLICY "Anyone can view active products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage products" ON products FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Categories policies (public read)
CREATE POLICY "Anyone can view active categories" ON categories FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage categories" ON categories FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Inventory policies
CREATE POLICY "Anyone can view inventory" ON inventory FOR SELECT USING (true);
CREATE POLICY "Admins can manage inventory" ON inventory FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Orders policies
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage orders" ON orders FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Order items policies
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Anyone can insert order items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage order items" ON order_items FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Reviews policies
CREATE POLICY "Anyone can view approved reviews" ON reviews FOR SELECT USING (is_approved = true);
CREATE POLICY "Users can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage reviews" ON reviews FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Coupons policies
CREATE POLICY "Anyone can view active coupons" ON coupons FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage coupons" ON coupons FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Addresses policies
CREATE POLICY "Users can manage own addresses" ON addresses FOR ALL USING (user_id = auth.uid());

-- Settings policies
CREATE POLICY "Anyone can view settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage settings" ON settings FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Newsletter policies
CREATE POLICY "Anyone can subscribe" ON newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view subscribers" ON newsletter_subscribers FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- =============================================
-- SEED DATA
-- =============================================

-- Insert default categories
INSERT INTO categories (name, slug, description, display_order) VALUES
  ('Wooden Frames', 'wooden-frames', 'Handcrafted wooden frames with natural grain patterns for a warm, timeless look.', 1),
  ('Glass Frames', 'glass-frames', 'Sleek glass frames that add a touch of modern sophistication to any space.', 2),
  ('Acrylic Frames', 'acrylic-frames', 'Lightweight and durable acrylic frames with crystal-clear display.', 3),
  ('Modern Frames', 'modern-frames', 'Contemporary designs that complement minimalist and modern interiors.', 4),
  ('Vintage Frames', 'vintage-frames', 'Classic and antique-inspired frames for a nostalgic, elegant display.', 5),
  ('Wall Collage Sets', 'wall-collage-sets', 'Curated sets to create stunning gallery walls with coordinated frames.', 6),
  ('Premium Luxury Frames', 'premium-luxury-frames', 'Exclusive handcrafted frames with premium materials and finishes.', 7);

-- Insert default settings
INSERT INTO settings (key, value) VALUES
  ('shipping_fee', '{"default": 250, "free_above": 5000}'),
  ('business_info', '{"name": "Frames & Decor PK", "email": "hello@framesandecor.pk", "phone": "+92 300 1234567", "whatsapp": "+92 300 1234567", "address": "Lahore, Pakistan"}'),
  ('contact_info', '{"email": "support@framesandecor.pk", "phone": "+92 300 1234567", "whatsapp": "+92 300 1234567"}');

-- Insert sample products
INSERT INTO products (name, slug, description, category_id, price, sale_price, sizes, colors, materials, images, is_featured, is_bestseller, is_premium, specifications) VALUES
(
  'Classic Oak Photo Frame',
  'classic-oak-photo-frame',
  'A beautifully crafted oak wood frame that brings warmth and elegance to any photograph. The natural wood grain adds character while the precision-cut matting ensures your photos look their best.',
  (SELECT id FROM categories WHERE slug = 'wooden-frames'),
  2499, 1999,
  ARRAY['6x8', '8x10', '11x14', '16x20'],
  ARRAY['Natural Oak', 'Dark Walnut', 'Honey'],
  ARRAY['Solid Oak Wood'],
  ARRAY['https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=800', 'https://images.unsplash.com/photo-1582053433976-25c00369fc93?w=800'],
  true, true, false,
  '{"weight": "450g", "glass": "Anti-glare glass", "backing": "MDF with easel stand", "mounting": "Wall mount + tabletop"}'
),
(
  'Minimalist Glass Frame',
  'minimalist-glass-frame',
  'Ultra-modern frameless glass design that lets your photos float. Perfect for contemporary spaces where simplicity speaks volumes.',
  (SELECT id FROM categories WHERE slug = 'glass-frames'),
  1799, NULL,
  ARRAY['5x7', '8x10', '11x14'],
  ARRAY['Clear', 'Frosted', 'Smoked'],
  ARRAY['Tempered Glass'],
  ARRAY['https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=800', 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=800'],
  true, false, false,
  '{"weight": "350g", "glass": "HD tempered glass", "backing": "Velvet-lined", "mounting": "Wall mount with clips"}'
),
(
  'Crystal Clear Acrylic Frame',
  'crystal-clear-acrylic-frame',
  'Museum-quality acrylic frame that provides exceptional clarity and UV protection. Lightweight yet incredibly durable for long-lasting display.',
  (SELECT id FROM categories WHERE slug = 'acrylic-frames'),
  2199, 1899,
  ARRAY['8x10', '11x14', '16x20', '20x24'],
  ARRAY['Crystal Clear', 'Black Edge', 'Gold Edge'],
  ARRAY['Premium Acrylic'],
  ARRAY['https://images.unsplash.com/photo-1582053433976-25c00369fc93?w=800'],
  false, true, false,
  '{"weight": "300g", "glass": "UV-resistant acrylic", "backing": "Aluminum", "mounting": "Float mount system"}'
),
(
  'Geometric Modern Frame',
  'geometric-modern-frame',
  'Bold geometric design in matte black metal. A statement piece that transforms any wall into an art gallery.',
  (SELECT id FROM categories WHERE slug = 'modern-frames'),
  3499, 2999,
  ARRAY['8x10', '11x14', '16x20'],
  ARRAY['Matte Black', 'Brushed Silver', 'Rose Gold'],
  ARRAY['Powder-coated Metal'],
  ARRAY['https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=800'],
  true, true, true,
  '{"weight": "600g", "glass": "Museum-grade glass", "backing": "Steel plate", "mounting": "Flush wall mount"}'
),
(
  'Victorian Ornate Frame',
  'victorian-ornate-frame',
  'Exquisitely detailed Victorian-era reproduction with hand-applied gold leaf finish. Perfect for adding old-world charm to cherished photographs.',
  (SELECT id FROM categories WHERE slug = 'vintage-frames'),
  4999, NULL,
  ARRAY['8x10', '11x14', '16x20'],
  ARRAY['Antique Gold', 'Aged Silver', 'Bronze'],
  ARRAY['Resin with Gold Leaf'],
  ARRAY['https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=800'],
  true, false, true,
  '{"weight": "800g", "glass": "Conservation glass", "backing": "Archival board", "mounting": "D-ring hanging system"}'
),
(
  'Gallery Wall Set - 7 Pieces',
  'gallery-wall-set-7-pieces',
  'Create an Instagram-worthy gallery wall with this curated set of 7 coordinated frames. Includes layout template and all mounting hardware.',
  (SELECT id FROM categories WHERE slug = 'wall-collage-sets'),
  7999, 6499,
  ARRAY['Mixed Sizes Set'],
  ARRAY['All Black', 'All White', 'Mixed Metallic'],
  ARRAY['Wood + Metal Mix'],
  ARRAY['https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=800', 'https://images.unsplash.com/photo-1582053433976-25c00369fc93?w=800'],
  true, true, false,
  '{"weight": "2.5kg total", "glass": "Standard glass", "backing": "MDF", "mounting": "Template + hardware included"}'
),
(
  'Royal Heritage Luxury Frame',
  'royal-heritage-luxury-frame',
  'Our flagship luxury frame handcrafted by master artisans. Features genuine mother-of-pearl inlay and hand-rubbed lacquer finish. Each piece is unique.',
  (SELECT id FROM categories WHERE slug = 'premium-luxury-frames'),
  12999, NULL,
  ARRAY['8x10', '11x14', '16x20'],
  ARRAY['Pearl White', 'Midnight Black', 'Imperial Gold'],
  ARRAY['Lacquered Hardwood with Mother-of-Pearl'],
  ARRAY['https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=800'],
  true, false, true,
  '{"weight": "1.2kg", "glass": "Museum UV glass", "backing": "Velvet-lined archival", "mounting": "French cleat system"}'
),
(
  'Rustic Barn Wood Frame',
  'rustic-barn-wood-frame',
  'Authentic reclaimed barn wood frame with natural distressing. Each frame tells a story with its unique weathered patina.',
  (SELECT id FROM categories WHERE slug = 'wooden-frames'),
  3299, 2799,
  ARRAY['5x7', '8x10', '11x14'],
  ARRAY['Weathered Gray', 'Barn Red', 'Natural'],
  ARRAY['Reclaimed Barn Wood'],
  ARRAY['https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=800'],
  false, true, false,
  '{"weight": "550g", "glass": "Standard glass", "backing": "Reclaimed wood", "mounting": "Sawtooth hanger"}'
);

-- Insert inventory for all products
INSERT INTO inventory (product_id, quantity, low_stock_threshold)
SELECT id, 50, 5 FROM products;

-- Insert sample coupon
INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, max_uses, expires_at) VALUES
  ('WELCOME10', 'percentage', 10, 2000, 100, NOW() + INTERVAL '90 days'),
  ('FLAT500', 'fixed', 500, 3000, 50, NOW() + INTERVAL '60 days');

-- Insert sample reviews
INSERT INTO reviews (product_id, customer_name, rating, comment, is_approved) VALUES
  ((SELECT id FROM products WHERE slug = 'classic-oak-photo-frame'), 'Ahmed Khan', 5, 'Absolutely stunning frame! The oak wood quality is exceptional and it looks even better in person.', true),
  ((SELECT id FROM products WHERE slug = 'classic-oak-photo-frame'), 'Sara Ali', 4, 'Beautiful frame, fast delivery. The natural oak color is gorgeous.', true),
  ((SELECT id FROM products WHERE slug = 'geometric-modern-frame'), 'Usman Malik', 5, 'This frame transformed my living room wall. The matte black finish is premium quality.', true),
  ((SELECT id FROM products WHERE slug = 'gallery-wall-set-7-pieces'), 'Fatima Hassan', 5, 'Best purchase ever! The layout template made installation so easy. My gallery wall looks amazing.', true),
  ((SELECT id FROM products WHERE slug = 'victorian-ornate-frame'), 'Bilal Ahmed', 5, 'The gold leaf detailing is breathtaking. Worth every rupee for this level of craftsmanship.', true);
