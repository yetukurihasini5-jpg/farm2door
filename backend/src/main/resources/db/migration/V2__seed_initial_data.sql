-- V2__seed_initial_data.sql
-- Seed Core Agricultural Categories

INSERT INTO categories (name, slug, description, image_url, is_active) VALUES
('Fresh Vegetables', 'vegetables', 'Locally grown organic farm vegetables picked daily', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80', TRUE),
('Orchard Fruits', 'fruits', 'Juicy tree-ripened seasonal fruits straight from orchards', 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=600&q=80', TRUE),
('Grains & Pulses', 'grains-pulses', 'Wholesome unpolished grains, millets, pulses, and lentils', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80', TRUE),
('Dairy & Farm Honey', 'dairy-honey', 'Pure raw honey, dairy, ghee, and artisan farm preserves', 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80', TRUE),
('Fresh Herbs & Spices', 'herbs-spices', 'Aromatic culinary herbs, indigenous spices, and seasonings', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80', TRUE),
('Organic Greens', 'organic-greens', 'Pesticide-free leafy greens, spinach, kale, and microgreens', 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80', TRUE);
