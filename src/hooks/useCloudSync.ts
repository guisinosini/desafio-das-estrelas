import { useState, useCallback } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';

interface UseCloudSyncProps {
  supabase: SupabaseClient<any, "public", any>;
  setIsPremium: (isPremium: boolean) => void;
  setSubscriptionPriceId: (id: string | null) => void;
}

export function useCloudSync({ supabase, setIsPremium, setSubscriptionPriceId }: UseCloudSyncProps) {
  const [isSyncing, setIsSyncing] = useState(false);

  const loadFromCloud = useCallback(async (existingUser?: any) => {
    const user = existingUser || (await supabase.auth.getUser()).data.user;
    if (!user) return null;

    try {
      // Busca o estado do jogo E o status da assinatura simultaneamente
      const [gamificationRes, profileRes] = await Promise.all([
        supabase.from('patient_gamification').select('state').eq('profile_id', user.id).maybeSingle(),
        supabase.from('profiles').select('subscription_status, subscription_price_id').eq('id', user.id).maybeSingle()
      ]);

      if (profileRes.error) {
        console.error("❌ Erro do Supabase ao carregar perfil (profiles):", profileRes.error);
      }
      if (gamificationRes.error) {
        console.error("❌ Erro do Supabase ao carregar estado do jogo (patient_gamification):", gamificationRes.error);
      }

      if (profileRes.data?.subscription_status === 'active') {
        setIsPremium(true);
        if (profileRes.data.subscription_price_id) {
          setSubscriptionPriceId(profileRes.data.subscription_price_id);
        }
      } else {
        setIsPremium(false);
        setSubscriptionPriceId(null);
      }

      if (gamificationRes.data?.state) {
        console.log("✅ Progresso carregado com sucesso da nuvem para o usuário:", user.id);
        return gamificationRes.data.state;
      } else {
        console.warn("⚠️ Nenhum progresso salvo em patient_gamification para o usuário:", user.id);
      }
    } catch (e) {
      console.error("💥 Erro ao carregar dados:", e);
    }
    return null;
  }, [supabase, setIsPremium, setSubscriptionPriceId]);

  const saveToCloud = useCallback(async (state: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // TRAVA DE SEGURANÇA: Não salva se a lista de filhos estiver vazia 
    // e o usuário acabou de logar (isso evita sobrescrever dados da nuvem com um estado inicial vazio)
    if (state.children && state.children.length === 0) {
      console.log("Sincronização abortada: lista de heróis vazia para evitar perda de dados.");
      return;
    }

    setIsSyncing(true);
    try {
      const payload: any = {
        profile_id: user.id,
        state: state,
        updated_at: new Date().toISOString()
      };

      if (state.fleetId) {
        payload.fleet_id = state.fleetId;
      }

      const { error } = await supabase
        .from('patient_gamification')
        .upsert(payload, { onConflict: 'profile_id' });

      if (error) {
        console.error("❌ Erro do Supabase no upsert de patient_gamification:", error);
        // Fallback em caso de falha de foreign key ou permissão na coluna fleet_id
        if (error.message.includes('fleet_id') || error.message.includes('column "fleet_id"')) {
          delete payload.fleet_id;
          const { error: fallbackError } = await supabase.from('patient_gamification').upsert(payload, { onConflict: 'profile_id' });
          if (fallbackError) {
            console.error("❌ Erro do Supabase no fallback upsert:", fallbackError);
          }
        }
      }
    } catch (e) {
      console.error("❌ Erro inesperado na sincronização:", e);
    } finally {
      setIsSyncing(false);
    }
  }, [supabase]);

  return {
    isSyncing,
    loadFromCloud,
    saveToCloud
  };
}
