import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export function useBackendReady() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function check() {
      for (let i = 0; i < 10; i++) {
        try {
          const res = await fetch(`${API_URL}/api/customers`);
          if (res.ok) {
            setLoading(false);
            return;
          }
        } catch {}

        await new Promise((r) => setTimeout(r, 3000)); 
      }

      setLoading(false);
    }

    check();
  }, []);

  return loading;
}
