const Footer = () => {
  return (
    <footer className="bg-black/90 text-white text-sm text-center py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <p className="mb-2">
          © {new Date().getFullYear()} <span className="font-semibold">Pershelf</span>. All rights reserved.
        </p>
        <p className="text-white/70">
          Built for book lovers. Designed with passion 📚
        </p>
      </div>
    </footer>
  );
};

export default Footer;
