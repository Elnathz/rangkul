import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabaseAdmin = await createAdminClient();

    const demoUsers = [
      {
        email: 'demo_keluarga@rangkul.id',
        username: 'demo_keluarga',
        full_name: 'Keluarga Demo',
        role: 'keluarga' as const,
        phone: '081234567890',
      },
      {
        email: 'demo_helper@rangkul.id',
        username: 'demo_helper',
        full_name: 'Helper Demo',
        role: 'helper' as const,
        phone: '082345678901',
      },
      {
        email: 'demo_koordinator@rangkul.id',
        username: 'demo_koordinator',
        full_name: 'Koordinator Demo',
        role: 'koordinator' as const,
        phone: '083456789012',
      },
      {
        email: 'demo_admin@rangkul.id',
        username: 'demo_admin',
        full_name: 'Admin Demo Rangkul',
        role: 'admin' as const,
        phone: '084567890123',
      },
    ];

    const password = 'RangkulDemo2026!';
    const results = [];

    // Fetch existing auth users list
    const { data: authUsersData } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const existingList = authUsersData?.users || [];

    for (const demo of demoUsers) {
      let targetUser = existingList.find(u => u.email?.toLowerCase() === demo.email.toLowerCase());

      if (targetUser) {
        // Update existing auth user password and email confirmation
        const { data: updated, error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(
          targetUser.id,
          {
            password,
            email_confirm: true,
            user_metadata: {
              full_name: demo.full_name,
              role: demo.role,
              username: demo.username,
            },
          }
        );

        if (updateErr) {
          results.push({ email: demo.email, action: 'update', success: false, error: updateErr.message });
        } else {
          results.push({ email: demo.email, action: 'update', success: true, id: updated.user.id });
          targetUser = updated.user;
        }
      } else {
        const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
          email: demo.email,
          password,
          email_confirm: true,
          user_metadata: {
            full_name: demo.full_name,
            role: demo.role,
            username: demo.username,
          },
        });

        if (createErr) {
          if (createErr.message.includes('already been registered')) {
            // Find existing user ID from public.users
            const { data: existingProfile } = await supabaseAdmin
              .from('users')
              .select('id')
              .eq('email', demo.email.toLowerCase())
              .maybeSingle();

            if (existingProfile?.id) {
              const { data: updated } = await supabaseAdmin.auth.admin.updateUserById(existingProfile.id, {
                password,
                email_confirm: true,
                user_metadata: {
                  full_name: demo.full_name,
                  role: demo.role,
                  username: demo.username,
                },
              });
              if (updated?.user) {
                targetUser = updated.user;
                results.push({ email: demo.email, action: 'update_existing', success: true, id: targetUser.id });
              } else {
                results.push({ email: demo.email, action: 'exists', success: true, id: existingProfile.id });
              }
            } else {
              results.push({ email: demo.email, action: 'create', success: false, error: createErr.message });
            }
          } else {
            results.push({ email: demo.email, action: 'create', success: false, error: createErr.message });
          }
        } else if (created?.user) {
          targetUser = created.user;
          results.push({ email: demo.email, action: 'create', success: true, id: created.user.id });
        }
      }

      // Upsert into public.users table
      if (targetUser) {
        await supabaseAdmin.from('users').upsert({
          id: targetUser.id,
          email: demo.email.toLowerCase(),
          username: demo.username.toLowerCase(),
          full_name: demo.full_name,
          role: demo.role,
          phone: demo.phone,
          account_status: 'active',
          updated_at: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Demo accounts seeded successfully via Supabase Auth Admin API',
      password,
      accounts: demoUsers.map((u) => ({ username: u.username, email: u.email, role: u.role })),
      results,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
