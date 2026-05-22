import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Shop from "./Shop";

export default function UnisexShop() {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    // Preserve existing query parameters while setting gender
    const newParams = new URLSearchParams(searchParams);
    newParams.set('gender', 'unisex');
    setSearchParams(newParams);
  }, []);

  return <Shop />;
}
