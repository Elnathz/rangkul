-- Drop constraints temporarily
ALTER TABLE public.helper_services DROP CONSTRAINT IF EXISTS helper_services_service_category_id_fkey;
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_service_category_id_fkey;

-- Update child tables first
UPDATE public.helper_services SET service_category_id = 'a0000001-0000-4000-8000-000000000001' WHERE service_category_id = 'a0000001-0000-0000-0000-000000000001';
UPDATE public.helper_services SET service_category_id = 'a0000002-0000-4000-8000-000000000002' WHERE service_category_id = 'a0000002-0000-0000-0000-000000000002';
UPDATE public.helper_services SET service_category_id = 'a0000003-0000-4000-8000-000000000003' WHERE service_category_id = 'a0000003-0000-0000-0000-000000000003';
UPDATE public.helper_services SET service_category_id = 'a0000004-0000-4000-8000-000000000004' WHERE service_category_id = 'a0000004-0000-0000-0000-000000000004';
UPDATE public.helper_services SET service_category_id = 'a0000005-0000-4000-8000-000000000005' WHERE service_category_id = 'a0000005-0000-0000-0000-000000000005';
UPDATE public.helper_services SET service_category_id = 'a0000006-0000-4000-8000-000000000006' WHERE service_category_id = 'a0000006-0000-0000-0000-000000000006';

UPDATE public.tasks SET service_category_id = 'a0000001-0000-4000-8000-000000000001' WHERE service_category_id = 'a0000001-0000-0000-0000-000000000001';
UPDATE public.tasks SET service_category_id = 'a0000002-0000-4000-8000-000000000002' WHERE service_category_id = 'a0000002-0000-0000-0000-000000000002';
UPDATE public.tasks SET service_category_id = 'a0000003-0000-4000-8000-000000000003' WHERE service_category_id = 'a0000003-0000-0000-0000-000000000003';
UPDATE public.tasks SET service_category_id = 'a0000004-0000-4000-8000-000000000004' WHERE service_category_id = 'a0000004-0000-0000-0000-000000000004';
UPDATE public.tasks SET service_category_id = 'a0000005-0000-4000-8000-000000000005' WHERE service_category_id = 'a0000005-0000-0000-0000-000000000005';
UPDATE public.tasks SET service_category_id = 'a0000006-0000-4000-8000-000000000006' WHERE service_category_id = 'a0000006-0000-0000-0000-000000000006';

-- Update dummy IDs to be strictly UUIDv4 compliant (for Zod validation)
UPDATE public.service_categories SET id = 'a0000001-0000-4000-8000-000000000001' WHERE id = 'a0000001-0000-0000-0000-000000000001';
UPDATE public.service_categories SET id = 'a0000002-0000-4000-8000-000000000002' WHERE id = 'a0000002-0000-0000-0000-000000000002';
UPDATE public.service_categories SET id = 'a0000003-0000-4000-8000-000000000003' WHERE id = 'a0000003-0000-0000-0000-000000000003';
UPDATE public.service_categories SET id = 'a0000004-0000-4000-8000-000000000004' WHERE id = 'a0000004-0000-0000-0000-000000000004';
UPDATE public.service_categories SET id = 'a0000005-0000-4000-8000-000000000005' WHERE id = 'a0000005-0000-0000-0000-000000000005';
UPDATE public.service_categories SET id = 'a0000006-0000-4000-8000-000000000006' WHERE id = 'a0000006-0000-0000-0000-000000000006';

-- Restore constraints
ALTER TABLE public.helper_services ADD CONSTRAINT helper_services_service_category_id_fkey FOREIGN KEY (service_category_id) REFERENCES public.service_categories(id) ON DELETE CASCADE;
ALTER TABLE public.tasks ADD CONSTRAINT tasks_service_category_id_fkey FOREIGN KEY (service_category_id) REFERENCES public.service_categories(id) ON DELETE RESTRICT;
