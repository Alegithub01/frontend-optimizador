import { useState, useEffect } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { api } from "@/lib/api";

interface AccessVerificationResult {
  hasAccess: boolean;
  loading: boolean;
  error: string | null;
}

export function useAccessToCourse(courseId: number | null): AccessVerificationResult {
  const { user, isAuthenticated } = useAuthContext();
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId || !isAuthenticated || !user?.id) {
      setHasAccess(false);
      setLoading(false);
      return;
    }

    const checkAccess = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get<{ access: boolean }>(
          `/sales/user/${user.id}/can-access-course/${courseId}`
        );
        setHasAccess(response.access); // ✅ sin el spread
      } catch (err) {
        console.error("Error verificando acceso:", err);
        setError("Error al verificar acceso");
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [courseId, isAuthenticated, user?.id]);

  return { hasAccess, loading, error };
}
