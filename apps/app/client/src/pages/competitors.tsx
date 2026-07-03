import { useEffect } from "react";
import { useLocation } from "wouter";

export default function CompetitorsPage() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    setLocation("/intelligence");
  }, [setLocation]);

  return null;
}
