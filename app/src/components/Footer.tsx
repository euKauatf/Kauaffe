export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-amber-950 text-amber-100/80 border-t text-center text-xs border-amber-900/50 pt-8 pb-8">
      {/* Direitos Autorais */}
      <p>&copy; {currentYear} Kauaffè. Todos os direitos reservados.</p>
      <p className="mt-1">Desenvolvido com React, TypeScript e Firebase.</p>
    </footer>
  );
}
