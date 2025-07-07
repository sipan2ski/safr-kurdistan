-- Insert sample houses
INSERT INTO public.houses (
  title, area, city, price, bedrooms, bathrooms, guests, parking, 
  description, amenities, phone, whatsapp, lat, lng, images
) VALUES 
(
  'Mountain View Villa in Zawita',
  'Zawita',
  'Duhok',
  180,
  4,
  3,
  10,
  true,
  'Luxury villa with panoramic mountain views, perfect for large families.',
  ARRAY['WiFi', 'AC', 'Kitchen', 'Garden', 'Mountain View', 'BBQ Area'],
  '+964 750 123 4567',
  '+964 750 123 4567',
  37.0469,
  43.0889,
  ARRAY['/placeholder.svg?height=300&width=400']
),
(
  'Cozy Family House in Zawita',
  'Zawita',
  'Duhok',
  120,
  3,
  2,
  8,
  true,
  'Comfortable family house with traditional Kurdish architecture.',
  ARRAY['WiFi', 'Kitchen', 'Garden', 'Traditional Design'],
  '+964 750 123 4568',
  '+964 750 123 4568',
  37.0479,
  43.0899,
  ARRAY['/placeholder.svg?height=300&width=400']
),
(
  'Modern Apartment in Sarsing',
  'Sarsing',
  'Duhok',
  100,
  2,
  1,
  6,
  false,
  'Modern apartment with valley views and all amenities.',
  ARRAY['WiFi', 'AC', 'Kitchen', 'Valley View'],
  '+964 750 123 4569',
  '+964 750 123 4569',
  37.0500,
  43.1000,
  ARRAY['/placeholder.svg?height=300&width=400']
);

-- Create a default admin user (you'll need to sign up first, then update this)
-- Replace 'your-user-id-here' with your actual user ID from auth.users
-- INSERT INTO public.admin_users (user_id, role) 
-- VALUES ('your-user-id-here', 'super-admin');
