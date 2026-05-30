function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} wajib diatur`);
  }

  return value;
}

export const env = {
  supabaseUrl: requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
};
