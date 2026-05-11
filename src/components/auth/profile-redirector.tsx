"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export function ProfileRedirector({ isProfileIncomplete }: { isProfileIncomplete: boolean }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Se o perfil está incompleto E não estamos na página de perfil, redireciona
    const isOnProfilePage = pathname.includes("/profile") || pathname.includes("/perfil");

    if (isProfileIncomplete && !isOnProfilePage) {
      console.log("🔄 [Redirector] Redirecionando para primeiro acesso...");
      router.push("/patient/profile?first_access=1");
    }
  }, [isProfileIncomplete, pathname, router]);

  return null; // Este componente não renderiza nada visualmente
}
