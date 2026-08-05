import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabaseAdmin = await createAdminClient();

    const demoUsers = [
      {
        email: 'keluarga.demo@rangkul.id',
        username: 'keluarga_demo',
        full_name: 'Keluarga Demo',
        role: 'keluarga' as const,
        phone: '081234567890',
      },
      {
        email: 'helper.demo@rangkul.id',
        username: 'helper_demo',
        full_name: 'Helper Demo',
        role: 'helper' as const,
        phone: '082345678901',
      },
      {
        email: 'koordinator.rt01@rangkul.id',
        username: 'koordinator_rt01',
        full_name: 'Koordinator RT 01',
        role: 'koordinator' as const,
        phone: '083456789012',
      },
      {
        email: 'admin.demo@rangkul.id',
        username: 'admin_demo',
        full_name: 'Admin Demo Rangkul',
        role: 'admin' as const,
        phone: '084567890123',
      },
    ];

    const password = 'RangkulDemo2026!';
    const results = [];

    for (const demo of demoUsers) {
      // Check if auth user exists by email
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find(u => u.email === demo.email);

      if (existingUser) {
        // Update password & metadata for existing user
        await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
          password,
          user_metadata: {
            full_name: demo.full_name,
            role: demo.role,
            username: demo.username,
          },
        });

        // Ensure user row exists in public.users
        await supabaseAdmin.from('users').upsert({
          id: existingUser.id,
          email: demo.email,
          username: demo.username,
          full_name: demo.full_name,
          role: demo.role,
          phone: demo.phone,
          account_status: 'active',
          updated_at: new Date().toISOString(),
        });

        results.push({ email: demo.email, status: 'updated' });
      } else {
        // Create user via Auth Admin API
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: demo.email,
          password,
          email_confirm: true,
          user_metadata: {
            full_name: demo.full_name,
            role: demo.role,
            username: demo.username,
          },
        });

        if (createError) {
          results.push({ email: demo.email, status: 'error', message: createError.message });
        } else if (newUser?.user) {
          await supabaseAdmin.from('users').upsert({
            id: newUser.user.id,
            email: demo.email,
            username: demo.username,
            full_name: demo.full_name,
            role: demo.role,
            phone: demo.phone,
            account_status: 'active',
            updated_at: new Date().toISOString(),
          });
          results.push({ email: demo.email, status: 'created' });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Demo accounts seeded successfully',
      password,
      results,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
