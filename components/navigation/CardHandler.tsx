"use client";
import { useState } from "react";
import { NavigationService } from "@/services/navigationService";
import IndicacaoPopup from "@/components/popups/IndicacaoPopup";

export default function CardHandler({ categoria, children }: any) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleNavigation = async () => {
    const disponivel = await NavigationService.verificarDisponibilidade(categoria);
    
    if (disponivel) {
      window.location.href = `/catalogo/${categoria.toLowerCase()}`;
    } else {
      setIsPopupOpen(true);
    }
  };

  return (
    <>
      <div onClick={handleNavigation} className="cursor-pointer">
        {children}
      </div>
      <IndicacaoPopup 
        categoria={categoria} 
        isOpen={isPopupOpen} 
        onClose={() => setIsPopupOpen(false)} 
      />
    </>
  );
}