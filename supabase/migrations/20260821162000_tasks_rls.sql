-- RLS Policies for tasks table
DROP POLICY IF EXISTS "Keluarga can insert own tasks" ON public.tasks;
CREATE POLICY "Keluarga can insert own tasks" ON public.tasks
    FOR INSERT WITH CHECK (auth.uid() = keluarga_id);

DROP POLICY IF EXISTS "Keluarga can select own tasks" ON public.tasks;
CREATE POLICY "Keluarga can select own tasks" ON public.tasks
    FOR SELECT USING (auth.uid() = keluarga_id);

DROP POLICY IF EXISTS "Keluarga can update own tasks" ON public.tasks;
CREATE POLICY "Keluarga can update own tasks" ON public.tasks
    FOR UPDATE USING (auth.uid() = keluarga_id);

-- RLS Policies for task_extra_services table
DROP POLICY IF EXISTS "Keluarga can insert extra services" ON public.task_extra_services;
CREATE POLICY "Keluarga can insert extra services" ON public.task_extra_services
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.tasks WHERE tasks.id = task_id AND tasks.keluarga_id = auth.uid())
    );

DROP POLICY IF EXISTS "Keluarga can select extra services" ON public.task_extra_services;
CREATE POLICY "Keluarga can select extra services" ON public.task_extra_services
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.tasks WHERE tasks.id = task_id AND tasks.keluarga_id = auth.uid())
    );
