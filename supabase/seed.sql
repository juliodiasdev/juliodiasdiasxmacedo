-- Opcional: categorias iniciais. Execute depois de schema.sql.
insert into public.categories (slug, label, position) values
  ('saudade', 'Quando senti sua falta', 0),
  ('futuro', 'Quando imaginei nosso futuro', 1),
  ('amor', 'Quando percebi que te amava', 2),
  ('pequenas-coisas', 'Pequenas coisas que me lembram você', 3),
  ('nunca-contei', 'Coisas que nunca te contei', 4),
  ('escolhi', 'Todas as vezes que escolhi você', 5)
on conflict (slug) do nothing;
