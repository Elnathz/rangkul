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

    // List users using admin API
    const { data: authUsersData } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const existingList = authUsersData?.users || [];

    for (const demo of demoUsers) {
      let targetUser = existingList.find(u => u.email?.toLowerCase() === demo.email.toLowerCase());

      if (targetUser) {
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
          // If already exists error, try listUsers again to find it
          if (createErr.message.includes('already been registered')) {
            const { data: retryList } = await supabaseAdmin.auth.admin.listUsers();
            const found = retryList?.users?.find(u => u.email?.toLowerCase() === demo.email.toLowerCase());
            if (found) {
              const { data: updated } = await supabaseAdmin.auth.admin.updateUserById(found.id, {
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
                results.push({ email: demo.email, action: 'update_after_conflict', success: true, id: updated.user.id });
              }
            }
          } else {
            results.push({ email: demo.email, action: 'create', success: false, error: createErr.message });
          }
        } else if (created?.user) {
          targetUser = created.user;
          results.push({ email: demo.email, action: 'create', success: true, id: created.user.id });
        }
      }

      // Upsert into public.users
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
