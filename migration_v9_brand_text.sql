-- Migration V9: Custom Brand Text
INSERT INTO system_settings (key, value)
VALUES ('brand_text', 'THE HYUNDAI | SKY TERRACE')
ON CONFLICT (key) DO NOTHING;
