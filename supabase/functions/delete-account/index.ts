import { createClient } from "npm:@supabase/supabase-js@2.116.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function getDefaultKey(envName: string): string {
  const raw = Deno.env.get(envName) || "";
  if (!raw) return "";
  try {
    const parsed = JSON.parse(raw);
    return parsed?.default || "";
  } catch {
    return raw;
  }
}

async function collectFiles(
  storage: ReturnType<ReturnType<typeof createClient>["storage"]["from"]>,
  prefix: string,
  output: string[] = [],
): Promise<string[]> {
  let offset = 0;
  const limit = 100;

  while (true) {
    const { data, error } = await storage.list(prefix, {
      limit,
      offset,
      sortBy: { column: "name", order: "asc" },
    });
    if (error) throw error;

    for (const item of data || []) {
      const path = prefix ? `${prefix}/${item.name}` : item.name;
      if (item.id === null) {
        await collectFiles(storage, path, output);
      } else {
        output.push(path);
      }
    }

    if (!data || data.length < limit) break;
    offset += limit;
  }

  return output;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed." }, 405);
  }

  try {
    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return json({ error: "Authentication required." }, 401);
    }

    const body = await req.json().catch(() => ({}));
    if (body?.confirmation !== "DELETE MY ACCOUNT") {
      return json({ error: "Deletion confirmation was not provided." }, 400);
    }

    const url = Deno.env.get("SUPABASE_URL") || "";
    const publishableKey =
      getDefaultKey("SUPABASE_PUBLISHABLE_KEYS") ||
      Deno.env.get("SUPABASE_ANON_KEY") ||
      "";
    const secretKey =
      getDefaultKey("SUPABASE_SECRET_KEYS") ||
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
      "";

    if (!url || !publishableKey || !secretKey) {
      throw new Error("Required Supabase environment variables are unavailable.");
    }

    const token = authHeader.slice("Bearer ".length);
    const userClient = createClient(url, publishableKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser(token);

    if (userError || !user || user.is_anonymous) {
      return json({ error: "A registered signed-in account could not be verified." }, 401);
    }

    const admin = createClient(url, secretKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const media = admin.storage.from("memory-media");
    const ownedPaths = await collectFiles(media, user.id);

    for (let i = 0; i < ownedPaths.length; i += 100) {
      const batch = ownedPaths.slice(i, i + 100);
      const { error: removeError } = await media.remove(batch);
      if (removeError) throw removeError;
    }

    // Revoke refresh sessions before deleting the Auth user. Supabase access JWTs
    // remain cryptographically valid until exp, so the registered-account RLS/storage
    // gate must also verify that auth.uid() still exists in auth.users.
    const { error: signOutError } = await admin.auth.admin.signOut(token, "global");
    if (signOutError) {
      throw new Error("Account sessions could not be revoked before deletion.");
    }

    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
    if (deleteError) throw deleteError;

    return json({ deleted: true });
  } catch (error) {
    console.error("delete-account:", error);
    return json(
      { error: error instanceof Error ? error.message : "Account deletion failed." },
      500,
    );
  }
});
