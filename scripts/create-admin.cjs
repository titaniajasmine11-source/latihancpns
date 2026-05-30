/* eslint-disable @typescript-eslint/no-require-imports */
const { config } = require("dotenv");
const { createClient } = require("@supabase/supabase-js");
const { resolve } = require("node:path");

config({ path: resolve(process.cwd(), ".env.local") });

const email = process.argv[2] ?? "admin@latihancpns.local";
const password = process.argv[3];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const allowServiceRole = process.env.ALLOW_SERVICE_ROLE_SCRIPT === "true";

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY wajib tersedia");
}

if (!allowServiceRole) {
  throw new Error("Set ALLOW_SERVICE_ROLE_SCRIPT=true untuk menjalankan script service-role secara eksplisit");
}

if (!password || password.length < 12 || password === "admin") {
  throw new Error("Password admin wajib diisi, minimal 12 karakter, dan bukan default. Contoh: node scripts/create-admin.cjs admin@example.com StrongPassword123!");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function main() {
  let userId;
  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: "Admin",
    },
  });

  if (createError && !createError.message.toLowerCase().includes("already")) {
    throw createError;
  }

  if (created?.user?.id) {
    userId = created.user.id;
  } else {
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      throw listError;
    }

    userId = users.users.find((user) => user.email === email)?.id;
  }

  if (!userId) {
    throw new Error(`User ${email} tidak ditemukan setelah create/list`);
  }

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: userId,
      full_name: "Admin",
      role: "admin",
    },
    { onConflict: "id" },
  );

  if (profileError) {
    throw profileError;
  }

  console.log(`Admin ready: ${email}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
