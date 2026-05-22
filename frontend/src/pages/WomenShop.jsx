import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Shop from "./Shop";

export default function WomenShop() {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    // Preserve existing query parameters while setting gender
    const newParams = new URLSearchParams(searchParams);
    newParams.set('gender', 'women');
    setSearchParams(newParams);
  }, []);

  return <Shop />;
}
